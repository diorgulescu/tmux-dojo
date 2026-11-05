#!/usr/bin/env bash
# tmux-dojo — v86 Assets & Custom Alpine Linux Image Builder
# Copyright (C) 2026 Dragoş Iorgulescu
# SPDX-License-Identifier: GPL-3.0-or-later
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
V86_DIR="$PROJECT_ROOT/public/v86"
V86_CACHE_DIR="$SCRIPT_DIR/.v86-cache"

# Pinned v86 release. patch_libv86.py asserts that every minified-JS patch
# matches exactly once and fails loudly if upstream changes — override
# V86_VERSION only after updating build-image/patch_libv86.py.
V86_VERSION="${V86_VERSION:-0.5.473}"
V86_TARBALL_URL="https://registry.npmjs.org/v86/-/v86-${V86_VERSION}.tgz"
V86_TARBALL="$V86_CACHE_DIR/v86-${V86_VERSION}.tgz"

mkdir -p "$V86_DIR"

echo "============================================================"
echo " tmux-dojo: v86 Assets & Custom Alpine Linux Image Builder"
echo "============================================================"

# 1. Download the pinned v86 npm tarball and extract/patch its assets
download_v86_assets() {
    echo "=== Downloading v86 v${V86_VERSION} browser runtime & extracting assets ==="
    mkdir -p "$V86_CACHE_DIR"
    if [ ! -f "$V86_TARBALL" ]; then
        echo "  -> Fetching $V86_TARBALL_URL"
        curl -fsSL "$V86_TARBALL_URL" -o "$V86_TARBALL"
    else
        echo "  -> Using cached $V86_TARBALL"
    fi
    # patch_libv86.py verifies each patch applies exactly once, aborting on mismatch
    python3 "$SCRIPT_DIR/patch_libv86.py" "$V86_TARBALL" "$V86_DIR"

    # BIOS ROMs are not bundled in the npm tarball: download from copy/v86 if missing
    if [ ! -f "$V86_DIR/seabios.bin" ]; then
        echo "  -> Downloading seabios.bin from github.com/copy/v86..."
        curl -fsSL "https://raw.githubusercontent.com/copy/v86/master/bios/seabios.bin" -o "$V86_DIR/seabios.bin"
    fi
    if [ ! -f "$V86_DIR/vgabios.bin" ]; then
        echo "  -> Downloading vgabios.bin from github.com/copy/v86..."
        curl -fsSL "https://raw.githubusercontent.com/copy/v86/master/bios/vgabios.bin" -o "$V86_DIR/vgabios.bin"
    fi
}

download_v86_assets

# 2. Build custom 32-bit Alpine Linux bzImage and initramfs.cpio.gz
if [ "${USE_DOCKER:-0}" = "1" ] && command -v docker >/dev/null 2>&1; then
    echo "=== Building Alpine Linux image via Docker (linux/386) ==="
    docker build --platform=linux/386 -t tmux-dojo-rootfs "$SCRIPT_DIR"
    CONTAINER_ID="$(docker create --platform=linux/386 tmux-dojo-rootfs)"
    trap 'docker rm -f "$CONTAINER_ID" >/dev/null 2>&1 || true' EXIT
    docker cp "$CONTAINER_ID:/boot/vmlinuz-virt" "$V86_DIR/bzImage"
    rm -rf "$SCRIPT_DIR/.rootfs-tmp"
    mkdir -p "$SCRIPT_DIR/.rootfs-tmp"
    docker export "$CONTAINER_ID" | tar -x -C "$SCRIPT_DIR/.rootfs-tmp"
    rm -rf "$SCRIPT_DIR/.rootfs-tmp/boot" "$SCRIPT_DIR/.rootfs-tmp/lib/modules"
    (
        cd "$SCRIPT_DIR/.rootfs-tmp"
        find . -print0 | cpio --null -o -H newc | gzip -9 > "$V86_DIR/initramfs.cpio.gz"
    )
    rm -rf "$SCRIPT_DIR/.rootfs-tmp"
else
    echo "=== Building Alpine Linux (i386/x86) kernel & initramfs via build_rootfs.py ==="
    python3 "$SCRIPT_DIR/build_rootfs.py"
fi

if command -v node >/dev/null 2>&1 && [ -f "$SCRIPT_DIR/generate_snapshot.js" ]; then
    echo "=== Generating instant-boot VM snapshot (initial_state.bin) ==="
    node "$SCRIPT_DIR/generate_snapshot.js"
fi

echo ""
echo "=== Build Summary (/public/v86/) ==="
ls -lh "$V86_DIR"
