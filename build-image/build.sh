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

mkdir -p "$V86_DIR"

echo "============================================================"
echo " tmux-dojo: v86 Assets & Custom Alpine Linux Image Builder"
echo "============================================================"

# 1. Download latest v86 browser build files if missing or requested
download_v86_assets() {
    echo "=== Checking / downloading v86 browser runtime & BIOS files ==="
    local NPM_TARBALL_URL
    NPM_TARBALL_URL="$(python3 -c '
import json, urllib.request
req = urllib.request.Request("https://registry.npmjs.org/v86/latest", headers={"User-Agent": "tmux-dojo/1.0"})
with urllib.request.urlopen(req, timeout=30) as r:
    data = json.loads(r.read().decode("utf-8"))
print(data["dist"]["tarball"])
')"
    echo "  -> Fetching latest v86 release from $NPM_TARBALL_URL"
    python3 -c "
import io, tarfile, urllib.request
from pathlib import Path

url = '$NPM_TARBALL_URL'
out_dir = Path('$V86_DIR')
req = urllib.request.Request(url, headers={'User-Agent': 'tmux-dojo/1.0'})
raw = urllib.request.urlopen(req, timeout=60).read()
with tarfile.open(fileobj=io.BytesIO(raw), mode='r:gz') as tf:
    for m in tf.getmembers():
        if m.name.endswith('/build/libv86.js') or m.name == 'package/build/libv86.js':
            js_code = tf.extractfile(m).read().decode('utf-8')
            # Support initrd placement when memory_size < 64MB (e.g. 32MB RAM)
            js_code = js_code.replace(
                'c&&(h=67108864,e=c.byteLength,a.set(new Uint8Array(c),h));',
                'c&&(h=a.byteLength>67108864+c.byteLength?67108864:(a.byteLength-c.byteLength)&-4096,e=c.byteLength,a.set(new Uint8Array(c),h));'
            )
            js_code = js_code.replace(
                'this.create_memory(a.memory_size||67108864,a.initrd?67108864:1048576)',
                'this.create_memory(a.memory_size||67108864,(a.initrd||a.initial_state)?67108864:1048576)'
            )
            # Export both V86 and V86Starter
            js_code = js_code.replace(
                '\"undefined\"!==typeof module&&\"undefined\"!==typeof module.exports?module.exports.V86=Q:\"undefined\"!==typeof window?window.V86=Q:\"function\"===typeof importScripts&&(self.V86=Q);',
                '\"undefined\"!==typeof module&&\"undefined\"!==typeof module.exports?(module.exports.V86=Q,module.exports.V86Starter=Q):\"undefined\"!==typeof window?(window.V86=Q,window.V86Starter=Q):\"function\"===typeof importScripts&&(self.V86=Q,self.V86Starter=Q);'
            )
            # Emit both *-output-byte and *-output-char / serial-output-char
            js_code = js_code.replace(
                'this.modem_control&16?this.data_received(a):this.bus.send(\"serial\"+this.com+\"-output-byte\",a)',
                'this.modem_control&16?this.data_received(a):(this.bus.send(\"serial\"+this.com+\"-output-byte\",a),this.bus.send(\"serial\"+this.com+\"-output-char\",String.fromCharCode(a)),0===this.com&&this.bus.send(\"serial-output-char\",String.fromCharCode(a)))'
            )
            (out_dir / 'libv86.js').write_text(js_code, encoding='utf-8')
            print('  -> Extracted & patched libv86.js')
        elif m.name.endswith('/build/v86.wasm') or m.name == 'package/build/v86.wasm':
            (out_dir / 'v86.wasm').write_bytes(tf.extractfile(m).read())
            print('  -> Extracted v86.wasm')
        elif m.name.endswith('/bios/seabios.bin'):
            (out_dir / 'seabios.bin').write_bytes(tf.extractfile(m).read())
            print('  -> Extracted seabios.bin')
        elif m.name.endswith('/bios/vgabios.bin'):
            (out_dir / 'vgabios.bin').write_bytes(tf.extractfile(m).read())
            print('  -> Extracted vgabios.bin')
"

    # If BIOS files weren't bundled inside the npm tarball, download from copy/v86 master repository
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
