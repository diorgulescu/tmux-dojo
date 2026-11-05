#!/usr/bin/env python3
# tmux-dojo — Reproducible Alpine Linux (x86 / i386) rootfs + bzImage builder
# Copyright (C) 2026 Dragoş Iorgulescu
# SPDX-License-Identifier: GPL-3.0-or-later
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Reproducible Alpine Linux (x86 / i386) rootfs + initramfs + bzImage builder for v86.

Downloads official 32-bit Alpine Linux packages directly from dl-cdn.alpinelinux.org,
resolves all shared library and package dependencies, configures the tmux-dojo rootfs
(hostname, bash prompt, ttyS0 root auto-login, ttyS1 telemetry evaluation daemon),
and packs everything into a clean, reproducible newc cpio.gz archive alongside the
32-bit linux-virt bzImage kernel.
"""

import gzip
import io
import os
import stat
import struct
import tarfile
import urllib.request
from pathlib import Path

ALPINE_MIRROR = "https://dl-cdn.alpinelinux.org/alpine/v3.21"
ARCH = "x86"
REPOS = ["main", "community"]

# Target packages to install on top of Alpine base layout
TARGET_PACKAGES = [
    "alpine-baselayout",
    "alpine-baselayout-data",
    "musl",
    "busybox",
    "busybox-binsh",
    "bash",
    "tmux",
    "nano",
    "ncurses",
    "ncurses-terminfo-base",
    "libevent",
]

EXCLUDED_PACKAGES = {"libcrypto3", "libssl3"}

KERNEL_PACKAGE = "linux-virt"


class CpioArchiveBuilder:
    """Builds a SVR4 portable 'newc' format CPIO archive in memory."""

    def __init__(self):
        self.entries = {}  # path (without leading slash) -> dict of metadata + content
        self._next_ino = 300000

    def add_dir(self, path: str, mode: int = 0o755, uid: int = 0, gid: int = 0):
        norm = self._normalize_path(path)
        if not norm:
            return
        self._ensure_parents(norm)
        self.entries[norm] = {
            "mode": stat.S_IFDIR | (mode & 0o7777),
            "uid": uid,
            "gid": gid,
            "nlink": 2,
            "data": b"",
        }

    def add_file(self, path: str, data: bytes, mode: int = 0o644, uid: int = 0, gid: int = 0):
        norm = self._normalize_path(path)
        if not norm:
            return
        self._ensure_parents(norm)
        self.entries[norm] = {
            "mode": stat.S_IFREG | (mode & 0o7777),
            "uid": uid,
            "gid": gid,
            "nlink": 1,
            "data": data,
        }

    def add_symlink(self, path: str, target: str, mode: int = 0o777, uid: int = 0, gid: int = 0):
        norm = self._normalize_path(path)
        if not norm:
            return
        self._ensure_parents(norm)
        self.entries[norm] = {
            "mode": stat.S_IFLNK | (mode & 0o7777),
            "uid": uid,
            "gid": gid,
            "nlink": 1,
            "data": target.encode("utf-8"),
        }

    def add_chardev(self, path: str, major: int, minor: int, mode: int = 0o666, uid: int = 0, gid: int = 0):
        norm = self._normalize_path(path)
        if not norm:
            return
        self._ensure_parents(norm)
        self.entries[norm] = {
            "mode": stat.S_IFCHR | (mode & 0o7777),
            "uid": uid,
            "gid": gid,
            "nlink": 1,
            "rdevmajor": major,
            "rdevminor": minor,
            "data": b"",
        }

    def _normalize_path(self, path: str) -> str:
        p = path.strip("/")
        while "//" in p:
            p = p.replace("//", "/")
        if p.startswith("./"):
            p = p[2:]
        if p == ".":
            return ""
        return p

    def _ensure_parents(self, norm_path: str):
        parts = norm_path.split("/")
        for i in range(1, len(parts)):
            parent = "/".join(parts[:i])
            if parent not in self.entries:
                self.entries[parent] = {
                    "mode": stat.S_IFDIR | 0o755,
                    "uid": 0,
                    "gid": 0,
                    "nlink": 2,
                    "data": b"",
                }

    def _write_entry(self, out: io.BytesIO, name: str, info: dict, ino: int):
        name_bytes = name.encode("utf-8") + b"\x00"
        namesize = len(name_bytes)
        data = info["data"]
        filesize = len(data)
        header = (
            f"070701"
            f"{ino:08x}"
            f"{info['mode']:08x}"
            f"{info.get('uid', 0):08x}"
            f"{info.get('gid', 0):08x}"
            f"{info.get('nlink', 1):08x}"
            f"{info.get('mtime', 1700000000):08x}"
            f"{filesize:08x}"
            f"{info.get('devmajor', 0):08x}"
            f"{info.get('devminor', 0):08x}"
            f"{info.get('rdevmajor', 0):08x}"
            f"{info.get('rdevminor', 0):08x}"
            f"{namesize:08x}"
            f"{0:08x}"
        ).encode("ascii")

        out.write(header)
        out.write(name_bytes)
        # Pad header + filename to 4-byte boundary (header is 110 bytes)
        pad_hdr = (4 - ((110 + namesize) % 4)) % 4
        if pad_hdr:
            out.write(b"\x00" * pad_hdr)

        if filesize > 0:
            out.write(data)
            pad_data = (4 - (filesize % 4)) % 4
            if pad_data:
                out.write(b"\x00" * pad_data)

    def build_gzip(self, output_path: Path):
        buf = io.BytesIO()
        # Sort entries so parent directories always precede children
        for idx, name in enumerate(sorted(self.entries.keys()), start=self._next_ino):
            self._write_entry(buf, name, self.entries[name], idx)

        # Write TRAILER!!!
        self._write_entry(
            buf,
            "TRAILER!!!",
            {"mode": 0, "nlink": 1, "data": b"", "mtime": 0},
            0,
        )

        raw_cpio = buf.getvalue()
        with gzip.GzipFile(filename="", mode="wb", fileobj=open(output_path, "wb"), compresslevel=9, mtime=0) as gz:
            gz.write(raw_cpio)


def fetch_bytes(url: str, cache_dir: Path) -> bytes:
    cache_dir.mkdir(parents=True, exist_ok=True)
    safe_name = url.replace("https://", "").replace("http://", "").replace("/", "_")
    cached_file = cache_dir / safe_name
    if cached_file.exists():
        return cached_file.read_bytes()
    print(f"  -> Downloading {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "tmux-dojo-builder/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    cached_file.write_bytes(data)
    return data


def parse_apkindex(raw_tar_gz: bytes, repo: str) -> dict:
    """Parses APKINDEX.tar.gz and returns mapping of pkg_name -> metadata & provides -> pkg_name."""
    pkgs = {}
    provides = {}
    with tarfile.open(fileobj=io.BytesIO(raw_tar_gz), mode="r:gz") as tf:
        index_member = tf.extractfile("APKINDEX")
        content = index_member.read().decode("utf-8", errors="replace")

    for block in content.strip().split("\n\n"):
        if not block.strip():
            continue
        meta = {"repo": repo, "depends": [], "provides": []}
        for line in block.splitlines():
            if len(line) < 2 or line[1] != ":":
                continue
            k, v = line[0], line[2:]
            if k == "P":
                meta["name"] = v.strip()
            elif k == "V":
                meta["version"] = v.strip()
            elif k == "D":
                meta["depends"] = [d.strip() for d in v.split() if d.strip()]
            elif k == "p":
                meta["provides"] = [p.strip() for p in v.split() if p.strip()]
        if "name" in meta and "version" in meta:
            name = meta["name"]
            pkgs[name] = meta
            provides[name] = name
            for prov in meta["provides"]:
                prov_key = prov.split("=")[0].split("<")[0].split(">")[0].split("~")[0]
                # Prefer non-busybox provider if already registered, or register if absent
                if prov_key not in provides or name == "busybox":
                    provides[prov_key] = name
    return pkgs, provides


def resolve_dependencies(seed_names: list, all_pkgs: dict, all_provides: dict) -> list:
    resolved = []
    visited = set()
    queue = list(seed_names)

    while queue:
        dep = queue.pop(0)
        if dep.startswith("!"):
            continue
        # Strip version constraints
        clean_dep = dep.split("=")[0].split("<")[0].split(">")[0].split("~")[0]
        pkg_name = all_provides.get(clean_dep, clean_dep)
        if pkg_name in visited or pkg_name in EXCLUDED_PACKAGES:
            continue
        if pkg_name not in all_pkgs:
            print(f"  [warn] Dependency '{clean_dep}' (from '{dep}') not found in index, skipping.")
            continue
        visited.add(pkg_name)
        resolved.append(pkg_name)
        for sub_dep in all_pkgs[pkg_name]["depends"]:
            queue.append(sub_dep)

    return resolved


def extract_apk_into_cpio(apk_bytes: bytes, cpio: CpioArchiveBuilder, strip_prefixes=()):
    """Extracts an Alpine .apk package into the CpioArchiveBuilder."""
    # Note: An .apk file is multiple concatenated gzip streams (signature, control, data).
    # Python's tarfile with mode="r:gz" reads the entire concatenated stream or we can decompress via zlib/gzip.
    decompressed = gzip.decompress(apk_bytes)
    with tarfile.open(fileobj=io.BytesIO(decompressed), mode="r:") as tf:
        for member in tf.getmembers():
            name = member.name.lstrip("./")
            if not name or name.startswith(".PKGINFO") or name.startswith(".SIGN") or name.startswith(".trigger") or name.startswith(".post-") or name.startswith(".pre-"):
                continue
            if any(name.startswith(p) for p in strip_prefixes):
                continue

            if member.isdir():
                cpio.add_dir(name, mode=member.mode)
            elif member.issym():
                cpio.add_symlink(name, member.linkname, mode=0o777)
            elif member.islnk():
                # Hard link inside package: resolve target from existing entries
                target_norm = member.linkname.lstrip("./")
                if target_norm in cpio.entries:
                    existing = cpio.entries[target_norm]
                    cpio.add_file(name, existing["data"], mode=existing["mode"])
            elif member.isfile():
                data = tf.extractfile(member).read()
                cpio.add_file(name, data, mode=member.mode)


def create_busybox_applets(cpio: CpioArchiveBuilder):
    """Creates standard BusyBox symlinks in /bin, /sbin, /usr/bin, /usr/sbin."""
    bin_applets = [
        "sh", "ash", "cat", "chgrp", "chmod", "chown", "cp", "cttyhack", "date",
        "dd", "df", "dmesg", "dnsdomainname", "echo", "egrep", "false", "fgrep",
        "fsync", "getopt", "grep", "gunzip", "gzip", "hostname", "ionice", "ipcalc",
        "kill", "ln", "login", "ls", "lzop", "mkdir", "mknod", "mktemp", "more",
        "mount", "mountpoint", "mpstat", "mv", "netstat", "nice", "pidof", "ping",
        "pipe_progress", "printenv", "ps", "pwd", "reformime", "rev", "rm", "rmdir",
        "run-parts", "sed", "setpriv", "setserial", "sleep", "stat", "stty", "su",
        "sync", "tar", "touch", "true", "umount", "uname", "usleep", "vi", "watch",
        "zcat",
    ]
    sbin_applets = [
        "acpid", "adjtimex", "arp", "blkid", "blockdev", "depmod", "fbsplash",
        "fdisk", "findfs", "fsck", "fstrim", "getty", "halt", "hwclock", "ifconfig",
        "ifdown", "ifenslave", "ifup", "init", "inotifyd", "insmod", "ip", "ipaddr",
        "iplink", "ipneigh", "iproute", "iprule", "iptunnel", "klogd", "loadkmap",
        "logread", "losetup", "lsmod", "mdev", "mkdosfs", "mke2fs", "mkfs.ext2",
        "mkfs.vfat", "mkswap", "modinfo", "modprobe", "nameif", "pivot_root",
        "poweroff", "raidautorun", "reboot", "rmmod", "route", "setconsole",
        "slattach", "swapoff", "swapon", "switch_root", "sysctl", "syslogd",
        "tunctl", "udhcpc", "vconfig", "watchdog", "zcip",
    ]
    usr_bin_applets = [
        "[", "[[", "awk", "basename", "beep", "blkdiscard", "bunzip2", "bzcat",
        "bzip2", "cal", "Check", "chvt", "cksum", "clear", "cmp", "comm", "cpio",
        "crontab", "cryptpw", "cut", "dc", "deallocvt", "diff", "dirname", "dos2unix",
        "du", "eject", "env", "expand", "expr", "factor", "fallocate", "find",
        "flock", "fold", "free", "fuser", " groups", "hd", "head", "hexdump",
        "hostid", "iconv", "id", "install", "ipcrm", "ipcs", "killall", "last",
        "less", "logger", "logname", "lsof", "lspci", "lsusb", "lzcat", "lzma",
        "md5sum", "mesg", "microcom", "mkfifo", "mkpasswd", "nc", "nl", "nmeter",
        "nohup", "nproc", "nsenter", "nslookup", "od", "openvt", "passwd", "paste",
        "pgrep", "pkill", "pmap", "printf", "pscan", "pstree", "pwdx", "readlink",
        "realpath", "renice", "reset", "resize", "seq", "setfattr", "setsid",
        "sha1sum", "sha256sum", "sha3sum", "sha512sum", "shred", "shuf", "smemcap",
        "sort", "split", "strings", "sum", "tac", "tail", "tee", "test", "time",
        "timeout", "top", "tr", "traceroute", "truncate", "tty", "ttysize",
        "udhcpc6", "unexpand", "uniq", "unix2dos", "unlink", "unlzma", "unshare",
        "unxz", "unzip", "uptime", "uudecode", "uuencode", "vlock", "volname",
        "wc", "wget", "which", "who", "whoami", "whois", "xargs", "xxd", "xz",
        "xzcat", "yes",
    ]

    for app in bin_applets:
        path = f"bin/{app.strip()}"
        if path not in cpio.entries:
            cpio.add_symlink(path, "/bin/busybox")
    if "bin/base64" not in cpio.entries:
        cpio.add_symlink("bin/base64", "/bin/busybox")
    for app in sbin_applets:
        path = f"sbin/{app.strip()}"
        if path not in cpio.entries:
            cpio.add_symlink(path, "/bin/busybox")
    for app in usr_bin_applets:
        path = f"usr/bin/{app.strip()}"
        if path not in cpio.entries:
            cpio.add_symlink(path, "/bin/busybox")


def configure_tmux_dojo_rootfs(cpio: CpioArchiveBuilder):
    """Applies tmux-dojo customizations: hostname, bash prompt, ttyS0 auto-login, ttyS1 telemetry."""
    # Ensure standard directories exist
    for d in ["proc", "sys", "dev", "dev/pts", "dev/shm", "tmp", "run", "var/run", "var/lock", "root", "home", "etc", "usr/local/bin"]:
        cpio.add_dir(d, mode=0o755)
    cpio.add_dir("tmp", mode=0o1777)
    cpio.add_dir("home/teammate", mode=0o755, uid=1000, gid=1000)

    # Pre-populate essential /dev device nodes in case devtmpfs isn't mounted yet
    cpio.add_chardev("dev/console", 5, 1, mode=0o600)
    cpio.add_chardev("dev/null", 1, 3, mode=0o666)
    cpio.add_chardev("dev/zero", 1, 5, mode=0o666)
    cpio.add_chardev("dev/ptmx", 5, 2, mode=0o666)
    cpio.add_chardev("dev/tty", 5, 0, mode=0o666)
    cpio.add_chardev("dev/tty0", 4, 0, mode=0o620)
    cpio.add_chardev("dev/tty1", 4, 1, mode=0o620)
    cpio.add_chardev("dev/ttyS0", 4, 64, mode=0o660)
    cpio.add_chardev("dev/ttyS1", 4, 65, mode=0o660)
    cpio.add_chardev("dev/random", 1, 8, mode=0o666)
    cpio.add_chardev("dev/urandom", 1, 9, mode=0o666)

    # 1. Hostname
    cpio.add_file("etc/hostname", b"tmux-dojo\n", mode=0o644)
    cpio.add_file(
        "etc/hosts",
        b"127.0.0.1\tlocalhost tmux-dojo\n::1\t\tlocalhost tmux-dojo\n",
        mode=0o644,
    )

    # 2. /etc/passwd and /etc/group with /bin/bash as default shell for root & non-root user `teammate` in group `devops`
    passwd_content = (
        "root:x:0:0:root:/root:/bin/bash\n"
        "bin:x:1:1:bin:/bin:/sbin/nologin\n"
        "daemon:x:2:2:daemon:/sbin:/sbin/nologin\n"
        "teammate:x:1000:1000:teammate:/home/teammate:/bin/bash\n"
        "nobody:x:65534:65534:nobody:/:/sbin/nologin\n"
    ).encode("utf-8")
    cpio.add_file("etc/passwd", passwd_content, mode=0o644)

    group_content = (
        "root:x:0:root\n"
        "bin:x:1:root,bin,daemon\n"
        "daemon:x:2:root,bin,daemon\n"
        "sys:x:3:root,bin\n"
        "adm:x:4:root,daemon\n"
        "tty:x:5:\n"
        "disk:x:6:root\n"
        "wheel:x:10:root\n"
        "utmp:x:22:\n"
        "devops:x:1000:root,teammate\n"
        "nobody:x:65534:\n"
    ).encode("utf-8")
    cpio.add_file("etc/group", group_content, mode=0o644)

    shadow_content = b"root::19000:0:99999:7:::\nteammate::19000:0:99999:7:::\nnobody:!::0:::::\n"
    cpio.add_file("etc/shadow", shadow_content, mode=0o600)

    # 3. Root & teammate bash profiles and clean prompt `dojo:~# `
    bashrc_content = (
        "export TERM=xterm-256color\n"
        "export EDITOR=nano\n"
        "export LANG=C.UTF-8\n"
        "if [ \"$(id -u)\" = \"0\" ]; then\n"
        "    export PS1='dojo:\\w# '\n"
        "else\n"
        "    export PS1='teammate@dojo:\\w$ '\n"
        "fi\n"
        "alias ls='ls --color=auto'\n"
        "alias ll='ls -la --color=auto'\n"
    ).encode("utf-8")
    cpio.add_file("root/.bashrc", bashrc_content, mode=0o644)
    cpio.add_file("home/teammate/.bashrc", bashrc_content, mode=0o644, uid=1000, gid=1000)

    bash_profile_content = (
        "if [ -f ~/.bashrc ]; then\n"
        "    . ~/.bashrc\n"
        "fi\n"
    ).encode("utf-8")
    cpio.add_file("root/.bash_profile", bash_profile_content, mode=0o644)
    cpio.add_file("home/teammate/.bash_profile", bash_profile_content, mode=0o644, uid=1000, gid=1000)
    cpio.add_file("etc/profile", bashrc_content, mode=0o644)

    # Sample starter files in /root for practicing tmux & nano
    welcome_note = (
        "Welcome to tmux-dojo!\n"
        "=====================\n\n"
        "Use the interactive tutorial sidebar to learn tmux step-by-step.\n"
        "Try running: tmux\n"
    ).encode("utf-8")
    cpio.add_file("root/README.txt", welcome_note, mode=0o644)

    # 4. Telemetry evaluation daemon on ttyS1
    telemetry_daemon = (
        "#!/bin/bash\n"
        "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n"
        "export HOME=/root\n"
        "export USER=root\n"
        "export TERM=xterm-256color\n\n"
        "# Configure ttyS1 into canonical line-buffered mode with echo disabled and CR->NL translation\n"
        "stty -F /dev/ttyS1 115200 sane -echo icrnl onlcr 2>/dev/null || stty sane -echo icrnl onlcr 2>/dev/null || true\n\n"
        "while IFS= read -r cmd; do\n"
        "    cmd=\"${cmd%$'\\r'}\"\n"
        "    [ -z \"$cmd\" ] && continue\n"
        "    printf \"___EVAL_START___\\n\"\n"
        "    eval \"$cmd\" </dev/null 2>&1\n"
        "    rc=$?\n"
        "    printf \"\\n___EVAL_END___:%d\\n\" \"$rc\"\n"
        "done\n"
    ).encode("utf-8")
    cpio.add_file("usr/local/bin/telemetry-daemon", telemetry_daemon, mode=0o755)

    # 5. Auto-login helper for ttyS0
    autologin_ttyS0 = (
        "#!/bin/sh\n"
        "export TERM=xterm-256color\n"
        "export HOME=/root\n"
        "export USER=root\n"
        "export LOGNAME=root\n"
        "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n"
        "cd /root\n"
        "stty rows 24 cols 80 2>/dev/null || true\n"
        "clear 2>/dev/null || true\n"
        "printf '\\033[1;32mWelcome to tmux-dojo!\\033[0m Type \\033[1;36mtmux\\033[0m to begin.\\n\\n'\n"
        "exec /bin/bash --login -i\n"
    ).encode("utf-8")
    cpio.add_file("usr/local/bin/autologin-ttyS0", autologin_ttyS0, mode=0o755)

    # 5b. Provide /usr/local/bin/base64 wrapper using busybox base64 applet (and awk fallback)
    base64_wrapper = (
        "#!/bin/sh\n"
        "if /bin/busybox base64 --help >/dev/null 2>&1; then\n"
        "    exec /bin/busybox base64 \"$@\"\n"
        "fi\n"
        "# Pure POSIX awk base64 decoder/encoder fallback if busybox base64 applet is compiled out\n"
        "if [ \"$1\" = \"-d\" ] || [ \"$1\" = \"--decode\" ]; then\n"
        "    exec awk 'BEGIN{b=\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\";for(i=0;i<64;i++)m[substr(b,i+1,1)]=i}{gsub(/[^A-Za-z0-9+\\/=]/,\"\");for(i=1;i<=length($0);i+=4){c1=m[substr($0,i,1)];c2=m[substr($0,i+1,1)];s3=substr($0,i+2,1);s4=substr($0,i+3,1);c3=(s3==\"=\")?0:m[s3];c4=(s4==\"=\")?0:m[s4];printf(\"%c\",(c1*4)+int(c2/16));if(s3!=\"=\"&&s3!=\"\")printf(\"%c\",((c2%16)*16)+int(c3/4));if(s4!=\"=\"&&s4!=\"\")printf(\"%c\",((c3%4)*64)+c4)}}'\n"
        "fi\n"
    ).encode("utf-8")
    cpio.add_file("usr/local/bin/base64", base64_wrapper, mode=0o755)

    # 6. /etc/inittab
    inittab_content = (
        "::sysinit:/sbin/init-sysinit\n"
        "ttyS0::respawn:/usr/local/bin/autologin-ttyS0\n"
        "ttyS1::respawn:/usr/local/bin/telemetry-daemon\n"
        "::ctrlaltdel:/sbin/reboot\n"
        "::shutdown:/bin/umount -a -r\n"
    ).encode("utf-8")
    cpio.add_file("etc/inittab", inittab_content, mode=0o644)

    # 7. Fast /sbin/init-sysinit and /init entrypoint
    init_sysinit = (
        "#!/bin/sh\n"
        "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n"
        "mount -t proc proc /proc 2>/dev/null || true\n"
        "mount -t sysfs sysfs /sys 2>/dev/null || true\n"
        "mount -t devtmpfs devtmpfs /dev 2>/dev/null || true\n"
        "mkdir -p /dev/pts /dev/shm /tmp /run /var/lock\n"
        "mount -t devpts devpts /dev/pts -o gid=5,mode=620 2>/dev/null || true\n"
        "mount -t tmpfs tmpfs /dev/shm 2>/dev/null || true\n"
        "mount -t tmpfs tmpfs /run 2>/dev/null || true\n"
        "chmod 1777 /tmp /dev/shm 2>/dev/null || true\n"
        "hostname -F /etc/hostname 2>/dev/null || hostname tmux-dojo\n"
        "ifconfig lo 127.0.0.1 up 2>/dev/null || ip link set lo up 2>/dev/null || true\n"
    ).encode("utf-8")
    cpio.add_file("sbin/init-sysinit", init_sysinit, mode=0o755)

    init_script = (
        "#!/bin/sh\n"
        "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n"
        "/sbin/init-sysinit\n"
        "exec /sbin/init\n"
    ).encode("utf-8")
    cpio.add_file("init", init_script, mode=0o755)


def extract_kernel(apk_bytes: bytes, output_kernel_path: Path):
    """Extracts /boot/vmlinuz-virt from the linux-virt APK as bzImage."""
    decompressed = gzip.decompress(apk_bytes)
    with tarfile.open(fileobj=io.BytesIO(decompressed), mode="r:") as tf:
        for member in tf.getmembers():
            name = member.name.lstrip("./")
            if name in ("boot/vmlinuz-virt", "boot/vmlinuz-lts", "boot/vmlinuz"):
                data = tf.extractfile(member).read()
                output_kernel_path.write_bytes(data)
                print(f"  -> Extracted kernel '{name}' to {output_kernel_path} ({len(data) / (1024*1024):.2f} MB)")
                return
    raise RuntimeError("Could not find vmlinuz inside kernel package!")


def main():
    root_dir = Path(__file__).resolve().parent.parent
    cache_dir = Path(__file__).resolve().parent / ".apk-cache"
    out_dir = root_dir / "public" / "v86"
    out_dir.mkdir(parents=True, exist_ok=True)

    print("=== [1/4] Fetching Alpine Linux v3.21 (x86 / i386) package indices ===")
    all_pkgs = {}
    all_provides = {}
    for repo in REPOS:
        idx_url = f"{ALPINE_MIRROR}/{repo}/{ARCH}/APKINDEX.tar.gz"
        raw_idx = fetch_bytes(idx_url, cache_dir)
        pkgs, provides = parse_apkindex(raw_idx, repo)
        all_pkgs.update(pkgs)
        all_provides.update(provides)

    print(f"  -> Indexed {len(all_pkgs)} packages across {REPOS}")

    print("=== [2/4] Resolving dependencies for tmux-dojo rootfs ===")
    resolved_pkgs = resolve_dependencies(TARGET_PACKAGES, all_pkgs, all_provides)
    print(f"  -> Resolved {len(resolved_pkgs)} packages: {', '.join(resolved_pkgs)}")

    cpio = CpioArchiveBuilder()

    # Strip bulky unused documentation/man/zoneinfo/locale data if any
    strip_prefixes = (
        "usr/share/man/",
        "usr/share/doc/",
        "usr/share/locale/",
        "usr/share/nano/man-html/",
        "usr/lib/libevent_openssl",
        "usr/lib/libevent_extra",
        "usr/lib/libevent-2.1",
    )

    for pkg_name in resolved_pkgs:
        meta = all_pkgs[pkg_name]
        apk_url = f"{ALPINE_MIRROR}/{meta['repo']}/{ARCH}/{pkg_name}-{meta['version']}.apk"
        apk_bytes = fetch_bytes(apk_url, cache_dir)
        extract_apk_into_cpio(apk_bytes, cpio, strip_prefixes=strip_prefixes)

    # Ensure BusyBox symlinks are present
    create_busybox_applets(cpio)

    # Apply tmux-dojo configuration
    print("=== [3/4] Configuring tmux-dojo rootfs (hostname, bash, ttyS0 auto-login, ttyS1 telemetry) ===")
    configure_tmux_dojo_rootfs(cpio)

    initramfs_path = out_dir / "initramfs.cpio.gz"
    cpio.build_gzip(initramfs_path)
    initramfs_mb = initramfs_path.stat().st_size / (1024 * 1024)
    print(f"  -> Built {initramfs_path} ({initramfs_mb:.2f} MB)")

    print("=== [4/4] Extracting 32-bit x86 linux-virt kernel (bzImage) ===")
    kmeta = all_pkgs[KERNEL_PACKAGE]
    kernel_url = f"{ALPINE_MIRROR}/{kmeta['repo']}/{ARCH}/{KERNEL_PACKAGE}-{kmeta['version']}.apk"
    kernel_apk_bytes = fetch_bytes(kernel_url, cache_dir)
    bzimage_path = out_dir / "bzImage"
    extract_kernel(kernel_apk_bytes, bzimage_path)

    total_mb = (initramfs_path.stat().st_size + bzimage_path.stat().st_size) / (1024 * 1024)
    print(f"=== Done! Total kernel + initramfs size: {total_mb:.2f} MB ===")


if __name__ == "__main__":
    main()
