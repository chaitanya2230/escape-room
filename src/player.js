/**
 * Escape The Rooms - Player Controller & Character Renderer
 */

class Player {
    constructor(startX = 100, startY = 100) {
        this.x = startX;
        this.y = startY;
        this.startX = startX;
        this.startY = startY;
        this.checkpointX = startX;
        this.checkpointY = startY;

        this.vx = 0;
        this.vy = 0;
        this.baseSpeed = 160;
        this.sprintSpeed = 230;
        this.radius = 14;

        this.facing = 'down'; // 'up', 'down', 'left', 'right'
        this.angle = Math.PI / 2;
        this.walkCycle = 0;
        this.isMoving = false;
        this.isSprinting = false;
        this.stamina = 1.0; // 0.0 to 1.0

        // Lives & Damage
        this.maxLives = 3;
        this.lives = 3;
        this.invulnerableTimer = 0;
        this.isDead = false;

        // Visual FX
        this.torchFlicker = 0;
        this.pushCooldown = 0;
    }

    resetToCheckpoint() {
        this.x = this.checkpointX;
        this.y = this.checkpointY;
        this.vx = 0;
        this.vy = 0;
        this.isDead = false;
        this.invulnerableTimer = 1.2; // brief protection on respawn
    }

    resetToStart() {
        this.x = this.startX;
        this.y = this.startY;
        this.checkpointX = this.startX;
        this.checkpointY = this.startY;
        this.vx = 0;
        this.vy = 0;
        this.lives = this.maxLives;
        this.isDead = false;
        this.invulnerableTimer = 0;
    }

    setCheckpoint(x, y) {
        this.checkpointX = x;
        this.checkpointY = y;
    }

    takeDamage() {
        if (this.invulnerableTimer > 0 || this.isDead) return false;

        this.lives--;
        this.invulnerableTimer = 1.6;
        if (window.gameAudio) window.gameAudio.playDamage();

        if (this.lives <= 0) {
            this.isDead = true;
            if (window.gameAudio) window.gameAudio.playGameOver();
            return 'game_over';
        } else {
            return 'respawn';
        }
    }

    update(dt, input, solidGrid, crates, particles) {
        if (this.isDead) return;

        // Timers
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= dt;
        }
        if (this.pushCooldown > 0) {
            this.pushCooldown -= dt;
        }
        this.torchFlicker += dt * 8;

        // Movement input
        let moveX = 0;
        let moveY = 0;

        if (input.up) moveY -= 1;
        if (input.down) moveY += 1;
        if (input.left) moveX -= 1;
        if (input.right) moveX += 1;

        // Normalize diagonal
        const mag = Math.hypot(moveX, moveY);
        if (mag > 0) {
            moveX /= mag;
            moveY /= mag;
            this.isMoving = true;
            this.angle = Math.atan2(moveY, moveX);

            if (Math.abs(moveX) > Math.abs(moveY)) {
                this.facing = moveX > 0 ? 'right' : 'left';
            } else {
                this.facing = moveY > 0 ? 'down' : 'up';
            }
        } else {
            this.isMoving = false;
        }

        // Sprint Handling
        if (input.sprint && this.stamina > 0.1 && this.isMoving) {
            this.isSprinting = true;
            this.stamina = Math.max(0, this.stamina - dt * 0.4);
        } else {
            this.isSprinting = false;
            this.stamina = Math.min(1.0, this.stamina + dt * 0.25);
        }

        const targetSpeed = this.isSprinting ? this.sprintSpeed : this.baseSpeed;
        const accel = 18;

        this.vx += (moveX * targetSpeed - this.vx) * accel * dt;
        this.vy += (moveY * targetSpeed - this.vy) * accel * dt;

        // Animation cycle & footstep sound
        if (this.isMoving) {
            const cycleSpeed = this.isSprinting ? 18 : 12;
            const prevCycle = this.walkCycle;
            this.walkCycle += dt * cycleSpeed;

            if (Math.floor(this.walkCycle / Math.PI) > Math.floor(prevCycle / Math.PI)) {
                if (window.gameAudio) window.gameAudio.playFootstep();
                if (particles) {
                    particles.emitDust(this.x, this.y + 12);
                }
            }
        } else {
            this.walkCycle = 0;
        }

        // Apply movement with separate X/Y collision for smooth wall sliding
        const nextX = this.x + this.vx * dt;
        const nextY = this.y + this.vy * dt;

        // Collision with Crates & Pushing
        if (crates && this.pushCooldown <= 0) {
            for (const crate of crates) {
                // If attempting to push into crate
                if (window.GameObstacles.Utils.circleRectIntersect(nextX, this.y, this.radius, crate.x, crate.y, crate.w, crate.h)) {
                    if (Math.abs(this.vx) > 30) {
                        const pushDirX = this.vx > 0 ? 1 : -1;
                        if (crate.tryPush(pushDirX, 0, solidGrid, crates)) {
                            this.pushCooldown = 0.35;
                        }
                    }
                }
                if (window.GameObstacles.Utils.circleRectIntersect(this.x, nextY, this.radius, crate.x, crate.y, crate.w, crate.h)) {
                    if (Math.abs(this.vy) > 30) {
                        const pushDirY = this.vy > 0 ? 1 : -1;
                        if (crate.tryPush(0, pushDirY, solidGrid, crates)) {
                            this.pushCooldown = 0.35;
                        }
                    }
                }
            }
        }

        // Check X movement
        if (!this.checkCollision(nextX, this.y, solidGrid, crates)) {
            this.x = nextX;
        } else {
            this.vx = 0;
        }

        // Check Y movement
        if (!this.checkCollision(this.x, nextY, solidGrid, crates)) {
            this.y = nextY;
        } else {
            this.vy = 0;
        }
    }

    checkCollision(x, y, solidGrid, crates) {
        // Test 8 boundary points on player circle
        const pts = 8;
        for (let i = 0; i < pts; i++) {
            const a = (i * Math.PI * 2) / pts;
            const px = x + Math.cos(a) * this.radius;
            const py = y + Math.sin(a) * this.radius;

            if (solidGrid.isBlocked(px, py)) {
                return true;
            }
        }

        // Check crates collision
        if (crates) {
            for (const crate of crates) {
                if (window.GameObstacles.Utils.circleRectIntersect(x, y, this.radius * 0.9, crate.x, crate.y, crate.w, crate.h)) {
                    return true;
                }
            }
        }

        return false;
    }

    draw(ctx) {
        // Invulnerability blinking
        if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer * 12) % 2 === 0) {
            return;
        }

        const x = this.x;
        const y = this.y;

        // Player Drop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(x, y + 10, this.radius * 0.9, this.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Walking bobbing & leg swing
        const bob = this.isMoving ? Math.sin(this.walkCycle) * 2 : 0;
        const legSwing = this.isMoving ? Math.sin(this.walkCycle) * 6 : 0;

        ctx.save();
        ctx.translate(x, y + bob);

        // Legs / Boots
        ctx.fillStyle = '#1e1b18';
        if (this.facing === 'left' || this.facing === 'right') {
            ctx.fillRect(-6 + legSwing, 6, 5, 8);
            ctx.fillRect(1 - legSwing, 6, 5, 8);
        } else {
            ctx.fillRect(-7, 6 + legSwing * 0.5, 5, 8);
            ctx.fillRect(2, 6 - legSwing * 0.5, 5, 8);
        }

        // Explorer Backpack (rendered behind if facing down, or on side)
        if (this.facing === 'up' || this.facing === 'left' || this.facing === 'right') {
            ctx.fillStyle = '#854d0e';
            const bpX = this.facing === 'right' ? -13 : (this.facing === 'left' ? 3 : -7);
            ctx.beginPath();
            ctx.roundRect(bpX, -4, 10, 11, 2);
            ctx.fill();
            ctx.strokeStyle = '#58310c';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Adventurer Jacket (Torso)
        ctx.fillStyle = '#1d4ed8'; // Adventurer dark sapphire / traveler jacket
        ctx.beginPath();
        ctx.roundRect(-8, -5, 16, 13, 3);
        ctx.fill();

        // Belt
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-8, 5, 16, 3);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-2, 5, 4, 3); // brass buckle

        // Scarf / Neck collar
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-5, -6, 10, 3);

        // Head / Face
        ctx.fillStyle = '#fed7aa'; // skin tone
        ctx.beginPath();
        ctx.arc(0, -11, 8.5, 0, Math.PI * 2);
        ctx.fill();

        // Hair (Adventurer brown hair)
        ctx.fillStyle = '#3f2212';
        ctx.beginPath();
        ctx.arc(0, -13, 9, Math.PI, Math.PI * 2);
        ctx.lineTo(8, -10);
        ctx.lineTo(-8, -10);
        ctx.closePath();
        ctx.fill();

        // Eyes based on facing
        ctx.fillStyle = '#0f172a';
        if (this.facing === 'down') {
            ctx.fillRect(-4, -11, 2.5, 3);
            ctx.fillRect(2, -11, 2.5, 3);
        } else if (this.facing === 'right') {
            ctx.fillRect(3, -11, 2.5, 3);
        } else if (this.facing === 'left') {
            ctx.fillRect(-5, -11, 2.5, 3);
        }

        // Handheld Lantern / Torch in hand
        const lanternX = this.facing === 'left' ? -12 : 12;
        const lanternY = 2;

        ctx.fillStyle = '#475569';
        ctx.fillRect(lanternX - 2, lanternY - 3, 5, 8);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(lanternX - 2, lanternY - 3, 5, 8);

        // Torch flame
        const flameColor = Math.sin(this.torchFlicker) > 0 ? '#fbbf24' : '#f97316';
        ctx.fillStyle = flameColor;
        ctx.beginPath();
        ctx.arc(lanternX, lanternY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Soft Radial Torch Light Mask onto surroundings
        const flickerRadius = 90 + Math.sin(this.torchFlicker) * 4;
        const lanternGlobalX = x + (this.facing === 'left' ? -12 : 12);
        const lanternGlobalY = y + 2;

        const lightGrad = ctx.createRadialGradient(
            lanternGlobalX, lanternGlobalY, 5,
            lanternGlobalX, lanternGlobalY, flickerRadius
        );
        lightGrad.addColorStop(0, 'rgba(255, 230, 140, 0.28)');
        lightGrad.addColorStop(0.4, 'rgba(255, 180, 50, 0.12)');
        lightGrad.addColorStop(1, 'rgba(255, 160, 0, 0)');

        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(lanternGlobalX, lanternGlobalY, flickerRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

window.Player = Player;
