#!/usr/bin/env node
// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0-or-later
/**
 * tmux-dojo — Instant-Boot VM Snapshot Generator
 * Copyright (C) 2026 Dragoş Iorgulescu
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

const fs = require("fs");
const path = require("path");
const { V86Starter } = require(path.join(__dirname, "../public/v86/libv86.js"));

const v86Dir = path.join(__dirname, "../public/v86");
const outputSnapshotPath = path.join(v86Dir, "initial_state.bin");

console.log("=== [tmux-dojo] Booting Alpine Linux VM to generate initial_state.bin ===");

const emulator = new V86Starter({
    wasm_path: path.join(v86Dir, "v86.wasm"),
    memory_size: 32 * 1024 * 1024,
    vga_memory_size: 2 * 1024 * 1024,
    bios: { url: path.join(v86Dir, "seabios.bin") },
    vga_bios: { url: path.join(v86Dir, "vgabios.bin") },
    bzimage: { url: path.join(v86Dir, "bzImage") },
    initrd: { url: path.join(v86Dir, "initramfs.cpio.gz") },
    cmdline: "rw root=/dev/ram0 console=ttyS0,115200 init=/init quiet",
    uart1: true,
    autostart: true,
});

let ttyS0Out = "";
let ttyS1Out = "";
let snapshotTriggered = false;
let evalConfirmed = false;

emulator.add_listener("serial0-output-byte", (byte) => {
    const ch = String.fromCharCode(byte);
    ttyS0Out += ch;

    if (!snapshotTriggered && ttyS0Out.includes("dojo:~#")) {
        snapshotTriggered = true;
        console.log("  -> Detected dojo:~# prompt on ttyS0. Verifying ttyS1 telemetry & base64...");
        const probe = "echo 'dG11eC1kb2pv' | base64 -d && echo ''\n";
        const bytes = new TextEncoder().encode(probe);
        emulator.serial_send_bytes(1, bytes);
    }
});

emulator.add_listener("serial1-output-byte", async (byte) => {
    const ch = String.fromCharCode(byte);
    ttyS1Out += ch;

    if (!evalConfirmed && ttyS1Out.includes("___EVAL_END___:0") && ttyS1Out.endsWith("\n")) {
        evalConfirmed = true;
        console.log("  -> ttyS1 telemetry verified:", ttyS1Out.trim().replace(/\r?\n/g, " | "));

        // Wait 250ms so ttyS1 loop settles back onto `read -r cmd`
        await new Promise((r) => setTimeout(r, 250));

        const stateBuffer = await emulator.save_state();
        fs.writeFileSync(outputSnapshotPath, Buffer.from(stateBuffer));
        const sizeMb = (fs.statSync(outputSnapshotPath).size / (1024 * 1024)).toFixed(2);
        console.log(`=== Saved clean VM snapshot to ${outputSnapshotPath} (${sizeMb} MB) ===`);
        emulator.stop();
        process.exit(0);
    }
});

setTimeout(() => {
    console.error("Timed out generating initial_state.bin");
    process.exit(1);
}, 30000);
