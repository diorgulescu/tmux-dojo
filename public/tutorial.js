// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0-or-later
/**
 * tmux-dojo — BJJ Belt & Stripe Interactive Tutorial Runner
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

const STORAGE_KEY = "tmux_dojo_bjj_progress_v2";

class TutorialEngine {
    /**
     * @param {object} app - Instance of TmuxDojoApp
     * @param {Array} katas - Array of Kata definitions from lessons.js
     */
    constructor(app, katas) {
        this.app = app;
        this.katas = katas;

        this.currentKataIndex = 0;
        this.completedTasks = new Set();
        this.hintVisible = false;
        this.pollTimer = null;
        this.isPollingCheck = false;

        // DOM references
        this.beltBadge = document.getElementById("belt-badge");
        this.progressFill = document.getElementById("kata-progress-fill");
        this.kataContent = document.getElementById("kata-content");

        this._loadState();
    }

    init() {
        this.render();
        this.startPolling();
    }

    _loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.completedTasks)) {
                this.completedTasks = new Set(parsed.completedTasks);
            }
            if (
                typeof parsed.currentKataIndex === "number" &&
                parsed.currentKataIndex >= 0 &&
                parsed.currentKataIndex < this.katas.length
            ) {
                this.currentKataIndex = parsed.currentKataIndex;
            }
        } catch (err) {
            console.warn("Could not load saved tutorial progress:", err);
        }
    }

    _saveState() {
        try {
            const payload = {
                currentKataIndex: this.currentKataIndex,
                completedTasks: Array.from(this.completedTasks),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (err) {
            console.warn("Could not save tutorial progress:", err);
        }
    }

    resetProgress() {
        this.completedTasks.clear();
        this.currentKataIndex = 0;
        this.hintVisible = false;
        this._saveState();
        this.render();
    }

    get currentKata() {
        return this.katas[this.currentKataIndex];
    }

    /**
     * Returns the first incomplete task in the current Kata, or null if all tasks are complete.
     */
    getActiveTask(kata = this.currentKata) {
        if (!kata || !Array.isArray(kata.tasks)) {
            return null;
        }
        for (const task of kata.tasks) {
            if (!this.completedTasks.has(task.id)) {
                return task;
            }
        }
        return null;
    }

    isKataComplete(kata) {
        if (!kata.tasks || kata.tasks.length === 0) {
            return true;
        }
        return kata.tasks.every((t) => this.completedTasks.has(t.id));
    }

    getTotalTaskProgress() {
        let total = 0;
        let done = 0;
        for (const kata of this.katas) {
            for (const task of kata.tasks || []) {
                total++;
                if (this.completedTasks.has(task.id)) {
                    done++;
                }
            }
        }
        return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 100 };
    }

    /**
     * Builds the visual BJJ Belt & Stripes (trese) HTML for a Kata.
     * As the user completes tasks in a belt, white stripes fill into the black/red rank bar!
     */
    _buildBjjBeltHtml(kata, compact = false) {
        const beltColor = kata.beltColor || "white";
        const tasks = Array.isArray(kata.tasks) ? kata.tasks : [];
        const totalStripes = tasks.length > 0 ? tasks.length : 4;
        const earnedStripes =
            tasks.length > 0
                ? tasks.filter((t) => this.completedTasks.has(t.id)).length
                : 4;

        let stripesHtml = "";
        for (let i = 0; i < totalStripes; i++) {
            const isEarned = i < earnedStripes;
            stripesHtml += `<span class="bjj-stripe ${isEarned ? "earned" : ""}" title="Stripe ${i + 1} of ${totalStripes}"></span>`;
        }

        if (compact) {
            return `
                <span class="bjj-belt-label">${kata.belt}</span>
                <span class="bjj-ponta ponta-${beltColor}" aria-label="${earnedStripes} of ${totalStripes} stripes earned">
                    ${stripesHtml}
                </span>
            `;
        }

        return `
            <div class="bjj-belt-banner belt-fabric-${beltColor}">
                <div class="bjj-belt-stitch"></div>
                <div class="bjj-belt-info">
                    <span class="bjj-belt-rank-title">${kata.number} • ${kata.belt.toUpperCase()}</span>
                    <span class="bjj-belt-stripes-text">${
                        kata.isSandbox
                            ? "Master Rank • 4/4 Stripes"
                            : `${earnedStripes} / ${totalStripes} Stripes (Trese) Earned`
                    }</span>
                </div>
                <div class="bjj-ponta-bar ponta-${beltColor}" title="${earnedStripes} of ${totalStripes} Stripes Earned">
                    ${stripesHtml}
                </div>
            </div>
        `;
    }

    selectKata(index) {
        if (index < 0 || index >= this.katas.length) {
            return;
        }
        this.currentKataIndex = index;
        this.hintVisible = false;
        this._saveState();
        this.render();
        if (this.app && this.app.term) {
            this.app.term.focus();
        }
    }

    startPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
        }
        this.pollTimer = setInterval(() => {
            this.checkActiveTask();
        }, 1500);
    }

    async checkActiveTask() {
        if (this.isPollingCheck) {
            return;
        }
        if (!this.app || !this.app.isVmReady || !this.app.inspector) {
            return;
        }

        const activeTask = this.getActiveTask();
        if (!activeTask || !activeTask.checkCmd) {
            return;
        }

        this.isPollingCheck = true;
        try {
            const output = await this.app.inspector.exec(activeTask.checkCmd, 4000);
            const lines = output
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);

            if (lines.includes("OK")) {
                this._markTaskCompleted(activeTask);
            }
        } catch (_) {
            // Ignore transient evaluation timeouts during polling
        } finally {
            this.isPollingCheck = false;
        }
    }

    _markTaskCompleted(task) {
        if (this.completedTasks.has(task.id)) {
            return;
        }
        this.completedTasks.add(task.id);
        this.hintVisible = false;
        this._saveState();
        this.render(task.id);

        // Execute any bonus side-effect command on ttyS1 when a task passes
        // (e.g., teammate sending a live greeting message into /tmp/pair.sock in Kata 5)
        if (task.onPassCmd && this.app && this.app.isVmReady && this.app.inspector) {
            this.app.inspector.exec(task.onPassCmd, 5000).catch(() => {});
        }
    }

    /**
     * Executes or simulates the active task when the user clicks "Auto-Complete Step".
     */
    async autoCompleteActiveTask() {
        const activeTask = this.getActiveTask();
        if (!activeTask) {
            return;
        }
        if (!this.app || !this.app.isVmReady || !this.app.emulator || !this.app.inspector) {
            return;
        }

        const autoBtn = document.getElementById("auto-complete-btn");
        if (autoBtn) {
            autoBtn.disabled = true;
            autoBtn.textContent = "⏳ Executing Step...";
        }

        try {
            if (Array.isArray(activeTask.autoSteps) && activeTask.autoSteps.length > 0) {
                for (const step of activeTask.autoSteps) {
                    if (step.type === "ttyS0" && step.data) {
                        const bytes = new TextEncoder().encode(step.data);
                        for (let i = 0; i < bytes.length; i++) {
                            this.app.emulator.bus.send("serial0-input", bytes[i]);
                        }
                    } else if (step.type === "ttyS1" && step.cmd) {
                        await this.app.inspector.exec(step.cmd, 6000);
                    }
                }
            } else if (activeTask.autoSolveCmd) {
                await this.app.inspector.exec(activeTask.autoSolveCmd, 6000);
            }

            // Wait briefly for the command to take effect, then run checkActiveTask
            await new Promise((r) => setTimeout(r, 450));
            await this.checkActiveTask();
        } catch (err) {
            console.warn("Auto-complete step encountered an error:", err);
        } finally {
            if (autoBtn && document.body.contains(autoBtn)) {
                autoBtn.disabled = false;
                autoBtn.textContent = "⚡ Auto-Complete Step";
            }
            if (this.app.term) {
                this.app.term.focus();
            }
        }
    }

    /**
     * Applies one of the 3 preset themes ("catppuccin", "matrix", "zen") to `/root/.tmux.conf` via ttyS1
     * and reloads tmux immediately.
     */
    async applyThemePreset(themeKey) {
        if (!this.app || !this.app.isVmReady || !this.app.inspector) {
            return;
        }

        const themes = window.TMUX_DOJO_THEMES || {};
        const selected = themes[themeKey];
        if (!selected) {
            return;
        }

        const feedback = document.getElementById("inject-sensei-feedback");
        const allButtons = document.querySelectorAll(".theme-preset-btn");
        allButtons.forEach((b) => {
            b.disabled = true;
        });

        try {
            const out = await this.app.inspector.writeAndReloadTmuxConf(selected.conf);
            // Ensure a tmux session is running so the user sees the new status bar right away
            await this.app.inspector.exec("tmux has-session 2>/dev/null || tmux new-session -d -s dojo", 4000);
            await this.app.inspector.exec("tmux source-file /root/.tmux.conf 2>/dev/null || true", 4000);

            if (this.app.confTextarea) {
                this.app.confTextarea.value = selected.conf;
                this.app._renderConfigExplanations(selected.conf);
            }

            if (out.includes("CONF_SAVED_OK") && feedback) {
                feedback.textContent = `✓ Applied "${selected.name}" to /root/.tmux.conf and hot-reloaded tmux! Open the [ ~/.tmux.conf Editor ] tab or attach to tmux to admire your new Gi.`;
                feedback.classList.add("visible");
            }

            allButtons.forEach((b) => {
                b.classList.toggle("active-theme", b.getAttribute("data-theme-key") === themeKey);
            });
        } catch (err) {
            if (feedback) {
                feedback.textContent = `⚠ Could not apply theme: ${err.message}`;
                feedback.classList.add("visible");
            }
        } finally {
            allButtons.forEach((b) => {
                b.disabled = false;
            });
            if (this.app.term) {
                this.app.term.focus();
            }
        }
    }

    /**
     * Injects Sensei's Recommended ~/.tmux.conf via ttyS1 and reloads tmux.
     */
    async injectSenseiConfig() {
        return this.applyThemePreset("catppuccin");
    }

    render(justCompletedTaskId = null) {
        const kata = this.currentKata;
        if (!kata) {
            return;
        }

        // Update Belt Badge with live BJJ rank bar & white stripes in sidebar header
        if (this.beltBadge) {
            this.beltBadge.innerHTML = this._buildBjjBeltHtml(kata, true);
            this.beltBadge.className = `belt-badge belt-${kata.beltColor || "white"}`;
        }

        // Update overall progress bar
        const progress = this.getTotalTaskProgress();
        if (this.progressFill) {
            this.progressFill.style.width = `${Math.max(5, progress.percent)}%`;
        }

        const activeTask = this.getActiveTask(kata);
        const kataDone = this.isKataComplete(kata);

        // Build Kata Navigation Tabs
        const navTabsHtml = this.katas
            .map((k, idx) => {
                const isCurrent = idx === this.currentKataIndex;
                const isDone = k.isSandbox ? progress.done === progress.total : this.isKataComplete(k);
                return `
                    <button
                        type="button"
                        class="kata-nav-tab ${isCurrent ? "active" : ""} ${isDone ? "completed" : ""}"
                        data-kata-index="${idx}"
                        title="${k.number}: ${k.title} (${k.belt})"
                    >
                        <span class="tab-index">${idx + 1}</span>
                        <span class="tab-belt-dot belt-dot-${k.beltColor}"></span>
                        ${isDone ? '<span class="tab-check">✓</span>' : ""}
                    </button>
                `;
            })
            .join("");

        // Build Task Checklist
        let tasksSectionHtml = "";
        if (!kata.isSandbox && kata.tasks && kata.tasks.length > 0) {
            const taskItemsHtml = kata.tasks
                .map((task, idx) => {
                    const isCompleted = this.completedTasks.has(task.id);
                    const isActive = activeTask && activeTask.id === task.id;
                    const justFinished = justCompletedTaskId === task.id;

                    let stateClass = "task-locked";
                    let badgeText = `Stripe ${idx + 1}`;
                    if (isCompleted) {
                        stateClass = "task-completed";
                        badgeText = `✓ Stripe ${idx + 1} Earned`;
                    } else if (isActive) {
                        stateClass = "task-active";
                        badgeText = `Active Stripe ${idx + 1} of ${kata.tasks.length}`;
                    }

                    return `
                        <div class="kata-task-item ${stateClass} ${justFinished ? "task-just-completed" : ""}" data-task-id="${task.id}">
                            <div class="task-item-header">
                                <span class="task-step-badge">${badgeText}</span>
                                ${isActive ? '<span class="task-live-probe">Listening on ttyS1...</span>' : ""}
                            </div>
                            <div class="task-item-desc">${task.description}</div>
                            ${
                                isActive
                                    ? `
                                <div class="task-actions-row">
                                    <button type="button" id="sensei-hint-btn" class="task-action-btn hint-btn">
                                        💡 ${this.hintVisible ? "Hide Sensei Hint" : "Sensei Hint"}
                                    </button>
                                    <button type="button" id="auto-complete-btn" class="task-action-btn autocomplete-btn">
                                        ⚡ Auto-Complete Step
                                    </button>
                                </div>
                                ${
                                    this.hintVisible
                                        ? `<div class="sensei-hint-box" id="sensei-hint-box"><strong>Sensei:</strong> ${task.hint}</div>`
                                        : ""
                                }
                            `
                                    : ""
                            }
                        </div>
                    `;
                })
                .join("");

            const nextKata = this.katas[this.currentKataIndex + 1];
            const completionBannerHtml = kataDone
                ? `
                    <div class="kata-complete-banner">
                        <div class="complete-banner-text">
                            <strong>🥋 ${kata.belt} Promoted!</strong> You earned all stripes in ${kata.number}.
                        </div>
                        ${
                            nextKata
                                ? `<button type="button" id="next-kata-btn" class="next-kata-btn">Promote to ${nextKata.number}: ${nextKata.belt} →</button>`
                                : ""
                        }
                    </div>
                `
                : "";

            tasksSectionHtml = `
                <div class="kata-tasks-section">
                    <div class="tasks-section-header">
                        <span>Belt Promotion Challenges</span>
                        <span class="tasks-counter">${kata.tasks.filter((t) => this.completedTasks.has(t.id)).length} / ${kata.tasks.length} Stripes</span>
                    </div>
                    <div class="kata-tasks-list">
                        ${taskItemsHtml}
                    </div>
                    ${completionBannerHtml}
                </div>
            `;
        }

        // Footer controls for prev/next navigation & resetting progress
        const prevDisabled = this.currentKataIndex === 0 ? "disabled" : "";
        const nextDisabled = this.currentKataIndex >= this.katas.length - 1 ? "disabled" : "";

        this.kataContent.innerHTML = `
            <nav class="kata-switcher" aria-label="Kata Selection">
                <div class="kata-tabs-group">
                    ${navTabsHtml}
                </div>
                <span class="overall-progress-label">${progress.done}/${progress.total} Stripes</span>
            </nav>

            ${this._buildBjjBeltHtml(kata, false)}

            <div class="kata-meta">
                <span class="kata-number">${kata.number} • ${kata.belt.toUpperCase()}</span>
                <span class="kata-status-pill ${kataDone ? "pill-complete" : ""}">
                    ${kata.isSandbox ? "Open Mat Mode" : kataDone ? "Belt Completed ✓" : "In Training"}
                </span>
            </div>

            <h2 class="kata-title">${kata.title}</h2>

            <div class="kata-theory">
                ${kata.theory}
            </div>

            ${tasksSectionHtml}

            ${kata.sandboxFooterHtml ? `<div class="kata-sandbox-extras">${kata.sandboxFooterHtml}</div>` : ""}

            <div class="kata-pagination-bar">
                <button type="button" id="prev-kata-btn" class="kata-page-btn" ${prevDisabled}>← Prev Belt</button>
                <button type="button" id="reset-progress-btn" class="reset-progress-link" title="Clear saved lesson progress">Reset Progress</button>
                <button type="button" id="next-kata-nav-btn" class="kata-page-btn" ${nextDisabled}>Next Belt →</button>
            </div>
        `;

        this._bindRenderedEvents();
    }

    _bindRenderedEvents() {
        // Kata tab buttons
        this.kataContent.querySelectorAll(".kata-nav-tab").forEach((btn) => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-kata-index"), 10);
                this.selectKata(idx);
            });
        });

        // Sensei Hint toggle
        const hintBtn = document.getElementById("sensei-hint-btn");
        if (hintBtn) {
            hintBtn.addEventListener("click", () => {
                this.hintVisible = !this.hintVisible;
                this.render();
            });
        }

        // Auto-Complete Step button
        const autoBtn = document.getElementById("auto-complete-btn");
        if (autoBtn) {
            autoBtn.addEventListener("click", () => {
                this.autoCompleteActiveTask();
            });
        }

        // Next Kata banner button
        const nextBannerBtn = document.getElementById("next-kata-btn");
        if (nextBannerBtn) {
            nextBannerBtn.addEventListener("click", () => {
                this.selectKata(this.currentKataIndex + 1);
            });
        }

        // Prev / Next pagination buttons
        const prevBtn = document.getElementById("prev-kata-btn");
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                this.selectKata(this.currentKataIndex - 1);
            });
        }

        const nextNavBtn = document.getElementById("next-kata-nav-btn");
        if (nextNavBtn) {
            nextNavBtn.addEventListener("click", () => {
                this.selectKata(this.currentKataIndex + 1);
            });
        }

        // Reset progress button
        const resetProgressBtn = document.getElementById("reset-progress-btn");
        if (resetProgressBtn) {
            resetProgressBtn.addEventListener("click", () => {
                this.resetProgress();
            });
        }

        // Kata 6 (Coral Belt): Theme Gallery preset buttons
        this.kataContent.querySelectorAll(".theme-preset-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const themeKey = btn.getAttribute("data-theme-key");
                if (themeKey) {
                    this.applyThemePreset(themeKey);
                }
            });
        });

        // Legacy/fallback button support
        const injectBtn = document.getElementById("inject-sensei-conf-btn");
        if (injectBtn) {
            injectBtn.addEventListener("click", () => {
                this.injectSenseiConfig();
            });
        }
    }
}

window.TutorialEngine = TutorialEngine;

window.addEventListener("DOMContentLoaded", () => {
    const startTutorial = () => {
        if (window.tmuxDojoApp && window.TMUX_DOJO_KATAS) {
            const engine = new TutorialEngine(window.tmuxDojoApp, window.TMUX_DOJO_KATAS);
            window.tutorialEngine = engine;
            engine.init();
        }
    };

    // Initialize immediately after TmuxDojoApp is created
    setTimeout(startTutorial, 0);
});
// @license-end
