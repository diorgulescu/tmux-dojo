// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0-or-later
/**
 * tmux-dojo — Client-Side Application (Phases 2–4)
 * Copyright (C) 2026 Dragoş Iorgulescu
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const PREFIX_COMBO_DESCRIPTIONS = {
    "%": "Split Pane Vertically",
    '"': "Split Pane Horizontally",
    c: "Create New Window",
    d: "Detach from Session",
    ",": "Rename Current Window",
    $: "Rename Current Session",
    n: "Next Window",
    p: "Previous Window",
    l: "Last Selected Window",
    w: "Choose Window / Pane Tree",
    s: "Choose Session Interactively",
    z: "Toggle Active Pane Zoom",
    x: "Kill Active Pane",
    "&": "Kill Current Window",
    "[": "Enter Copy / Scroll Mode",
    "]": "Paste Copy Buffer",
    ":": "Open tmux Command Prompt",
    "?": "List All Keybindings",
    o: "Select Next Pane",
    ";": "Toggle Last Active Pane",
    "{": "Swap Pane Left / Up",
    "}": "Swap Pane Right / Down",
    "!": "Break Pane into New Window",
    t: "Show Big Clock",
    " ": "Cycle Pane Layout",
    "|": "Split Vertically (Custom Bind)",
    "-": "Split Horizontally (Custom Bind)",
    r: "Reload ~/.tmux.conf (Custom Bind)",
    ArrowUp: "Focus Pane Up",
    ArrowDown: "Focus Pane Down",
    ArrowLeft: "Focus Pane Left",
    ArrowRight: "Focus Pane Right",
    0: "Select Window 0",
    1: "Select Window 1",
    2: "Select Window 2",
    3: "Select Window 3",
    4: "Select Window 4",
    5: "Select Window 5",
    6: "Select Window 6",
    7: "Select Window 7",
    8: "Select Window 8",
    9: "Select Window 9",
};

/**
 * Parses `/root/.tmux.conf` text and returns structured line-by-line English explanations.
 * @param {string} rawText
 * @returns {Array<{lineNumber: number, code: string, summary: string, category: string}>}
 */
function analyzeTmuxConfLines(rawText) {
    const lines = (rawText || "").split(/\r?\n/);
    const results = [];

    lines.forEach((rawLine, idx) => {
        const trimmed = rawLine.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            return;
        }

        let summary = "Custom tmux configuration directive.";
        let category = "Option";

        if (/set(?:-option)?\s+-g\s+mouse\s+on/i.test(trimmed)) {
            category = "Ergonomics";
            summary =
                "Enables full mouse mode: click to focus panes or windows, drag borders to resize panes, and scroll output with the mouse wheel.";
        } else if (/set(?:-option)?\s+-g\s+mouse\s+off/i.test(trimmed)) {
            category = "Ergonomics";
            summary = "Disables mouse support inside tmux.";
        } else if (/set(?:-option)?\s+-g\s+base-index\s+(\d+)/i.test(trimmed)) {
            const m = trimmed.match(/base-index\s+(\d+)/i);
            category = "Indexing";
            summary = `Starts numbering tmux windows at ${m ? m[1] : "1"} instead of 0 so window numbers match your keyboard's number row.`;
        } else if (/setw\s+-g\s+pane-base-index\s+(\d+)/i.test(trimmed)) {
            const m = trimmed.match(/pane-base-index\s+(\d+)/i);
            category = "Indexing";
            summary = `Starts numbering panes within each window at ${m ? m[1] : "1"}.`;
        } else if (/set(?:-option)?\s+-g\s+renumber-windows\s+on/i.test(trimmed)) {
            category = "Indexing";
            summary = "Automatically re-numbers remaining windows sequentially whenever a window is closed.";
        } else if (/set(?:-option)?\s+-g\s+history-limit\s+(\d+)/i.test(trimmed)) {
            const m = trimmed.match(/history-limit\s+(\d+)/i);
            category = "Scrollback";
            summary = `Sets the scrollback buffer size for each pane to ${m ? m[1] : "10000"} lines.`;
        } else if (/set(?:-option)?\s+-g\s+default-terminal\s+["']?([^"'\s]+)["']?/i.test(trimmed)) {
            const m = trimmed.match(/default-terminal\s+["']?([^"'\s]+)["']?/i);
            category = "Colors";
            summary = `Sets the default TERM inside tmux to '${m ? m[1] : "tmux-256color"}' for rich 256-color rendering.`;
        } else if (/set(?:-option)?\s+-g\s+prefix\s+(\S+)/i.test(trimmed)) {
            const m = trimmed.match(/prefix\s+(\S+)/i);
            category = "Prefix Key";
            summary = `Changes the master tmux Prefix key chord to ${m ? m[1] : "a custom key"}.`;
        } else if (/bind(?:-key)?\s+\|\s+split-window\s+-h/i.test(trimmed)) {
            category = "Keybinding";
            summary = "Binds Prefix + | to split the current pane vertically (left/right).";
        } else if (/bind(?:-key)?\s+-\s+split-window\s+-v/i.test(trimmed)) {
            category = "Keybinding";
            summary = "Binds Prefix + - to split the current pane horizontally (top/bottom).";
        } else if (/bind(?:-key)?\s+r\s+source-file/i.test(trimmed)) {
            category = "Keybinding";
            summary = "Binds Prefix + r to hot-reload ~/.tmux.conf inside the running tmux server.";
        } else if (/bind(?:-key)?\s+(\S+)\s+(.+)/i.test(trimmed)) {
            const m = trimmed.match(/bind(?:-key)?\s+(\S+)\s+(.+)/i);
            category = "Keybinding";
            summary = `Binds Prefix + '${m[1]}' to run: ${m[2]}`;
        } else if (/status-style|status-left|status-right|window-status/i.test(trimmed)) {
            category = "Status Bar";
            summary = "Customizes the appearance, colors, or segments of the bottom tmux status bar.";
        } else if (/set(?:-option)?\s+-s\s+escape-time\s+(\d+)/i.test(trimmed)) {
            const m = trimmed.match(/escape-time\s+(\d+)/i);
            category = "Performance";
            summary = `Reduces ESC key delay to ${m ? m[1] : "0"}ms for snappy modal editing in Vim/Neovim.`;
        }

        results.push({
            lineNumber: idx + 1,
            code: trimmed,
            summary,
            category,
        });
    });

    return results;
}

class VmInspector {
    /**
     * @param {object} emulator - Instance of V86 / V86Starter
     * @param {(state: {active: boolean, lastCommand?: string}) => void} [onStatusChange]
     */
    constructor(emulator, onStatusChange = null) {
        this.emulator = emulator;
        this.onStatusChange = onStatusChange;
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder("utf-8");
        this.buffer = "";
        this.queue = [];
        this.currentTask = null;

        this._boundOnByte = (byte) => this._handleOutputChar(this.decoder.decode(Uint8Array.of(byte), { stream: true }));
        this.emulator.add_listener("serial1-output-byte", this._boundOnByte);
    }

    /**
     * Sends a shell command over ttyS1 (serial port 1) and resolves with the stdout
     * captured between ___EVAL_START___ and ___EVAL_END___.
     *
     * @param {string} command
     * @param {number} [timeoutMs=8000]
     * @returns {Promise<string>}
     */
    exec(command, timeoutMs = 8000) {
        return new Promise((resolve, reject) => {
            this.queue.push({ command, resolve, reject, timeoutMs });
            this._processNext();
        });
    }

    /**
     * Silently updates the ttyS0 terminal dimensions and refreshes any running tmux client.
     *
     * @param {number} cols
     * @param {number} rows
     * @returns {Promise<string>}
     */
    syncTerminalSize(cols, rows) {
        const safeCols = Math.max(20, Math.floor(cols));
        const safeRows = Math.max(5, Math.floor(rows));
        const cmd = `stty -F /dev/ttyS0 rows ${safeRows} cols ${safeCols} && (tmux list-clients >/dev/null 2>&1 && tmux refresh-client || true)`;
        return this.exec(cmd);
    }

    /**
     * Reads `/root/.tmux.conf` from the VM via ttyS1.
     * @returns {Promise<string>}
     */
    async readTmuxConf() {
        return this.exec("cat /root/.tmux.conf 2>/dev/null || true");
    }

    /**
     * Writes `/root/.tmux.conf` using base64 encoding to avoid shell escaping issues,
     * and reloads the config inside any running tmux server.
     *
     * @param {string} content
     * @returns {Promise<string>}
     */
    async writeAndReloadTmuxConf(content) {
        const utf8Bytes = new TextEncoder().encode(content);
        let binaryStr = "";
        for (let i = 0; i < utf8Bytes.length; i++) {
            binaryStr += String.fromCharCode(utf8Bytes[i]);
        }
        const b64 = btoa(binaryStr);
        const cmd = `printf '%s' '${b64}' | base64 -d > /root/.tmux.conf && (tmux has-session 2>/dev/null && tmux source-file /root/.tmux.conf || true) && echo CONF_SAVED_OK`;
        return this.exec(cmd, 8000);
    }

    _processNext() {
        if (this.currentTask || this.queue.length === 0) {
            return;
        }

        const task = this.queue.shift();
        this.currentTask = task;
        this.buffer = "";

        if (this.onStatusChange) {
            this.onStatusChange({ active: true, lastCommand: task.command });
        }

        task.timer = setTimeout(() => {
            if (this.currentTask === task) {
                this.currentTask = null;
                if (this.onStatusChange) {
                    this.onStatusChange({ active: false, lastCommand: task.command });
                }
                task.reject(new Error(`VmInspector timeout executing: ${task.command}`));
                this._processNext();
            }
        }, task.timeoutMs);

        const payload = this.encoder.encode(task.command.trim() + "\n");
        this.emulator.serial_send_bytes(1, payload);
    }

    _handleOutputChar(ch) {
        if (!this.currentTask) {
            return;
        }

        this.buffer += ch;

        const startMarker = "___EVAL_START___";
        const endMarker = "___EVAL_END___";
        const startIdx = this.buffer.indexOf(startMarker);
        const endIdx = this.buffer.indexOf(endMarker);

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const afterEnd = this.buffer.slice(endIdx);
            if (!afterEnd.includes("\n")) {
                return;
            }

            const rawOutput = this.buffer
                .slice(startIdx + startMarker.length, endIdx)
                .replace(/^\r?\n/, "")
                .replace(/\r?\n$/, "")
                .replace(/\r\n/g, "\n");

            const finishedTask = this.currentTask;
            clearTimeout(finishedTask.timer);
            this.currentTask = null;
            this.buffer = "";

            if (this.onStatusChange) {
                this.onStatusChange({ active: false, lastCommand: finishedTask.command });
            }

            finishedTask.resolve(rawOutput);
            this._processNext();
        }
    }

    destroy() {
        if (this.currentTask && this.currentTask.timer) {
            clearTimeout(this.currentTask.timer);
        }
        this.queue = [];
        this.currentTask = null;
    }
}

window.VmInspector = VmInspector;
window.analyzeTmuxConfLines = analyzeTmuxConfLines;

class TmuxDojoApp {
    constructor() {
        this.terminalContainer = document.getElementById("terminal-container");
        this.vmStatusBadge = document.getElementById("vm-status-badge");
        this.vmStatusText = document.getElementById("vm-status-text");
        this.resetVmBtn = document.getElementById("reset-vm-btn");
        this.keystrokeVisualizer = document.getElementById("keystroke-visualizer");
        this.prefixStatusIcon = document.getElementById("prefix-status-icon");
        this.lastKeyChord = document.getElementById("last-key-chord");
        this.telemetryDot = document.getElementById("telemetry-dot");
        this.telemetrySummary = document.getElementById("telemetry-summary");
        this.dimensionsReadout = document.getElementById("dimensions-readout");

        // Workspace Tab Switcher & Config Editor elements
        this.tabBtnTerminal = document.getElementById("tab-btn-terminal");
        this.tabBtnConfig = document.getElementById("tab-btn-config");
        this.panelTerminal = document.getElementById("panel-terminal");
        this.panelConfig = document.getElementById("panel-config");
        this.confTextarea = document.getElementById("tmux-conf-textarea");
        this.confExplanations = document.getElementById("tmux-conf-explanations");
        this.confSyncStatus = document.getElementById("config-sync-status");
        this.reloadFromVmBtn = document.getElementById("reload-from-vm-btn");
        this.loadSenseiTemplateBtn = document.getElementById("load-sensei-template-btn");
        this.saveReloadConfBtn = document.getElementById("save-reload-conf-btn");

        this.term = null;
        this.fitAddon = null;
        this.emulator = null;
        this.inspector = null;
        this.isVmReady = false;
        this.bootOutputBuffer = "";
        this.prefixActiveTimer = null;
        this.prefixArmed = false;
        this.resizeDebounceTimer = null;
        this.activeWorkspaceTab = "terminal";
        this.snapshotAvailable = null;
        this.encoder = new TextEncoder();
    }

    init() {
        this._initTerminal();
        this._initKeyboardInterception();
        this._initUiListeners();
        this._initConfigEditor();
        this.bootVm();
    }

    _initTerminal() {
        const TerminalCtor = window.Terminal;
        const FitAddonCtor = window.FitAddon ? window.FitAddon.FitAddon : null;

        this.term = new TerminalCtor({
            cursorBlink: true,
            cursorStyle: "block",
            fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Menlo, Monaco, Consolas, monospace',
            fontSize: 14,
            lineHeight: 1.2,
            scrollback: 1500,
            allowProposedApi: true,
            theme: {
                background: "#090d14",
                foreground: "#eef4fc",
                cursor: "#22c55e",
                cursorAccent: "#090d14",
                selectionBackground: "rgba(56, 189, 248, 0.28)",
                black: "#0e141f",
                red: "#ef4444",
                green: "#22c55e",
                yellow: "#f59e0b",
                blue: "#3b82f6",
                magenta: "#a855f7",
                cyan: "#38bdf8",
                white: "#eef4fc",
                brightBlack: "#647792",
                brightRed: "#f87171",
                brightGreen: "#4ade80",
                brightYellow: "#fbbf24",
                brightBlue: "#60a5fa",
                brightMagenta: "#c084fc",
                brightCyan: "#7dd3fc",
                brightWhite: "#ffffff",
            },
        });

        if (FitAddonCtor) {
            this.fitAddon = new FitAddonCtor();
            this.term.loadAddon(this.fitAddon);
        }

        this.term.open(this.terminalContainer);
        if (this.fitAddon) {
            this.fitAddon.fit();
        }
        this._updateDimensionsReadout(this.term.cols, this.term.rows);

        // Forward user terminal input to ttyS0 (serial0-input)
        // Also detect raw \x02 (Ctrl+b) if sent programmatically or via mobile/IME input
        this.term.onData((data) => {
            if (!this.emulator) {
                return;
            }
            if (data === "\x02") {
                this._triggerPrefixVisualizer();
            }
            const bytes = this.encoder.encode(data);
            for (let i = 0; i < bytes.length; i++) {
                this.emulator.bus.send("serial0-input", bytes[i]);
            }
        });

        // Whenever xterm resizes, silently sync ttyS0 rows/cols via VmInspector on ttyS1
        this.term.onResize(({ cols, rows }) => {
            this._updateDimensionsReadout(cols, rows);
            if (this.isVmReady && this.inspector) {
                this._scheduleSilentResize(cols, rows);
            }
        });

        this.term.focus();
    }

    _initKeyboardInterception() {
        this.term.attachCustomKeyEventHandler((e) => {
            if (e.type !== "keydown") {
                return true;
            }

            // Detect Ctrl+b (tmux prefix key)
            if (e.ctrlKey && !e.altKey && !e.metaKey && (e.key === "b" || e.key === "B" || e.code === "KeyB")) {
                e.preventDefault();
                e.stopPropagation();
                this._triggerPrefixVisualizer();
                if (this.emulator) {
                    this.emulator.bus.send("serial0-input", 0x02); // \x02 = Ctrl+B
                }
                return false;
            }

            // Block browser default actions for common terminal/tmux control keys
            if (e.ctrlKey && !e.altKey && !e.metaKey) {
                const keyLower = e.key.toLowerCase();
                if (["d", "c", "z", "l", "a", "e", "u", "k", "p", "n", "f", "r"].includes(keyLower)) {
                    e.preventDefault();
                }
            }

            // If prefix was just pressed, display the recognized action in the visualizer
            if (this.prefixArmed && !["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
                this._showPrefixFollowUpKey(e.key);
            }

            return true;
        });

        this.terminalContainer.addEventListener(
            "keydown",
            (e) => {
                if (e.ctrlKey && !e.altKey && !e.metaKey && (e.key === "b" || e.key === "B" || e.code === "KeyB")) {
                    e.preventDefault();
                }
            },
            { capture: true }
        );
    }

    _triggerPrefixVisualizer() {
        this.prefixArmed = true;
        this.keystrokeVisualizer.classList.remove("combo-resolved");
        this.keystrokeVisualizer.classList.add("prefix-active");
        if (this.prefixStatusIcon) {
            this.prefixStatusIcon.textContent = "🟢";
        }
        this.lastKeyChord.textContent =
            'PREFIX ACTIVE (Ctrl+b) — Awaiting command key (%, ", c, d, ,)...';

        if (this.prefixActiveTimer) {
            clearTimeout(this.prefixActiveTimer);
        }
        this.prefixActiveTimer = setTimeout(() => {
            this.prefixArmed = false;
            this.keystrokeVisualizer.classList.remove("prefix-active", "combo-resolved");
            if (this.prefixStatusIcon) {
                this.prefixStatusIcon.textContent = "⌨";
            }
            this.lastKeyChord.textContent = "Idle — Press Ctrl+b";
        }, 4000);
    }

    _showPrefixFollowUpKey(key) {
        this.prefixArmed = false;
        const displayKey =
            key === " "
                ? "Space"
                : key.startsWith("Arrow")
                ? key.replace("Arrow", "")
                : key;
        const actionDesc = PREFIX_COMBO_DESCRIPTIONS[key] || "Send Command to tmux";

        this.keystrokeVisualizer.classList.remove("prefix-active");
        this.keystrokeVisualizer.classList.add("combo-resolved");
        if (this.prefixStatusIcon) {
            this.prefixStatusIcon.textContent = "⚡";
        }
        this.lastKeyChord.textContent = `Ctrl+b ${displayKey} → ${actionDesc}`;

        if (this.prefixActiveTimer) {
            clearTimeout(this.prefixActiveTimer);
        }
        this.prefixActiveTimer = setTimeout(() => {
            this.keystrokeVisualizer.classList.remove("prefix-active", "combo-resolved");
            if (this.prefixStatusIcon) {
                this.prefixStatusIcon.textContent = "⌨";
            }
            this.lastKeyChord.textContent = "Idle — Press Ctrl+b";
        }, 2200);
    }

    _initUiListeners() {
        window.addEventListener("resize", () => {
            if (this.activeWorkspaceTab === "terminal" && this.fitAddon) {
                this.fitAddon.fit();
            }
        });

        this.resetVmBtn.addEventListener("click", () => {
            this.resetVm();
        });

        this.terminalContainer.addEventListener("click", () => {
            if (this.term) {
                this.term.focus();
            }
        });

        if (this.tabBtnTerminal && this.tabBtnConfig) {
            this.tabBtnTerminal.addEventListener("click", () => this.switchWorkspaceTab("terminal"));
            this.tabBtnConfig.addEventListener("click", () => this.switchWorkspaceTab("config"));
        }
    }

    _initConfigEditor() {
        if (!this.confTextarea) {
            return;
        }

        // Update live line-by-line explanation whenever the user edits the textarea
        this.confTextarea.addEventListener("input", () => {
            this._renderConfigExplanations(this.confTextarea.value);
            if (this.confSyncStatus) {
                this.confSyncStatus.textContent = "Unsaved edits";
                this.confSyncStatus.className = "config-sync-status status-unsaved";
            }
        });

        if (this.reloadFromVmBtn) {
            this.reloadFromVmBtn.addEventListener("click", () => {
                this.fetchTmuxConfFromVm();
            });
        }

        if (this.loadSenseiTemplateBtn) {
            this.loadSenseiTemplateBtn.addEventListener("click", () => {
                this.confTextarea.value = window.SENSEI_RECOMMENDED_TMUX_CONF || "";
                this._renderConfigExplanations(this.confTextarea.value);
                if (this.confSyncStatus) {
                    this.confSyncStatus.textContent = "Loaded Sensei Preset (Click Save & Reload to apply)";
                    this.confSyncStatus.className = "config-sync-status status-unsaved";
                }
            });
        }

        if (this.saveReloadConfBtn) {
            this.saveReloadConfBtn.addEventListener("click", () => {
                this.saveAndReloadTmuxConfFromEditor();
            });
        }

        this._renderConfigExplanations(this.confTextarea.value);
    }

    async switchWorkspaceTab(tabName) {
        this.activeWorkspaceTab = tabName;

        if (tabName === "config") {
            this.tabBtnTerminal.classList.remove("active");
            this.tabBtnTerminal.setAttribute("aria-selected", "false");
            this.tabBtnConfig.classList.add("active");
            this.tabBtnConfig.setAttribute("aria-selected", "true");

            this.panelTerminal.classList.add("hidden");
            this.panelConfig.classList.remove("hidden");

            await this.fetchTmuxConfFromVm();
        } else {
            this.tabBtnConfig.classList.remove("active");
            this.tabBtnConfig.setAttribute("aria-selected", "false");
            this.tabBtnTerminal.classList.add("active");
            this.tabBtnTerminal.setAttribute("aria-selected", "true");

            this.panelConfig.classList.add("hidden");
            this.panelTerminal.classList.remove("hidden");

            if (this.fitAddon) {
                this.fitAddon.fit();
            }
            if (this.term) {
                this.term.focus();
            }
        }
    }

    async fetchTmuxConfFromVm() {
        if (!this.isVmReady || !this.inspector || !this.confTextarea) {
            return;
        }
        if (this.confSyncStatus) {
            this.confSyncStatus.textContent = "Fetching /root/.tmux.conf via ttyS1...";
            this.confSyncStatus.className = "config-sync-status";
        }
        try {
            const content = await this.inspector.readTmuxConf();
            this.confTextarea.value = content;
            this._renderConfigExplanations(content);
            if (this.confSyncStatus) {
                this.confSyncStatus.textContent = content.trim()
                    ? "✓ Loaded live /root/.tmux.conf from VM"
                    : "✓ /root/.tmux.conf is currently empty";
                this.confSyncStatus.className = "config-sync-status status-saved";
            }
        } catch (err) {
            if (this.confSyncStatus) {
                this.confSyncStatus.textContent = `⚠ Error reading config: ${err.message}`;
                this.confSyncStatus.className = "config-sync-status status-unsaved";
            }
        }
    }

    async saveAndReloadTmuxConfFromEditor() {
        if (!this.isVmReady || !this.inspector || !this.confTextarea) {
            return;
        }
        const text = this.confTextarea.value;
        if (this.saveReloadConfBtn) {
            this.saveReloadConfBtn.disabled = true;
            this.saveReloadConfBtn.textContent = "⏳ Saving & Reloading...";
        }
        try {
            const out = await this.inspector.writeAndReloadTmuxConf(text);
            this._renderConfigExplanations(text);
            if (out.includes("CONF_SAVED_OK") && this.confSyncStatus) {
                this.confSyncStatus.textContent =
                    "✓ Saved to /root/.tmux.conf & executed tmux source-file /root/.tmux.conf!";
                this.confSyncStatus.className = "config-sync-status status-saved";
            }
            if (window.tutorialEngine) {
                window.tutorialEngine.checkActiveTask();
            }
        } catch (err) {
            if (this.confSyncStatus) {
                this.confSyncStatus.textContent = `⚠ Save failed: ${err.message}`;
                this.confSyncStatus.className = "config-sync-status status-unsaved";
            }
        } finally {
            if (this.saveReloadConfBtn) {
                this.saveReloadConfBtn.disabled = false;
                this.saveReloadConfBtn.textContent = "💾 Save & Reload in tmux";
            }
        }
    }

    _renderConfigExplanations(rawText) {
        if (!this.confExplanations) {
            return;
        }
        const items = analyzeTmuxConfLines(rawText);
        if (items.length === 0) {
            this.confExplanations.innerHTML = `
                <div class="conf-empty-state">
                    <p>No active directives found in <code>/root/.tmux.conf</code>.</p>
                    <p>Type settings like <code>set -g mouse on</code> or <code>set -g base-index 1</code> in the editor on the left, or click <strong>⚡ Load Sensei Preset</strong> to inspect a complete configuration.</p>
                </div>
            `;
            return;
        }

        this.confExplanations.innerHTML = items
            .map(
                (item) => `
                <div class="conf-explanation-card">
                    <div class="conf-card-top">
                        <span class="conf-line-badge">Line ${item.lineNumber}</span>
                        <span class="conf-category-badge">${item.category}</span>
                    </div>
                    <code class="conf-directive-code">${item.code
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")}</code>
                    <p class="conf-directive-summary">${item.summary}</p>
                </div>
            `
            )
            .join("");
    }

    async _checkSnapshotExists() {
        if (this.snapshotAvailable !== null) {
            return this.snapshotAvailable;
        }
        try {
            const resp = await fetch("./v86/initial_state.bin", { method: "HEAD" });
            this.snapshotAvailable = resp.ok;
        } catch (_) {
            this.snapshotAvailable = false;
        }
        return this.snapshotAvailable;
    }

    async bootVm(forceColdBoot = false) {
        this._setVmStatus("booting");
        this.isVmReady = false;
        this.bootOutputBuffer = "";

        this.term.clear();

        const useSnapshot = !forceColdBoot && (await this._checkSnapshotExists());

        const v86Config = {
            wasm_path: "v86/v86.wasm",
            memory_size: 32 * 1024 * 1024,
            vga_memory_size: 2 * 1024 * 1024,
            screen_container: document.getElementById("v86-screen-hidden"),
            bios: { url: "v86/seabios.bin" },
            vga_bios: { url: "v86/vgabios.bin" },
            uart1: true,
            autostart: true,
        };

        if (useSnapshot) {
            v86Config.initial_state = { url: "./v86/initial_state.bin" };
        } else {
            this.term.writeln("\x1b[1;36m[tmux-dojo]\x1b[0m Booting 32-bit Alpine Linux in v86 (32MB RAM)...");
            v86Config.bzimage = { url: "v86/bzImage" };
            v86Config.initrd = { url: "v86/initramfs.cpio.gz" };
            v86Config.cmdline = "rw root=/dev/ram0 console=ttyS0,115200 init=/init quiet";
        }

        const StarterCtor = window.V86Starter || window.V86;
        this.emulator = new StarterCtor(v86Config);
        window.emulator = this.emulator;

        // Instantiate ttyS1 Telemetry Bridge
        this.inspector = new VmInspector(this.emulator, ({ active, lastCommand }) => {
            if (active) {
                this.telemetryDot.classList.add("active");
                this.telemetrySummary.textContent = `ttyS1: ${lastCommand.slice(0, 28)}...`;
            } else {
                this.telemetryDot.classList.remove("active");
                this.telemetrySummary.textContent = "ttyS1 Telemetry: Ready";
            }
        });
        window.vmInspector = this.inspector;

        // Connect ttyS0 output bytes (serial0-output-byte) directly to xterm.js as raw Uint8Array
        // so multi-byte UTF-8 box-drawing characters (│, ─, ┼, etc.) decode properly instead of Latin-1 mojibake
        this.emulator.add_listener("serial0-output-byte", (byte) => {
            this.term.write(Uint8Array.of(byte));

            if (!this.isVmReady) {
                this.bootOutputBuffer += String.fromCharCode(byte);
                if (this.bootOutputBuffer.includes("dojo:~#")) {
                    this._onVmBootReady();
                }
            }
        });

        // When restoring from initial_state.bin, trigger prompt display and mark ready immediately once loaded
        if (useSnapshot) {
            this.emulator.add_listener("emulator-loaded", () => {
                this.term.write("\x1b[1;32mWelcome to tmux-dojo!\x1b[0m Type \x1b[1;36mtmux\x1b[0m to begin.\r\n");
                // Send newline to ttyS0 so bash prints fresh `dojo:~# ` prompt
                this.emulator.bus.send("serial0-input", 0x0a);
                this._onVmBootReady();
            });
        }
    }

    async _onVmBootReady() {
        if (this.isVmReady) {
            return;
        }
        this.isVmReady = true;
        this._setVmStatus("ready");
        this.telemetrySummary.textContent = "ttyS1 Telemetry: Ready";

        if (this.fitAddon && this.activeWorkspaceTab === "terminal") {
            this.fitAddon.fit();
        }

        try {
            await this.inspector.syncTerminalSize(this.term.cols, this.term.rows);
        } catch (err) {
            console.warn("Initial ttyS0 size sync failed:", err);
        }

        if (this.activeWorkspaceTab === "terminal") {
            this.term.focus();
        }
    }

    _scheduleSilentResize(cols, rows) {
        if (this.resizeDebounceTimer) {
            clearTimeout(this.resizeDebounceTimer);
        }
        this.resizeDebounceTimer = setTimeout(async () => {
            if (this.isVmReady && this.inspector) {
                try {
                    await this.inspector.syncTerminalSize(cols, rows);
                } catch (err) {
                    console.warn("Silent ttyS0 resize failed:", err);
                }
            }
        }, 120);
    }

    async resetVm() {
        if (this.inspector) {
            this.inspector.destroy();
            this.inspector = null;
        }
        if (this.emulator) {
            try {
                await this.emulator.stop();
                this.emulator.destroy();
            } catch (_) {
                // Ignore stop errors during reboot
            }
            this.emulator = null;
        }
        this.bootVm();
    }

    _setVmStatus(state) {
        if (state === "ready") {
            this.vmStatusBadge.classList.remove("status-booting");
            this.vmStatusBadge.classList.add("status-ready");
            this.vmStatusText.textContent = "Ready";
        } else {
            this.vmStatusBadge.classList.remove("status-ready");
            this.vmStatusBadge.classList.add("status-booting");
            this.vmStatusText.textContent = "Booting";
        }
    }

    _updateDimensionsReadout(cols, rows) {
        if (this.dimensionsReadout) {
            this.dimensionsReadout.textContent = `${cols} × ${rows}`;
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const app = new TmuxDojoApp();
    window.tmuxDojoApp = app;
    app.init();
});
// @license-end
