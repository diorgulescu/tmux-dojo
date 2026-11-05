#!/usr/bin/env python3
# tmux-dojo — v86 asset extractor & libv86.js patcher
# Copyright (C) 2026 Dragoş Iorgulescu
# SPDX-License-Identifier: GPL-3.0-or-later
#
# This program is free software: you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Extracts the browser runtime (libv86.js, v86.wasm) from an official v86 npm
tarball and applies the tmux-dojo patches to libv86.js.

Every patch MUST match EXACTLY ONCE in the pristine upstream libv86.js.
If upstream v86 changes its minified output, this script fails loudly instead
of silently producing a broken libv86.js — update PATCHES below or pin a
different V86_VERSION in build.sh.

Usage:
    python3 patch_libv86.py <v86-npm-tarball.tgz> <output-dir>
"""

import sys
import tarfile
from pathlib import Path

# (name, old, new) — each `old` must occur exactly once in upstream libv86.js.
PATCHES = [
    (
        "initrd placement when memory_size < 64MB (32MB RAM support)",
        "c&&(h=67108864,e=c.byteLength,a.set(new Uint8Array(c),h));",
        "c&&(h=a.byteLength>67108864+c.byteLength?67108864:(a.byteLength-c.byteLength)&-4096,e=c.byteLength,a.set(new Uint8Array(c),h));",
    ),
    (
        "reserve memory for initial_state restore, not just initrd",
        "this.create_memory(a.memory_size||67108864,a.initrd?67108864:1048576)",
        "this.create_memory(a.memory_size||67108864,(a.initrd||a.initial_state)?67108864:1048576)",
    ),
    (
        "export both V86 and V86Starter (browser window, Node, and worker globals)",
        '"undefined"!==typeof module&&"undefined"!==typeof module.exports?module.exports.V86=Q:"undefined"!==typeof window?window.V86=Q:"function"===typeof importScripts&&(self.V86=Q);',
        '"undefined"!==typeof module&&"undefined"!==typeof module.exports?(module.exports.V86=Q,module.exports.V86Starter=Q):"undefined"!==typeof window?(window.V86=Q,window.V86Starter=Q):"function"===typeof importScripts&&(self.V86=Q,self.V86Starter=Q);',
    ),
    (
        "emit per-byte AND per-char serial output events (serialN-output-byte/-char)",
        'this.modem_control&16?this.data_received(a):this.bus.send("serial"+this.com+"-output-byte",a)',
        'this.modem_control&16?this.data_received(a):(this.bus.send("serial"+this.com+"-output-byte",a),this.bus.send("serial"+this.com+"-output-char",String.fromCharCode(a)),0===this.com&&this.bus.send("serial-output-char",String.fromCharCode(a)))',
    ),
]


def patch_libv86(js_code: str) -> str:
    for name, old, new in PATCHES:
        count = js_code.count(old)
        if count != 1:
            raise SystemExit(
                f"ERROR: v86 patch '{name}' expected exactly 1 occurrence in upstream "
                f"libv86.js, found {count}.\n"
                "Upstream v86 has changed its minified output. Either pin a different "
                "V86_VERSION in build.sh or update PATCHES in patch_libv86.py."
            )
        js_code = js_code.replace(old, new)
    return js_code


def main() -> None:
    if len(sys.argv) != 3:
        print(f"usage: {sys.argv[0]} <v86-npm-tarball.tgz> <output-dir>", file=sys.stderr)
        sys.exit(2)

    tarball_path = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    found = {"libv86.js": False, "v86.wasm": False, "seabios.bin": False, "vgabios.bin": False}

    with tarfile.open(tarball_path, mode="r:gz") as tf:
        for member in tf.getmembers():
            name = member.name
            if name.endswith("/build/libv86.js") or name == "package/build/libv86.js":
                js_code = tf.extractfile(member).read().decode("utf-8")
                js_code = patch_libv86(js_code)
                (out_dir / "libv86.js").write_text(js_code, encoding="utf-8")
                found["libv86.js"] = True
                print("  -> Extracted & patched libv86.js")
            elif name.endswith("/build/v86.wasm") or name == "package/build/v86.wasm":
                (out_dir / "v86.wasm").write_bytes(tf.extractfile(member).read())
                found["v86.wasm"] = True
                print("  -> Extracted v86.wasm")
            elif name.endswith("/bios/seabios.bin"):
                (out_dir / "seabios.bin").write_bytes(tf.extractfile(member).read())
                found["seabios.bin"] = True
                print("  -> Extracted seabios.bin")
            elif name.endswith("/bios/vgabios.bin"):
                (out_dir / "vgabios.bin").write_bytes(tf.extractfile(member).read())
                found["vgabios.bin"] = True
                print("  -> Extracted vgabios.bin")

    missing = [k for k, v in found.items() if not v]
    if missing:
        # BIOS ROMs are not bundled in the npm tarball; build.sh downloads them
        # from github.com/copy/v86 as a fallback.
        print(f"  -> Not in tarball (build.sh will fetch from GitHub if missing): {', '.join(missing)}")


if __name__ == "__main__":
    main()
