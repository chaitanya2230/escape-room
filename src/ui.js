/**
 * Escape The Rooms - UI Management System
 * Handles HUD updates, Main Menu, Level Intro, Level Select (Chambers), 
 * Pause, Level Complete, Game Over, Settings, Credits, and Touch Controls.
 */

class UIManager {
    constructor(game) {
        this.game = game;
        this.selectedIntroLevel = 0;

        // UI DOM Elements
        this.dom = {
            screenMainMenu: document.getElementById('screen-main-menu'),
            screenLevelIntro: document.getElementById('screen-level-intro'),
            screenLevelSelect: document.getElementById('screen-level-select'),
            screenGameHud: document.getElementById('game-hud'),
            modalPause: document.getElementById('modal-pause'),
            modalLevelComplete: document.getElementById('modal-level-complete'),
            modalGameOver: document.getElementById('modal-game-over'),
            modalSettings: document.getElementById('modal-settings'),
            modalCredits: document.getElementById('modal-credits'),
            modalGameVictory: document.getElementById('modal-game-victory'),

            // Level Intro Elements
            introRoomNum: document.getElementById('intro-room-num'),
            introRoomTitle: document.getElementById('intro-room-title'),
            introRoomSubtitle: document.getElementById('intro-room-subtitle'),
            btnStartRoom: document.getElementById('btn-start-room'),

            // HUD
            hudHearts: document.getElementById('hud-hearts'),
            hudRoomLabel: document.getElementById('hud-room-label'),
            hudCenterRoom: document.getElementById('hud-center-room'),
            hudKeys: document.getElementById('hud-keys'),
            hudTimer: document.getElementById('hud-timer'),
            btnPause: document.getElementById('btn-pause'),
            btnAudioToggle: document.getElementById('btn-audio-toggle'),

            // Collapsible Objectives Drawer
            hudObjectivesDrawer: document.getElementById('hud-objectives-drawer'),
            btnToggleObjectives: document.getElementById('btn-toggle-objectives'),
            hudObjSummary: document.getElementById('hud-obj-summary'),
            hudObjIcon: document.getElementById('hud-obj-icon'),
            hudObjectivesPanel: document.getElementById('hud-objectives-panel'),
            hudObjectivesList: document.getElementById('hud-objectives-list'),

            // Level Complete
            lcStars: document.getElementById('lc-stars'),
            lcTime: document.getElementById('lc-time'),
            lcDeaths: document.getElementById('lc-deaths'),
            lcKeys: document.getElementById('lc-keys'),
            lcRoom: document.getElementById('lc-room'),
            btnNextLevel: document.getElementById('btn-next-level'),

            // Level Failed / Game Over
            goTime: document.getElementById('go-time'),
            goObjectives: document.getElementById('go-objectives'),

            // Grand Final Level 10 Celebration
            modalFinalCelebration: document.getElementById('modal-final-celebration'),
            fcTotalTime: document.getElementById('fc-total-time'),
            fcTotalDeaths: document.getElementById('fc-total-deaths'),
            fcTotalObjectives: document.getElementById('fc-total-objectives'),
            btnFinalPlayAgain: document.getElementById('btn-final-play-again'),
            btnFinalLevelSelect: document.getElementById('btn-final-level-select'),
            btnFinalMainMenu: document.getElementById('btn-final-main-menu'),

            // Level Select Cards Container
            levelCardsContainer: document.getElementById('level-cards-container'),

            // Touch Controls
            touchControls: document.getElementById('touch-controls'),
            btnTouchUp: document.getElementById('touch-up'),
            btnTouchDown: document.getElementById('touch-down'),
            btnTouchLeft: document.getElementById('touch-left'),
            btnTouchRight: document.getElementById('touch-right'),
            btnTouchSprint: document.getElementById('touch-sprint'),
            btnTouchInteract: document.getElementById('touch-interact')
        };

        this.autoRestartTimer = null;
        this.initEventListeners();
        this.initTouchControls();
    }

    initEventListeners() {
        // Main Menu
        document.getElementById('btn-play')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.game.startNewGame(); // Always starts from Level 1
        });

        document.getElementById('btn-levels')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.showLevelSelect();
        });

        document.getElementById('btn-settings')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.showSettings();
        });

        document.getElementById('btn-credits')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.showCredits();
        });

        // Level Intro Start Button
        this.dom.btnStartRoom?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.dom.screenMainMenu?.classList.add('hidden');
            this.dom.screenLevelSelect?.classList.add('hidden');
            this.dom.screenLevelIntro?.classList.add('hidden');
            this.game.startLevel(this.selectedIntroLevel !== undefined ? this.selectedIntroLevel : 0);
        });

        // Level Select Back
        document.getElementById('btn-level-select-back')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.showMainMenu();
        });

        // HUD Pause & Audio
        this.dom.btnPause?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.game.togglePause();
        });

        this.dom.btnAudioToggle?.addEventListener('click', () => {
            if (window.gameAudio) {
                const muted = window.gameAudio.toggleMute();
                this.updateAudioButtonState(muted);
            }
        });

        // Pause Menu Buttons
        document.getElementById('btn-resume')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.game.togglePause();
        });

        document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.game.restartCurrentLevel();
        });

        document.getElementById('btn-pause-level-select')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.showLevelSelect();
        });

        document.getElementById('btn-pause-main-menu')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.showMainMenu();
        });

        // Level Complete Buttons
        this.dom.btnNextLevel?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.game.nextLevel();
        });

        document.getElementById('btn-lc-replay')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.game.restartCurrentLevel();
        });

        document.getElementById('btn-lc-level-select')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.showLevelSelect();
        });

        // Game Over Buttons
        document.getElementById('btn-go-retry')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.game.restartCurrentLevel();
        });

        document.getElementById('btn-go-level-select')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.showLevelSelect();
        });

        document.getElementById('btn-go-main-menu')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.showMainMenu();
        });

        // Victory Modal Buttons
        document.getElementById('btn-victory-replay')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.showLevelIntro(0);
        });

        document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.showMainMenu();
        });

        // Collapsible Objectives Drawer Toggle
        this.dom.btnToggleObjectives?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.dom.hudObjectivesPanel?.classList.toggle('hidden');
            const isHidden = this.dom.hudObjectivesPanel?.classList.contains('hidden');
            if (this.dom.hudObjIcon) {
                this.dom.hudObjIcon.textContent = isHidden ? '▾' : '▴';
            }
        });

        // Final Celebration Buttons
        this.dom.btnFinalPlayAgain?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.game.startLevel(0);
        });

        this.dom.btnFinalLevelSelect?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.showLevelSelect();
        });

        this.dom.btnFinalMainMenu?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.hideAllModals();
            this.showMainMenu();
        });

        // Settings Modal
        document.getElementById('btn-close-settings')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.dom.modalSettings?.classList.add('hidden');
        });

        const chkShake = document.getElementById('chk-shake');
        if (chkShake) {
            chkShake.checked = this.game.levelManager.camera.shakeEnabled;
            chkShake.addEventListener('change', (e) => {
                this.game.levelManager.camera.shakeEnabled = e.target.checked;
                try { localStorage.setItem('etr_camera_shake', e.target.checked); } catch (err) {}
            });
        }

        const chkSfx = document.getElementById('chk-sfx');
        if (chkSfx) {
            chkSfx.checked = !window.gameAudio.isMuted;
            chkSfx.addEventListener('change', (e) => {
                window.gameAudio.setMuted(!e.target.checked);
                this.updateAudioButtonState(window.gameAudio.isMuted);
            });
        }

        const chkMusic = document.getElementById('chk-music');
        if (chkMusic) {
            chkMusic.checked = window.gameAudio.musicEnabled;
            chkMusic.addEventListener('change', (e) => {
                window.gameAudio.setMusicEnabled(e.target.checked);
            });
        }

        document.getElementById('btn-reset-save')?.addEventListener('click', () => {
            if (confirm("Reset all game progress and start from Room 01?")) {
                localStorage.removeItem('etr_unlocked_level');
                localStorage.removeItem('etr_level_stars');
                alert("Progress reset!");
                this.renderLevelSelectCards();
            }
        });

        // Credits Modal
        document.getElementById('btn-close-credits')?.addEventListener('click', () => {
            if (window.gameAudio) window.gameAudio.playUiClick();
            this.dom.modalCredits?.classList.add('hidden');
        });
    }

    initTouchControls() {
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth < 850;
        if (isTouch && this.dom.touchControls) {
            this.dom.touchControls.classList.remove('hidden');
        }

        const bindBtn = (btn, keyProp) => {
            if (!btn) return;
            const activate = (e) => {
                e.preventDefault();
                this.game.input[keyProp] = true;
            };
            const deactivate = (e) => {
                e.preventDefault();
                this.game.input[keyProp] = false;
            };
            btn.addEventListener('touchstart', activate, { passive: false });
            btn.addEventListener('touchend', deactivate, { passive: false });
            btn.addEventListener('mousedown', activate);
            btn.addEventListener('mouseup', deactivate);
            btn.addEventListener('mouseleave', deactivate);
        };

        bindBtn(this.dom.btnTouchUp, 'up');
        bindBtn(this.dom.btnTouchDown, 'down');
        bindBtn(this.dom.btnTouchLeft, 'left');
        bindBtn(this.dom.btnTouchRight, 'right');
        bindBtn(this.dom.btnTouchSprint, 'sprint');
        bindBtn(this.dom.btnTouchInteract, 'interact');
    }

    updateAudioButtonState(isMuted) {
        if (this.dom.btnAudioToggle) {
            this.dom.btnAudioToggle.textContent = isMuted ? '🔇' : '🔊';
        }
    }

    hideAllModals() {
        if (this.autoRestartTimer) {
            clearTimeout(this.autoRestartTimer);
            this.autoRestartTimer = null;
        }
        this.dom.modalPause?.classList.add('hidden');
        this.dom.modalLevelComplete?.classList.add('hidden');
        this.dom.modalGameOver?.classList.add('hidden');
        this.dom.modalSettings?.classList.add('hidden');
        this.dom.modalCredits?.classList.add('hidden');
        this.dom.modalGameVictory?.classList.add('hidden');
        this.dom.modalFinalCelebration?.classList.add('hidden');
    }

    showMainMenu() {
        this.hideAllModals();
        this.dom.screenMainMenu?.classList.remove('hidden');
        this.dom.screenLevelIntro?.classList.add('hidden');
        this.dom.screenLevelSelect?.classList.add('hidden');
        this.dom.screenGameHud?.classList.add('hidden');
        this.game.state = 'MAIN_MENU';
    }

    showLevelIntro(levelIndex) {
        this.hideAllModals();
        this.selectedIntroLevel = levelIndex;
        const lvl = window.LEVELS_DATA[levelIndex];

        if (this.dom.introRoomNum) {
            const numStr = `0${lvl.id}`.slice(-2);
            this.dom.introRoomNum.textContent = `ROOM ${numStr}`;
        }
        if (this.dom.introRoomTitle) {
            this.dom.introRoomTitle.textContent = lvl.title;
        }
        if (this.dom.introRoomSubtitle) {
            this.dom.introRoomSubtitle.textContent = `"${lvl.subtitle}"`;
        }
        if (this.dom.btnStartRoom) {
            this.dom.btnStartRoom.textContent = lvl.id === 1 ? '[ START ROOM ]' : '[ ENTER ROOM ]';
        }

        this.dom.screenMainMenu?.classList.add('hidden');
        this.dom.screenLevelSelect?.classList.add('hidden');
        this.dom.screenGameHud?.classList.add('hidden');
        this.dom.screenLevelIntro?.classList.remove('hidden');
    }

    showLevelSelect() {
        this.hideAllModals();
        this.dom.screenMainMenu?.classList.add('hidden');
        this.dom.screenLevelIntro?.classList.add('hidden');
        this.dom.screenLevelSelect?.classList.remove('hidden');
        this.dom.screenGameHud?.classList.add('hidden');
        this.renderLevelSelectCards();
        this.game.state = 'LEVEL_SELECT';
    }

    showGameHud() {
        this.hideAllModals();
        this.dom.screenMainMenu?.classList.add('hidden');
        this.dom.screenLevelIntro?.classList.add('hidden');
        this.dom.screenLevelSelect?.classList.add('hidden');
        this.dom.screenGameHud?.classList.remove('hidden');
    }

    showPause() {
        this.dom.modalPause?.classList.remove('hidden');
    }

    hidePause() {
        this.dom.modalPause?.classList.add('hidden');
    }

    showSettings() {
        this.dom.modalSettings?.classList.remove('hidden');
    }

    showCredits() {
        this.dom.modalCredits?.classList.remove('hidden');
    }

    showGameOver(levelNumber, timeElapsed, objectivesStats) {
        this.hideAllModals();
        if (this.dom.modalGameOver) {
            if (this.dom.goTime) {
                this.dom.goTime.textContent = this.formatTime(timeElapsed);
            }
            if (this.dom.goObjectives) {
                this.dom.goObjectives.textContent = objectivesStats ? objectivesStats.summary : '0/0';
            }
            this.dom.modalGameOver.classList.remove('hidden');

            // Automatic restart after short delay if player does not choose an action
            this.autoRestartTimer = setTimeout(() => {
                if (this.game.state === 'GAME_OVER') {
                    this.hideAllModals();
                    this.game.restartCurrentLevel();
                }
            }, 3200);
        }
    }

    showLevelComplete(levelNumber, timeElapsed, deaths, keysCollected, totalKeys, stars) {
        this.hideAllModals();
        if (this.dom.modalLevelComplete) {
            let starStr = '';
            for (let i = 1; i <= 3; i++) {
                starStr += i <= stars ? '⭐' : '☆';
            }
            this.dom.lcStars.textContent = starStr;
            this.dom.lcTime.textContent = this.formatTime(timeElapsed);
            this.dom.lcDeaths.textContent = deaths.toString();
            this.dom.lcKeys.textContent = `${keysCollected}/${totalKeys}`;
            this.dom.lcRoom.textContent = `ROOM 0${levelNumber}`;

            if (levelNumber === 10) {
                this.dom.btnNextLevel.textContent = '🏆 VIEW CELEBRATION';
            } else {
                this.dom.btnNextLevel.textContent = 'NEXT ROOM →';
            }

            this.dom.modalLevelComplete.classList.remove('hidden');
        }
    }

    showFinalCelebration(totalTime, totalDeaths) {
        this.hideAllModals();
        if (this.dom.modalFinalCelebration) {
            if (this.dom.fcTotalTime) {
                this.dom.fcTotalTime.textContent = this.formatTime(totalTime);
            }
            if (this.dom.fcTotalDeaths) {
                this.dom.fcTotalDeaths.textContent = totalDeaths.toString();
            }
            if (this.dom.fcTotalObjectives) {
                this.dom.fcTotalObjectives.textContent = '100%';
            }
            this.dom.modalFinalCelebration.classList.remove('hidden');
        }

        if (window.gameAudio) {
            window.gameAudio.playFinalVictoryFanfare();
        }
    }

    showGameVictory(totalTime, totalDeaths) {
        this.showFinalCelebration(totalTime, totalDeaths);
    }

    updateObjectivesUI(objectivesManager) {
        if (!objectivesManager) return;
        const stats = objectivesManager.getStats();
        if (this.dom.hudObjSummary) {
            this.dom.hudObjSummary.textContent = `OBJECTIVES ${stats.summary}`;
        }
        if (this.dom.hudObjectivesList) {
            const list = objectivesManager.getList();
            this.dom.hudObjectivesList.innerHTML = list.map(obj => {
                const icon = obj.completed ? '✓' : '○';
                const cls = obj.completed ? 'obj-done' : (obj.isCurrent ? 'obj-current' : '');
                return `<div class="objective-item ${cls}"><span class="obj-icon">${icon}</span><span>${obj.text}</span></div>`;
            }).join('');
        }
    }

    updateHud(lives, maxLives, levelIndex, totalLevels, keysCollected, totalKeys, timeElapsed) {
        // Minimal Hearts: ♥ ♥ ♥
        if (this.dom.hudHearts) {
            let heartsStr = '';
            for (let i = 0; i < maxLives; i++) {
                heartsStr += i < lives ? '♥ ' : '♡ ';
            }
            this.dom.hudHearts.innerHTML = heartsStr.trim();
        }

        // Room Label: ROOM 01
        const roomNumStr = `0${levelIndex + 1}`.slice(-2);
        if (this.dom.hudRoomLabel) {
            this.dom.hudRoomLabel.textContent = `ROOM ${roomNumStr}`;
        }

        // Center Room: 01 / 10
        const totalRoomsStr = `0${totalLevels}`.slice(-2);
        if (this.dom.hudCenterRoom) {
            this.dom.hudCenterRoom.textContent = `${roomNumStr} / ${totalRoomsStr}`;
        }

        // Keys: 🔑 0/1 -> 🔑 1/1 (with brief glow animation on pickup)
        if (this.dom.hudKeys) {
            const keyText = `🔑 ${keysCollected}/${totalKeys}`;
            if (this.dom.hudKeys.textContent !== keyText) {
                const wasInitial = !this.dom.hudKeys.textContent;
                this.dom.hudKeys.textContent = keyText;
                if (!wasInitial && keysCollected > 0) {
                    this.dom.hudKeys.classList.remove('hud-pulse-glow');
                    void this.dom.hudKeys.offsetWidth; // trigger reflow
                    this.dom.hudKeys.classList.add('hud-pulse-glow');
                }
            }
        }

        // Timer: 02:31
        if (this.dom.hudTimer) {
            this.dom.hudTimer.textContent = `⏱ ${this.formatTime(timeElapsed)}`;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    renderLevelSelectCards() {
        if (!this.dom.levelCardsContainer) return;
        this.dom.levelCardsContainer.innerHTML = '';

        const unlockedLevel = this.game.getUnlockedLevel();
        const savedStars = this.game.getLevelStars();

        window.LEVELS_DATA.forEach((lvl, idx) => {
            const isCompleted = idx < unlockedLevel;
            const isCurrent = idx === unlockedLevel;
            const stars = savedStars[idx] || 0;

            const card = document.createElement('div');
            card.className = `chamber-card unlocked ${isCurrent ? 'current-chamber' : ''}`;

            let starsDisplay = '';
            if (stars > 0) {
                for (let s = 1; s <= 3; s++) {
                    starsDisplay += s <= stars ? '⭐' : '☆';
                }
            } else {
                starsDisplay = '☆☆☆';
            }

            const chamberNumStr = `0${lvl.id}`.slice(-2);

            card.innerHTML = `
                <div class="chamber-card-header">
                    <span class="chamber-number">${chamberNumStr}</span>
                    <span class="chamber-status">${isCompleted ? '✓ CLEARED' : (isCurrent ? '▶ CURRENT' : 'ENTER')}</span>
                </div>
                <div class="chamber-card-title">${lvl.title}</div>
                <div class="chamber-card-subtitle">${lvl.difficulty || ''}</div>
                <div class="chamber-card-stars">${starsDisplay}</div>
            `;

            // Clicking any room immediately opens and starts that room!
            card.addEventListener('click', () => {
                if (window.gameAudio) window.gameAudio.playUiClick();
                this.hideAllModals();
                this.dom.screenMainMenu?.classList.add('hidden');
                this.dom.screenLevelSelect?.classList.add('hidden');
                this.dom.screenLevelIntro?.classList.add('hidden');
                this.game.startLevel(idx);
            });

            this.dom.levelCardsContainer.appendChild(card);
        });
    }
}

window.UIManager = UIManager;
