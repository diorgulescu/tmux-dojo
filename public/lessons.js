// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0-or-later
/**
 * tmux-dojo — Interactive Kata Curriculum (English)
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

# Intuitive pane splitting with | and - (keeping current directory)
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# Fast config reload with Prefix + r
bind r source-file ~/.tmux.conf \\; display-message "tmux.conf reloaded!"

# Clean, high-contrast status bar
set -g status-style "bg=#0b1019,fg=#eef4fc"
set -g status-left "#[bg=#22c55e,fg=#051b0c,bold] #S #[bg=#0b1019,fg=#eef4fc] "
set -g status-right "#[fg=#9fb0c7]%H:%M #[bg=#38bdf8,fg=#051b0c,bold] dojo "
setw -g window-status-current-style "bg=#182336,fg=#22c55e,bold"
`;

const TMUX_DOJO_KATAS = [
    {
        id: "kata-1-sessions",
        number: "KATA 01",
        belt: "White Belt",
        beltColor: "white",
        title: "Entering the Dojo (Sessions)",
        theory: `
            <p>
                Unlike a standard shell that dies the moment your terminal window closes or your SSH connection drops,
                <code>tmux</code> uses a <strong>client-server architecture</strong>. When you start <code>tmux</code>,
                it launches a background server that holds one or more persistent <strong>sessions</strong>.
            </p>
            <p>
                You can <em>detach</em> from a session at any time—leaving your builds, editors, and logs running safely in the background—and
                <em>re-attach</em> later from anywhere.
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">How the Prefix Key (<kbd>Ctrl+b</kbd>) Works</div>
                <p>
                    By default, <code>tmux</code> stays out of your way and passes every keystroke straight to your shell.
                    To talk to <code>tmux</code> itself, you press the <strong>Prefix key</strong>:
                </p>
                <ol class="theory-steps">
                    <li>Hold <kbd>Ctrl</kbd> and press <kbd>b</kbd>.</li>
                    <li><strong>Release both keys completely.</strong></li>
                    <li>Now press the command key (for example, <kbd>d</kbd> to detach).</li>
                </ol>
            </div>
        `,
        tasks: [
            {
                id: "k1-t1-start-session",
                description: "Start a new named session called <code>dojo</code> by running <code>tmux new -s dojo</code> in the terminal.",
                hint: "Type <code>tmux new -s dojo</code> in the shell on the right and press <kbd>Enter</kbd>. Notice the green status bar at the bottom!",
                checkCmd: 'tmux has-session -t dojo 2>/dev/null && echo OK',
                autoSteps: [
                    { type: "ttyS0", data: "tmux new -s dojo\n" }
                ]
            },
            {
                id: "k1-t2-detach-session",
                description: "Detach from your running <code>dojo</code> session using the prefix key: press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>d</kbd>.",
                hint: "Make sure the terminal is focused. Press <kbd>Ctrl+b</kbd> (watch the top-right Prefix badge light up green), release, and press <kbd>d</kbd>. You can also run <code>tmux detach</code>.",
                checkCmd: 'tmux has-session -t dojo 2>/dev/null && tmux list-sessions -F "#{session_name}:#{session_attached}" 2>/dev/null | grep -q "^dojo:0$" && echo OK',
                autoSteps: [
                    { type: "ttyS1", cmd: "tmux detach-client -s dojo 2>/dev/null || true" }
                ]
            },
            {
                id: "k1-t3-reattach-session",
                description: "Re-attach to your background <code>dojo</code> session by running <code>tmux attach -t dojo</code>.",
                hint: "Type <code>tmux attach -t dojo</code> (or shorthand <code>tmux a -t dojo</code>) in the terminal and press <kbd>Enter</kbd>.",
                checkCmd: 'tmux list-sessions -F "#{session_name}:#{session_attached}" 2>/dev/null | grep -q "^dojo:1$" && echo OK',
                autoSteps: [
                    { type: "ttyS0", data: "tmux attach -t dojo\n" }
                ]
            }
        ]
    },
    {
        id: "kata-2-panes",
        number: "KATA 02",
        belt: "Yellow Belt",
        beltColor: "yellow",
        title: "Blade Work (Panes)",
        theory: `
            <p>
                Inside a <code>tmux</code> window, you can slice your screen into multiple side-by-side <strong>panes</strong>.
                This lets you edit code in one pane, tail logs in another, and run tests in a third—all within a single terminal viewport.
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Essential Pane Keybindings</div>
                <ul class="theory-keylist">
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>%</kbd></span> <span>Split active pane <strong>vertically</strong> (left / right)</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>"</kbd></span> <span>Split active pane <strong>horizontally</strong> (top / bottom)</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd></span> <span>Move focus between panes</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>z</kbd></span> <span>Toggle <strong>Zoom</strong> (fullscreen the active pane &amp; press again to restore)</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>x</kbd></span> <span>Close the active pane (or simply type <code>exit</code>)</span></li>
                </ul>
            </div>
        `,
        tasks: [
            {
                id: "k2-t1-vertical-split",
                description: "Split your current pane vertically (left and right) by pressing <kbd>Ctrl+b</kbd> followed by <kbd>%</kbd> (so there are 2 panes total).",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>%</kbd> (<kbd>Shift+5</kbd>). If you aren't inside <code>tmux</code> yet, run <code>tmux attach || tmux</code> first.",
                checkCmd: '[ $(tmux list-panes 2>/dev/null | wc -l) -eq 2 ] && echo OK',
                autoSteps: [
                    {
                        type: "ttyS1",
                        cmd: 'tmux has-session 2>/dev/null || tmux new-session -d -s dojo; while [ $(tmux list-panes 2>/dev/null | wc -l) -gt 1 ]; do tmux kill-pane; done; tmux split-window -h'
                    }
                ]
            },
            {
                id: "k2-t2-horizontal-split",
                description: "Split the active pane horizontally (top and bottom) by pressing <kbd>Ctrl+b</kbd> followed by <kbd>\"</kbd> (so there are 3 panes total).",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>\"</kbd> (double quote). You should now see 3 panes on screen.",
                checkCmd: '[ $(tmux list-panes 2>/dev/null | wc -l) -eq 3 ] && echo OK',
                autoSteps: [
                    {
                        type: "ttyS1",
                        cmd: 'while [ $(tmux list-panes 2>/dev/null | wc -l) -lt 2 ]; do tmux split-window -h; done; while [ $(tmux list-panes 2>/dev/null | wc -l) -gt 2 ]; do tmux kill-pane; done; tmux split-window -v'
                    }
                ]
            },
            {
                id: "k2-t3-close-pane",
                description: "Close one pane so you return to having 2 panes (type <code>exit</code> and press <kbd>Enter</kbd>, or press <kbd>Ctrl+b</kbd> then <kbd>x</kbd> and confirm with <kbd>y</kbd>).",
                hint: "Simply type <code>exit</code> in the active shell pane and press <kbd>Enter</kbd> (or press <kbd>Ctrl+d</kbd>).",
                checkCmd: '[ $(tmux list-panes 2>/dev/null | wc -l) -eq 2 ] && echo OK',
                autoSteps: [
                    {
                        type: "ttyS1",
                        cmd: 'while [ $(tmux list-panes 2>/dev/null | wc -l) -gt 2 ]; do tmux kill-pane; done; while [ $(tmux list-panes 2>/dev/null | wc -l) -lt 2 ]; do tmux split-window -h; done'
                    }
                ]
            }
        ]
    },
    {
        id: "kata-3-windows",
        number: "KATA 03",
        belt: "Green Belt",
        beltColor: "green",
        title: "Multiple Rooms (Windows)",
        theory: `
            <p>
                When a single screen of split panes gets crowded, <code>tmux</code> lets you organize your session into multiple
                full-screen <strong>windows</strong>—just like tabs in a modern web browser. Each window has its own independent set of panes
                and appears in the green status bar at the bottom of the screen.
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Window Management Keybindings</div>
                <ul class="theory-keylist">
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>c</kbd></span> <span><strong>Create</strong> a new window</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>n</kbd> / <kbd>p</kbd></span> <span>Switch to the <strong>Next</strong> or <strong>Previous</strong> window</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>0</kbd>–<kbd>9</kbd></span> <span>Jump directly to window by number</span></li>
                    <li><span><kbd>Ctrl+b</kbd> then <kbd>,</kbd></span> <span><strong>Rename</strong> the current window</span></li>
                </ul>
            </div>
        `,
        tasks: [
            {
                id: "k3-t1-create-window",
                description: "Create a second window inside your <code>tmux</code> session by pressing <kbd>Ctrl+b</kbd> followed by <kbd>c</kbd>.",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>c</kbd>. Look at the bottom status bar—you will see two numbered windows (e.g. <code>0:bash</code> and <code>1:bash*</code>).",
                checkCmd: '[ $(tmux list-windows 2>/dev/null | wc -l) -eq 2 ] && echo OK',
                autoSteps: [
                    {
                        type: "ttyS1",
                        cmd: 'tmux has-session 2>/dev/null || tmux new-session -d -s dojo; while [ $(tmux list-windows 2>/dev/null | wc -l) -gt 1 ]; do tmux kill-window; done; tmux new-window'
                    }
                ]
            },
            {
                id: "k3-t2-rename-window",
                description: "Rename the current window to <code>logs</code> by pressing <kbd>Ctrl+b</kbd> followed by <kbd>,</kbd> (comma), typing <code>logs</code>, and pressing <kbd>Enter</kbd>.",
                hint: "Press <kbd>Ctrl+b</kbd> then <kbd>,</kbd>. An amber prompt <code>(rename-window)</code> will appear at the bottom: clear the existing name with <kbd>Backspace</kbd>, type <code>logs</code>, and hit <kbd>Enter</kbd> (or run <code>tmux rename-window logs</code>).",
                checkCmd: 'tmux list-windows -F "#{window_name}" 2>/dev/null | grep -qx "logs" && echo OK',
                autoSteps: [
                    {
                        type: "ttyS1",
                        cmd: 'tmux rename-window logs'
                    }
                ]
            }
        ]
    },
    {
        id: "kata-4-config",
        number: "KATA 04",
        belt: "Brown Belt",
        beltColor: "brown",
        title: "Forging Your Weapon (.tmux.conf)",
        theory: `
            <p>
                Out of the box, <code>tmux</code> uses conservative defaults. Power users customize their workflow inside
                <code>~/.tmux.conf</code> so <code>tmux</code> feels effortless:
            </p>
            <ul class="theory-bullets">
                <li><strong>Mouse Mode (<code>set -g mouse on</code>):</strong> Click any pane or window tab to focus it, drag pane borders to resize, and scroll output with your mouse wheel.</li>
                <li><strong>1-Based Indexing (<code>set -g base-index 1</code>):</strong> Number windows starting at <code>1</code> instead of <code>0</code> so they line up with the left side of your keyboard number row.</li>
                <li><strong>Hot Reloading:</strong> Apply changes anytime without restarting your session via <code>tmux source-file ~/.tmux.conf</code> (or <kbd>Ctrl+b</kbd> <kbd>:</kbd> then <code>source-file ~/.tmux.conf</code>).</li>
            </ul>
        `,
        tasks: [
            {
                id: "k4-t1-mouse-on",
                description: "Create or edit <code>~/.tmux.conf</code> and add <code>set -g mouse on</code> (using <code>nano ~/.tmux.conf</code> or <code>echo \"set -g mouse on\" &gt;&gt; ~/.tmux.conf</code>).",
                hint: "Run <code>echo 'set -g mouse on' &gt;&gt; ~/.tmux.conf</code> in your shell, or open <code>nano ~/.tmux.conf</code>, add the line, and save with <kbd>Ctrl+O</kbd> <kbd>Enter</kbd>, then exit with <kbd>Ctrl+X</kbd>.",
                checkCmd: 'grep -q "mouse on" ~/.tmux.conf 2>/dev/null && echo OK',
                autoSteps: [
                    {
                        type: "ttyS1",
                        cmd: 'grep -q "mouse on" ~/.tmux.conf 2>/dev/null || echo "set -g mouse on" >> ~/.tmux.conf'
                    }
                ]
            },
            {
                id: "k4-t2-base-index",
                description: "Configure windows to start numbering at <code>1</code> by adding <code>set -g base-index 1</code> to <code>~/.tmux.conf</code>.",
                hint: "Run <code>echo 'set -g base-index 1' &gt;&gt; ~/.tmux.conf</code> or add the line inside <code>nano ~/.tmux.conf</code>.",
                checkCmd: 'grep -q "base-index 1" ~/.tmux.conf 2>/dev/null && echo OK',
                autoSteps: [
                    {
                        type: "ttyS1",
                        cmd: 'grep -q "base-index 1" ~/.tmux.conf 2>/dev/null || echo "set -g base-index 1" >> ~/.tmux.conf'
                    }
                ]
            },
            {
                id: "k4-t3-reload-config",
                description: "Reload your configuration into the live <code>tmux</code> server by running <code>tmux source-file ~/.tmux.conf</code> (or via <kbd>Ctrl+b</kbd> <kbd>:</kbd> then <code>source-file ~/.tmux.conf</code>).",
                hint: "In any shell or pane, run <code>tmux source-file ~/.tmux.conf</code> and press <kbd>Enter</kbd>. Afterwards, try clicking between panes or windows with your mouse!",
                checkCmd: 'tmux show-options -g 2>/dev/null | grep -q "mouse on" && tmux show-options -g 2>/dev/null | grep -q "base-index 1" && echo OK',
                autoSteps: [
                    {
                        type: "ttyS1",
                        cmd: 'tmux has-session 2>/dev/null || tmux new-session -d -s dojo; tmux source-file ~/.tmux.conf'
                    }
                ]
            }
        ]
    },
    {
        id: "kata-5-mastery",
        number: "KATA 05",
        belt: "Black Belt",
        beltColor: "black",
        title: "Free Sparring (Sandbox & Mastery)",
        isSandbox: true,
        theory: `
            <p>
                Congratulations—you have mastered sessions, panes, windows, and configuration in <code>tmux</code>!
                This sandbox is yours for unrestricted experimentation.
            </p>
            <div class="sandbox-action-box">
                <p class="sandbox-action-desc">
                    Want to test-drive a battle-tested setup with mouse support, 1-based indexing, <kbd>Prefix + |</kbd> / <kbd>Prefix + -</kbd> splits, and a custom status bar?
                </p>
                <button id="inject-sensei-conf-btn" class="inject-sensei-btn" type="button">
                    ⚡ Inject Sensei's Recommended ~/.tmux.conf
                </button>
                <div id="inject-sensei-feedback" class="inject-sensei-feedback" aria-live="polite"></div>
            </div>

            <div class="master-cheatsheet">
                <div class="cheatsheet-section">
                    <h4>Sessions</h4>
                    <ul class="theory-keylist">
                        <li><span><code>tmux new -s name</code></span> <span>Start named session</span></li>
                        <li><span><code>tmux ls</code></span> <span>List running sessions</span></li>
                        <li><span><code>tmux a -t name</code></span> <span>Attach to session</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>d</kbd></span> <span>Detach from session</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>s</kbd></span> <span>Interactive session picker</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>$</kbd></span> <span>Rename current session</span></li>
                    </ul>
                </div>

                <div class="cheatsheet-section">
                    <h4>Panes (Splits)</h4>
                    <ul class="theory-keylist">
                        <li><span><kbd>Ctrl+b</kbd> <kbd>%</kbd></span> <span>Split vertically (left/right)</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>"</kbd></span> <span>Split horizontally (top/bottom)</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>Arrows</kbd></span> <span>Switch active pane</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>z</kbd></span> <span>Toggle pane zoom (fullscreen)</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>Space</kbd></span> <span>Cycle pane layouts</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>x</kbd></span> <span>Kill active pane</span></li>
                    </ul>
                </div>

                <div class="cheatsheet-section">
                    <h4>Windows (Tabs)</h4>
                    <ul class="theory-keylist">
                        <li><span><kbd>Ctrl+b</kbd> <kbd>c</kbd></span> <span>Create new window</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>n</kbd> / <kbd>p</kbd></span> <span>Next / Previous window</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>0</kbd>–<kbd>9</kbd></span> <span>Select window by number</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>,</kbd></span> <span>Rename current window</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>w</kbd></span> <span>Visual window &amp; pane tree</span></li>
                    </ul>
                </div>

                <div class="cheatsheet-section">
                    <h4>Copy Mode &amp; Command Prompt</h4>
                    <ul class="theory-keylist">
                        <li><span><kbd>Ctrl+b</kbd> <kbd>[</kbd></span> <span>Enter Copy/Scroll mode (<kbd>q</kbd> to quit)</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>:</kbd></span> <span>Open <code>tmux</code> command prompt</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>?</kbd></span> <span>List all active keybindings</span></li>
                    </ul>
                </div>
            </div>
        `,
        tasks: []
    }
];

window.TMUX_DOJO_KATAS = TMUX_DOJO_KATAS;
window.SENSEI_RECOMMENDED_TMUX_CONF = SENSEI_RECOMMENDED_TMUX_CONF;
// @license-end
