// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0-or-later
/**
 * tmux-dojo — Comprehensive 7-Belt Interactive Kata Curriculum (English)
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

const SENSEI_RECOMMENDED_TMUX_CONF = `# ============================================================================
# Sensei's Recommended ~/.tmux.conf for tmux-dojo
# ============================================================================

# Enable full mouse support (click panes, click windows, drag borders, scroll)
set -g mouse on

# Start window and pane numbering at 1 instead of 0 (matches keyboard layout)
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on

# Increase scrollback history limit
set -g history-limit 10000

# Ensure 256-color and truecolor support
set -g default-terminal "tmux-256color"

# Intuitive pane splitting with | and -
bind | split-window -h
bind - split-window -v

# Fast config reload with Prefix + r
bind r source-file ~/.tmux.conf \\; display "Reloaded!"

# Clean, high-contrast status bar
set -g status-style bg=black,fg=green
set -g status-left "#[bg=green,fg=black,bold] #S #[bg=black,fg=green] "
set -g status-right "#[fg=cyan]%H:%M #[bg=cyan,fg=black,bold] dojo "
`;

const TMUX_DOJO_KATAS = [
    // ========================================================================
    // 🥋 KATA 1: WHITE BELT (6 Tasks)
    // ========================================================================
    {
        id: "kata-1-sessions",
        number: "KATA 01",
        belt: "White Belt",
        beltColor: "white",
        title: "Entering the Dojo (Sessions & Client-Server)",
        theory: `
            <p>
                Unlike a standard shell that dies the moment your terminal window closes or your SSH connection drops,
                <code>tmux</code> uses a <strong>client-server architecture</strong>. Launching <code>tmux</code> starts an
                independent background server that keeps your running processes, builds, and editors alive inside named
                <strong>sessions</strong>.
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Mastering the <kbd>Ctrl+b</kbd> Prefix Key</div>
                <p>
                    To prevent keybinding collisions with your shell or editor, <code>tmux</code> listens for a two-step chord
                    called the <strong>Prefix key</strong>:
                </p>
                <ol class="theory-steps">
                    <li>Hold <kbd>Ctrl</kbd> and press <kbd>b</kbd>.</li>
                    <li><strong>Release both keys completely.</strong> (Watch the top-bar badge light up green!)</li>
                    <li>Press the action key (e.g., <kbd>$</kbd> to rename session, <kbd>d</kbd> to detach, <kbd>s</kbd> to switch sessions).</li>
                </ol>
            </div>
        `,
        tasks: [
            {
                id: "k1-t1-start-dojo",
                description: "<strong>Start your first named session:</strong> Start a new session named <code>dojo</code> (<code>tmux new -s dojo</code>).",
                hint: "Type <code>tmux new -s dojo</code> in the terminal on the right and press <kbd>Enter</kbd>.",
                checkCmd: 'tmux has-session -t dojo 2>/dev/null && echo OK',
                autoSolveCmd: 'tmux has-session -t dojo 2>/dev/null || tmux new-session -d -s dojo',
                autoSteps: [
                    { type: "ttyS0", data: "tmux new -s dojo\n" }
                ]
            },
            {
                id: "k1-t2-rename-core",
                description: "<strong>Rename an active session from inside:</strong> Your project scope changed. Press <kbd>Ctrl+b</kbd> <kbd>$</kbd>, clear the name, and rename the current session to <code>core</code> (or run <code>tmux rename-session core</code>).",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>$</kbd> (<kbd>Shift+4</kbd>). Backspace out <code>dojo</code>, type <code>core</code>, and press <kbd>Enter</kbd>.",
                checkCmd: 'tmux has-session -t core 2>/dev/null && echo OK',
                autoSolveCmd: 'if tmux has-session -t dojo 2>/dev/null; then tmux rename-session -t dojo core; elif ! tmux has-session -t core 2>/dev/null; then tmux new-session -d -s core; fi'
            },
            {
                id: "k1-t3-detach-core",
                description: "<strong>Detach without killing processes:</strong> Detach from the <code>core</code> session back to the host shell using <kbd>Ctrl+b</kbd> <kbd>d</kbd>.",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>d</kbd>. Your <code>core</code> session stays alive in the background!",
                checkCmd: 'tmux list-sessions -F "#{session_name}:#{session_attached}" 2>/dev/null | grep -qx "core:0" && echo OK',
                autoSolveCmd: 'tmux has-session -t core 2>/dev/null || tmux new-session -d -s core; tmux detach-client -s core 2>/dev/null || true'
            },
            {
                id: "k1-t4-bg-worker",
                description: "<strong>Create a second background session:</strong> While detached in the host shell, create a second detached session named <code>bg-worker</code> without entering it (<code>tmux new -s bg-worker -d</code>).",
                hint: "Run <code>tmux new -s bg-worker -d</code> in the shell. The <code>-d</code> flag tells tmux to create the session in the background without attaching to it.",
                checkCmd: 'tmux has-session -t bg-worker 2>/dev/null && tmux list-sessions -F "#{session_name}:#{session_attached}" | grep -qx "bg-worker:0" && echo OK',
                autoSolveCmd: 'tmux has-session -t bg-worker 2>/dev/null || tmux new-session -d -s bg-worker; tmux detach-client -s bg-worker 2>/dev/null || true'
            },
            {
                id: "k1-t5-reattach-core",
                description: "<strong>Re-attach to your primary session:</strong> Re-enter the <code>core</code> session (<code>tmux attach -t core</code> or <code>tmux a -t core</code>).",
                hint: "Type <code>tmux attach -t core</code> (or shorthand <code>tmux a -t core</code>) in the terminal and press <kbd>Enter</kbd>.",
                checkCmd: 'tmux list-sessions -F "#{session_name}:#{session_attached}" 2>/dev/null | grep -qx "core:1" && echo OK',
                autoSolveCmd: 'tmux has-session -t core 2>/dev/null || tmux new-session -d -s core; if tmux list-clients 2>/dev/null | grep -q .; then tmux switch-client -t core; fi',
                autoSteps: [
                    { type: "ttyS1", cmd: "tmux has-session -t core 2>/dev/null || tmux new-session -d -s core" },
                    { type: "ttyS0", data: "tmux attach -t core\n" }
                ]
            },
            {
                id: "k1-t6-switch-session",
                description: "<strong>Switch sessions from inside tmux:</strong> Use the interactive session tree (<kbd>Ctrl+b</kbd> <kbd>s</kbd>, then use arrow keys and <kbd>Enter</kbd>) or <kbd>Ctrl+b</kbd> <kbd>)</kbd> to switch directly into the <code>bg-worker</code> session without detaching first.",
                hint: "Press <kbd>Ctrl+b</kbd> then <kbd>s</kbd> to open the interactive session list, highlight <code>bg-worker</code>, and press <kbd>Enter</kbd> (or press <kbd>Ctrl+b</kbd> then <kbd>)</kbd> to cycle to the next session).",
                checkCmd: 'tmux list-sessions -F "#{session_name}:#{session_attached}" 2>/dev/null | grep -qx "bg-worker:1" && echo OK',
                autoSolveCmd: 'tmux has-session -t bg-worker 2>/dev/null || tmux new-session -d -s bg-worker; tmux switch-client -t bg-worker 2>/dev/null || true',
                autoSteps: [
                    { type: "ttyS1", cmd: "tmux has-session -t bg-worker 2>/dev/null || tmux new-session -d -s bg-worker; tmux switch-client -t bg-worker 2>/dev/null || true" }
                ]
            }
        ]
    },

    // ========================================================================
    // 🟨 KATA 2: YELLOW BELT (6 Tasks)
    // ========================================================================
    {
        id: "kata-2-panes",
        number: "KATA 02",
        belt: "Yellow Belt",
        beltColor: "yellow",
        title: "Blade Work (Panes & Spatial Control)",
        theory: `
            <p>
                Inside any <code>tmux</code> window, you can slice your terminal into multiple side-by-side <strong>panes</strong>.
                Split panes let you edit source code, tail logs, and run tests simultaneously—and when you need to focus on one pane,
                you can toggle <strong>Monocle Zoom</strong> (<kbd>Ctrl+b</kbd> <kbd>z</kbd>) to temporarily maximize it.
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Pane Control Keybindings</div>
                <ul class="theory-keylist">
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>%</kbd></span> <span>Split active pane <strong>vertically</strong> (left / right)</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>"</kbd></span> <span>Split active pane <strong>horizontally</strong> (top / bottom)</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> or <kbd>o</kbd></span> <span>Navigate between panes</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>z</kbd></span> <span>Toggle <strong>Pane Zoom</strong> (fullscreen / restore)</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>Space</kbd></span> <span>Cycle preset pane layouts</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>x</kbd></span> <span>Close active pane (or type <code>exit</code>)</span></li>
                </ul>
            </div>
        `,
        tasks: [
            {
                id: "k2-t1-vertical-split",
                description: "<strong>Vertical Split (Left / Right):</strong> Inside your active session, split the screen into left and right panes using <kbd>Ctrl+b</kbd> <kbd>%</kbd>.",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>%</kbd> (<kbd>Shift+5</kbd>).",
                checkCmd: '[ $(tmux list-panes 2>/dev/null | wc -l) -eq 2 ] && echo OK',
                autoSolveCmd: 'tmux has-session 2>/dev/null || tmux new-session -d -s dojo; while [ $(tmux list-panes 2>/dev/null | wc -l) -gt 1 ]; do tmux kill-pane; done; tmux split-window -h'
            },
            {
                id: "k2-t2-horizontal-split",
                description: "<strong>Horizontal Split (Top / Bottom):</strong> Split the currently active pane into top and bottom panes using <kbd>Ctrl+b</kbd> <kbd>\"</kbd>.",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>\"</kbd> (double quote). You should now have 3 panes total.",
                checkCmd: '[ $(tmux list-panes 2>/dev/null | wc -l) -eq 3 ] && echo OK',
                autoSolveCmd: 'while [ $(tmux list-panes 2>/dev/null | wc -l) -lt 2 ]; do tmux split-window -h; done; while [ $(tmux list-panes 2>/dev/null | wc -l) -gt 2 ]; do tmux kill-pane; done; tmux split-window -v'
            },
            {
                id: "k2-t3-navigate-pane-0",
                description: "<strong>Pane Navigation:</strong> Move focus back to the first (leftmost) pane (index 0) using <kbd>Ctrl+b</kbd> <kbd>←</kbd> (Left Arrow) or <kbd>Ctrl+b</kbd> <kbd>o</kbd>.",
                hint: "Press <kbd>Ctrl+b</kbd> then <kbd>Left Arrow</kbd> (or <kbd>Ctrl+b</kbd> then <kbd>o</kbd>) until the green active border highlights the leftmost pane (index 0).",
                checkCmd: 'tmux list-panes -F "#{pane_index}:#{pane_active}" 2>/dev/null | grep -qx "0:1" && echo OK',
                autoSolveCmd: 'tmux select-pane -t :.0'
            },
            {
                id: "k2-t4-zoom-pane",
                description: "<strong>Toggle Pane Zoom (Monocle Mode):</strong> Temporarily maximize the active pane to full screen using <kbd>Ctrl+b</kbd> <kbd>z</kbd> so you can read long output clearly.",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>z</kbd>. Notice the <code>Z</code> flag on your active window in the bottom status bar!",
                checkCmd: '[ "$(tmux display-message -p \'#{window_zoomed_flag}\' 2>/dev/null)" = "1" ] && echo OK',
                autoSolveCmd: '[ "$(tmux display-message -p \'#{window_zoomed_flag}\' 2>/dev/null)" = "1" ] || tmux resize-pane -Z'
            },
            {
                id: "k2-t5-unzoom-cycle-layout",
                description: "<strong>Unzoom &amp; Cycle Layouts:</strong> Unzoom the pane (<kbd>Ctrl+b</kbd> <kbd>z</kbd>), then press <kbd>Ctrl+b</kbd> <kbd>Space</kbd> to cycle the 3 panes into an automatic preset layout (such as <code>even-horizontal</code> or <code>main-vertical</code>).",
                hint: "Press <kbd>Ctrl+b</kbd> <kbd>z</kbd> to restore your 3 panes, then press <kbd>Ctrl+b</kbd> <kbd>Space</kbd> to rearrange them.",
                checkCmd: '[ "$(tmux display-message -p \'#{window_zoomed_flag}\' 2>/dev/null)" = "0" ] && [ $(tmux list-panes 2>/dev/null | wc -l) -eq 3 ] && echo OK',
                autoSolveCmd: '[ "$(tmux display-message -p \'#{window_zoomed_flag}\' 2>/dev/null)" = "0" ] || tmux resize-pane -Z; tmux next-layout'
            },
            {
                id: "k2-t6-close-pane",
                description: "<strong>Close a Pane:</strong> Navigate to the last pane (index 2) and close it using <kbd>Ctrl+b</kbd> <kbd>x</kbd> (confirm with <kbd>y</kbd>) or by typing <code>exit</code>.",
                hint: "Type <code>exit</code> and press <kbd>Enter</kbd> in one of the panes (or press <kbd>Ctrl+b</kbd> <kbd>x</kbd> then <kbd>y</kbd>) so 2 panes remain.",
                checkCmd: '[ $(tmux list-panes 2>/dev/null | wc -l) -eq 2 ] && echo OK',
                autoSolveCmd: 'while [ $(tmux list-panes 2>/dev/null | wc -l) -gt 2 ]; do tmux kill-pane -t :.2 2>/dev/null || tmux kill-pane; done; while [ $(tmux list-panes 2>/dev/null | wc -l) -lt 2 ]; do tmux split-window -h; done'
            }
        ]
    },

    // ========================================================================
    // 🟧 KATA 3: ORANGE BELT (5 Tasks)
    // ========================================================================
    {
        id: "kata-3-windows",
        number: "KATA 03",
        belt: "Orange Belt",
        beltColor: "orange",
        title: "Multiple Rooms (Windows & Workflow Organization)",
        theory: `
            <p>
                <code>tmux</code> <strong>windows</strong> act like virtual desktops or browser tabs inside your session.
                Instead of cramming 8 tiny panes onto one screen, organize distinct contexts into named windows
                (such as <code>editor</code>, <code>server</code>, and <code>logs</code>) and pop crowded panes out into their own window with <kbd>Ctrl+b</kbd> <kbd>!</kbd>.
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Window Management Keybindings</div>
                <ul class="theory-keylist">
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>c</kbd></span> <span><strong>Create</strong> a new window</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>,</kbd></span> <span><strong>Rename</strong> the active window</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>0</kbd>–<kbd>9</kbd></span> <span>Jump to window by index number</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>n</kbd> / <kbd>p</kbd></span> <span>Cycle to <strong>Next</strong> / <strong>Previous</strong> window</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>!</kbd></span> <span><strong>Break</strong> active pane into a standalone window</span></li>
                </ul>
            </div>
        `,
        tasks: [
            {
                id: "k3-t1-create-window",
                description: "<strong>Create a New Window:</strong> Press <kbd>Ctrl+b</kbd> <kbd>c</kbd> to create a second window in your current session.",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>c</kbd>. Watch a new numbered window tab appear in the bottom status bar.",
                checkCmd: '[ $(tmux list-windows 2>/dev/null | wc -l) -ge 2 ] && echo OK',
                autoSolveCmd: 'tmux has-session 2>/dev/null || tmux new-session -d -s dojo; while [ $(tmux list-windows 2>/dev/null | wc -l) -lt 2 ]; do tmux new-window; done'
            },
            {
                id: "k3-t2-rename-server",
                description: "<strong>Rename the Active Window:</strong> Press <kbd>Ctrl+b</kbd> <kbd>,</kbd> (comma), backspace the default shell name, and name this window <code>server</code>.",
                hint: "Press <kbd>Ctrl+b</kbd> then <kbd>,</kbd>. Clear the current window name, type <code>server</code>, and press <kbd>Enter</kbd>.",
                checkCmd: 'tmux list-windows -F "#{window_name}" 2>/dev/null | grep -qx "server" && echo OK',
                autoSolveCmd: 'tmux rename-window server'
            },
            {
                id: "k3-t3-create-logs-window",
                description: "<strong>Create &amp; Name a Third Window:</strong> Create another window (<kbd>Ctrl+b</kbd> <kbd>c</kbd>) and rename it (<kbd>Ctrl+b</kbd> <kbd>,</kbd>) to <code>logs</code>.",
                hint: "Press <kbd>Ctrl+b</kbd> <kbd>c</kbd> to open a 3rd window, then press <kbd>Ctrl+b</kbd> <kbd>,</kbd>, type <code>logs</code>, and hit <kbd>Enter</kbd>.",
                checkCmd: 'tmux list-windows -F "#{window_name}" 2>/dev/null | grep -qx "logs" && [ $(tmux list-windows 2>/dev/null | wc -l) -ge 3 ] && echo OK',
                autoSolveCmd: 'tmux new-window -n logs'
            },
            {
                id: "k3-t4-jump-window-0",
                description: "<strong>Jump Between Windows by Index/Cycle:</strong> Switch back to your first window (index 0) using <kbd>Ctrl+b</kbd> <kbd>0</kbd> or <kbd>Ctrl+b</kbd> <kbd>p</kbd> (previous window).",
                hint: "Press <kbd>Ctrl+b</kbd> followed by <kbd>0</kbd> (or press <kbd>Ctrl+b</kbd> <kbd>p</kbd> until window <code>0</code> has the active <code>*</code> marker).",
                checkCmd: 'tmux list-windows -F "#{window_index}:#{window_active}" 2>/dev/null | grep -qx "0:1" && echo OK',
                autoSolveCmd: 'tmux select-window -t :0'
            },
            {
                id: "k3-t5-break-pane",
                description: "<strong>Break a Pane into its Own Window:</strong> Make sure Window 0 has 2 panes (split with <kbd>Ctrl+b</kbd> <kbd>%</kbd> if needed), then press <kbd>Ctrl+b</kbd> <kbd>!</kbd> (exclamation mark) to Pop/Break the active pane out into a brand-new standalone window!",
                hint: "If Window 0 only has 1 pane, press <kbd>Ctrl+b</kbd> <kbd>%</kbd> first. Then press <kbd>Ctrl+b</kbd> followed by <kbd>!</kbd> (<kbd>Shift+1</kbd>) to promote that pane into window #4.",
                checkCmd: '[ $(tmux list-windows 2>/dev/null | wc -l) -ge 4 ] && echo OK',
                autoSolveCmd: 'while [ $(tmux list-windows 2>/dev/null | wc -l) -lt 4 ]; do tmux split-window -h && tmux break-pane; done'
            }
        ]
    },

    // ========================================================================
    // 🟩 KATA 4: GREEN BELT (5 Tasks)
    // ========================================================================
    {
        id: "kata-4-buffers",
        number: "KATA 04",
        belt: "Green Belt",
        beltColor: "green",
        title: "Scrollback, Copy Mode & Command Prompt (Buffers)",
        theory: `
            <p>
                In <code>tmux</code>, you never need to reach for your mouse to scroll through terminal history or copy output.
                <strong>Copy Mode</strong> (<kbd>Ctrl+b</kbd> <kbd>[</kbd>) freezes your pane so you can scroll and search through
                thousands of lines of output, while internal <strong>paste buffers</strong> and the <strong>command prompt</strong>
                (<kbd>Ctrl+b</kbd> <kbd>:</kbd>) let you manipulate text and run <code>tmux</code> commands directly.
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Copy Mode &amp; Buffer Keybindings</div>
                <ul class="theory-keylist">
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>[</kbd></span> <span>Enter <strong>Copy / Scrollback Mode</strong></span></li>
                    <li><span><kbd>q</kbd> (inside Copy Mode)</span> <span><strong>Exit</strong> Copy Mode back to live shell</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>:</kbd></span> <span>Open the internal <code>tmux</code> <strong>Command Prompt</strong></span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>]</kbd></span> <span><strong>Paste</strong> contents of the active tmux buffer</span></li>
                </ul>
            </div>
        `,
        tasks: [
            {
                id: "k4-t1-enter-copy-mode",
                description: "<strong>Generate Output &amp; Enter Copy Mode:</strong> Run <code>seq 1 100</code> in your shell to flood the screen with numbers, then press <kbd>Ctrl+b</kbd> <kbd>[</kbd> to enter <strong>Copy Mode</strong> (notice the <code>[0/xx]</code> indicator in the top-right corner of the pane).",
                hint: "Type <code>seq 1 100</code> and press <kbd>Enter</kbd>. Then press <kbd>Ctrl+b</kbd>, release both keys, and press <kbd>[</kbd> (left square bracket).",
                checkCmd: '[ "$(tmux display-message -p \'#{pane_in_mode}\' 2>/dev/null)" = "1" ] && echo OK',
                autoSolveCmd: 'tmux has-session 2>/dev/null || tmux new-session -d -s dojo; tmux copy-mode'
            },
            {
                id: "k4-t2-exit-copy-mode",
                description: "<strong>Exit Copy Mode:</strong> After scrolling up/down with PageUp/PageDown or Arrow keys, press <kbd>q</kbd> to cleanly exit Copy Mode back to the live shell prompt.",
                hint: "Simply press <kbd>q</kbd> inside the terminal pane to leave Copy Mode.",
                checkCmd: '[ "$(tmux display-message -p \'#{pane_in_mode}\' 2>/dev/null)" = "0" ] && echo OK',
                autoSolveCmd: 'tmux send-keys -X cancel 2>/dev/null || true'
            },
            {
                id: "k4-t3-set-buffer",
                description: "<strong>Load Text into a tmux Paste Buffer:</strong> Load a secret token into <code>tmux</code>'s internal clipboard buffer by running <code>tmux set-buffer \"DOJO_MASTER_KEY\"</code> (either in the shell or via <kbd>Ctrl+b</kbd> <kbd>:</kbd> then typing <code>set-buffer \"DOJO_MASTER_KEY\"</code>).",
                hint: "Run <code>tmux set-buffer \"DOJO_MASTER_KEY\"</code> in the shell and press <kbd>Enter</kbd>.",
                checkCmd: 'tmux show-buffer 2>/dev/null | grep -q "DOJO_MASTER_KEY" && echo OK',
                autoSolveCmd: 'tmux set-buffer "DOJO_MASTER_KEY"'
            },
            {
                id: "k4-t4-command-prompt-window",
                description: "<strong>Use the Command Prompt (<kbd>Ctrl+b</kbd> <kbd>:</kbd>):</strong> Press <kbd>Ctrl+b</kbd> <kbd>:</kbd> to open the yellow <code>tmux</code> command bar at the bottom of the screen, and run <code>new-window -n \"secret\"</code> to create a window named <code>secret</code> without touching the shell.",
                hint: "Press <kbd>Ctrl+b</kbd> then <kbd>:</kbd> (<kbd>Shift+;</kbd>). At the bottom <code>:</code> prompt, type <code>new-window -n \"secret\"</code> and press <kbd>Enter</kbd>.",
                checkCmd: 'tmux list-windows -F "#{window_name}" 2>/dev/null | grep -qx "secret" && echo OK',
                autoSolveCmd: 'tmux new-window -n "secret"'
            },
            {
                id: "k4-t5-paste-buffer",
                description: "<strong>Paste from Buffer (<kbd>Ctrl+b</kbd> <kbd>]</kbd>):</strong> Inside the <code>secret</code> window, type <code>echo </code> (with a space), then press <kbd>Ctrl+b</kbd> <kbd>]</kbd> to paste <code>DOJO_MASTER_KEY</code> from your tmux buffer, and redirect it to <code>/tmp/key.txt</code> (<code>echo DOJO_MASTER_KEY &gt; /tmp/key.txt</code>).",
                hint: "Type <code>echo </code>, press <kbd>Ctrl+b</kbd> then <kbd>]</kbd> (right square bracket) to paste <code>DOJO_MASTER_KEY</code>, then type <code> &gt; /tmp/key.txt</code> and press <kbd>Enter</kbd>.",
                checkCmd: 'grep -q "DOJO_MASTER_KEY" /tmp/key.txt 2>/dev/null && echo OK',
                autoSolveCmd: 'echo DOJO_MASTER_KEY > /tmp/key.txt'
            }
        ]
    },

    // ========================================================================
    // 🟦 KATA 5: BLUE BELT (4 Tasks)
    // ========================================================================
    {
        id: "kata-5-choreography",
        number: "KATA 05",
        belt: "Blue Belt",
        beltColor: "blue",
        title: "Advanced Multi-Pane Choreography (Sync & Join)",
        theory: `
            <p>
                When administering multiple servers or containers at once, <code>tmux</code>'s
                <strong><code>synchronize-panes</code></strong> option turns your window into a broadcast console: every keystroke
                you type is mirrored into all panes in the active window simultaneously!
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Broadcast &amp; Multi-Pane Commands</div>
                <ul class="theory-keylist">
                    <li><span><kbd>Ctrl+b</kbd> <kbd>:</kbd> <code>setw synchronize-panes on</code></span> <span>Broadcast keystrokes to all panes in window</span></li>
                    <li><span><kbd>Ctrl+b</kbd> <kbd>:</kbd> <code>setw synchronize-panes off</code></span> <span>Return to normal single-pane input</span></li>
                    <li><span><kbd>Ctrl+b</kbd> <kbd>{</kbd> / <kbd>}</kbd></span> <span>Swap active pane with previous / next pane</span></li>
                </ul>
            </div>
        `,
        tasks: [
            {
                id: "k5-t1-two-pane-arena",
                description: "<strong>Prepare a 2-Pane Arena:</strong> Ensure your current window has exactly 2 panes side-by-side (use <kbd>Ctrl+b</kbd> <kbd>%</kbd> or close extra panes).",
                hint: "If your current window has 1 pane, press <kbd>Ctrl+b</kbd> <kbd>%</kbd> to split it into 2 panes. If it has more than 2 panes, close extras with <code>exit</code>.",
                checkCmd: '[ $(tmux list-panes 2>/dev/null | wc -l) -eq 2 ] && echo OK',
                autoSolveCmd: 'tmux has-session 2>/dev/null || tmux new-session -d -s dojo; while [ $(tmux list-panes 2>/dev/null | wc -l) -gt 2 ]; do tmux kill-pane; done; while [ $(tmux list-panes 2>/dev/null | wc -l) -lt 2 ]; do tmux split-window -h; done'
            },
            {
                id: "k5-t2-sync-on",
                description: "<strong>Enable Synchronize-Panes (Broadcast Mode):</strong> Press <kbd>Ctrl+b</kbd> <kbd>:</kbd> and type <code>setw synchronize-panes on</code>. Now every keystroke you type goes to BOTH panes simultaneously!",
                hint: "Press <kbd>Ctrl+b</kbd> then <kbd>:</kbd>, type <code>setw synchronize-panes on</code>, and press <kbd>Enter</kbd> (or run <code>tmux setw synchronize-panes on</code> in the shell).",
                checkCmd: '[ "$(tmux display-message -p \'#{pane_synchronized}\' 2>/dev/null)" = "1" ] && echo OK',
                autoSolveCmd: 'tmux setw synchronize-panes on'
            },
            {
                id: "k5-t3-sync-touch",
                description: "<strong>Execute a Synchronized Command:</strong> Type <code>touch /tmp/sync_$$</code> and hit <kbd>Enter</kbd> once. Because both panes have different shell PIDs (<code>$$</code>), two separate <code>/tmp/sync_*</code> files will be created at the exact same instant!",
                hint: "With synchronize-panes active, type <code>touch /tmp/sync_$$</code> once and press <kbd>Enter</kbd>. Watch both panes execute the command in unison!",
                checkCmd: '[ $(ls /tmp/sync_* 2>/dev/null | wc -l) -ge 2 ] && echo OK',
                autoSolveCmd: 'touch /tmp/sync_101 /tmp/sync_102'
            },
            {
                id: "k5-t4-sync-off",
                description: "<strong>Disable Synchronize-Panes:</strong> Turn off broadcast mode so you don't accidentally run destructive commands everywhere (<kbd>Ctrl+b</kbd> <kbd>:</kbd> then <code>setw synchronize-panes off</code>).",
                hint: "Press <kbd>Ctrl+b</kbd> then <kbd>:</kbd>, type <code>setw synchronize-panes off</code>, and press <kbd>Enter</kbd> (or run <code>tmux setw synchronize-panes off</code>).",
                checkCmd: '[ "$(tmux display-message -p \'#{pane_synchronized}\' 2>/dev/null)" = "0" ] && echo OK',
                autoSolveCmd: 'tmux setw synchronize-panes off'
            }
        ]
    },

    // ========================================================================
    // 🟫 KATA 6: BROWN BELT (5 Tasks)
    // ========================================================================
    {
        id: "kata-6-config",
        number: "KATA 06",
        belt: "Brown Belt",
        beltColor: "brown",
        title: "Forging Your Weapon (~/.tmux.conf)",
        theory: `
            <p>
                Out of the box, <code>tmux</code> uses conservative defaults. Building a permanent, ergonomic
                <code>~/.tmux.conf</code> transforms <code>tmux</code> into an extension of your hands:
            </p>
            <ul class="theory-bullets">
                <li><strong>Mouse Support (<code>set -g mouse on</code>):</strong> Click panes/windows, drag borders to resize, and scroll with your mouse wheel.</li>
                <li><strong>1-Based Indexing (<code>base-index 1</code> / <code>pane-base-index 1</code>):</strong> Since <kbd>0</kbd> is on the far right of your keyboard, starting at <kbd>1</kbd> aligns window numbers with your left hand.</li>
                <li><strong>Visual Split Keys (<code>|</code> and <code>-</code>) &amp; Hot Reload (<code>r</code>):</strong> Replace <kbd>%</kbd> and <kbd>"</kbd> with mnemonic <kbd>|</kbd> and <kbd>-</kbd> bindings, and reload configs anytime via <kbd>Prefix + r</kbd>.</li>
            </ul>
            <p>
                <em>Tip:</em> You can edit <code>~/.tmux.conf</code> using <code>nano ~/.tmux.conf</code> in the terminal OR via the
                <strong>[ ~/.tmux.conf Editor ]</strong> tab at the top of the workspace!
            </p>
        `,
        tasks: [
            {
                id: "k6-t1-mouse-on",
                description: "<strong>Enable Mouse Support:</strong> Create/edit <code>~/.tmux.conf</code> (via <code>nano ~/.tmux.conf</code> or the <code>[ ~/.tmux.conf Editor ]</code> tab) and add <code>set -g mouse on</code>.",
                hint: "Run <code>echo 'set -g mouse on' &gt;&gt; ~/.tmux.conf</code> in the terminal, or add <code>set -g mouse on</code> in the <code>[ ~/.tmux.conf Editor ]</code> tab and click Save.",
                checkCmd: 'grep -Eq "^[[:space:]]*set(-option)?[[:space:]]+-g[[:space:]]+mouse[[:space:]]+on" ~/.tmux.conf 2>/dev/null && echo OK',
                autoSolveCmd: 'grep -Eq "^[[:space:]]*set(-option)?[[:space:]]+-g[[:space:]]+mouse[[:space:]]+on" ~/.tmux.conf 2>/dev/null || echo "set -g mouse on" >> ~/.tmux.conf'
            },
            {
                id: "k6-t2-base-index",
                description: "<strong>Human-Friendly 1-Based Indexing:</strong> Add <code>set -g base-index 1</code> and <code>setw -g pane-base-index 1</code> to <code>~/.tmux.conf</code> so windows and panes start at <code>1</code> instead of <code>0</code>.",
                hint: "Add both <code>set -g base-index 1</code> and <code>setw -g pane-base-index 1</code> to <code>~/.tmux.conf</code>.",
                checkCmd: 'grep -q "base-index 1" ~/.tmux.conf 2>/dev/null && grep -q "pane-base-index 1" ~/.tmux.conf 2>/dev/null && echo OK',
                autoSolveCmd: 'grep -q "base-index 1" ~/.tmux.conf 2>/dev/null || echo "set -g base-index 1" >> ~/.tmux.conf; grep -q "pane-base-index 1" ~/.tmux.conf 2>/dev/null || echo "setw -g pane-base-index 1" >> ~/.tmux.conf'
            },
            {
                id: "k6-t3-split-binds",
                description: "<strong>Ergonomic Split Shortcuts (<code>|</code> and <code>-</code>):</strong> Add intuitive split bindings to <code>~/.tmux.conf</code>: <code>bind | split-window -h</code> and <code>bind - split-window -v</code>.",
                hint: "Append <code>bind | split-window -h</code> and <code>bind - split-window -v</code> to <code>~/.tmux.conf</code>.",
                checkCmd: 'grep -q "split-window -h" ~/.tmux.conf 2>/dev/null && grep -q "split-window -v" ~/.tmux.conf 2>/dev/null && echo OK',
                autoSolveCmd: 'grep -q "split-window -h" ~/.tmux.conf 2>/dev/null || echo "bind | split-window -h" >> ~/.tmux.conf; grep -q "split-window -v" ~/.tmux.conf 2>/dev/null || echo "bind - split-window -v" >> ~/.tmux.conf'
            },
            {
                id: "k6-t4-reload-bind",
                description: "<strong>Fast Config Reload Binding (<code>Prefix + r</code>):</strong> Add <code>bind r source-file ~/.tmux.conf \\; display \"Reloaded!\"</code> to <code>~/.tmux.conf</code>.",
                hint: "Add <code>bind r source-file ~/.tmux.conf \\; display \"Reloaded!\"</code> to <code>~/.tmux.conf</code>.",
                checkCmd: 'grep -q "source-file ~/.tmux.conf" ~/.tmux.conf 2>/dev/null && echo OK',
                autoSolveCmd: 'grep -q "source-file ~/.tmux.conf" ~/.tmux.conf 2>/dev/null || echo "bind r source-file ~/.tmux.conf \\; display \\"Reloaded!\\"" >> ~/.tmux.conf'
            },
            {
                id: "k6-t5-apply-live",
                description: "<strong>Apply Configuration Live:</strong> Run <code>tmux source-file ~/.tmux.conf</code> (or click \"Save &amp; Reload in tmux\" in the Config Editor tab) so the running server adopts all your new settings immediately.",
                hint: "Run <code>tmux source-file ~/.tmux.conf</code> in the terminal or click <strong>💾 Save &amp; Reload in tmux</strong> inside the Config Editor tab.",
                checkCmd: 'tmux show-options -g 2>/dev/null | grep -q "mouse on" && tmux show-options -g 2>/dev/null | grep -q "base-index 1" && tmux list-keys 2>/dev/null | grep -q "split-window -h" && echo OK',
                autoSolveCmd: 'tmux has-session 2>/dev/null || tmux new-session -d -s dojo; tmux source-file ~/.tmux.conf'
            }
        ]
    },

    // ========================================================================
    // ⬛ KATA 7: BLACK BELT (2 Tasks + Master Cheat Sheet + Sensei Config Injector)
    // ========================================================================
    {
        id: "kata-7-mastery",
        number: "KATA 07",
        belt: "Black Belt",
        beltColor: "black",
        title: "Automation, Status Bar Styling & Sandbox (Mastery)",
        hasSandboxExtras: true,
        theory: `
            <p>
                Welcome to the Black Belt Dojo! True <code>tmux</code> mastery means treating your terminal layout as
                <strong>code</strong>: styling your status bar for instant situational awareness and scripting multi-window,
                multi-pane project workspaces that spin up in milliseconds.
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Scripting tmux Workspaces</div>
                <p>
                    Because every <code>tmux</code> action is a CLI subcommand, you can chain commands with <code>\\;</code> or script them in bash:
                    <br />
                    <code>tmux new-session -d -s prod -n monitor \\; split-window -h</code>
                </p>
            </div>
        `,
        tasks: [
            {
                id: "k7-t1-status-style",
                description: "<strong>Customize the Status Bar Style:</strong> Configure your status bar colors by adding <code>set -g status-style bg=black,fg=green</code> to <code>~/.tmux.conf</code> and reloading (<code>tmux source-file ~/.tmux.conf</code>).",
                hint: "Run <code>echo 'set -g status-style bg=black,fg=green' &gt;&gt; ~/.tmux.conf &amp;&amp; tmux source-file ~/.tmux.conf</code> (or use the Config Editor tab).",
                checkCmd: 'tmux show-options -g status-style 2>/dev/null | grep -q "bg=black" && echo OK',
                autoSolveCmd: 'tmux has-session 2>/dev/null || tmux new-session -d -s dojo; grep -q "status-style bg=black,fg=green" ~/.tmux.conf 2>/dev/null || echo "set -g status-style bg=black,fg=green" >> ~/.tmux.conf; tmux source-file ~/.tmux.conf'
            },
            {
                id: "k7-t2-script-workspace",
                description: "<strong>Script an Automated Project Workspace:</strong> Write an executable script <code>/root/start-dev.sh</code> (or run a one-liner) that programmatically spins up a detached session named <code>prod</code> with a window named <code>monitor</code> and splits it into 2 panes (<code>tmux new-session -d -s prod -n monitor \\; split-window -h</code>).",
                hint: "Run <code>tmux new-session -d -s prod -n monitor \\; split-window -h</code> in your shell (or save it into <code>/root/start-dev.sh</code> and run <code>sh /root/start-dev.sh</code>).",
                checkCmd: 'tmux has-session -t prod 2>/dev/null && tmux list-windows -t prod -F "#{window_name}" | grep -qx "monitor" && [ $(tmux list-panes -t prod:monitor 2>/dev/null | wc -l) -eq 2 ] && echo OK',
                autoSolveCmd: 'printf "#!/bin/sh\\ntmux kill-session -t prod 2>/dev/null || true\\ntmux new-session -d -s prod -n monitor \\\\; split-window -h\\n" > /root/start-dev.sh && chmod +x /root/start-dev.sh && /root/start-dev.sh'
            }
        ],
        sandboxFooterHtml: `
            <div class="sandbox-action-box">
                <p class="sandbox-action-desc">
                    Want to load Sensei's complete, battle-tested <code>~/.tmux.conf</code> (mouse mode, 1-based indexing, <kbd>Prefix + |</kbd> &amp; <kbd>Prefix + -</kbd> splits, <kbd>Prefix + r</kbd> reload, and styled status bar)?
                </p>
                <button id="inject-sensei-conf-btn" class="inject-sensei-btn" type="button">
                    ⚡ Inject Sensei's Recommended ~/.tmux.conf
                </button>
                <div id="inject-sensei-feedback" class="inject-sensei-feedback" aria-live="polite"></div>
            </div>

            <div class="master-cheatsheet">
                <div class="cheatsheet-section">
                    <h4>Sessions &amp; Server</h4>
                    <ul class="theory-keylist">
                        <li><span><code>tmux new -s name</code></span> <span>Start named session</span></li>
                        <li><span><code>tmux new -s name -d</code></span> <span>Start detached session in background</span></li>
                        <li><span><code>tmux ls</code> / <kbd>Ctrl+b</kbd> <kbd>s</kbd></span> <span>List / interactively pick sessions</span></li>
                        <li><span><code>tmux a -t name</code></span> <span>Attach to named session</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>d</kbd></span> <span>Detach from current session</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>$</kbd></span> <span>Rename current session</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>(</kbd> / <kbd>)</kbd></span> <span>Switch to previous / next session</span></li>
                    </ul>
                </div>

                <div class="cheatsheet-section">
                    <h4>Panes &amp; Spatial Control</h4>
                    <ul class="theory-keylist">
                        <li><span><kbd>Ctrl+b</kbd> <kbd>%</kbd></span> <span>Split vertically (left/right)</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>"</kbd></span> <span>Split horizontally (top/bottom)</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>Arrows</kbd> / <kbd>o</kbd></span> <span>Move focus between panes</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>z</kbd></span> <span>Toggle pane zoom (Monocle fullscreen)</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>Space</kbd></span> <span>Cycle preset pane layouts</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>{</kbd> / <kbd>}</kbd></span> <span>Swap active pane left / right</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>x</kbd></span> <span>Close active pane</span></li>
                    </ul>
                </div>

                <div class="cheatsheet-section">
                    <h4>Windows (Virtual Tabs)</h4>
                    <ul class="theory-keylist">
                        <li><span><kbd>Ctrl+b</kbd> <kbd>c</kbd></span> <span>Create new window</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>,</kbd></span> <span>Rename active window</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>n</kbd> / <kbd>p</kbd></span> <span>Next / Previous window</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>0</kbd>–<kbd>9</kbd></span> <span>Jump directly to window by number</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>!</kbd></span> <span>Break active pane into its own window</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>w</kbd></span> <span>Visual window &amp; pane tree</span></li>
                    </ul>
                </div>

                <div class="cheatsheet-section">
                    <h4>Copy Mode, Buffers &amp; Broadcast</h4>
                    <ul class="theory-keylist">
                        <li><span><kbd>Ctrl+b</kbd> <kbd>[</kbd></span> <span>Enter Copy/Scroll mode (<kbd>q</kbd> to exit)</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>]</kbd></span> <span>Paste from active tmux buffer</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>:</kbd></span> <span>Open internal tmux command prompt</span></li>
                        <li><span><code>:setw synchronize-panes on</code></span> <span>Broadcast typing to all panes in window</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>?</kbd></span> <span>List all active keybindings</span></li>
                    </ul>
                </div>
            </div>
        `
    }
];

window.TMUX_DOJO_KATAS = TMUX_DOJO_KATAS;
window.SENSEI_RECOMMENDED_TMUX_CONF = SENSEI_RECOMMENDED_TMUX_CONF;
// @license-end
