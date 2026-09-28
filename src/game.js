/**
 * Escape The Rooms - Main Game Engine
 * Orchestrates Game Loop, Input Processing, State Management, and Screen Shake.
 */

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Target Dimensions
        this.width = 864; // 18 cols * 48px
        this.height = 576; // 12 rows * 48px
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Game State
        this.state = 'MAIN_MENU'; // 'MAIN_MENU', 'LEVEL_SELECT', 'PLAYING', 'PAUSED', 'LEVEL_COMPLETE', 'GAME_OVER', 'VICTORY'
        this.currentLevelIndex = 0;
        this.lastTime = 0;
        this.screenShakeTime = 0;

        // Input
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false,
            sprint: false,
            interact: false
        };

        // Subsystems
        this.player = new window.Player();
        this.levelManager = new window.LevelManager();
        this.ui = new window.UIManager(this);

        this.initInputListeners();
        this.initWindowResize();
    }

    initInputListeners() {
        window.addEventListener('keydown', (e) => {
            // Audio Context Resume on first user gesture
            if (window.gameAudio) window.gameAudio.init();

            // Pause toggle
            if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                if (this.state === 'PLAYING' || this.state === 'PAUSED') {
                    this.togglePause();
                    return;
                }
            }

            // Interact Key (E)
            if (e.key === 'e' || e.key === 'E') {
                this.input.interact = true;
            }

            // Arrow & WASD Keys
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.input.up = true;
                e.preventDefault();
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.input.down = true;
                e.preventDefault();
            }
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.input.left = true;
                e.preventDefault();
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.input.right = true;
                e.preventDefault();
            }
            if (e.key === 'Shift') {
                this.input.sprint = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                this.input.interact = false;
            }
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.input.up = false;
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.input.down = false;
            }
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.input.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.input.right = false;
            }
            if (e.key === 'Shift') {
                this.input.sprint = false;
            }
        });

        // Pause when tab loses focus
        window.addEventListener('blur', () => {
            if (this.state === 'PLAYING') {
                this.togglePause();
            }
        });
    }

    initWindowResize() {
        // High-DPI crisp canvas scaling to fill viewport elegantly
        const resize = () => {
            const container = document.getElementById('canvas-container') || document.body;
            const maxWidth = container.clientWidth || window.innerWidth;
            const maxHeight = container.clientHeight || window.innerHeight;
            const aspect = this.width / this.height;

            let w = maxWidth;
            let h = maxWidth / aspect;
            if (h > maxHeight) {
                h = maxHeight;
                w = maxHeight * aspect;
            }

            this.canvas.style.width = `${Math.floor(w)}px`;
            this.canvas.style.height = `${Math.floor(h)}px`;
        };

        window.addEventListener('resize', resize);
        setTimeout(resize, 50);
    }

    // Persistence
    getUnlockedLevel() {
        try {
            const saved = localStorage.getItem('etr_unlocked_level');
            return saved !== null ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }

    saveUnlockedLevel(levelIndex) {
        try {
            const current = this.getUnlockedLevel();
            if (levelIndex > current) {
                localStorage.setItem('etr_unlocked_level', levelIndex.toString());
            }
        } catch (e) {}
    }

    getLevelStars() {
        try {
            const saved = localStorage.getItem('etr_level_stars');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    saveLevelStars(levelIndex, stars) {
        try {
            const allStars = this.getLevelStars();
            const prev = allStars[levelIndex] || 0;
            if (stars > prev) {
                allStars[levelIndex] = stars;
                localStorage.setItem('etr_level_stars', JSON.stringify(allStars));
            }
        } catch (e) {}
    }

    // Level Management
    startNewGame() {
        // START GAME always begins from Level 1 (index 0) — never from saved progress
        this.ui.showLevelIntro(0);
    }

    startFromLatest() {
        const latest = Math.min(this.getUnlockedLevel(), window.LEVELS_DATA.length - 1);
        this.ui.showLevelIntro(latest);
    }

    selectLevel(index) {
        this.ui.showLevelIntro(index);
    }

    startLevel(index) {
        this.currentLevelIndex = index;
        this.player.lives = 3;
        this.player.isDead = false;
        this.player.invulnerableTimer = 0;
        this.levelManager.loadLevel(index, this.player);
        this.ui.showGameHud();
        this.state = 'PLAYING';
        this.screenShakeTime = 0;
        if (window.gameAudio && window.gameAudio.musicEnabled) {
            window.gameAudio.startMusic();
        }
    }

    restartCurrentLevel() {
        this.startLevel(this.currentLevelIndex);
    }

    nextLevel() {
        if (this.currentLevelIndex + 1 < window.LEVELS_DATA.length) {
            this.ui.showLevelIntro(this.currentLevelIndex + 1);
        } else {
            // All levels finished - Victory!
            this.state = 'VICTORY';
            this.ui.showGameVictory(this.levelManager.timeElapsed, this.levelManager.deaths);
            if (window.gameAudio) window.gameAudio.playLevelComplete();
        }
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.ui.showPause();
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.ui.hidePause();
        }
    }

    triggerScreenShake(duration = 0.3) {
        this.screenShakeTime = duration;
    }

    // Main Game Loop
    start() {
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(currentTime) {
        let dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap dt to prevent huge jumps
        if (dt > 0.1) dt = 0.1;

        this.update(dt);
        this.render();

        requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {
        if (this.state === 'PLAYING') {
            if (this.screenShakeTime > 0) {
                this.screenShakeTime -= dt;
            }

            // Update player
            this.player.update(dt, this.input, this.levelManager, this.levelManager.crates, this.levelManager.particles);

            // Update level with input for interaction triggers
            const status = this.levelManager.update(dt, this.player, this.input);

            if (status === 'game_over') {
                this.state = 'GAME_OVER';
                this.triggerScreenShake(0.5);
                this.ui.showGameOver(
                    this.currentLevelIndex + 1,
                    this.levelManager.timeElapsed,
                    this.levelManager.objectivesManager ? this.levelManager.objectivesManager.getStats() : null
                );
                return;
            }

            if (status === 'level_complete') {
                // If Level 10 was cleared: Grand Final Celebration!
                if (this.currentLevelIndex === 9) {
                    this.state = 'FINAL_CELEBRATION';
                    this.saveUnlockedLevel(10);
                    this.saveLevelStars(9, 3);
                    this.ui.showFinalCelebration(this.levelManager.timeElapsed, this.levelManager.deaths);
                    return;
                }

                this.state = 'LEVEL_COMPLETE';
                if (window.gameAudio) window.gameAudio.playLevelComplete();

                // Calculate Star Rating
                const lvlData = this.levelManager.currentLevelData;
                let stars = 1;
                const time = this.levelManager.timeElapsed;
                const deaths = this.levelManager.deaths;

                if (time <= lvlData.starTimes.three && deaths === 0) {
                    stars = 3;
                } else if (time <= lvlData.starTimes.two && deaths <= 1) {
                    stars = 2;
                }

                // Unlock next level & save stars
                this.saveUnlockedLevel(this.currentLevelIndex + 1);
                this.saveLevelStars(this.currentLevelIndex, stars);

                this.ui.showLevelComplete(
                    this.currentLevelIndex + 1,
                    time,
                    deaths,
                    this.levelManager.keysCollected,
                    this.levelManager.totalKeys,
                    stars
                );
                return;
            }

            // Sync Objectives UI
            if (this.levelManager.objectivesManager) {
                this.ui.updateObjectivesUI(this.levelManager.objectivesManager);
            }

            // Sync HUD
            this.ui.updateHud(
                this.player.lives,
                this.player.maxLives,
                this.currentLevelIndex,
                window.LEVELS_DATA.length,
                this.levelManager.keysCollected,
                this.levelManager.totalKeys,
                this.levelManager.timeElapsed
            );
        }
    }

    render() {
        this.ctx.save();

        // Screen shake
        if (this.screenShakeTime > 0) {
            const shake = (this.screenShakeTime / 0.3) * 6;
            const offsetX = (Math.random() - 0.5) * shake;
            const offsetY = (Math.random() - 0.5) * shake;
            this.ctx.translate(offsetX, offsetY);
        }

        // Clear screen with deep dungeon black
        this.ctx.fillStyle = '#0f1115';
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'LEVEL_COMPLETE' || this.state === 'GAME_OVER') {
            // Draw Level & Entities & Player
            this.levelManager.draw(this.ctx, this.player);

            // Ambient Vignette & Darkness
            this.drawAmbientLighting();
        }

        this.ctx.restore();
    }

    drawAmbientLighting() {
        // Dramatic dungeon shadow edges
        const grad = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.width * 0.35,
            this.width / 2, this.height / 2, this.width * 0.7
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.7, 'rgba(10, 12, 16, 0.45)');
        grad.addColorStop(1, 'rgba(5, 6, 8, 0.85)');

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}

window.GameEngine = GameEngine;
