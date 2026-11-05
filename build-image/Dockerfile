# tmux-dojo — Alpine Linux rootfs & kernel optimized for v86
# Copyright (C) 2026 Dragoş Iorgulescu
# SPDX-License-Identifier: GPL-3.0-or-later
FROM --platform=linux/386 alpine:3.21 AS rootfs-builder

# Install required packages for tmux-dojo
RUN apk update && apk add --no-cache \
    linux-virt \
    tmux \
    nano \
    htop \
    procps-ng \
    grep \
    sed \
    ncurses \
    ncurses-terminfo-base \
    bash \
    && rm -rf /var/cache/apk/*

# Set hostname
RUN echo "tmux-dojo" > /etc/hostname && \
    echo "127.0.0.1 localhost tmux-dojo" > /etc/hosts

# Set bash as default shell for root and create group `devops` + non-root user `teammate`
RUN sed -i 's|^root:x:0:0:root:/root:/bin/ash|root:x:0:0:root:/root:/bin/bash|' /etc/passwd && \
    sed -i 's|^root:x:0:0:root:/root:/bin/sh|root:x:0:0:root:/root:/bin/bash|' /etc/passwd && \
    addgroup -g 1000 devops && \
    adduser -D -u 1000 -G devops -s /bin/bash teammate && \
    addgroup root devops && \
    mkdir -p /var/log && \
    cat << 'EOF' > /var/log/dojo-auth.log
Nov 05 08:00:01 tmux-dojo sshd[101]: Server listening on 0.0.0.0 port 22.
Nov 05 08:01:12 tmux-dojo sshd[114]: ACCEPTED_LOGIN publickey for sensei from 10.0.0.10 port 51200 ssh2
Nov 05 08:01:12 tmux-dojo sshd[114]: pam_unix(sshd:session): session opened for user sensei(uid=0) by (uid=0)
Nov 05 08:04:33 tmux-dojo sshd[128]: ACCEPTED_LOGIN publickey for teammate from 10.0.0.14 port 51412 ssh2
Nov 05 08:04:33 tmux-dojo sshd[128]: pam_unix(sshd:session): session opened for user teammate(uid=1000) by (uid=0)
Nov 05 08:11:05 tmux-dojo cron[140]: (root) CMD (/usr/local/bin/dojo-healthcheck)
Nov 05 08:15:42 tmux-dojo sshd[155]: Connection from 10.0.0.99 port 44810 on 10.0.0.1 port 22
Nov 05 08:15:44 tmux-dojo sshd[155]: Invalid user admin from 10.0.0.99 port 44810
Nov 05 08:15:46 tmux-dojo sshd[155]: FAILED_LOGIN password for invalid user admin from 10.0.0.99 port 44810 ssh2
Nov 05 08:15:47 tmux-dojo sshd[155]: Connection closed by invalid user admin 10.0.0.99 port 44810 [preauth]
Nov 05 08:18:02 tmux-dojo sshd[162]: ACCEPTED_LOGIN publickey for sensei from 10.0.0.10 port 51890 ssh2
Nov 05 08:18:02 tmux-dojo sshd[162]: pam_unix(sshd:session): session opened for user sensei(uid=0) by (uid=0)
Nov 05 08:22:19 tmux-dojo sshd[179]: Connection from 10.0.0.99 port 45102 on 10.0.0.1 port 22
Nov 05 08:22:21 tmux-dojo sshd[179]: FAILED_LOGIN password for root from 10.0.0.99 port 45102 ssh2
Nov 05 08:22:22 tmux-dojo sshd[179]: Disconnected from authenticating user root 10.0.0.99 port 45102 [preauth]
Nov 05 08:30:00 tmux-dojo cron[190]: (root) CMD (/usr/local/bin/dojo-healthcheck)
Nov 05 08:34:11 tmux-dojo sshd[204]: ACCEPTED_LOGIN publickey for sensei from 10.0.0.10 port 52104 ssh2
Nov 05 08:34:11 tmux-dojo sshd[204]: pam_unix(sshd:session): session opened for user sensei(uid=0) by (uid=0)
Nov 05 08:41:50 tmux-dojo sshd[218]: Connection from 10.0.0.99 port 45988 on 10.0.0.1 port 22
Nov 05 08:41:52 tmux-dojo sshd[218]: Invalid user guest from 10.0.0.99 port 45988
Nov 05 08:41:54 tmux-dojo sshd[218]: FAILED_LOGIN password for invalid user guest from 10.0.0.99 port 45988 ssh2
Nov 05 08:41:55 tmux-dojo sshd[218]: Connection reset by 10.0.0.99 port 45988 [preauth]
Nov 05 08:45:00 tmux-dojo syslogd[90]: -- MARK --
Nov 05 08:50:12 tmux-dojo sshd[233]: ACCEPTED_LOGIN publickey for teammate from 10.0.0.14 port 52910 ssh2
Nov 05 08:50:12 tmux-dojo sshd[233]: pam_unix(sshd:session): session opened for user teammate(uid=1000) by (uid=0)
Nov 05 08:55:03 tmux-dojo sshd[128]: pam_unix(sshd:session): session closed for user teammate
Nov 05 09:00:01 tmux-dojo cron[250]: (root) CMD (/usr/local/bin/dojo-healthcheck)
Nov 05 09:05:40 tmux-dojo sshd[264]: ACCEPTED_LOGIN publickey for sensei from 10.0.0.10 port 53300 ssh2
Nov 05 09:05:40 tmux-dojo sshd[264]: pam_unix(sshd:session): session opened for user sensei(uid=0) by (uid=0)
Nov 05 09:10:00 tmux-dojo sshd[264]: Received keepalive from 10.0.0.10 port 53300
EOF

# Configure clean bash prompt and environment for root
RUN cat << 'EOF' > /root/.bashrc
export TERM=xterm-256color
export PS1='dojo:\w# '
export EDITOR=nano
export LANG=C.UTF-8
alias ll='ls -la --color=auto'
alias ls='ls --color=auto'
EOF

RUN cat << 'EOF' > /root/.bash_profile
if [ -f ~/.bashrc ]; then
    . ~/.bashrc
fi
EOF

# Create telemetry evaluation daemon for ttyS1
RUN cat << 'EOF' > /usr/local/bin/telemetry-daemon
#!/bin/bash
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export HOME=/root
export TERM=xterm-256color

# TRUST BOUNDARY: this daemon evals every line received on ttyS1 as root.
# The VM is fully isolated inside the browser (v86 has no network access in
# this configuration), so the only writer to ttyS1 is the tmux-dojo page
# JavaScript itself. Do not expose ttyS1 to any untrusted input source.

# Configure ttyS1 in canonical line mode with echo disabled and CR->NL translation
stty -F /dev/ttyS1 115200 sane -echo icrnl onlcr 2>/dev/null || stty sane -echo icrnl onlcr 2>/dev/null || true

while IFS= read -r cmd; do
    # Strip any trailing carriage return
    cmd="${cmd%$'\r'}"
    [ -z "$cmd" ] && continue
    printf "___EVAL_START___\n"
    eval "$cmd" </dev/null 2>&1
    rc=$?
    printf "\n___EVAL_END___:%d\n" "$rc"
done
EOF
RUN chmod +x /usr/local/bin/telemetry-daemon

# Create auto-login wrapper for ttyS0 (kept in sync with build_rootfs.py)
RUN cat << 'EOF' > /usr/local/bin/autologin-ttyS0
#!/bin/sh
export TERM=xterm-256color
export HOME=/root
export USER=root
export LOGNAME=root
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
cd /root
stty rows 24 cols 80 2>/dev/null || true
clear 2>/dev/null || true
printf '\033[1;32mWelcome to tmux-dojo!\033[0m Type \033[1;36mtmux\033[0m to begin.\n\n'
exec /bin/bash --login -i
EOF
RUN chmod +x /usr/local/bin/autologin-ttyS0

# Configure /etc/inittab for fast boot, ttyS0 auto-login, and ttyS1 telemetry daemon
RUN cat << 'EOF' > /etc/inittab
::sysinit:/sbin/init-sysinit
ttyS0::respawn:/usr/local/bin/autologin-ttyS0
ttyS1::respawn:/usr/local/bin/telemetry-daemon
::ctrlaltdel:/sbin/reboot
::shutdown:/bin/umount -a -r
EOF

# Create minimal /sbin/init-sysinit and /init for fast initramfs boot
RUN cat << 'EOF' > /sbin/init-sysinit
#!/bin/sh
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
mount -t proc proc /proc 2>/dev/null || true
mount -t sysfs sysfs /sys 2>/dev/null || true
mount -t devtmpfs devtmpfs /dev 2>/dev/null || true
mkdir -p /dev/pts /dev/shm /tmp /run /var/lock
mount -t devpts devpts /dev/pts -o gid=5,mode=620 2>/dev/null || true
mount -t tmpfs tmpfs /dev/shm 2>/dev/null || true
mount -t tmpfs tmpfs /run 2>/dev/null || true
chmod 1777 /tmp /dev/shm
hostname -F /etc/hostname 2>/dev/null || hostname tmux-dojo
ifconfig lo 127.0.0.1 up 2>/dev/null || ip link set lo up 2>/dev/null || true
EOF
RUN chmod +x /sbin/init-sysinit

RUN cat << 'EOF' > /init
#!/bin/sh
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
/sbin/init-sysinit
exec /sbin/init
EOF
RUN chmod +x /init
