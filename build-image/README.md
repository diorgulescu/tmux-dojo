# tmux-dojo Custom Alpine Linux Image Builder

This directory contains the build pipeline for generating the custom 32-bit (`x86` / `i386`) Alpine Linux kernel (`bzImage`) and root filesystem (`initramfs.cpio.gz`) optimized for fast booting inside the `v86` WebAssembly emulator.

## Architecture & Features

- **Target Architecture**: 32-bit x86 (`i386`), Alpine Linux v3.21
- **Kernel**: `linux-virt` (`bzImage`) stripped of unnecessary physical hardware drivers for sub-second boot in `v86`
- **Root Filesystem**: In-memory `initramfs` (`cpio.gz`) booting directly via a streamlined `/init` script and BusyBox `init`
- **Pre-installed Packages**:
  - `tmux` (terminal multiplexer)
  - `bash` (default root login shell with prompt `dojo:~# `)
  - `nano` (friendly terminal text editor)
  - `ncurses`, `ncurses-terminfo-base`, `ncurses-terminfo` (full terminal capability database for `xterm-256color` and `tmux-256color`)
- **Serial Console (`ttyS0`)**: Auto-logs in as `root` with `TERM=xterm-256color` and a welcome banner.
- **Telemetry & Evaluation Daemon (`ttyS1`)**: Runs a dedicated background evaluation loop (`/usr/local/bin/telemetry-daemon`) attached to `/dev/ttyS1`. When the host browser JavaScript sends a single-line command to serial port 1 (`ttyS1`), the daemon executes it and returns the output wrapped in `___EVAL_START___` and `___EVAL_END___:<exit_code>` markers without disturbing the user's `ttyS0` session.

  **Trust boundary:** the daemon `eval`s every line it receives on `ttyS1` as root. This is safe because the VM is fully isolated inside the browser (v86 is configured with no network access), so the only writer to `ttyS1` is the tmux-dojo page JavaScript itself. Never expose `ttyS1` to an untrusted input source.

## v86 Runtime Pinning & Patching

`build.sh` downloads a **pinned** v86 npm release (`V86_VERSION`, default `0.5.473`) and extracts `libv86.js` / `v86.wasm` from it via `patch_libv86.py`. That script applies the tmux-dojo patches to the minified `libv86.js` (32MB-RAM initrd placement, `initial_state` memory reservation, `V86Starter` export, per-byte serial output events) and **fails loudly if any patch no longer matches exactly once** — if upstream v86 changes its minified output, either pin a different `V86_VERSION` or update `PATCHES` in `patch_libv86.py`. BIOS ROMs (`seabios.bin`, `vgabios.bin`) are not in the npm tarball and are downloaded from `github.com/copy/v86` when missing.

## Building the Image

You can build the image using the standalone Python builder (no root privileges or Docker daemon required; works on macOS and Linux) or via Docker:

```bash
./build-image/build.sh
```

This outputs:
- `public/v86/bzImage`
- `public/v86/initramfs.cpio.gz`
