# tmux-dojo 🥋

**`tmux-dojo`** is an interactive, 100% client-side web tutorial for mastering [`tmux`](https://github.com/tmux/tmux) (the terminal multiplexer). It runs a real 32-bit (`i386` / `x86`) Alpine Linux environment directly inside the browser using the [`v86`](https://github.com/copy/v86) WebAssembly emulator paired with [`xterm.js`](https://xtermjs.org/) and zero heavy UI frameworks.

---

## Key Features

- **Real Linux + Real `tmux` in WebAssembly**: Runs an authentic Alpine Linux v3.21 (`x86`) kernel (`linux-virt`) and `initramfs` with `tmux`, `bash`, `nano`, and `ncurses` pre-installed—no backend server or WebSocket container required.
- **Instant (<1s) Browser Boot**: Pre-snapshots the booted 32 MB RAM VM into `/public/v86/initial_state.bin` so the interactive `dojo:~#` prompt is ready in under 1 second.
- **Dual-Serial-Port Telemetry Architecture (`ttyS0` + `ttyS1`)**:
  - **`ttyS0` (User Terminal)**: Connected directly to `xterm.js` (`TERM=xterm-256color`) with keyboard shortcut interception so browser shortcuts like `Ctrl+b` (bookmarks) are blocked and forwarded as `\x02` to `tmux`.
  - **`ttyS1` (Silent Telemetry & Resize Bridge)**: Runs a background evaluation daemon (`/usr/local/bin/telemetry-daemon`). The browser's `VmInspector` sends shell probes and `stty -F /dev/ttyS0 rows <R> cols <C>` resize commands over `ttyS1` and parses responses wrapped in `___EVAL_START___` / `___EVAL_END___` markers without ever polluting the user's terminal on `ttyS0`.
- **Live Prefix & Keystroke Combo Visualizer**: Highlights in the top bar when `Ctrl+b` is pressed (`🟢 PREFIX ACTIVE (Ctrl+b) — Awaiting command key...`) and displays the human-readable action for the follow-up key (e.g., `Ctrl+b % → Split Pane Vertically`).
- **Interactive `~/.tmux.conf` Inspector & Editor Tab**: Switch between `[ Terminal (ttyS0) ]` and `[ ~/.tmux.conf Editor ]` to inspect `/root/.tmux.conf` with live line-by-line English explanations, edit directives, and one-click **Save & Reload in tmux** (via base64 over `ttyS1`).
- **5-Belt Progressive Curriculum**:
  1. **Kata 01 (White Belt)** — *Entering the Dojo (`Sessions`)*: Creating, detaching (`Ctrl+b d`), and re-attaching (`tmux attach -t dojo`) sessions.
  2. **Kata 02 (Yellow Belt)** — *Blade Work (`Panes`)*: Vertical splits (`Ctrl+b %`), horizontal splits (`Ctrl+b "`), pane navigation, zoom (`Ctrl+b z`), and closing panes.
  3. **Kata 03 (Green Belt)** — *Multiple Rooms (`Windows`)*: Creating (`Ctrl+b c`), switching, and renaming (`Ctrl+b ,`) windows.
  4. **Kata 04 (Brown Belt)** — *Forging Your Weapon (`.tmux.conf`)*: Enabling mouse mode (`set -g mouse on`), 1-based window numbering (`set -g base-index 1`), and hot-reloading (`tmux source-file ~/.tmux.conf`).
  5. **Kata 05 (Black Belt)** — *Free Sparring (`Sandbox & Mastery`)*: Full interactive cheat sheet and one-click injection of Sensei's production-ready `~/.tmux.conf`.

---

## Project Structure

```text
tmux-dojo/
├── README.md
├── build-image/
│   ├── README.md              # Image builder documentation
│   ├── Dockerfile             # Reproducible linux/386 Alpine Dockerfile
│   ├── build.sh               # Master build script (downloads v86, builds image & snapshot)
│   ├── build_rootfs.py        # Rootless Python builder for initramfs.cpio.gz & bzImage
│   └── generate_snapshot.js   # Boots the VM in Node.js and saves initial_state.bin
└── public/
    ├── index.html             # Split-screen Dojo UI (35% Kata sidebar / 65% Workspace)
    ├── style.css              # High-contrast dark terminal styling
    ├── app.js                 # V86Starter, xterm.js, VmInspector (ttyS1), & Config Editor
    ├── lessons.js             # 5-Belt English Kata curriculum & checkCmd definitions
    ├── tutorial.js            # Interactive TutorialEngine polling ttyS1 every 1500ms
    ├── vendor/                # Vendored xterm.js & xterm-addon-fit assets
    └── v86/                   # libv86.js, v86.wasm, BIOS ROMs, bzImage, initramfs, initial_state.bin
```

---

## Running Locally

Because `tmux-dojo` is 100% static client-side HTML/CSS/JS + WebAssembly, you can serve the `/public` folder with any static HTTP server:

```bash
python3 -m http.server 8080 --directory public
```

Then open **http://localhost:8080** in your browser.

---

## Rebuilding the Custom Alpine Linux Image & Snapshot

To rebuild the 32-bit Alpine Linux kernel (`bzImage`), root filesystem (`initramfs.cpio.gz`), and instant-boot VM snapshot (`initial_state.bin`):

```bash
./build-image/build.sh
```

By default, `build.sh` uses `build_rootfs.py` (which downloads official 32-bit Alpine packages directly from `dl-cdn.alpinelinux.org` and packs the `newc` `cpio.gz` archive without requiring root privileges or a running Docker daemon) and then runs `generate_snapshot.js` in Node.js to produce `/public/v86/initial_state.bin`. You can also build with Docker by running `USE_DOCKER=1 ./build-image/build.sh`.

---

## Deploying to GitHub Pages

This repository includes a ready-to-use GitHub Actions workflow ([`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)) that deploys `/public` directly to **GitHub Pages**:

1. Create a new repository on GitHub (e.g., `tmux-dojo`) and push this repository:
   ```bash
   git remote add origin https://github.com/<your-username>/tmux-dojo.git
   git push -u origin main
   ```
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. The `Deploy tmux-dojo to GitHub Pages` workflow will run automatically on every push to `main` and publish the live interactive tutorial at `https://<your-username>.github.io/tmux-dojo/`.

---

## License & Third-Party Notices

**`tmux-dojo`** is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version** (`GPL-3.0-or-later`). See the [LICENSE](LICENSE) file for the full license text.

### Bundled & Referenced Open-Source Components
- **[v86](https://github.com/copy/v86)** (`public/v86/libv86.js`, `v86.wasm`) — Copyright (c) Fabian Hemmer, licensed under the BSD 2-Clause License.
- **[SeaBIOS & VGABIOS](https://www.seabios.org/)** (`public/v86/seabios.bin`, `vgabios.bin`) — Licensed under the GNU LGPLv3 / GPLv3.
- **[xterm.js & @xterm/addon-fit](https://xtermjs.org/)** (`public/vendor/`) — Licensed under the MIT License.
- **[Alpine Linux](https://alpinelinux.org/)**, **Linux Kernel (`bzImage`)**, **BusyBox**, **GNU Bash**, **GNU Nano**, **ncurses**, and **tmux** (`public/v86/bzImage`, `initramfs.cpio.gz`) — Distributed under their respective open-source licenses (GPLv2, GPLv3, ISC, MIT). Reproducible source/package build scripts are provided in [`build-image/`](build-image/).
