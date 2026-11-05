// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0-or-later
/**
 * tmux-dojo — Complete Brazilian Jiu-Jitsu (BJJ) Belt & Stripe Curriculum (English)
 * Copyright (C) 2026 Dragoş Iorgulescu
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Progression:
 *   Kata 1: White Belt  — Survival & Escapes (Sessions & Client-Server) [6 Tasks]
 *   Kata 2: Blue Belt   — Guard Work & Spatial Control (Panes & Windows) [6 Tasks]
 *   Kata 3: Purple Belt — Flow State, Vi Buffers & Keybinding Modifiers (~/.tmux.conf) [6 Tasks]
 *   Kata 4: Brown Belt  — Customizing Your Gi (Status Bar Ricing, Colors, Modifiers & Live Telemetry) [5 Tasks]
 *   Kata 5: Black Belt  — Team Ops, Shared Sockets & Automation (Multi-User & Scripting) [6 Tasks]
 *   Kata 6: Coral Belt  — Open Mat (Sandbox, Theme Gallery & Master Cheat Sheet) [3 Preset Themes]
 */

const TMUX_DOJO_THEMES = {
    catppuccin: {
        name: "Catppuccin Mocha Dojo",
        tagline: "Modern dark pastel palette with dynamic Red/Green Prefix indicator & live CPU load",
        conf: `# ============================================================================
# Theme: Catppuccin Mocha Dojo (Sensei's Recommended Default)
# ============================================================================

# Core Ergonomics & Vi Copy Mode
set -g mouse on
setw -g mode-keys vi
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
set -g history-limit 10000
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

# Fast Config Reload
bind r source-file ~/.tmux.conf \\; display "Catppuccin Mocha Dojo Reloaded!"

# Catppuccin Mocha Status Bar & Borders
set -g status-position bottom
set -g status-interval 2
set -g status-style "bg=#1e1e2e,fg=#cdd6f4"
set -g pane-border-style "fg=#45475a"
set -g pane-active-border-style "fg=#a6e3a1,bold"

setw -g window-status-style "bg=#181825,fg=#a6adc8"
setw -g window-status-format " #I:#W "
setw -g window-status-current-style "bg=#89b4fa,fg=#11111b,bold"
setw -g window-status-current-format " #I:#W#{?window_zoomed_flag, [Z],} "

set -g status-left-length 40
set -g status-left "#{?client_prefix,#[bg=#f38ba8 fg=#11111b bold] PREFIX #[default],#[bg=#a6e3a1 fg=#11111b bold] #S #[default]} "

set -g status-right-length 80
set -g status-right "#[fg=#f9e2af]CMD:#{pane_current_command} #[fg=#89b4fa]| LOAD:#(cut -d' ' -f1 /proc/loadavg) #[fg=#cdd6f4]| %H:%M "
`
    },
    matrix: {
        name: "Cyberpunk Matrix",
        tagline: "High-contrast neon phosphor green on pure black with sharp cybernetic borders",
        conf: `# ============================================================================
# Theme: Cyberpunk Matrix
# ============================================================================

set -g mouse on
setw -g mode-keys vi
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
set -g default-terminal "tmux-256color"

set -g prefix2 C-a
bind C-a send-prefix -2
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
bind -n M-Left select-pane -L
bind -n M-Right select-pane -R
bind -r H resize-pane -L 5
bind -r L resize-pane -R 5
bind r source-file ~/.tmux.conf \\; display "Matrix Protocol Reloaded!"

# High-Contrast Phosphor Green on Void Black
set -g status-position bottom
set -g status-interval 2
set -g status-style "bg=#000000,fg=#00ff66"
set -g pane-border-style "fg=#003311"
set -g pane-active-border-style "fg=#00ff66,bold"

setw -g window-status-style "bg=#000000,fg=#008833"
setw -g window-status-format " [#I:#W] "
setw -g window-status-current-style "bg=#00ff66,fg=#000000,bold"
setw -g window-status-current-format " <#I:#W#{?window_zoomed_flag,*Z*,}> "

set -g status-left-length 40
set -g status-left "#{?client_prefix,#[bg=#ff0055 fg=#000000 bold] [OVERRIDE] #[default],#[bg=#00ff66 fg=#000000 bold] [#S] #[default]} "

set -g status-right-length 80
set -g status-right "#[fg=#00ff66]SYS:#{pane_current_command} // LOAD:#(cut -d' ' -f1 /proc/loadavg) // %H:%M:%S "
`
    },
    zen: {
        name: "Minimalist Zen",
        tagline: "Top status bar, muted slate typography, and distraction-free monochrome focus",
        conf: `# ============================================================================
# Theme: Minimalist Zen
# ============================================================================

set -g mouse on
setw -g mode-keys vi
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
set -g default-terminal "tmux-256color"

set -g prefix2 C-a
bind C-a send-prefix -2
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
bind -n M-Left select-pane -L
bind -n M-Right select-pane -R
bind -r H resize-pane -L 5
bind -r L resize-pane -R 5
bind r source-file ~/.tmux.conf \\; display "Zen Config Reloaded"

# Top Status Bar & Muted Monochrome Aesthetics
set -g status-position top
set -g status-interval 5
set -g status-justify left
set -g status-style "bg=#0e141f,fg=#647792"
set -g pane-border-style "fg=#182336"
set -g pane-active-border-style "fg=#647792"

setw -g window-status-style "bg=#0e141f,fg=#647792"
setw -g window-status-format "  #I·#W  "
setw -g window-status-current-style "bg=#0e141f,fg=#eef4fc,bold,underscore"
setw -g window-status-current-format "  #I·#W#{?window_zoomed_flag, (z),}  "

set -g status-left-length 30
set -g status-left "#{?client_prefix,#[fg=#f59e0b bold] ● #S ,#[fg=#9fb0c7] ○ #S } "

set -g status-right-length 60
set -g status-right "#[fg=#647792]#{pane_current_command}  %H:%M "
`
    }
};

const SENSEI_RECOMMENDED_TMUX_CONF = TMUX_DOJO_THEMES.catppuccin.conf;

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
    // 🟫 KATA 4: BROWN BELT — Customizing Your Gi (5 Tasks)
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
            }
        ]
    },

    // ========================================================================
    // ⬛ KATA 5: BLACK BELT — Team Ops, Shared Sockets & Automation (6 Tasks)
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
                description: "<strong>Automated Workspace Scripting:</strong> Write an executable script <code>/root/deploy-dojo.sh</code> (or run a chained command) that builds a multi-window session named <code>hq</code> with window <code>code</code> split into 2 panes and a second window named <code>logs</code>, completely non-interactively (<code>tmux new-session -d -s hq -n code \\; split-window -h \\; new-window -n logs</code>).",
                hint: "Run <code>tmux new-session -d -s hq -n code \\; split-window -h \\; new-window -n logs</code> in your shell.",
                checkCmd: 'tmux has-session -t hq 2>/dev/null && tmux list-windows -t hq -F "#{window_name}" | grep -qx "logs" && [ $(tmux list-panes -t hq:code 2>/dev/null | wc -l) -eq 2 ] && echo OK',
                autoSolveCmd: 'printf "#!/bin/sh\\ntmux kill-session -t hq 2>/dev/null || true\\ntmux new-session -d -s hq -n code \\\\; split-window -h \\\\; new-window -n logs\\n" > /root/deploy-dojo.sh && chmod +x /root/deploy-dojo.sh && /root/deploy-dojo.sh'
            }
        ]
    },

    // ========================================================================
    // 🟥⬛ KATA 6: CORAL BELT — Open Mat (Sandbox, Theme Gallery & Master Cheat Sheet)
    // ========================================================================
    {
        id: "kata-6-coral-belt",
        number: "KATA 06",
        belt: "Coral Belt",
        beltColor: "coral",
        title: "Open Mat (Sandbox, Theme Gallery & Master Cheat Sheet)",
        isSandbox: true,
        hasSandboxExtras: true,
        theory: `
            <p>
                <em>Oss!</em> You have progressed from White Belt survival to Black Belt multi-user War Rooms and workspace
                automation. Welcome to <strong>Coral Belt Open Mat</strong>—experiment freely with the 3 one-click
                <code>~/.tmux.conf</code> themes below, inspect them in the <strong>[ ~/.tmux.conf Editor ]</strong> tab,
                or use the Master Cheat Sheet as your permanent reference.
            </p>
        `,
        tasks: [],
        sandboxFooterHtml: `
            <div class="theme-gallery-card">
                <div class="theme-gallery-header">
                    <span class="theme-gallery-title">🎨 One-Click ~/.tmux.conf Theme Gallery</span>
                    <span class="theme-gallery-sub">Applies &amp; hot-reloads live via ttyS1</span>
                </div>
                <div class="theme-preset-grid">
                    <button type="button" class="theme-preset-btn" data-theme-key="catppuccin">
                        <div class="theme-preset-top">
                            <span class="theme-swatches">
                                <span style="background:#1e1e2e"></span>
                                <span style="background:#a6e3a1"></span>
                                <span style="background:#89b4fa"></span>
                                <span style="background:#f38ba8"></span>
                            </span>
                            <strong>1. Catppuccin Mocha Dojo</strong>
                        </div>
                        <p>Modern dark pastel with dynamic Red/Green Prefix badge &amp; live CPU load</p>
                    </button>

                    <button type="button" class="theme-preset-btn" data-theme-key="matrix">
                        <div class="theme-preset-top">
                            <span class="theme-swatches">
                                <span style="background:#000000"></span>
                                <span style="background:#00ff66"></span>
                                <span style="background:#008833"></span>
                                <span style="background:#ff0055"></span>
                            </span>
                            <strong>2. Cyberpunk Matrix</strong>
                        </div>
                        <p>High-contrast neon phosphor green on pure black with minimal borders</p>
                    </button>

                    <button type="button" class="theme-preset-btn" data-theme-key="zen">
                        <div class="theme-preset-top">
                            <span class="theme-swatches">
                                <span style="background:#0e141f"></span>
                                <span style="background:#647792"></span>
                                <span style="background:#9fb0c7"></span>
                                <span style="background:#f59e0b"></span>
                            </span>
                            <strong>3. Minimalist Zen</strong>
                        </div>
                        <p>Distraction-free top status bar with muted slate &amp; monochrome typography</p>
                    </button>
                </div>
                <div id="inject-sensei-feedback" class="inject-sensei-feedback" aria-live="polite"></div>
            </div>

            <div class="master-cheatsheet">
                <div class="cheatsheet-section">
                    <h4>Sessions &amp; Server</h4>
                    <ul class="theory-keylist">
                        <li><span><code>tmux new -s name</code></span> <span>Start named session</span></li>
                        <li><span><code>tmux new -s name -d</code></span> <span>Start detached background session</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>$</kbd></span> <span>Rename active session</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>d</kbd></span> <span>Detach from session</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>s</kbd></span> <span>Interactive session tree chooser</span></li>
                    </ul>
                </div>

                <div class="cheatsheet-section">
                    <h4>Panes &amp; Windows</h4>
                    <ul class="theory-keylist">
                        <li><span><kbd>Ctrl+b</kbd> <kbd>%</kbd> / <kbd>"</kbd></span> <span>Split vertically / horizontally</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>z</kbd></span> <span>Toggle pane Monocle Zoom</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>Space</kbd></span> <span>Cycle preset pane layouts</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>c</kbd> / <kbd>,</kbd></span> <span>Create / Rename window</span></li>
                        <li><span><kbd>Ctrl+b</kbd> <kbd>!</kbd></span> <span>Break pane into standalone window</span></li>
                    </ul>
                </div>

                <div class="cheatsheet-section">
                    <h4>Keybinding Modifiers &amp; Vi Mode</h4>
                    <ul class="theory-keylist">
                        <li><span><code>setw -g mode-keys vi</code></span> <span>Enable Vi navigation in Copy Mode (<kbd>Ctrl+b</kbd> <kbd>[</kbd>)</span></li>
                        <li><span><code>set -g prefix2 C-a</code></span> <span>Add secondary <kbd>Ctrl+a</kbd> prefix</span></li>
                        <li><span><code>bind -n M-Left select-pane -L</code></span> <span>Root table (<code>-n</code>): switch panes with <kbd>Alt+Left</kbd></span></li>
                        <li><span><code>bind -r H resize-pane -L 5</code></span> <span>Repeatable (<code>-r</code>): tap <kbd>H</kbd> repeatedly to resize</span></li>
                    </ul>
                </div>

                <div class="cheatsheet-section">
                    <h4>Status Bar Telemetry &amp; Multi-User</h4>
                    <ul class="theory-keylist">
                        <li><span><code>#{?client_prefix,PREFIX,#S}</code></span> <span>Dynamic conditional Prefix indicator</span></li>
                        <li><span><code>#(cut -d' ' -f1 /proc/loadavg)</code></span> <span>Embed live shell telemetry in bar</span></li>
                        <li><span><code>tmux -S /tmp/pair.sock new -s warroom</code></span> <span>Create shared multi-user socket</span></li>
                        <li><span><code>tmux -S /tmp/pair.sock attach -r</code></span> <span>Shadow session in Read-Only mode</span></li>
                        <li><span><code>tmux -S /tmp/pair.sock new -t warroom -s view2</code></span> <span>Grouped session with independent window focus</span></li>
                    </ul>
                </div>
            </div>
        `
    }
];

window.TMUX_DOJO_THEMES = TMUX_DOJO_THEMES;
window.TMUX_DOJO_KATAS = TMUX_DOJO_KATAS;
window.SENSEI_RECOMMENDED_TMUX_CONF = SENSEI_RECOMMENDED_TMUX_CONF;
// @license-end
