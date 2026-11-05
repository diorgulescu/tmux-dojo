// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0-or-later
/**
 * tmux-dojo — 7-Belt BJJ & Grandmaster Interactive Tutorial Runner
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

const STORAGE_KEY = "tmux_dojo_bjj_progress_v4";

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

        // Interactive Master Cheat Sheet filter state
        this.cheatSheetCategory = "All";
        this.cheatSheetQuery = "";

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
     * As the user completes tasks in a belt, white/gold stripes fill into the rank bar!
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

        const rankSub =
            beltColor === "red"
                ? `9th/10th Degree Grandmaster • ${earnedStripes} / ${totalStripes} Grandmaster Stripes`
                : beltColor === "coral"
                ? `7th Degree Master • ${earnedStripes} / ${totalStripes} Master Stripes`
                : kata.track === "foundations"
                ? `UNIX Foundations (Youth Belt) • ${earnedStripes} / ${totalStripes} Stripes (Trese) Earned`
                : `${earnedStripes} / ${totalStripes} Stripes (Trese) Earned`;

        return `
            <div class="bjj-belt-banner belt-fabric-${beltColor}">
                <div class="bjj-belt-stitch"></div>
                <div class="bjj-belt-info">
                    <span class="bjj-belt-rank-title">${kata.number} • ${kata.belt.toUpperCase()}</span>
                    <span class="bjj-belt-stripes-text">${rankSub}</span>
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
     * Applies one of the Grandmaster's Vault themes ("gracie", "catppuccin", "warroom")
     * to `/root/.tmux.conf` via ttyS1 and reloads tmux immediately.
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
            await this.app.inspector.exec("tmux has-session 2>/dev/null || tmux new-session -d -s dojo", 4000);
            await this.app.inspector.exec("tmux source-file /root/.tmux.conf 2>/dev/null || true", 4000);

            if (this.app.confTextarea) {
                this.app.confTextarea.value = selected.conf;
                this.app._renderConfigExplanations(selected.conf);
            }

            // Immediately verify if this satisfies the active task (e.g., k7-t2-grandmaster-conf)
            await this.checkActiveTask();

            const updatedFeedback = document.getElementById("inject-sensei-feedback");
            if (out.includes("CONF_SAVED_OK") && updatedFeedback) {
                updatedFeedback.textContent = `✓ Forged "${selected.name}" into /root/.tmux.conf and hot-reloaded tmux!`;
                updatedFeedback.classList.add("visible");
            }

            document.querySelectorAll(".theme-preset-btn").forEach((b) => {
                b.classList.toggle("active-theme", b.getAttribute("data-theme-key") === themeKey);
            });
        } catch (err) {
            if (feedback) {
                feedback.textContent = `⚠ Could not apply theme: ${err.message}`;
                feedback.classList.add("visible");
            }
        } finally {
            document.querySelectorAll(".theme-preset-btn").forEach((b) => {
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

    _renderCheatSheetRows() {
        const tbody = document.getElementById("cheatsheet-table-body");
        if (!tbody) {
            return;
        }
        const items = window.MASTER_CHEATSHEET_ITEMS || [];
        const q = (this.cheatSheetQuery || "").trim().toLowerCase();
        const cat = this.cheatSheetCategory || "All";

        const filtered = items.filter((item) => {
            const matchesCat = cat === "All" || item.category === cat;
            if (!matchesCat) {
                return false;
            }
            if (!q) {
                return true;
            }
            return (
                item.category.toLowerCase().includes(q) ||
                item.cmd.toLowerCase().includes(q) ||
                item.desc.toLowerCase().includes(q)
            );
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="cheatsheet-empty-cell">No matching tmux commands or variables found.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered
            .map(
                (item) => `
                <tr>
                    <td><span class="cheatsheet-cat-tag">${item.category}</span></td>
                    <td><code>${item.cmd
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")}</code></td>
                    <td>${item.desc}</td>
                </tr>
            `
            )
            .join("");
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
        const isFoundationsTrack = kata.track === "foundations";
        const whiteBeltIndex = this.katas.findIndex((k) => k.id === "kata-1-white-belt");

        // Build Track Switcher + Kata Navigation Tabs
        let fCount = 0;
        let kCount = 0;
        const navTabsHtml = this.katas
            .map((k, idx) => {
                const isCurrent = idx === this.currentKataIndex;
                const isDone = this.isKataComplete(k);
                const shortLabel = k.track === "foundations" ? `F${++fCount}` : `K${++kCount}`;
                return `
                    <button
                        type="button"
                        class="kata-nav-tab ${isCurrent ? "active" : ""} ${isDone ? "completed" : ""}"
                        data-kata-index="${idx}"
                        title="${k.number}: ${k.title} (${k.belt})"
                    >
                        <span class="tab-index">${shortLabel}</span>
                        <span class="tab-belt-dot belt-dot-${k.beltColor}"></span>
                        ${isDone ? '<span class="tab-check">✓</span>' : ""}
                    </button>
                `;
            })
            .join("");

        const trackBarHtml = `
            <div class="track-filter-bar">
                <div class="track-toggle-pills">
                    <button type="button" id="track-btn-foundations" class="track-toggle-btn ${isFoundationsTrack ? "active" : ""}">
                        🌱 UNIX Foundations (F1–F4)
                    </button>
                    <button type="button" id="track-btn-tmux" class="track-toggle-btn ${!isFoundationsTrack ? "active" : ""}">
                        🥋 Tmux Curriculum (K1–K7)
                    </button>
                </div>
                ${
                    isFoundationsTrack && whiteBeltIndex !== -1
                        ? `<button type="button" id="skip-to-whitebelt-btn" class="skip-foundations-btn" title="Jump directly to Adult White Belt (Kata 01)">Skip to White Belt (tmux) →</button>`
                        : ""
                }
            </div>
        `;

        // Build Task Checklist
        let tasksSectionHtml = "";
        if (kata.tasks && kata.tasks.length > 0) {
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
            const isGrandmasterKata = kata.beltColor === "red";

            let completionBannerHtml = "";
            if (kataDone) {
                if (isGrandmasterKata) {
                    completionBannerHtml = `
                        <div class="certificate-of-mastery-banner" id="certificate-of-mastery-banner">
                            <div class="certificate-crest">🟥</div>
                            <div class="certificate-body">
                                <div class="certificate-headline">🟥 RED BELT GRANDMASTER — TMUX DOJO COMPLETED</div>
                                <div class="certificate-sub">
                                    All 7 BJJ Belts mastered • Total Tasks Completed: <strong>${progress.done}/${progress.total}</strong> (${progress.total}/${progress.total})
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    completionBannerHtml = `
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
                    `;
                }
            }

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
            ${trackBarHtml}
            <nav class="kata-switcher" aria-label="Kata Selection">
                <div class="kata-tabs-group">
                    ${navTabsHtml}
                </div>
                <span class="overall-progress-label">${progress.done}/${progress.total} Tasks</span>
            </nav>

            ${this._buildBjjBeltHtml(kata, false)}

            <div class="kata-meta">
                <span class="kata-number">${kata.number} • ${kata.belt.toUpperCase()}</span>
                <span class="kata-status-pill ${kataDone ? "pill-complete" : ""}">
                    ${kataDone ? "Belt Completed ✓" : "In Training"}
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

        this._renderCheatSheetRows();
        this._bindRenderedEvents();
    }

    _bindRenderedEvents() {
        // Track switcher & quick-jump buttons
        const foundBtn = document.getElementById("track-btn-foundations");
        if (foundBtn) {
            foundBtn.addEventListener("click", () => {
                const firstFoundIdx = this.katas.findIndex((k) => k.track === "foundations");
                if (firstFoundIdx !== -1) {
                    this.selectKata(firstFoundIdx);
                }
            });
        }

        const tmuxTrackBtn = document.getElementById("track-btn-tmux");
        if (tmuxTrackBtn) {
            tmuxTrackBtn.addEventListener("click", () => {
                const whiteBeltIdx = this.katas.findIndex((k) => k.id === "kata-1-white-belt");
                if (whiteBeltIdx !== -1) {
                    this.selectKata(whiteBeltIdx);
                }
            });
        }

        const skipBtn = document.getElementById("skip-to-whitebelt-btn");
        if (skipBtn) {
            skipBtn.addEventListener("click", () => {
                const whiteBeltIdx = this.katas.findIndex((k) => k.id === "kata-1-white-belt");
                if (whiteBeltIdx !== -1) {
                    this.selectKata(whiteBeltIdx);
                }
            });
        }

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

        // Kata 7 (Red Belt): Grandmaster's Vault preset buttons
        this.kataContent.querySelectorAll(".theme-preset-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const themeKey = btn.getAttribute("data-theme-key");
                if (themeKey) {
                    this.applyThemePreset(themeKey);
                }
            });
        });

        // Interactive Master Cheat Sheet search & category filter pills
        const searchInput = document.getElementById("cheatsheet-search-input");
        if (searchInput) {
            searchInput.value = this.cheatSheetQuery;
            searchInput.addEventListener("input", (e) => {
                this.cheatSheetQuery = e.target.value;
                this._renderCheatSheetRows();
            });
        }

        this.kataContent.querySelectorAll(".cheatsheet-pill").forEach((pill) => {
            const cat = pill.getAttribute("data-category");
            pill.classList.toggle("active", cat === this.cheatSheetCategory);
            pill.addEventListener("click", () => {
                this.cheatSheetCategory = cat || "All";
                this.kataContent.querySelectorAll(".cheatsheet-pill").forEach((p) => {
                    p.classList.toggle("active", p.getAttribute("data-category") === this.cheatSheetCategory);
                });
                this._renderCheatSheetRows();
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
