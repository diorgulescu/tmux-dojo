# tmux-dojo — Alpine Linux rootfs & kernel optimized for v86
# Copyright (C) 2026 Dragoş Iorgulescu
# SPDX-License-Identifier: GPL-3.0-or-later
FROM --platform=linux/386 alpine:3.21 AS rootfs-builder

# Install required packages for tmux-dojo
RUN apk update && apk add --no-cache \
    linux-virt \
    tmux \
    nano \
    ncurses \
    ncurses-terminfo-base \
    ncurses-terminfo \
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
    addgroup root devops

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

# Create auto-login wrapper for ttyS0
RUN cat << 'EOF' > /usr/local/bin/autologin-ttyS0
#!/bin/sh
export TERM=xterm-256color
export HOME=/root
export USER=root
export LOGNAME=root
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
cd /root
stty rows 24 cols 80 2>/dev/null || true
exec /bin/bash --login
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
