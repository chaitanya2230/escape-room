/**
 * Escape The Rooms - Level Manager
 * Manages loading, updating, collision checking, and rendering of handcrafted 18x12 stone rooms.
 * Canvas: 864px x 576px (18 columns x 12 rows, 48px tile size).
 */

class LevelManager {
    constructor() {
        this.currentLevelData = null;
        this.currentLevelIndex = 0;

        // Collision Grid
        this.map = [];
        this.gridWidth = 18;
        this.gridHeight = 12;
        this.tileSize = window.TILE_SIZE || 48;

        // Entities
        this.keys = [];
        this.exitDoor = null;
        this.crates = [];
        this.spikes = [];
        this.pressurePlates = [];
        this.rotatingMaces = [];
        this.lavaPits = [];
        this.puzzlePedestals = [];
        this.puzzleSequence = [];
        this.puzzleCurrentIndex = 0;
        this.puzzleSolved = false;
        this.enemies = [];
        this.lasers = [];
        this.checkpoints = [];
        this.torches = [];

        // Progress
        this.keysCollected = 0;
        this.totalKeys = 0;
        this.timeElapsed = 0;
        this.deaths = 0;
        this.checkpointReached = null;

        // Camera shim (fixed viewport for 18x12 rooms)
        this.camera = {
            x: 0,
            y: 0,
            shakeEnabled: true,
            triggerShake: () => {}
        };

        // Visual effects
        this.torchTime = 0;
        this.particles = new ParticleSystem();

        // Interactive HUD / Contextual Prompts / Toast / Flying Keys
        this.activePrompt = null;
        this.toast = null;
        this.flyingKeys = [];

        // Objectives Provider
        this.objectivesManager = {
            getStats: () => ({
                summary: `${this.keysCollected}/${Math.max(1, this.totalKeys)}`
            }),
            getList: () => {
                const list = [];
                if (this.totalKeys > 0) {
                    list.push({
                        text: `Collect Keys (${this.keysCollected}/${this.totalKeys})`,
                        completed: this.keysCollected >= this.totalKeys,
                        isCurrent: this.keysCollected < this.totalKeys
                    });
                }
                if (this.puzzlePedestals.length > 0) {
                    list.push({
                        text: `Solve Rune Sequence`,
                        completed: this.puzzleSolved,
                        isCurrent: !this.puzzleSolved
                    });
                }
                list.push({
                    text: `Escape Through Heavy Door`,
                    completed: this.exitDoor ? this.exitDoor.isOpen : false,
                    isCurrent: this.exitDoor ? this.exitDoor.isOpen : false
                });
                return list;
            },
            completeObjective: () => {}
        };
    }

    loadLevel(levelIndex, player) {
        if (levelIndex < 0 || levelIndex >= window.LEVELS_DATA.length) {
            console.error('Invalid level index:', levelIndex);
            return;
        }

        this.currentLevelIndex = levelIndex;
        const data = window.LEVELS_DATA[levelIndex];
        this.currentLevelData = data;

        this.gridWidth = data.gridWidth;
        this.gridHeight = data.gridHeight;
        this.map = data.map.map(row => [...row]);

        // Reset progress & state
        this.timeElapsed = 0;
        this.deaths = 0;
        this.keysCollected = 0;
        this.checkpointReached = null;
        this.particles.clear();
        this.activePrompt = null;
        this.toast = null;
        this.flyingKeys = [];

        // 1. Initialize Player Start
        player.startX = data.playerStart.x;
        player.startY = data.playerStart.y;
        player.resetToStart();

        // 2. Initialize Exit Door
        const ex = data.exit;
        this.exitDoor = new window.GameObstacles.ExitDoor(ex.x, ex.y, ex.w, ex.h, ex.requiredKeys);
        if (this.exitDoor.requiredKeys === 0) {
            this.exitDoor.canOpen = true;
        }

        // 3. Initialize Keys
        this.keys = (data.keys || []).map(k => new window.GameObstacles.KeyItem(k.x, k.y, k.id));
        this.totalKeys = this.keys.length;

        // 4. Initialize Crates
        this.crates = (data.crates || []).map(c => new window.GameObstacles.Crate(c.x, c.y, this.tileSize));

        // 5. Initialize Spikes
        this.spikes = (data.spikes || []).map(s => 
            new window.GameObstacles.SpikeTrap(s.x, s.y, this.tileSize, s.cycleOffset, s.cycleTime)
        );

        // 6. Initialize Lasers
        this.lasers = (data.lasers || []).map(l => 
            new window.GameObstacles.LaserTrap(l.x1, l.y1, l.x2, l.y2, l.isActive)
        );

        // 7. Initialize Pressure Plates
        this.pressurePlates = (data.pressurePlates || []).map(p => {
            return new window.GameObstacles.PressurePlate(p.x, p.y, p.id, 40, () => {
                if (p.disarmsSpikes) {
                    p.disarmsSpikes.forEach(spikeIdx => {
                        if (this.spikes[spikeIdx]) this.spikes[spikeIdx].disable();
                    });
                }
                if (p.togglesLaser !== undefined) {
                    if (this.lasers[p.togglesLaser]) {
                        this.lasers[p.togglesLaser].isActive = false;
                    }
                }
            });
        });

        // 8. Initialize Rotating Maces
        this.rotatingMaces = (data.rotatingMaces || []).map(m => 
            new window.GameObstacles.RotatingMace(m.cx, m.cy, m.armLength, m.arms, m.speed)
        );

        // 9. Initialize Lava
        this.lavaPits = (data.lavaPits || []).map(l => 
            new window.GameObstacles.LavaPit(l.x, l.y, l.w, l.h)
        );

        // 10. Initialize Puzzle
        this.puzzlePedestals = [];
        this.puzzleSequence = [];
        this.puzzleCurrentIndex = 0;
        this.puzzleSolved = false;

        if (data.puzzle) {
            this.puzzleSequence = data.puzzle.targetSequence;
            this.puzzlePedestals = data.puzzle.pedestals.map(p => 
                new window.GameObstacles.PuzzlePedestal(p.x, p.y, p.index, p.symbol, p.color)
            );
        }

        // 11. Initialize Enemies
        this.enemies = (data.enemies || []).map(e => 
            new window.GameObstacles.EnemySentinel(e.x, e.y, e.waypoints, e.visionRange, e.fov)
        );

        // 12. Checkpoints & Torches
        this.checkpoints = data.checkpoints || [];
        this.torches = data.torches || [];
    }

    isBlocked(px, py) {
        // If inside open exit door doorway, allow player to enter the portal!
        if (this.exitDoor && this.exitDoor.isOpen) {
            if (px >= this.exitDoor.x - 4 && px <= this.exitDoor.x + this.exitDoor.w + 4 &&
                py >= this.exitDoor.y && py <= this.exitDoor.y + this.exitDoor.h + 16) {
                return false;
            }
        }

        const col = Math.floor(px / this.tileSize);
        const row = Math.floor(py / this.tileSize);

        if (col < 0 || col >= this.gridWidth || row < 0 || row >= this.gridHeight) {
            return true;
        }

        const tile = this.map[row][col];
        // 1 = solid wall
        if (tile === 1) return true;

        // Closed exit door is also solid
        if (this.exitDoor && !this.exitDoor.isOpen) {
            if (px >= this.exitDoor.x && px <= this.exitDoor.x + this.exitDoor.w &&
                py >= this.exitDoor.y && py <= this.exitDoor.y + this.exitDoor.h) {
                return true;
            }
        }

        return false;
    }

    isWall(col, row) {
        if (col < 0 || col >= this.gridWidth || row < 0 || row >= this.gridHeight) {
            return true;
        }
        return this.map[row][col] === 1;
    }

    update(dt, player, input = {}) {
        this.timeElapsed += dt;
        this.torchTime += dt * 6;
        this.particles.update(dt);

        // Update active toast timer
        if (this.toast) {
            this.toast.timer -= dt;
            if (this.toast.timer <= 0) {
                this.toast = null;
            }
        }

        // Update flying key particles
        for (let i = this.flyingKeys.length - 1; i >= 0; i--) {
            const fk = this.flyingKeys[i];
            fk.update(dt, this.camera);
            if (fk.finished) {
                this.flyingKeys.splice(i, 1);
            }
        }

        // Reset active contextual prompt for this frame
        this.activePrompt = null;

        // 1. Update Crates
        this.crates.forEach(c => c.update(dt, this));

        // 2. Update Keys & Manual Collection with [E]
        let nearestKeyPrompt = null;
        this.keys.forEach(key => {
            key.update(dt);

            // Subtle gold particle drift around uncollected keys
            if (!key.collected && !key.isCollecting && Math.random() < 0.1) {
                this.particles.emitSparkles(key.x + (Math.random() * 12 - 6), key.y + (Math.random() * 12 - 6), '#ffd700', 1);
            }

            // Proximity interaction check
            if (key.canInteract(player)) {
                nearestKeyPrompt = {
                    text: '[E] PICK UP KEY',
                    x: key.x,
                    y: key.y - 28,
                    type: 'key'
                };

                // Player MUST press E to collect the key
                if (input.interact) {
                    input.interact = false; // consume input trigger
                    if (key.collect()) {
                        this.keysCollected++;
                        if (window.gameAudio) window.gameAudio.playKeyCollect();
                        this.particles.emitSparkles(key.x, key.y, '#ffd700', 25);

                        // Show "KEY FOUND" notification banner
                        this.showToast('KEY FOUND', 1.8, '#ffd700');

                        // Fly golden key icon towards HUD
                        this.flyingKeys.push(new window.GameObstacles.FlyingKeyParticle(key.x, key.y, 680, 30, '#ffd700'));

                        // Door becomes unlockable once required keys are obtained
                        if (this.exitDoor && this.keysCollected >= this.exitDoor.requiredKeys) {
                            this.exitDoor.canOpen = true;
                        }
                    }
                }
            }
        });

        // 3. Update Exit Door & Manual Unlock with [E]
        let doorPrompt = null;
        if (this.exitDoor) {
            this.exitDoor.update(dt);

            // If required keys are collected, ensure door is marked ready to open
            if (!this.exitDoor.isOpen && this.keysCollected >= this.exitDoor.requiredKeys) {
                this.exitDoor.canOpen = true;
            }

            // Proximity check for door interaction
            if (!this.exitDoor.isOpen && this.exitDoor.canInteract(player)) {
                if (this.exitDoor.canOpen) {
                    doorPrompt = {
                        text: '[E] OPEN DOOR',
                        x: this.exitDoor.x + this.exitDoor.w / 2,
                        y: this.exitDoor.y - 22,
                        type: 'door_open'
                    };

                    // Player MUST press E to unlock & open the door
                    if (input.interact) {
                        input.interact = false; // consume input trigger
                        if (this.exitDoor.open()) {
                            this.particles.emitSparkles(this.exitDoor.x + this.exitDoor.w / 2, this.exitDoor.y + this.exitDoor.h / 2, '#fbbf24', 35);
                            this.showToast('DOOR OPENED', 1.6, '#4ade80');
                        }
                    }
                } else {
                    const remaining = this.exitDoor.requiredKeys - this.keysCollected;
                    doorPrompt = {
                        text: '🔒 LOCKED',
                        subtext: remaining > 1 ? `Need ${remaining} Keys` : 'Need a Key',
                        x: this.exitDoor.x + this.exitDoor.w / 2,
                        y: this.exitDoor.y - 22,
                        type: 'door_locked'
                    };
                }
            }

            // LEVEL COMPLETION: Only when player actually walks into the open doorway portal!
            if (this.exitDoor.checkExit(player)) {
                return 'level_complete';
            }
        }

        // Active prompt precedence: Key prompt if near key, otherwise Door prompt
        this.activePrompt = nearestKeyPrompt || doorPrompt;

        // 4. Update Spikes & Hazard Check
        for (const spike of this.spikes) {
            spike.update(dt);
            if (spike.checkHit(player)) {
                const res = player.takeDamage();
                if (res) {
                    this.deaths++;
                    this.particles.emitBloodSparks(player.x, player.y);
                    if (res === 'game_over') return 'game_over';
                    player.resetToCheckpoint();
                }
            }
        }

        // 5. Update Lava Pits
        for (const lava of this.lavaPits) {
            lava.update(dt);
            if (lava.checkHit(player)) {
                const res = player.takeDamage();
                if (res) {
                    this.deaths++;
                    this.particles.emitBloodSparks(player.x, player.y);
                    if (res === 'game_over') return 'game_over';
                    player.resetToCheckpoint();
                }
            }
        }

        // 6. Update Rotating Maces
        for (const mace of this.rotatingMaces) {
            mace.update(dt);
            if (mace.checkHit(player)) {
                const res = player.takeDamage();
                if (res) {
                    this.deaths++;
                    this.particles.emitBloodSparks(player.x, player.y);
                    if (res === 'game_over') return 'game_over';
                    player.resetToCheckpoint();
                }
            }
        }

        // 7. Update Pressure Plates
        this.pressurePlates.forEach(plate => {
            plate.update(player, this.crates);
        });

        // 8. Update Laser Traps
        for (const laser of this.lasers) {
            laser.update(dt);
            if (laser.checkHit(player, this.crates)) {
                const res = player.takeDamage();
                if (res) {
                    this.deaths++;
                    this.particles.emitBloodSparks(player.x, player.y);
                    if (res === 'game_over') return 'game_over';
                    player.resetToCheckpoint();
                }
            }
        }

        // 9. Update Puzzle Pedestals
        if (this.puzzlePedestals.length > 0 && !this.puzzleSolved) {
            this.puzzlePedestals.forEach(pedestal => {
                pedestal.update(dt);
                if (window.GameObstacles.Utils.circleRectIntersect(
                    player.x, player.y, player.radius * 0.7,
                    pedestal.x, pedestal.y, pedestal.size, pedestal.size
                )) {
                    if (!pedestal.isLit) {
                        pedestal.isLit = true;
                        if (window.gameAudio) window.gameAudio.playPuzzleNote(pedestal.index);

                        // Check sequence
                        const expectedIdx = this.puzzleSequence[this.puzzleCurrentIndex];
                        if (pedestal.index === expectedIdx) {
                            this.puzzleCurrentIndex++;
                            this.particles.emitSparkles(pedestal.x + pedestal.size / 2, pedestal.y + pedestal.size / 2, pedestal.color, 12);

                            if (this.puzzleCurrentIndex >= this.puzzleSequence.length) {
                                // Solved!
                                this.puzzleSolved = true;
                                if (window.gameAudio) window.gameAudio.playPuzzleSuccess();
                                if (this.exitDoor) {
                                    this.exitDoor.isOpen = true;
                                    if (window.gameAudio) window.gameAudio.playDoorOpen();
                                }
                            }
                        } else {
                            // Wrong sequence note
                            if (window.gameAudio) window.gameAudio.playPuzzleFail();
                            setTimeout(() => {
                                this.puzzlePedestals.forEach(p => { p.isLit = false; });
                                this.puzzleCurrentIndex = 0;
                            }, 500);
                        }
                    }
                }
            });
        }

        // 10. Update Enemies
        const solidBlocks = [];
        for (let r = 0; r < this.gridHeight; r++) {
            for (let c = 0; c < this.gridWidth; c++) {
                if (this.map[r][c] === 1) {
                    solidBlocks.push({ x: c * this.tileSize, y: r * this.tileSize, size: this.tileSize });
                }
            }
        }

        for (const enemy of this.enemies) {
            enemy.update(dt, player, solidBlocks, this.crates);
            if (enemy.checkHit(player)) {
                const res = player.takeDamage();
                if (res) {
                    this.deaths++;
                    this.particles.emitBloodSparks(player.x, player.y);
                    if (res === 'game_over') return 'game_over';
                    player.resetToCheckpoint();
                }
            }
        }

        // 11. Checkpoints check
        this.checkpoints.forEach(cp => {
            if (window.GameObstacles.Utils.dist(player.x, player.y, cp.x, cp.y) < this.tileSize * 0.75) {
                if (player.checkpointX !== cp.x || player.checkpointY !== cp.y) {
                    player.setCheckpoint(cp.x, cp.y);
                    this.checkpointReached = true;
                    if (window.gameAudio) window.gameAudio.playCheckpoint();
                    this.particles.emitSparkles(cp.x, cp.y, '#38bdf8', 20);
                }
            }
        });

        return 'ok';
    }

    draw(ctx, player) {
        const ts = this.tileSize;

        // 1. Draw Stone Floor Tiles with Subtle Grid
        for (let r = 0; r < this.gridHeight; r++) {
            for (let c = 0; c < this.gridWidth; c++) {
                const x = c * ts;
                const y = r * ts;

                if (this.map[r][c] === 0 || this.map[r][c] === 2) {
                    ctx.fillStyle = '#161922';
                    ctx.fillRect(x, y, ts, ts);

                    // Floor paver with dark subtle grid grooves
                    ctx.fillStyle = '#1a1e28';
                    ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);

                    ctx.strokeStyle = '#222733';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, ts, ts);

                    // Subtle paver crack/moss details
                    if ((r * 11 + c * 17) % 7 === 0) {
                        ctx.fillStyle = '#262d3d';
                        ctx.fillRect(x + 10, y + 16, 7, 2);
                    } else if ((r * 13 + c * 7) % 9 === 0) {
                        ctx.fillStyle = '#1e3025';
                        ctx.beginPath();
                        ctx.arc(x + ts - 8, y + 8, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }

        // 2. Draw Start Tile
        const startPos = this.currentLevelData.playerStart;
        const startTileX = Math.floor(startPos.x / ts) * ts;
        const startTileY = Math.floor(startPos.y / ts) * ts;

        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.fillRect(startTileX, startTileY, ts, ts);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(startTileX + 2, startTileY + 2, ts - 4, ts - 4);

        // Start Chevron Icon
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        const scx = startTileX + ts / 2;
        const scy = startTileY + ts / 2;
        ctx.moveTo(scx, scy - 10);
        ctx.lineTo(scx + 10, scy);
        ctx.lineTo(scx + 5, scy);
        ctx.lineTo(scx + 5, scy + 8);
        ctx.lineTo(scx - 5, scy + 8);
        ctx.lineTo(scx - 5, scy);
        ctx.lineTo(scx - 10, scy);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('START', scx, startTileY + ts - 5);

        // 3. Draw Checkpoints
        this.checkpoints.forEach(cp => {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.beginPath();
            ctx.arc(cp.x, cp.y, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#bae6fd';
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('CHECKPOINT', cp.x, cp.y + 4);
        });

        // 4. Draw Lava Pits
        this.lavaPits.forEach(l => l.draw(ctx));

        // 5. Draw Spike Traps
        this.spikes.forEach(s => s.draw(ctx));

        // 6. Draw Pressure Plates
        this.pressurePlates.forEach(p => p.draw(ctx));

        // 7. Draw Puzzle Pedestals & Wall sequence display
        if (this.puzzlePedestals.length > 0) {
            this.puzzlePedestals.forEach(p => p.draw(ctx));

            // Wall Sequence Target Display Banner
            const bannerX = 6.5 * ts;
            const bannerY = 1.8 * ts;
            ctx.fillStyle = '#111827';
            ctx.beginPath();
            ctx.roundRect(bannerX, bannerY, 5 * ts, 36, 6);
            ctx.fill();
            ctx.strokeStyle = '#4b5563';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#9ca3af';
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('ANCIENT SEQUENCE:', bannerX + 2.5 * ts, bannerY - 6);

            // Display colored symbols in target order
            const symMap = {
                0: { color: '#ef4444', icon: '▲' },
                1: { color: '#3b82f6', icon: '◆' },
                2: { color: '#22c55e', icon: '●' },
                3: { color: '#eab308', icon: '★' }
            };

            this.puzzleSequence.forEach((pedIndex, idx) => {
                const s = symMap[pedIndex] || { color: '#fff', icon: '?' };
                const sx = bannerX + 28 + idx * 46;
                const sy = bannerY + 23;
                ctx.fillStyle = s.color;
                ctx.font = 'bold 18px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(s.icon, sx, sy);

                if (idx < this.puzzleSequence.length - 1) {
                    ctx.fillStyle = '#6b7280';
                    ctx.font = '12px Inter, sans-serif';
                    ctx.fillText('→', sx + 23, sy - 2);
                }
            });
        }

        // 8. Draw Crates
        this.crates.forEach(c => c.draw(ctx));

        // 9. Draw Keys
        this.keys.forEach(k => k.draw(ctx));

        // 10. Draw Exit Door
        if (this.exitDoor) {
            this.exitDoor.draw(ctx);
        }

        // 11. Draw Lasers
        this.lasers.forEach(l => l.draw(ctx, this.crates));

        // 12. Draw Rotating Maces
        this.rotatingMaces.forEach(m => m.draw(ctx));

        // 13. Draw Enemies
        this.enemies.forEach(e => e.draw(ctx));

        // 14. Draw Solid Wall Blocks (with 3D Beveled Face & Drop Shadow)
        for (let r = 0; r < this.gridHeight; r++) {
            for (let c = 0; c < this.gridWidth; c++) {
                if (this.map[r][c] === 1) {
                    const x = c * ts;
                    const y = r * ts;

                    // Wall Drop Shadow on floor to south
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                    ctx.fillRect(x, y + ts, ts, 8);

                    // 3D Front Face
                    ctx.fillStyle = '#2d3340';
                    ctx.fillRect(x, y + 10, ts, ts - 10);

                    // Brick seams on front face
                    ctx.strokeStyle = '#1b1f28';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(x, y + 10 + (ts - 10) / 2);
                    ctx.lineTo(x + ts, y + 10 + (ts - 10) / 2);

                    const brickOffset = (r % 2 === 0) ? ts / 2 : ts / 3;
                    ctx.moveTo(x + brickOffset, y + 10);
                    ctx.lineTo(x + brickOffset, y + 10 + (ts - 10) / 2);
                    ctx.moveTo(x + (ts - brickOffset), y + 10 + (ts - 10) / 2);
                    ctx.lineTo(x + (ts - brickOffset), y + ts);
                    ctx.stroke();

                    // Top Face
                    ctx.fillStyle = '#475060';
                    ctx.fillRect(x, y, ts, 12);

                    // Bevel Highlight
                    ctx.strokeStyle = '#64748b';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(x, y + 12);
                    ctx.lineTo(x, y);
                    ctx.lineTo(x + ts, y);
                    ctx.stroke();

                    ctx.strokeStyle = '#333b49';
                    ctx.beginPath();
                    ctx.moveTo(x + ts, y);
                    ctx.lineTo(x + ts, y + 12);
                    ctx.lineTo(x, y + 12);
                    ctx.stroke();

                    // Wall Top Inset
                    ctx.strokeStyle = '#5a6578';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x + 1, y + 1, ts - 2, 10);

                    // Wall Border Outline
                    ctx.strokeStyle = '#13161c';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, ts, ts);
                }
            }
        }

        // 15. Draw Wall Torches with Flickering Fire
        this.torches.forEach(t => {
            const flicker = Math.sin(this.torchTime + t.x) * 2;
            const tx = t.x;
            const ty = t.y;

            // Sconce iron bracket
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(tx - 3, ty + 2, 6, 8);

            // Orange/Yellow Flame
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(tx, ty - 2 + flicker * 0.5, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(tx, ty - 3 + flicker * 0.5, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Ambient Warm Light Radial Mask
            const torchRadius = 75 + flicker * 3;
            const lightGrad = ctx.createRadialGradient(tx, ty, 3, tx, ty, torchRadius);
            lightGrad.addColorStop(0, 'rgba(255, 170, 40, 0.22)');
            lightGrad.addColorStop(0.5, 'rgba(255, 120, 20, 0.08)');
            lightGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');

            ctx.fillStyle = lightGrad;
            ctx.beginPath();
            ctx.arc(tx, ty, torchRadius, 0, Math.PI * 2);
            ctx.fill();
        });

        // 16. Draw Player
        player.draw(ctx);

        // 17. Draw Particles (Dust, Sparkles, Blood Sparks, Portal Rays)
        this.particles.draw(ctx);

        // 18. Draw Flying Key Particles
        this.flyingKeys.forEach(fk => fk.draw(ctx));

        // 19. Draw Active Contextual Interaction Prompt
        if (this.activePrompt) {
            this.drawPrompt(ctx, this.activePrompt);
        }

        // 20. Draw Notification Toast
        if (this.toast) {
            this.drawToast(ctx, this.toast);
        }
    }

    showToast(text, duration = 1.8, color = '#ffd700') {
        this.toast = {
            text: text,
            timer: duration,
            maxTimer: duration,
            color: color
        };
    }

    drawPrompt(ctx, prompt) {
        if (!prompt) return;

        ctx.save();
        const px = prompt.x;
        const py = prompt.y;

        ctx.font = 'bold 12px Inter, sans-serif';
        const textWidth = ctx.measureText(prompt.text).width;
        const boxW = Math.max(textWidth + 24, 96);
        const boxH = prompt.subtext ? 40 : 28;
        const boxX = px - boxW / 2;
        const boxY = py - boxH / 2;

        // Dark translucent glass background
        ctx.fillStyle = 'rgba(12, 17, 26, 0.92)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 6);
        ctx.fill();

        // Border styling based on type
        let borderColor = '#ffd700';
        let glowColor = 'rgba(255, 215, 0, 0.45)';
        let textColor = '#fffbeb';

        if (prompt.type === 'door_locked') {
            borderColor = '#ef4444';
            glowColor = 'rgba(239, 68, 68, 0.45)';
            textColor = '#fecaca';
        } else if (prompt.type === 'door_open') {
            borderColor = '#10b981';
            glowColor = 'rgba(16, 185, 129, 0.5)';
            textColor = '#a7f3d0';
        }

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Downward pointer arrow towards target object
        ctx.fillStyle = borderColor;
        ctx.beginPath();
        ctx.moveTo(px - 5, boxY + boxH);
        ctx.lineTo(px + 5, boxY + boxH);
        ctx.lineTo(px, boxY + boxH + 5);
        ctx.closePath();
        ctx.fill();

        // Prompt Main Text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;
        ctx.fillText(prompt.text, px, prompt.subtext ? boxY + 14 : py);

        // Optional subtext (e.g. "Need a Key")
        if (prompt.subtext) {
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(prompt.subtext, px, boxY + 28);
        }

        ctx.restore();
    }

    drawToast(ctx, toast) {
        if (!toast) return;

        ctx.save();
        const progress = toast.timer / toast.maxTimer; // 1 -> 0
        let alpha = 1;
        if (progress > 0.85) {
            alpha = (1 - progress) / 0.15;
        } else if (progress < 0.2) {
            alpha = progress / 0.2;
        }

        const cx = this.gridWidth * this.tileSize / 2;
        const cy = 64; // Top center below HUD

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        ctx.font = 'bold 13px "Cinzel", "Cinzel Decorative", serif';
        const tw = ctx.measureText(toast.text).width;
        const bw = Math.max(tw + 48, 160);
        const bh = 34;

        // Banner backdrop
        ctx.fillStyle = 'rgba(10, 15, 24, 0.95)';
        ctx.beginPath();
        ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 6);
        ctx.fill();

        ctx.strokeStyle = toast.color || '#ffd700';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = toast.color || '#ffd700';
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Glowing text
        ctx.fillStyle = toast.color || '#ffd700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(toast.text, cx, cy);

        ctx.restore();
    }
}

// =================================================================
// Lightweight High Performance Particle System
// =================================================================
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    clear() {
        this.particles = [];
    }

    emitDust(x, y) {
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x + (Math.random() * 8 - 4),
                y: y + (Math.random() * 4 - 2),
                vx: (Math.random() - 0.5) * 20,
                vy: -Math.random() * 15,
                size: 2 + Math.random() * 2,
                color: 'rgba(148, 163, 184, 0.5)',
                life: 0.35,
                maxLife: 0.35
            });
        }
    }

    emitSparkles(x, y, color = '#ffd700', count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 70;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 2.5,
                color: color,
                life: 0.6 + Math.random() * 0.4,
                maxLife: 1.0
            });
        }
    }

    emitBloodSparks(x, y) {
        for (let i = 0; i < 18; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 90;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2.5 + Math.random() * 2,
                color: '#ef4444',
                life: 0.4 + Math.random() * 0.3,
                maxLife: 0.7
            });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => {
            const alpha = Math.max(0, p.life / p.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}

window.LevelManager = LevelManager;
window.ParticleSystem = ParticleSystem;
