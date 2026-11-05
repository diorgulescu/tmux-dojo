// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0-or-later
/**
 * tmux-dojo — Complete 7-Belt Brazilian Jiu-Jitsu (BJJ) Progression (English)
 * Copyright (C) 2026 Dragoş Iorgulescu
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Progression (37 Total Auto-Verified Tasks):
 *   Kata 1: White Belt  — Survival & Escapes (Sessions & Client-Server) [6 Tasks]
 *   Kata 2: Blue Belt   — Guard Work & Spatial Control (Panes & Windows) [6 Tasks]
 *   Kata 3: Purple Belt — Flow State, Vi Buffers & Keybinding Modifiers (~/.tmux.conf) [6 Tasks]
 *   Kata 4: Brown Belt  — Customizing Your Gi (Status Bar Ricing, Colors, Modifiers & Live Telemetry) [6 Tasks]
 *   Kata 5: Black Belt  — Team Ops, Shared Sockets & Automation (Multi-User & Scripting) [6 Tasks]
 *   Kata 6: Coral Belt  — Invisible Jiu-Jitsu (Popups, Event Hooks & Pane Surgery) [5 Tasks]
 *   Kata 7: Red Belt    — The Art of Effortlessness (Idempotent Architecture & The Grandmaster's Vault) [2 Tasks]
 */

const TMUX_DOJO_THEMES = {
    gracie: {
        name: "Gracie Classic (Minimalist High-Contrast)",
        tagline: "Ultra-low resource usage, zero visual clutter, Vi copy-mode, and Ctrl+a / Ctrl+b dual prefix",
        conf: `# ============================================================================
# Grandmaster Vault 1: Gracie Classic (Minimalist High-Contrast)
# ============================================================================

# Zero-Latency Escape & Core Ergonomics
set -s escape-time 0
set -g mouse on
setw -g mode-keys vi
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
set -g history-limit 20000
set -g default-terminal "tmux-256color"

# Dual Prefix (Ctrl+b and Ctrl+a)
set -g prefix2 C-a
bind C-a send-prefix -2

# Clean Splits & Fast Config Reload
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
bind K respawn-pane -k
bind r source-file ~/.tmux.conf \\; display "Gracie Classic Reloaded!"

# High-Contrast Monochrome Status Bar
set -g status-position bottom
set -g status-interval 5
set -g status-style "bg=#090d14,fg=#f8fafc"
set -g message-style "bg=#f8fafc,fg=#090d14,bold"
set -g pane-border-style "fg=#334155"
set -g pane-active-border-style "fg=#f8fafc,bold"

setw -g window-status-style "bg=#090d14,fg=#94a3b8"
setw -g window-status-format " #I:#W "
setw -g window-status-current-style "bg=#f8fafc,fg=#090d14,bold"
setw -g window-status-current-format " [#I:#W#{?window_zoomed_flag,*Z*,}] "

set -g status-left-length 30
set -g status-left "#{?client_prefix,#[bg=#ef4444 fg=#ffffff bold] PREFIX #[default],#[bg=#f8fafc fg=#090d14 bold] #S #[default]} "
set -g status-right-length 50
set -g status-right "#[fg=#94a3b8]#{pane_current_command} #[fg=#f8fafc bold]%H:%M "
`
    },
    catppuccin: {
        name: "Catppuccin Mocha Telemetry",
        tagline: "Full 24-bit hex theming, conditional client_prefix badge, live /proc/loadavg & memory telemetry",
        conf: `# ============================================================================
# Grandmaster Vault 2: Catppuccin Mocha Telemetry
# ============================================================================

# Core Ergonomics & Vi Copy Mode
set -s escape-time 0
set -g mouse on
setw -g mode-keys vi
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
set -g history-limit 20000
set -g default-terminal "tmux-256color"

# Dual Prefix (Ctrl+b and Ctrl+a)
set -g prefix2 C-a
bind C-a send-prefix -2

# Intuitive Splits Keeping Current Path
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# No-Prefix Alt Arrow Pane Navigation & Repeatable Resizing
bind -n M-Left select-pane -L
bind -n M-Right select-pane -R
bind -r H resize-pane -L 5
bind -r L resize-pane -R 5

# Coral Belt Master Binds (Popup & Respawn)
bind g display-popup -w 80% -h 80% -E "echo 'Catppuccin Scratchpad'; sh"
bind K respawn-pane -k
bind r source-file ~/.tmux.conf \\; display "Catppuccin Mocha Telemetry Reloaded!"

# Catppuccin Mocha Status Bar & Borders
set -g status-position bottom
set -g status-interval 2
set -g status-style "bg=#1e1e2e,fg=#cdd6f4"
set -g message-style "bg=#f9e2af,fg=#11111b,bold"
set -g pane-border-style "fg=#45475a"
set -g pane-active-border-style "fg=#a6e3a1,bold"

setw -g window-status-style "bg=#181825,fg=#a6adc8"
setw -g window-status-format " #I:#W "
setw -g window-status-current-style "bg=#89b4fa,fg=#11111b,bold"
setw -g window-status-current-format " #I:#W#{?window_zoomed_flag, [Z],} "

set -g status-left-length 45
set -g status-left "#{?client_prefix,#[bg=#f38ba8 fg=#11111b bold] PREFIX #[default],#[bg=#a6e3a1 fg=#11111b bold] #S #[default]} "

set -g status-right-length 90
set -g status-right "#[fg=#f9e2af]CMD:#{pane_current_command} #[fg=#89b4fa]| LOAD:#(cut -d' ' -f1 /proc/loadavg) #[fg=#cba6f7]| MEM:#( awk '/MemAvailable/{printf \"%dM\", $2/1024}' /proc/meminfo ) #[fg=#cdd6f4]| %H:%M "
`
    },
    warroom: {
        name: "SysAdmin War Room Edition",
        tagline: "Multi-user incident ops: Prefix+S sync toggle with red SYNC ON alert & Prefix+P pane capture",
        conf: `# ============================================================================
# Grandmaster Vault 3: SysAdmin War Room Edition
# ============================================================================

set -s escape-time 0
set -g mouse on
setw -g mode-keys vi
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
set -g history-limit 50000
set -g default-terminal "tmux-256color"

set -g prefix2 C-a
bind C-a send-prefix -2
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
bind -n M-Left select-pane -L
bind -n M-Right select-pane -R
bind -r H resize-pane -L 5
bind -r L resize-pane -R 5

# War Room Incident Response Binds:
# Prefix + S -> Toggle synchronize-panes with visual status alert
bind S setw synchronize-panes \\; display "synchronize-panes toggled!"
# Prefix + P -> Dump active pane scrollback directly to /tmp/audit.log
bind P capture-pane -p \\; save-buffer /tmp/audit.log \\; display "Captured pane to /tmp/audit.log!"
# Prefix + g -> Floating incident popup
bind g display-popup -w 80% -h 80% -E "uptime; free -m; sleep 2"
# Prefix + K -> Respawn hung pane in-place
bind K respawn-pane -k
bind r source-file ~/.tmux.conf \\; display "SysAdmin War Room Config Reloaded!"

# High-Visibility Tactical Status Bar with #{?pane_synchronized} Warning
set -g status-position bottom
set -g status-interval 2
set -g status-style "bg=#0b1019,fg=#eef4fc"
set -g message-style "bg=#ef4444,fg=#ffffff,bold"
set -g pane-border-style "fg=#1f2b3e"
set -g pane-active-border-style "fg=#ef4444,bold"

setw -g window-status-style "bg=#0b1019,fg=#647792"
setw -g window-status-format " [#I:#W] "
setw -g window-status-current-style "bg=#ef4444,fg=#ffffff,bold"
setw -g window-status-current-format " [#I:#W#{?window_zoomed_flag, *Z*,}] "

set -g status-left-length 60
set -g status-left "#{?client_prefix,#[bg=#f59e0b fg=#000000 bold] PREFIX #[default],#[bg=#dc2626 fg=#ffffff bold] WARROOM:#S #[default]}#{?pane_synchronized,#[bg=red fg=#ffffff bold] SYNC ON #[default],} "

set -g status-right-length 85
set -g status-right "#{?client_readonly,#[bg=#3b82f6 fg=#ffffff bold] READ-ONLY #[default] ,}#[fg=#f59e0b]LOAD:#(cut -d' ' -f1 /proc/loadavg) #[fg=#38bdf8]| %H:%M:%S "
`
    }
};

// Backwards-compatible aliases
TMUX_DOJO_THEMES.matrix = TMUX_DOJO_THEMES.warroom;
TMUX_DOJO_THEMES.zen = TMUX_DOJO_THEMES.gracie;

const SENSEI_RECOMMENDED_TMUX_CONF = TMUX_DOJO_THEMES.catppuccin.conf;

const MASTER_CHEATSHEET_ITEMS = [
    { category: "Sessions", cmd: "tmux new -s <name>", desc: "Start a new named session" },
    { category: "Sessions", cmd: "tmux new -s <name> -d", desc: "Start a detached session in the background" },
    { category: "Sessions", cmd: "Ctrl+b $", desc: "Rename the active session interactively" },
    { category: "Sessions", cmd: "Ctrl+b d", desc: "Detach client from current session" },
    { category: "Sessions", cmd: "tmux attach -t <name>", desc: "Re-attach to an existing session" },
    { category: "Sessions", cmd: "Ctrl+b s", desc: "Open interactive session tree chooser" },
    { category: "Panes", cmd: "Ctrl+b %", desc: "Split active pane vertically (left/right)" },
    { category: "Panes", cmd: "Ctrl+b \"", desc: "Split active pane horizontally (top/bottom)" },
    { category: "Panes", cmd: "Ctrl+b z", desc: "Toggle Monocle Zoom on active pane" },
    { category: "Panes", cmd: "Ctrl+b Space", desc: "Cycle panes through preset layouts" },
    { category: "Panes", cmd: "Ctrl+b !", desc: "Break active pane out into its own standalone window" },
    { category: "Panes", cmd: "tmux join-pane -s <src>", desc: "Graft a pane from another window into current split layout" },
    { category: "Panes", cmd: "tmux respawn-pane -k", desc: "Kill hung process and restart shell inside pane in-place" },
    { category: "Panes", cmd: "tmux display-popup -E <cmd>", desc: "Open a centered floating overlay terminal" },
    { category: "Windows", cmd: "Ctrl+b c", desc: "Create a new window" },
    { category: "Windows", cmd: "Ctrl+b ,", desc: "Rename the current window" },
    { category: "Windows", cmd: "Ctrl+b 0..9 / n / p / l", desc: "Jump to window by index, next, previous, or last window" },
    { category: "Windows", cmd: "Ctrl+b w", desc: "Interactive window & pane preview tree" },
    { category: "Copy Mode", cmd: "setw -g mode-keys vi", desc: "Enable Vi navigation & selection keys in Copy Mode" },
    { category: "Copy Mode", cmd: "Ctrl+b [", desc: "Enter Copy / Scrollback mode (q to exit)" },
    { category: "Copy Mode", cmd: "Ctrl+b ]", desc: "Paste contents of active tmux copy buffer" },
    { category: "Copy Mode", cmd: "tmux capture-pane -p > file", desc: "Headlessly scrape pane scrollback directly to a file" },
    { category: "Shared Sockets", cmd: "tmux -S /tmp/pair.sock new -s warroom", desc: "Create session on explicit shared UNIX socket" },
    { category: "Shared Sockets", cmd: "chmod 777 /tmp/pair.sock", desc: "Grant multi-user UNIX socket permissions" },
    { category: "Shared Sockets", cmd: "tmux -S /tmp/pair.sock attach -r", desc: "Shadow shared session in Read-Only spectator mode" },
    { category: "Shared Sockets", cmd: "tmux -S /tmp/pair.sock new -t warroom -s my-angle", desc: "Create grouped session sharing windows with independent focus" },
    { category: "Format Variables", cmd: "#{?client_prefix,A,B}", desc: "Conditional ternary: evaluates to A when Prefix is active" },
    { category: "Format Variables", cmd: "#{?pane_synchronized,SYNC,}", desc: "Conditional alert when synchronize-panes broadcast is active" },
    { category: "Format Variables", cmd: "#{?window_zoomed_flag,[Z],}", desc: "Conditional indicator when active pane is zoomed" },
    { category: "Format Variables", cmd: "#{pane_current_path} / #{pane_current_command}", desc: "Working directory or running binary of the active pane" },
    { category: "Format Variables", cmd: "#(cut -d' ' -f1 /proc/loadavg)", desc: "Execute shell command and embed live stdout in status bar" },
    { category: "Hooks", cmd: "tmux set-hook -g after-split-window <cmd>", desc: "Trigger automatic tmux command whenever any pane is split" },
    { category: "Hooks", cmd: "tmux show-hooks -g", desc: "Inspect all registered global lifecycle event hooks" }
];

window.MASTER_CHEATSHEET_ITEMS = MASTER_CHEATSHEET_ITEMS;

const TMUX_DOJO_KATAS = [
    // ========================================================================
    // ⬜ KATA 1: WHITE BELT — Survival & Escapes (6 Tasks)
    // ========================================================================
    {
        id: "kata-1-white-belt",
        number: "KATA 01",
        belt: "White Belt",
        beltColor: "white",
        title: "Survival & Escapes (Sessions & Client-Server)",
        theory: `
            <p>
                <em>Philosophy:</em> Before learning flashy submissions, a White Belt learns how to survive. In <code>tmux</code>,
                survival means decoupling your running processes from volatile SSH connections and mastering the
                <kbd>Ctrl+b</kbd> <strong>Prefix</strong> key.
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">The Two-Step Prefix Chord (<kbd>Ctrl+b</kbd>)</div>
                <ol class="theory-steps">
                    <li>Hold <kbd>Ctrl</kbd> and tap <kbd>b</kbd>.</li>
                    <li><strong>Release both keys completely.</strong></li>
                    <li>Press your target command key (<kbd>$</kbd> to rename, <kbd>d</kbd> to detach, <kbd>s</kbd> to choose session).</li>
                </ol>
            </div>
        `,
        tasks: [
            {
                id: "k1-t1-whitebelt-session",
                description: "<strong>Step onto the Mat (Named Session):</strong> Start a new session named <code>whitebelt</code> (<code>tmux new -s whitebelt</code>).",
                hint: "Type <code>tmux new -s whitebelt</code> in the terminal and press <kbd>Enter</kbd>.",
                checkCmd: 'tmux has-session -t whitebelt 2>/dev/null && echo OK',
                autoSolveCmd: 'tmux has-session -t whitebelt 2>/dev/null || tmux new-session -d -s whitebelt',
                autoSteps: [
                    { type: "ttyS0", data: "tmux new -s whitebelt\n" },
                    { type: "ttyS1", cmd: "tmux has-session -t whitebelt 2>/dev/null || tmux new-session -d -s whitebelt" }
                ]
            },
            {
                id: "k1-t2-rename-dojo",
                description: "<strong>Rename on the Fly:</strong> Press <kbd>Ctrl+b</kbd> <kbd>$</kbd> and rename the active session to <code>dojo</code>.",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>$</kbd> (<kbd>Shift+4</kbd>). Clear <code>whitebelt</code>, type <code>dojo</code>, and hit <kbd>Enter</kbd> (or run <code>tmux rename-session dojo</code>).",
                checkCmd: 'tmux has-session -t dojo 2>/dev/null && echo OK',
                autoSolveCmd: 'if tmux has-session -t whitebelt 2>/dev/null; then tmux rename-session -t whitebelt dojo; elif ! tmux has-session -t dojo 2>/dev/null; then tmux new-session -d -s dojo; fi'
            },
            {
                id: "k1-t3-clean-escape",
                description: "<strong>The Clean Escape (Detach):</strong> Escape back to the host shell while keeping your <code>dojo</code> session alive inside the server (<kbd>Ctrl+b</kbd> <kbd>d</kbd>).",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>d</kbd> (or run <code>tmux detach</code>).",
                checkCmd: 'tmux list-sessions -F "#{session_name}:#{session_attached}" 2>/dev/null | grep -qx "dojo:0" && echo OK',
                autoSolveCmd: 'tmux has-session -t dojo 2>/dev/null || tmux new-session -d -s dojo; tmux detach-client -s dojo 2>/dev/null || true'
            },
            {
                id: "k1-t4-background-opponent",
                description: "<strong>Spawn a Background Opponent:</strong> While in the host shell, create a second detached session named <code>drills</code> without entering it (<code>tmux new -s drills -d</code>).",
                hint: "Run <code>tmux new -s drills -d</code> in the shell. The <code>-d</code> flag starts the session detached in the background.",
                checkCmd: 'tmux list-sessions -F "#{session_name}:#{session_attached}" 2>/dev/null | grep -qx "drills:0" && echo OK',
                autoSolveCmd: 'tmux has-session -t drills 2>/dev/null || tmux new-session -d -s drills; tmux detach-client -s drills 2>/dev/null || true'
            },
            {
                id: "k1-t5-reengage-dojo",
                description: "<strong>Re-engage (Attach):</strong> Re-attach to your <code>dojo</code> session (<code>tmux attach -t dojo</code>).",
                hint: "Type <code>tmux attach -t dojo</code> (or <code>tmux a -t dojo</code>) and press <kbd>Enter</kbd>.",
                checkCmd: 'tmux list-sessions -F "#{session_name}:#{session_attached}" 2>/dev/null | grep -qx "dojo:1" && echo OK',
                autoSteps: [
                    { type: "ttyS1", cmd: "tmux has-session -t dojo 2>/dev/null || tmux new-session -d -s dojo" },
                    { type: "ttyS0", data: "tmux attach -t dojo\n" }
                ]
            },
            {
                id: "k1-t6-transition-sessions",
                description: "<strong>Transition Between Sessions (<kbd>Ctrl+b</kbd> <kbd>s</kbd>):</strong> Without detaching, open the interactive session chooser (<kbd>Ctrl+b</kbd> <kbd>s</kbd>), select <code>drills</code>, and press <kbd>Enter</kbd>.",
                hint: "Press <kbd>Ctrl+b</kbd> then <kbd>s</kbd>, use the arrow keys to highlight <code>drills</code>, and press <kbd>Enter</kbd> (or press <kbd>Ctrl+b</kbd> <kbd>)</kbd>).",
                checkCmd: 'tmux list-sessions -F "#{session_name}:#{session_attached}" 2>/dev/null | grep -qx "drills:1" && echo OK',
                autoSolveCmd: 'tmux has-session -t drills 2>/dev/null || tmux new-session -d -s drills; tmux switch-client -t drills 2>/dev/null || true'
            }
        ]
    },

    // ========================================================================
    // 🟦 KATA 2: BLUE BELT — Guard Work & Spatial Control (6 Tasks)
    // ========================================================================
    {
        id: "kata-2-blue-belt",
        number: "KATA 02",
        belt: "Blue Belt",
        beltColor: "blue",
        title: "Guard Work & Spatial Control (Panes & Windows)",
        theory: `
            <p>
                <em>Philosophy:</em> A Blue Belt controls distance and angles. Here you master splitting panes, isolating a
                single pane with Monocle Zoom, sweeping layouts, creating windows, and breaking panes out into standalone windows.
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Spatial Control Keybindings</div>
                <ul class="theory-keylist">
                    <li><span><kbd>Ctrl+b</kbd> <kbd>%</kbd> / <kbd>"</kbd></span> <span>Split pane Vertically (left/right) or Horizontally (top/bottom)</span></li>
                    <li><span><kbd>Ctrl+b</kbd> <kbd>z</kbd></span> <span>Toggle <strong>Pane Zoom</strong> (fullscreen monocle mode)</span></li>
                    <li><span><kbd>Ctrl+b</kbd> <kbd>Space</kbd></span> <span>Sweep / cycle panes through preset layouts</span></li>
                    <li><span><kbd>Ctrl+b</kbd> <kbd>c</kbd> / <kbd>,</kbd></span> <span>Create a new window / Rename active window</span></li>
                    <li><span><kbd>Ctrl+b</kbd> <kbd>!</kbd></span> <span><strong>Break</strong> active pane into its own standalone window</span></li>
                </ul>
            </div>
        `,
        tasks: [
            {
                id: "k2-t1-split-vertical",
                description: "<strong>Split the Guard Vertically:</strong> Split your current window into left and right panes (<kbd>Ctrl+b</kbd> <kbd>%</kbd>).",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>%</kbd> (<kbd>Shift+5</kbd>).",
                checkCmd: '[ $(tmux list-panes 2>/dev/null | wc -l) -eq 2 ] && echo OK',
                autoSolveCmd: 'tmux has-session 2>/dev/null || tmux new-session -d -s dojo; while [ $(tmux list-panes 2>/dev/null | wc -l) -gt 1 ]; do tmux kill-pane; done; tmux split-window -h'
            },
            {
                id: "k2-t2-split-horizontal",
                description: "<strong>Split Horizontally:</strong> Split the active pane into top and bottom panes (<kbd>Ctrl+b</kbd> <kbd>\"</kbd>).",
                hint: "Press <kbd>Ctrl+b</kbd>, release both keys, then press <kbd>\"</kbd> (double quote) so there are 3 panes total.",
                checkCmd: '[ $(tmux list-panes 2>/dev/null | wc -l) -eq 3 ] && echo OK',
                autoSolveCmd: 'while [ $(tmux list-panes 2>/dev/null | wc -l) -lt 2 ]; do tmux split-window -h; done; while [ $(tmux list-panes 2>/dev/null | wc -l) -gt 2 ]; do tmux kill-pane; done; tmux split-window -v'
            },
            {
                id: "k2-t3-isolate-zoom",
                description: "<strong>Isolate the Limb (Pane Zoom):</strong> Maximize the active pane to full screen using <kbd>Ctrl+b</kbd> <kbd>z</kbd> so you can focus on a single task.",
                hint: "Press <kbd>Ctrl+b</kbd> then <kbd>z</kbd>. Notice the <code>Z</code> indicator on your window tab!",
                checkCmd: '[ "$(tmux display-message -p \'#{window_zoomed_flag}\' 2>/dev/null)" = "1" ] && echo OK',
                autoSolveCmd: '[ "$(tmux display-message -p \'#{window_zoomed_flag}\' 2>/dev/null)" = "1" ] || tmux resize-pane -Z'
            },
            {
                id: "k2-t4-unzoom-sweep",
                description: "<strong>Unzoom &amp; Sweep Layout:</strong> Unzoom (<kbd>Ctrl+b</kbd> <kbd>z</kbd>) and press <kbd>Ctrl+b</kbd> <kbd>Space</kbd> to rearrange the 3 panes into an automatic layout.",
                hint: "Press <kbd>Ctrl+b</kbd> <kbd>z</kbd> to restore the 3 panes, then press <kbd>Ctrl+b</kbd> <kbd>Space</kbd>.",
                checkCmd: '[ "$(tmux display-message -p \'#{window_zoomed_flag}\' 2>/dev/null)" = "0" ] && [ $(tmux list-panes 2>/dev/null | wc -l) -eq 3 ] && echo OK',
                autoSolveCmd: '[ "$(tmux display-message -p \'#{window_zoomed_flag}\' 2>/dev/null)" = "0" ] || tmux resize-pane -Z; tmux next-layout'
            },
            {
                id: "k2-t5-window-telemetry",
                description: "<strong>Open a New Room (Windows):</strong> Create a new window (<kbd>Ctrl+b</kbd> <kbd>c</kbd>) and rename it (<kbd>Ctrl+b</kbd> <kbd>,</kbd>) to <code>telemetry</code>.",
                hint: "Press <kbd>Ctrl+b</kbd> <kbd>c</kbd> to create a new window, then press <kbd>Ctrl+b</kbd> <kbd>,</kbd> (comma), type <code>telemetry</code>, and hit <kbd>Enter</kbd>.",
                checkCmd: 'tmux list-windows -F "#{window_name}" 2>/dev/null | grep -qx "telemetry" && echo OK',
                autoSolveCmd: 'tmux new-window -n telemetry'
            },
            {
                id: "k2-t6-break-pane",
                description: "<strong>Break a Pane into a Standalone Window (<kbd>Ctrl+b</kbd> <kbd>!</kbd>):</strong> Switch back to window 0 (<kbd>Ctrl+b</kbd> <kbd>0</kbd>) and press <kbd>Ctrl+b</kbd> <kbd>!</kbd> to break the active pane out into its own independent window.",
                hint: "Press <kbd>Ctrl+b</kbd> <kbd>0</kbd> to select window 0, then press <kbd>Ctrl+b</kbd> followed by <kbd>!</kbd> (<kbd>Shift+1</kbd>).",
                checkCmd: '[ $(tmux list-windows 2>/dev/null | wc -l) -ge 3 ] && echo OK',
                autoSolveCmd: 'tmux select-window -t :0 2>/dev/null || true; while [ $(tmux list-windows 2>/dev/null | wc -l) -lt 3 ]; do tmux split-window -h && tmux break-pane; done'
            }
        ]
    },

    // ========================================================================
    // 🟪 KATA 3: PURPLE BELT — Flow State, Vi Buffers & Keybinding Modifiers (6 Tasks)
    // ========================================================================
    {
        id: "kata-3-purple-belt",
        number: "KATA 03",
        belt: "Purple Belt",
        beltColor: "purple",
        title: "Flow State, Vi Buffers & Keybinding Modifiers (~/.tmux.conf)",
        theory: `
            <p>
                <em>Philosophy:</em> At Purple Belt, you develop your own game. You stop fighting default ergonomics:
                you enable Vi-style Copy Mode, add <code>Ctrl+a</code> as a secondary prefix, and unlock <code>bind</code>
                <strong>modifiers</strong> in <code>~/.tmux.conf</code>:
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Keybinding Modifiers Explained</div>
                <ul class="theory-keylist">
                    <li><span><code>bind | split-window -h -c "#{pane_current_path}"</code></span> <span>Preserve current directory when splitting</span></li>
                    <li><span><code>bind -n M-Left select-pane -L</code></span> <span><strong><code>-n</code> (Root Table):</strong> Use <kbd>Alt+Left</kbd> directly with <em>no Prefix required</em>!</span></li>
                    <li><span><code>bind -r H resize-pane -L 5</code></span> <span><strong><code>-r</code> (Repeatable):</strong> Press Prefix once, then tap <kbd>H</kbd> repeatedly</span></li>
                </ul>
            </div>
        `,
        tasks: [
            {
                id: "k3-t1-vi-mode-mouse",
                description: "<strong>Enable Vi Keys in Copy Mode:</strong> Edit <code>~/.tmux.conf</code> (via <code>nano</code> or the <code>[ ~/.tmux.conf Editor ]</code> tab) and add <code>setw -g mode-keys vi</code> along with <code>set -g mouse on</code> and <code>set -g base-index 1</code>, then reload (<code>tmux source-file ~/.tmux.conf</code>).",
                hint: "Add <code>setw -g mode-keys vi</code>, <code>set -g mouse on</code>, and <code>set -g base-index 1</code> to <code>~/.tmux.conf</code>, then click <strong>💾 Save &amp; Reload in tmux</strong> (or run <code>tmux source-file ~/.tmux.conf</code>).",
                checkCmd: 'tmux show-window-options -g 2>/dev/null | grep -q "mode-keys vi" && tmux show-options -g 2>/dev/null | grep -q "mouse on" && echo OK',
                autoSolveCmd: 'printf "setw -g mode-keys vi\\nset -g mouse on\\nset -g base-index 1\\n" >> ~/.tmux.conf && tmux source-file ~/.tmux.conf'
            },
            {
                id: "k3-t2-prefix2-ctrl-a",
                description: "<strong>Add Secondary Prefix (<kbd>Ctrl+a</kbd>):</strong> Many practitioners find <kbd>Ctrl+b</kbd> too far to reach. Add <code>set -g prefix2 C-a</code> and <code>bind C-a send-prefix -2</code> to <code>~/.tmux.conf</code> and reload so BOTH <kbd>Ctrl+b</kbd> and <kbd>Ctrl+a</kbd> work!",
                hint: "Add <code>set -g prefix2 C-a</code> and <code>bind C-a send-prefix -2</code> to <code>~/.tmux.conf</code> and reload with <code>tmux source-file ~/.tmux.conf</code>.",
                checkCmd: 'tmux show-options -g prefix2 2>/dev/null | grep -q "C-a" && echo OK',
                autoSolveCmd: 'printf "set -g prefix2 C-a\\nbind C-a send-prefix -2\\n" >> ~/.tmux.conf && tmux source-file ~/.tmux.conf'
            },
            {
                id: "k3-t3-splits-current-path",
                description: "<strong>Intuitive Splits Keeping Current Path:</strong> Bind <code>|</code> and <code>-</code> to split panes while preserving the current working directory: <code>bind | split-window -h -c \"#{pane_current_path}\"</code> and <code>bind - split-window -v -c \"#{pane_current_path}\"</code>. Reload config.",
                hint: "Add both lines to <code>~/.tmux.conf</code> and run <code>tmux source-file ~/.tmux.conf</code>.",
                checkCmd: 'tmux list-keys 2>/dev/null | grep -q "pane_current_path" && echo OK',
                autoSolveCmd: 'printf "bind | split-window -h -c \\"#{pane_current_path}\\"\\nbind - split-window -v -c \\"#{pane_current_path}\\"\\n" >> ~/.tmux.conf && tmux source-file ~/.tmux.conf'
            },
            {
                id: "k3-t4-bind-n-alt-arrows",
                description: "<strong>No-Prefix Modifier (<code>bind -n</code> with <code>Alt</code>):</strong> The <code>-n</code> flag binds keys in the <em>root</em> table, meaning you don't need to press Prefix first! Add <code>bind -n M-Left select-pane -L</code> and <code>bind -n M-Right select-pane -R</code> (<code>M-</code> stands for Meta/Alt) to <code>~/.tmux.conf</code> and reload.",
                hint: "Add <code>bind -n M-Left select-pane -L</code> and <code>bind -n M-Right select-pane -R</code> to <code>~/.tmux.conf</code> and reload.",
                checkCmd: 'tmux list-keys -T root 2>/dev/null | grep -q "M-Left" && echo OK',
                autoSolveCmd: 'printf "bind -n M-Left select-pane -L\\nbind -n M-Right select-pane -R\\n" >> ~/.tmux.conf && tmux source-file ~/.tmux.conf'
            },
            {
                id: "k3-t5-bind-r-repeatable",
                description: "<strong>Repeatable Modifier (<code>bind -r</code> for Resizing):</strong> The <code>-r</code> flag lets you press Prefix once and then tap a key repeatedly. Add <code>bind -r H resize-pane -L 5</code> and <code>bind -r L resize-pane -R 5</code> to <code>~/.tmux.conf</code> and reload.",
                hint: "Add <code>bind -r H resize-pane -L 5</code> and <code>bind -r L resize-pane -R 5</code> to <code>~/.tmux.conf</code> and reload.",
                checkCmd: 'tmux list-keys 2>/dev/null | grep -E "bind-key[[:space:]]+-r.*resize-pane" && echo OK',
                autoSolveCmd: 'printf "bind -r H resize-pane -L 5\\nbind -r L resize-pane -R 5\\n" >> ~/.tmux.conf && tmux source-file ~/.tmux.conf'
            },
            {
                id: "k3-t6-sync-panes-attack",
                description: "<strong>Synchronize Panes (Simultaneous Attack):</strong> In a window with at least 2 panes, turn on broadcast mode (<code>tmux setw synchronize-panes on</code>) and run <code>touch /tmp/purple_$$</code> so both panes create a PID-stamped file simultaneously, then turn <code>synchronize-panes off</code>.",
                hint: "Make sure you have 2 panes, run <code>tmux setw synchronize-panes on</code>, type <code>touch /tmp/purple_$$</code>, then run <code>tmux setw synchronize-panes off</code>.",
                checkCmd: '[ $(ls /tmp/purple_* 2>/dev/null | wc -l) -ge 2 ] && [ "$(tmux display-message -p \'#{pane_synchronized}\' 2>/dev/null)" = "0" ] && echo OK',
                autoSolveCmd: 'touch /tmp/purple_201 /tmp/purple_202 && tmux setw synchronize-panes off'
            }
        ]
    },

    // ========================================================================
    // 🟫 KATA 4: BROWN BELT — Customizing Your Gi (6 Tasks)
    // ========================================================================
    {
        id: "kata-4-brown-belt",
        number: "KATA 04",
        belt: "Brown Belt",
        beltColor: "brown",
        title: "Customizing Your Gi (Status Bar Ricing, Colors, Modifiers & Live Telemetry)",
        theory: `
            <p>
                <em>Philosophy:</em> A Brown Belt refines every detail. Here you master <code>tmux</code>'s status bar styling
                engine: truecolor hex palettes (<code>#1e1e2e</code>), text attribute modifiers (<code>bold</code>, <code>underscore</code>),
                conditional ternary expressions (<code>#{?condition,true,false}</code>), and live shell telemetry (<code>#(...)</code>).
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Status Bar Formatting Primitives</div>
                <ul class="theory-keylist">
                    <li><span><code>#[bg=#89b4fa,fg=#11111b,bold]</code></span> <span>Inline hex colors &amp; text attribute modifiers</span></li>
                    <li><span><code>#{?client_prefix,PREFIX,#S}</code></span> <span>Conditional ternary: reacts the instant <kbd>Ctrl+b</kbd> is pressed!</span></li>
                    <li><span><code>#{?window_zoomed_flag, [Z],}</code></span> <span>Displays <code>[Z]</code> badge when active pane is zoomed</span></li>
                    <li><span><code>#(cut -d' ' -f1 /proc/loadavg)</code></span> <span>Executes shell command &amp; embeds live output in the bar</span></li>
                </ul>
            </div>
        `,
        tasks: [
            {
                id: "k4-t1-status-base-palette",
                description: "<strong>Base Status Bar Colors &amp; Position:</strong> Style the base status bar palette by setting <code>set -g status-style \"bg=#1e1e2e,fg=#cdd6f4\"</code> in <code>~/.tmux.conf</code> and reloading.",
                hint: "Add <code>set -g status-style \"bg=#1e1e2e,fg=#cdd6f4\"</code> to <code>~/.tmux.conf</code> and run <code>tmux source-file ~/.tmux.conf</code> (or click Save &amp; Reload in the Editor tab).",
                checkCmd: 'tmux show-options -g status-style 2>/dev/null | grep -qi "#1e1e2e" && echo OK',
                autoSolveCmd: 'printf "set -g status-style \\"bg=#1e1e2e,fg=#cdd6f4\\"\\n" >> ~/.tmux.conf && tmux source-file ~/.tmux.conf'
            },
            {
                id: "k4-t2-pane-border-highlighting",
                description: "<strong>Pane Border Highlighting:</strong> Make the active pane border stand out starkly from inactive panes by setting <code>set -g pane-active-border-style \"fg=#a6e3a1,bold\"</code> and <code>set -g pane-border-style \"fg=#45475a\"</code>, then reload.",
                hint: "Add both <code>pane-active-border-style</code> and <code>pane-border-style</code> lines to <code>~/.tmux.conf</code> and reload.",
                checkCmd: 'tmux show-options -g pane-active-border-style 2>/dev/null | grep -qi "#a6e3a1" && echo OK',
                autoSolveCmd: 'printf "set -g pane-active-border-style \\"fg=#a6e3a1,bold\\"\\nset -g pane-border-style \\"fg=#45475a\\"\\n" >> ~/.tmux.conf && tmux source-file ~/.tmux.conf'
            },
            {
                id: "k4-t3-window-tab-modifiers",
                description: "<strong>Window Tab Styling with Attribute Modifiers:</strong> Style the active window tab using <code>setw -g window-status-current-style \"bg=#89b4fa,fg=#11111b,bold\"</code> and set its format to show index, name, and zoom flag: <code>setw -g window-status-current-format \" #I:#W#{?window_zoomed_flag, [Z],} \"</code>. Reload config.",
                hint: "Add both <code>window-status-current-style</code> and <code>window-status-current-format</code> to <code>~/.tmux.conf</code> and reload.",
                checkCmd: 'tmux show-window-options -g window-status-current-format 2>/dev/null | grep -q "window_zoomed_flag" && echo OK',
                autoSolveCmd: 'printf "setw -g window-status-current-style \\"bg=#89b4fa,fg=#11111b,bold\\"\\nsetw -g window-status-current-format \\" #I:#W#{?window_zoomed_flag, [Z],} \\"\\n" >> ~/.tmux.conf && tmux source-file ~/.tmux.conf'
            },
            {
                id: "k4-t4-conditional-prefix-indicator",
                description: "<strong>Conditional Prefix Indicator (<code>#{?client_prefix,...}</code>):</strong> Make <code>status-left</code> change color dynamically the exact millisecond you press <kbd>Ctrl+b</kbd>! Set:<br/><code>set -g status-left \"#{?client_prefix,#[bg=#f38ba8 fg=#11111b bold] PREFIX #[default],#[bg=#a6e3a1 fg=#11111b bold] #S #[default]} \"</code> and reload.",
                hint: "Add the <code>set -g status-left ...</code> line to <code>~/.tmux.conf</code> and reload. Then press <kbd>Ctrl+b</kbd> in the terminal and watch the bottom-left badge turn bright pink/red!",
                checkCmd: 'tmux show-options -g status-left 2>/dev/null | grep -q "client_prefix" && echo OK',
                autoSolveCmd: 'printf "set -g status-left \\"#{?client_prefix,#[bg=#f38ba8 fg=#11111b bold] PREFIX #[default],#[bg=#a6e3a1 fg=#11111b bold] #S #[default]} \\"\\n" >> ~/.tmux.conf && tmux source-file ~/.tmux.conf'
            },
            {
                id: "k4-t5-live-telemetry-status-right",
                description: "<strong>Live System Telemetry in <code>status-right</code> (<code>#(...)</code> Shell Execution):</strong> Set <code>set -g status-interval 2</code> and configure <code>status-right</code> to display the active command, CPU load average from <code>/proc/loadavg</code>, and time:<br/><code>set -g status-right \"#[fg=#f9e2af]CMD:#{pane_current_command} #[fg=#89b4fa]| LOAD:#(cut -d' ' -f1 /proc/loadavg) #[fg=#cdd6f4]| %H:%M \"</code> and reload.",
                hint: "Add <code>set -g status-interval 2</code> and the <code>set -g status-right ...</code> line to <code>~/.tmux.conf</code> and reload.",
                checkCmd: 'tmux show-options -g status-right 2>/dev/null | grep -q "/proc/loadavg" && tmux show-options -g status-right 2>/dev/null | grep -q "pane_current_command" && echo OK',
                autoSolveCmd: 'printf "set -g status-interval 2\\nset -g status-right \\"#[fg=#f9e2af]CMD:#{pane_current_command} #[fg=#89b4fa]| LOAD:#(cut -d\' \' -f1 /proc/loadavg) #[fg=#cdd6f4]| %%H:%%M \\"\\n" >> ~/.tmux.conf && tmux source-file ~/.tmux.conf'
            },
            {
                id: "k4-t6-message-style",
                description: "<strong>Command Prompt &amp; Alert Styling (<code>message-style</code>):</strong> Style the <code>Ctrl+b :</code> command prompt and status notifications to match your palette with <code>set -g message-style \"bg=#f9e2af,fg=#11111b,bold\"</code> and reload.",
                hint: "Add <code>set -g message-style \"bg=#f9e2af,fg=#11111b,bold\"</code> to <code>~/.tmux.conf</code> and reload.",
                checkCmd: 'tmux show-options -g message-style 2>/dev/null | grep -qi "#f9e2af" && echo OK',
                autoSolveCmd: 'printf "set -g message-style \\"bg=#f9e2af,fg=#11111b,bold\\"\\n" >> ~/.tmux.conf && tmux source-file ~/.tmux.conf'
            }
        ]
    },

    // ========================================================================
    // ⬛🟥 KATA 5: BLACK BELT — Team Ops, Shared Sockets & Automation (6 Tasks)
    // ========================================================================
    {
        id: "kata-5-black-belt",
        number: "KATA 05",
        belt: "Black Belt",
        beltColor: "black",
        title: "Team Ops, Shared Sockets & Automation (Multi-User & Scripting)",
        theory: `
            <p>
                <em>Philosophy:</em> A Black Belt leads the room. In production engineering, that means hosting multi-user
                War Rooms over shared UNIX sockets (<code>-S</code>), controlling read-only spectator vs. read-write access,
                linking grouped sessions so teammates don't fight over window focus, and scripting entire workspaces.
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Multi-User War Room &amp; Automation Commands</div>
                <ul class="theory-keylist">
                    <li><span><code>tmux -S /tmp/pair.sock new -s warroom -d</code></span> <span>Create session on explicit shared socket</span></li>
                    <li><span><code>chmod 777 /tmp/pair.sock</code></span> <span>Unlock socket permissions for user <code>teammate</code></span></li>
                    <li><span><code>tmux -S /tmp/pair.sock attach -t warroom -r</code></span> <span>Shadow in <strong>Read-Only</strong> mode</span></li>
                    <li><span><code>tmux -S /tmp/pair.sock new -t warroom -s my-angle -d</code></span> <span>Create linked session with independent window focus</span></li>
                </ul>
            </div>
        `,
        tasks: [
            {
                id: "k5-t1-shared-socket",
                description: "<strong>Create a Shared Team Socket (<code>-S</code>):</strong> Start a detached session named <code>warroom</code> on an explicit socket <code>/tmp/pair.sock</code> (<code>tmux -S /tmp/pair.sock new -s warroom -d</code>).",
                hint: "Run <code>tmux -S /tmp/pair.sock new -s warroom -d</code> in your shell.",
                checkCmd: '[ -S /tmp/pair.sock ] && tmux -S /tmp/pair.sock has-session -t warroom 2>/dev/null && echo OK',
                onPassCmd: 'tmux -S /tmp/pair.sock server-access -a teammate 2>/dev/null || true',
                autoSolveCmd: 'tmux -S /tmp/pair.sock has-session -t warroom 2>/dev/null || tmux -S /tmp/pair.sock new-session -d -s warroom'
            },
            {
                id: "k5-t2-socket-permissions",
                description: "<strong>Configure Multi-User Socket Permissions (<code>chmod</code> / <code>chgrp</code>):</strong> Unlock <code>/tmp/pair.sock</code> (<code>chmod 777 /tmp/pair.sock</code> or group <code>devops</code> with <code>770</code>) so user <code>teammate</code> can inspect the server.",
                hint: "Run <code>chmod 777 /tmp/pair.sock</code> (or <code>chgrp devops /tmp/pair.sock &amp;&amp; chmod 770 /tmp/pair.sock</code>).",
                checkCmd: 'tmux -S /tmp/pair.sock server-access -a teammate 2>/dev/null || true; su - teammate -c "tmux -S /tmp/pair.sock list-sessions" >/dev/null 2>&1 && echo OK',
                autoSolveCmd: 'chgrp devops /tmp/pair.sock 2>/dev/null || true; chmod 777 /tmp/pair.sock'
            },
            {
                id: "k5-t3-shadow-readonly",
                description: "<strong>Shadowing in Read-Only Mode (<code>attach -r</code>):</strong> Attach to <code>warroom</code> on <code>/tmp/pair.sock</code> with the <code>-r</code> flag so your keystrokes cannot disrupt the session (<code>tmux -S /tmp/pair.sock attach -t warroom -r</code>).",
                hint: "If you are currently inside another tmux session, press <kbd>Ctrl+b</kbd> <kbd>d</kbd> first, then run <code>tmux -S /tmp/pair.sock attach -t warroom -r</code>.",
                checkCmd: 'tmux -S /tmp/pair.sock list-clients -F "#{client_readonly}" 2>/dev/null | grep -qx "1" && echo OK',
                autoSteps: [
                    {
                        type: "ttyS1",
                        cmd: 'tmux detach-client 2>/dev/null || true; tmux -S /tmp/pair.sock detach-client 2>/dev/null || true'
                    },
                    {
                        type: "ttyS0",
                        data: "tmux -S /tmp/pair.sock attach -t warroom -r\n"
                    }
                ]
            },
            {
                id: "k5-t4-pair-debugging-live",
                description: "<strong>Live Pair-Debugging (Full Read-Write + Teammate Interaction):</strong> Detach (<kbd>Ctrl+b</kbd> <kbd>d</kbd>) and re-attach without <code>-r</code> (<code>tmux -S /tmp/pair.sock attach -t warroom</code>). Watch user <code>teammate</code> send a live greeting into your shared session!",
                hint: "Press <kbd>Ctrl+b</kbd> <kbd>d</kbd> to detach, then run <code>tmux -S /tmp/pair.sock attach -t warroom</code>.",
                checkCmd: 'tmux -S /tmp/pair.sock list-clients -F "#{client_readonly}" 2>/dev/null | grep -qx "0" && echo OK',
                onPassCmd: 'tmux -S /tmp/pair.sock server-access -a teammate 2>/dev/null || true; su - teammate -c "tmux -S /tmp/pair.sock send-keys -t warroom \'# 👋 Hey from teammate! I am connected to /tmp/pair.sock!\' C-m"',
                autoSteps: [
                    {
                        type: "ttyS1",
                        cmd: 'tmux -S /tmp/pair.sock detach-client -s warroom 2>/dev/null || true'
                    },
                    {
                        type: "ttyS0",
                        data: "tmux -S /tmp/pair.sock attach -t warroom\n"
                    }
                ]
            },
            {
                id: "k5-t5-grouped-my-angle",
                description: "<strong>Grouped Sessions for Independent Views (<code>new-session -t</code>):</strong> Create a linked session named <code>my-angle</code> attached to group <code>warroom</code> on <code>/tmp/pair.sock</code> (<code>tmux -S /tmp/pair.sock new -t warroom -s my-angle -d</code>) so two engineers share windows without dragging each other's active window focus.",
                hint: "Run <code>tmux -S /tmp/pair.sock new -t warroom -s my-angle -d</code>.",
                checkCmd: 'tmux -S /tmp/pair.sock list-sessions -F "#{session_name}:#{session_group}" 2>/dev/null | grep -E "^my-angle:.+" && echo OK',
                autoSolveCmd: 'tmux -S /tmp/pair.sock has-session -t my-angle 2>/dev/null || tmux -S /tmp/pair.sock new-session -d -t warroom -s my-angle'
            },
            {
                id: "k5-t6-deploy-dojo-script",
                description: "<strong>Automated Workspace Scripting:</strong> Detach from <code>/tmp/pair.sock</code> if attached, and build a multi-window session on the default server named <code>hq</code> with window <code>code</code> split into 2 panes and a second window named <code>logs</code> (<code>tmux new-session -d -s hq -n code \\; split-window -h \\; new-window -n logs</code>).",
                hint: "Run <code>tmux new-session -d -s hq -n code \\; split-window -h \\; new-window -n logs</code> in your shell.",
                checkCmd: 'tmux has-session -t hq 2>/dev/null && tmux list-windows -t hq -F "#{window_name}" | grep -qx "logs" && [ $(tmux list-panes -t hq:code 2>/dev/null | wc -l) -eq 2 ] && echo OK',
                onPassCmd: 'tmux -S /tmp/pair.sock detach-client 2>/dev/null || true',
                autoSolveCmd: 'tmux -S /tmp/pair.sock detach-client 2>/dev/null || true; printf "#!/bin/sh\\ntmux kill-session -t hq 2>/dev/null || true\\ntmux new-session -d -s hq -n code \\\\; split-window -h \\\\; new-window -n logs\\n" > /root/deploy-dojo.sh && chmod +x /root/deploy-dojo.sh && /root/deploy-dojo.sh'
            }
        ]
    },

    // ========================================================================
    // 🟥⬛ KATA 6: CORAL BELT (7th Degree Master) — Invisible Jiu-Jitsu (5 Tasks)
    // ========================================================================
    {
        id: "kata-6-coral-belt",
        number: "KATA 06",
        belt: "Coral Belt (Master)",
        beltColor: "coral",
        title: "Invisible Jiu-Jitsu (Popups, Event Hooks & Pane Surgery)",
        theory: `
            <p>
                <em>Philosophy:</em> In BJJ, 7th Degree Coral Belts practice <strong>"Invisible Jiu-Jitsu"</strong>—subtle
                weight shifts and hidden mechanics that feel like magic to lower belts. In <code>tmux</code>, this means
                surgical pane grafting across windows (<code>join-pane</code>), headless screen scraping (<code>capture-pane</code>),
                event-driven hooks (<code>set-hook</code>), floating popups (<code>display-popup</code>), and in-place pane resurrection (<code>respawn-pane -k</code>).
            </p>
            <div class="theory-callout">
                <div class="theory-callout-title">Master-Level Primitives</div>
                <ul class="theory-keylist">
                    <li><span><code>tmux join-pane -s donor</code></span> <span>Graft a window/pane directly into your active split layout</span></li>
                    <li><span><code>tmux capture-pane -p &gt; /tmp/audit.log</code></span> <span>Scrape pane scrollback headlessly into a file</span></li>
                    <li><span><code>tmux set-hook -g after-split-window "..."</code></span> <span>Trigger automatic commands on lifecycle events</span></li>
                    <li><span><code>bind g display-popup -w 80% -h 80%</code></span> <span>Summon a centered floating scratchpad terminal</span></li>
                    <li><span><code>bind K respawn-pane -k</code></span> <span>Restart a hung or corrupted pane shell in-place</span></li>
                </ul>
            </div>
        `,
        tasks: [
            {
                id: "k6-t1-surgical-join-pane",
                description: "<strong>Surgical Pane Grafting (<code>join-pane</code>):</strong> Earlier you broke a pane into a window (<code>!</code>). A Master can pull a pane from <em>another</em> window and graft it directly into the current split layout. Create a new window named <code>donor</code> (<code>tmux new-window -n donor</code>), switch back to your previous window (<kbd>Ctrl+b</kbd> <kbd>l</kbd>), and pull <code>donor</code> into your current window as a split pane (<code>tmux join-pane -s donor</code>).",
                hint: "Run <code>tmux new-window -n donor \\; last-window \\; join-pane -s donor</code> (or run each step inside your default tmux session).",
                checkCmd: '! tmux list-windows -F "#{window_name}" 2>/dev/null | grep -qx "donor" && [ $(tmux list-panes 2>/dev/null | wc -l) -ge 2 ] && echo OK',
                autoSolveCmd: 'tmux has-session 2>/dev/null || tmux new-session -d -s dojo; tmux new-window -n donor \\; last-window \\; join-pane -s donor'
            },
            {
                id: "k6-t2-headless-capture-pane",
                description: "<strong>Headless Screen Scraping (<code>capture-pane</code> &amp; <code>save-buffer</code>):</strong> Instead of manually selecting text with a mouse, <code>capture-pane</code> snapshots the scrollback history of any pane directly into a buffer or file. Capture the visible contents of the active pane and dump it to <code>/tmp/audit.log</code> (<code>tmux capture-pane -p &gt; /tmp/audit.log</code> or <code>tmux capture-pane \\; save-buffer /tmp/audit.log</code>).",
                hint: "Run <code>tmux capture-pane -p &gt; /tmp/audit.log</code> in your terminal.",
                checkCmd: '[ -s /tmp/audit.log ] && echo OK',
                autoSolveCmd: 'tmux send-keys "echo DOJO_MASTER_LOG" C-m; tmux capture-pane -p > /tmp/audit.log; [ -s /tmp/audit.log ] || echo "DOJO_MASTER_LOG" > /tmp/audit.log'
            },
            {
                id: "k6-t3-event-hook-split",
                description: "<strong>Event-Driven Automation (<code>set-hook</code>):</strong> Why run commands manually when <code>tmux</code> can react to lifecycle events automatically? Register a global hook on <code>after-split-window</code> that automatically selects the <code>even-horizontal</code> layout whenever any pane is split:<br/><code>tmux set-hook -g after-split-window \"select-layout even-horizontal\"</code>.",
                hint: "Run <code>tmux set-hook -g after-split-window \"select-layout even-horizontal\"</code>.",
                checkCmd: 'tmux show-hooks -g 2>/dev/null | grep -q "after-split-window.*even-horizontal" && echo OK',
                autoSolveCmd: 'tmux set-hook -g after-split-window "select-layout even-horizontal"'
            },
            {
                id: "k6-t4-floating-popup-bind",
                description: "<strong>Floating Scratchpad Terminal (<code>display-popup</code> Binding):</strong> Modern <code>tmux</code> (3.2+) supports floating overlay windows (<code>display-popup</code>) that appear centered over your workspace. Bind <kbd>Prefix</kbd> + <kbd>g</kbd> (e.g., <code>tmux bind g display-popup -w 80% -h 80%</code> or <code>tmux bind g display-popup -E \"echo 'Master Popup'; sleep 1\"</code>) so pressing <kbd>Ctrl+b</kbd> <kbd>g</kbd> opens a centered floating popup window.",
                hint: "Run <code>tmux bind g display-popup -w 80% -h 80% -E \"echo 'Master Popup'; sleep 1\"</code> (or add <code>bind g display-popup -w 80% -h 80%</code> to <code>~/.tmux.conf</code> and reload).",
                checkCmd: 'tmux list-keys 2>/dev/null | grep -q "display-popup" && echo OK',
                autoSolveCmd: 'tmux bind g display-popup -w 80% -h 80% -E "echo Master_Popup; sleep 1"'
            },
            {
                id: "k6-t5-respawn-dead-pane",
                description: "<strong>Respawn a Dead Pane (<code>respawn-pane -k</code>):</strong> When a process hangs or a shell state gets corrupted, you don't need to destroy and recreate your carefully sized pane layout. Bind <kbd>Prefix</kbd> + <kbd>K</kbd> (uppercase <code>K</code>) to forcefully respawn the active pane in-place (<code>tmux bind K respawn-pane -k</code>).",
                hint: "Run <code>tmux bind K respawn-pane -k</code> (or add <code>bind K respawn-pane -k</code> to <code>~/.tmux.conf</code> and reload).",
                checkCmd: 'tmux list-keys 2>/dev/null | grep -q "respawn-pane -k" && echo OK',
                autoSolveCmd: 'tmux bind K respawn-pane -k'
            }
        ]
    },

    // ========================================================================
    // 🟥 KATA 7: RED BELT (Grandmaster) — The Art of Effortlessness (2 Tasks + Vault)
    // ========================================================================
    {
        id: "kata-7-red-belt",
        number: "KATA 07",
        belt: "Red Belt (Grandmaster)",
        beltColor: "red",
        title: "The Art of Effortlessness (Idempotent Architecture & The Grandmaster's Vault)",
        hasGrandmasterVault: true,
        theory: `
            <p>
                <em>Philosophy:</em> In Brazilian Jiu-Jitsu, the 9th/10th Degree <strong>Red Belt</strong> is reserved for
                Grandmasters who have spent a lifetime perfecting the art. At this pinnacle, there is no wasted motion:
                you don't build workspaces by hand—you summon entire fault-tolerant environments with a single idempotent
                command, and the Dojo becomes your permanent open mat.
            </p>
        `,
        tasks: [
            {
                id: "k7-t1-idempotent-grandmaster-script",
                description: "<strong>Craft an Idempotent Workspace Launcher (<code>/root/grandmaster.sh</code>):</strong> Create an executable script <code>/root/grandmaster.sh</code> (<code>chmod +x /root/grandmaster.sh</code>) that checks if session <code>sanctum</code> exists (<code>tmux has-session -t sanctum 2&gt;/dev/null</code>) and creates a detached session named <code>sanctum</code> with:<br/>• Window 1 named <code>command</code> containing 2 panes.<br/>• Window 2 named <code>watchtower</code> where <code>send-keys</code> automatically executes <code>echo \"SANCTUM_ONLINE\" &gt; /tmp/sanctum.status</code>.",
                hint: "Create <code>/root/grandmaster.sh</code>, mark it executable with <code>chmod +x /root/grandmaster.sh</code>, and run <code>/root/grandmaster.sh</code>.",
                checkCmd: '[ -x /root/grandmaster.sh ] && tmux has-session -t sanctum 2>/dev/null && tmux list-windows -t sanctum -F "#{window_name}" | grep -qx "watchtower" && grep -q "SANCTUM_ONLINE" /tmp/sanctum.status 2>/dev/null && echo OK',
                autoSolveCmd: 'printf "#!/bin/sh\\nif ! tmux has-session -t sanctum 2>/dev/null; then\\n  tmux new-session -d -s sanctum -n command\\n  tmux split-window -h -t sanctum:command\\n  tmux new-window -t sanctum -n watchtower\\n  tmux send-keys -t sanctum:watchtower \\"echo SANCTUM_ONLINE > /tmp/sanctum.status\\" C-m\\n  tmux select-window -t sanctum:command\\nfi\\necho SANCTUM_ONLINE > /tmp/sanctum.status\\n" > /root/grandmaster.sh && chmod +x /root/grandmaster.sh && /root/grandmaster.sh'
            },
            {
                id: "k7-t2-grandmaster-conf",
                description: "<strong>Lock in the Grandmaster <code>.tmux.conf</code>:</strong> Combine all ergonomic, aesthetic, and operational principles into one cohesive configuration file (or click any of the <strong>Grandmaster's Vault</strong> presets below!) so that <code>/root/.tmux.conf</code> contains at least 8 active configuration directives and is loaded into the running server.",
                hint: "Click any of the 3 <strong>Grandmaster's Vault</strong> preset buttons below (or click <strong>⚡ Auto-Complete Step</strong>) to forge and load a complete Grandmaster <code>~/.tmux.conf</code>.",
                checkCmd: '[ $(grep -Ev "^[[:space:]]*(#|$)" ~/.tmux.conf 2>/dev/null | wc -l) -ge 8 ] && echo OK',
                autoSolveCmd: 'if [ $(grep -Ev "^[[:space:]]*(#|$)" ~/.tmux.conf 2>/dev/null | wc -l) -lt 8 ]; then printf "set -g mouse on\\nsetw -g mode-keys vi\\nset -g base-index 1\\nsetw -g pane-base-index 1\\nset -g renumber-windows on\\nset -g prefix2 C-a\\nbind | split-window -h\\nbind - split-window -v\\nbind K respawn-pane -k\\n" >> ~/.tmux.conf; fi && tmux source-file ~/.tmux.conf 2>/dev/null || true'
            }
        ],
        sandboxFooterHtml: `
            <div class="sandbox-action-box theme-gallery-card grandmaster-vault-card">
                <div class="theme-gallery-header">
                    <div class="theme-gallery-title">🏛️ The Grandmaster's Vault (One-Click Config Injectors)</div>
                    <p class="theme-gallery-sub">
                        Click any Grandmaster edition below to write it to <code>/root/.tmux.conf</code> via <code>ttyS1</code>,
                        hot-reload your running <code>tmux</code> server, and inspect every line in the <strong>[ ~/.tmux.conf Editor ]</strong> tab.
                    </p>
                </div>
                <div class="theme-preset-grid">
                    <button type="button" class="theme-preset-btn" data-theme-key="gracie">
                        <div class="theme-btn-top">
                            <span class="theme-btn-name">🥋 1. Gracie Classic (Minimalist High-Contrast)</span>
                            <span class="theme-swatches">
                                <span class="swatch" style="background:#090d14"></span>
                                <span class="swatch" style="background:#f8fafc"></span>
                                <span class="swatch" style="background:#ef4444"></span>
                            </span>
                        </div>
                        <span class="theme-btn-desc">Ultra-low resource usage, instant response (escape-time 0), zero visual clutter, Vi copy-mode, Ctrl+a prefix</span>
                    </button>

                    <button type="button" class="theme-preset-btn" data-theme-key="catppuccin">
                        <div class="theme-btn-top">
                            <span class="theme-btn-name">🎨 2. Catppuccin Mocha Telemetry</span>
                            <span class="theme-swatches">
                                <span class="swatch" style="background:#1e1e2e"></span>
                                <span class="swatch" style="background:#a6e3a1"></span>
                                <span class="swatch" style="background:#89b4fa"></span>
                                <span class="swatch" style="background:#f38ba8"></span>
                            </span>
                        </div>
                        <span class="theme-btn-desc">Full 24-bit hex theming, conditional client_prefix badge, live /proc/loadavg &amp; memory telemetry, repeatable resize binds</span>
                    </button>

                    <button type="button" class="theme-preset-btn" data-theme-key="warroom">
                        <div class="theme-btn-top">
                            <span class="theme-btn-name">🚨 3. SysAdmin War Room Edition</span>
                            <span class="theme-swatches">
                                <span class="swatch" style="background:#0b1019"></span>
                                <span class="swatch" style="background:#dc2626"></span>
                                <span class="swatch" style="background:#f59e0b"></span>
                                <span class="swatch" style="background:#38bdf8"></span>
                            </span>
                        </div>
                        <span class="theme-btn-desc">Multi-user incident ops: Prefix+S sync toggle with bright red #[bg=red] SYNC ON warning badge &amp; Prefix+P capture-pane logging</span>
                    </button>
                </div>
                <div id="inject-sensei-feedback" class="inject-sensei-feedback" aria-live="polite"></div>
            </div>

            <div class="interactive-cheatsheet-card" id="interactive-cheatsheet-card">
                <div class="cheatsheet-card-header">
                    <div class="theme-gallery-title">📜 Interactive Master Cheat Sheet</div>
                    <input
                        type="search"
                        id="cheatsheet-search-input"
                        class="cheatsheet-search-input"
                        placeholder="Search commands, flags, #{variables}, or hooks..."
                        aria-label="Search Master Cheat Sheet"
                    />
                    <div class="cheatsheet-filter-pills" id="cheatsheet-filter-pills">
                        <button type="button" class="cheatsheet-pill active" data-category="All">All</button>
                        <button type="button" class="cheatsheet-pill" data-category="Sessions">Sessions</button>
                        <button type="button" class="cheatsheet-pill" data-category="Panes">Panes</button>
                        <button type="button" class="cheatsheet-pill" data-category="Windows">Windows</button>
                        <button type="button" class="cheatsheet-pill" data-category="Copy Mode">Copy Mode</button>
                        <button type="button" class="cheatsheet-pill" data-category="Shared Sockets">Shared Sockets (-S)</button>
                        <button type="button" class="cheatsheet-pill" data-category="Format Variables">Format Variables (#{...})</button>
                        <button type="button" class="cheatsheet-pill" data-category="Hooks">Hooks</button>
                    </div>
                </div>
                <div class="cheatsheet-table-wrapper">
                    <table class="cheatsheet-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Command / Keybinding</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody id="cheatsheet-table-body"></tbody>
                    </table>
                </div>
            </div>
        `
    }
];

window.TMUX_DOJO_THEMES = TMUX_DOJO_THEMES;
window.SENSEI_RECOMMENDED_TMUX_CONF = SENSEI_RECOMMENDED_TMUX_CONF;
window.TMUX_DOJO_KATAS = TMUX_DOJO_KATAS;
// @license-end
