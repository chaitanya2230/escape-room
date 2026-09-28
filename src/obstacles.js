/**
 * Escape The Rooms - Obstacles & Interactive Systems
 * Includes: Crates, Multi-Keys, Doors, Spikes, Pressure Plates, 
 * Switches/Levers, Bridges, Gates, Rotating Maces, Lava, Puzzle Pedestals, 
 * Laser Barriers, Flying Key Animation, and Enemy AI.
 */

// Helper utility for distance & collision
const Utils = {
    dist(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2 - y1);
    },
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },
    rectIntersect(r1, r2) {
        return !(r2.x >= r1.x + r1.w || 
                 r2.x + r2.w <= r1.x || 
                 r2.y >= r1.y + r1.h || 
                 r2.y + r2.h <= r1.y);
    },
    circleRectIntersect(cx, cy, radius, rx, ry, rw, rh) {
        const testX = Utils.clamp(cx, rx, rx + rw);
        const testY = Utils.clamp(cy, ry, ry + rh);
        const distX = cx - testX;
        const distY = cy - testY;
        return (distX * distX + distY * distY) < (radius * radius);
    },
    lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denom === 0) return null;
        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            return {
                x: x1 + ua * (x2 - x1),
                y: y1 + ua * (y2 - y1),
                t: ua
            };
        }
        return null;
    }
};

// =================================================================
// 1. Crate (Pushable Block & Stealth Cover)
// =================================================================
class Crate {
    constructor(x, y, size = 48) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.size = size;
        this.w = size;
        this.h = size;
        this.isMoving = false;
        this.moveSpeed = 160;
    }

    update(dt, solidGrid) {
        if (this.isMoving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.hypot(dx, dy);
            const step = this.moveSpeed * dt;

            if (dist <= step) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.isMoving = false;
            } else {
                this.x += (dx / dist) * step;
                this.y += (dy / dist) * step;
            }
        }
    }

    tryPush(dirX, dirY, solidGrid, allCrates) {
        if (this.isMoving) return false;
        const destX = this.x + dirX * this.size;
        const destY = this.y + dirY * this.size;

        if (solidGrid.isBlocked(destX + this.size / 2, destY + this.size / 2)) {
            return false;
        }

        for (const other of allCrates) {
            if (other !== this && Math.hypot(other.targetX - destX, other.targetY - destY) < this.size * 0.8) {
                return false;
            }
        }

        this.targetX = destX;
        this.targetY = destY;
        this.isMoving = true;
        if (window.gameAudio) window.gameAudio.playPressurePlate();
        return true;
    }

    draw(ctx) {
        const x = this.x;
        const y = this.y;
        const s = this.size;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.roundRect(x + 4, y + s - 6, s - 8, 10, 4);
        ctx.fill();

        // 3D Front Face
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.roundRect(x, y + 6, s, s - 6, 4);
        ctx.fill();

        // Top Face
        ctx.fillStyle = '#8B5A2B';
        ctx.beginPath();
        ctx.roundRect(x, y, s, s - 8, 4);
        ctx.fill();

        // Wood grain planks
        ctx.strokeStyle = '#5c3a1e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + s * 0.33, y);
        ctx.lineTo(x + s * 0.33, y + s - 8);
        ctx.moveTo(x + s * 0.66, y);
        ctx.lineTo(x + s * 0.66, y + s - 8);
        ctx.stroke();

        // Iron Corner Brackets
        ctx.strokeStyle = '#3e2714';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, s - 4, s - 10);

        // Diagonal brace
        ctx.strokeStyle = '#a6723e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 4);
        ctx.lineTo(x + s - 4, y + s - 12);
        ctx.stroke();

        // Iron rivets
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 4, y + 4, 2, 2);
        ctx.fillRect(x + s - 6, y + 4, 2, 2);
        ctx.fillRect(x + 4, y + s - 14, 2, 2);
        ctx.fillRect(x + s - 6, y + s - 14, 2, 2);
    }
}

// =================================================================
// 2. Multi-Tier Key Item (Gold, Ruby, Sapphire, Bronze, Silver)
// =================================================================
class KeyItem {
    constructor(x, y, id = 1, type = 'gold') {
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type; // 'gold', 'ruby', 'sapphire', 'bronze', 'silver'
        this.radius = 18;
        this.collected = false;
        this.isCollecting = false;
        this.collectProgress = 0;
        this.time = Math.random() * Math.PI * 2;
    }

    getColor() {
        switch (this.type) {
            case 'ruby': return '#ef4444';
            case 'sapphire': return '#38bdf8';
            case 'bronze': return '#d97706';
            case 'silver': return '#e2e8f0';
            case 'gold':
            default:
                return '#ffd700';
        }
    }

    update(dt) {
        this.time += dt * 3.5;
        if (this.isCollecting) {
            this.collectProgress += dt * 3.2;
            this.y -= dt * 50; // floats upward as it disappears
            if (this.collectProgress >= 1) {
                this.collected = true;
                this.isCollecting = false;
            }
        }
    }

    canInteract(player) {
        if (this.collected || this.isCollecting) return false;
        return Utils.dist(this.x, this.y, player.x, player.y) < 48;
    }

    collect() {
        if (this.collected || this.isCollecting) return false;
        this.isCollecting = true;
        return true;
    }

    draw(ctx) {
        if (this.collected) return;
        const alpha = this.isCollecting ? Math.max(0, 1 - this.collectProgress) : 1;
        const scale = this.isCollecting ? Math.max(0.2, 1 + this.collectProgress * 0.5) : 1;

        const bob = Math.sin(this.time) * 4.5;
        const ky = this.y + bob;
        const keyColor = this.getColor();

        ctx.save();
        ctx.globalAlpha = alpha;

        // Ground Glowing Pulsing Aura
        const pulse = 0.85 + Math.sin(this.time * 2) * 0.15;
        const groundGrad = ctx.createRadialGradient(this.x, this.y + 12, 2, this.x, this.y + 12, 28 * pulse);
        groundGrad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
        groundGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.18)');
        groundGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 12, 24 * pulse, 10 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();

        // Key Halo Glow
        const grad = ctx.createRadialGradient(this.x, ky, 2, this.x, ky, 28);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(0.3, 'rgba(255, 215, 0, 0.55)');
        grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.22)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, ky, 28, 0, Math.PI * 2);
        ctx.fill();

        // 3D Rotating Key Graphic
        ctx.translate(this.x, ky);
        ctx.scale(scale, scale);
        ctx.rotate(Math.sin(this.time * 0.8) * 0.22);

        // Drop shadow for 3D depth
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(-3, -4, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(14, 12);
        ctx.moveTo(10, 8);
        ctx.lineTo(13, 5);
        ctx.moveTo(14, 12);
        ctx.lineTo(17, 9);
        ctx.stroke();

        // Golden Key Stem & Teeth
        ctx.strokeStyle = '#ffd700';
        ctx.fillStyle = '#fffbeb';
        ctx.lineWidth = 3.5;

        // Key Ring Head
        ctx.beginPath();
        ctx.arc(-4, -6, 7.5, 0, Math.PI * 2);
        ctx.stroke();

        // Key Stem
        ctx.beginPath();
        ctx.moveTo(1, -1);
        ctx.lineTo(13, 11);
        ctx.stroke();

        // Key Teeth
        ctx.beginPath();
        ctx.moveTo(9, 7);
        ctx.lineTo(12, 4);
        ctx.moveTo(13, 11);
        ctx.lineTo(16, 8);
        ctx.stroke();

        // Center jewel sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -6, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// =================================================================
// 3. Flying Key Particle (Picks up and flies toward HUD)
// =================================================================
class FlyingKeyParticle {
    constructor(startX, startY, targetScreenX = 750, targetScreenY = 30, color = '#ffd700') {
        this.x = startX;
        this.y = startY;
        this.targetScreenX = targetScreenX;
        this.targetScreenY = targetScreenY;
        this.color = color;
        this.progress = 0;
        this.finished = false;
        this.trail = [];
    }

    update(dt, camera) {
        this.progress += dt * 1.8;
        if (this.progress >= 1) {
            this.finished = true;
            return;
        }

        // Convert target screen to world coordinates if camera is provided
        let targetX = this.targetScreenX;
        let targetY = this.targetScreenY;
        if (camera && camera.screenToWorld) {
            const targetWorld = camera.screenToWorld(this.targetScreenX, this.targetScreenY);
            targetX = targetWorld.x;
            targetY = targetWorld.y;
        }

        this.x = this.x + (targetX - this.x) * (dt * 7);
        this.y = this.y + (targetY - this.y) * (dt * 7);

        this.trail.push({ x: this.x, y: this.y, life: 0.25 });
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].life -= dt;
            if (this.trail[i].life <= 0) this.trail.splice(i, 1);
        }
    }

    draw(ctx) {
        // Trail
        this.trail.forEach(p => {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Main Spark
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// =================================================================
// 4. Interactive Switch / Lever
// =================================================================
class SwitchLever {
    constructor(x, y, id, label = 'Switch', onToggle = null) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.label = label;
        this.onToggle = onToggle;
        this.isActivated = false;
        this.size = 40;
        this.w = 40;
        this.h = 40;
    }

    get isFlipped() {
        return this.isActivated;
    }

    update(dt) {
        // Lever state / animation if needed
    }

    flip() {
        return this.toggle();
    }

    toggle() {
        this.isActivated = !this.isActivated;
        if (window.gameAudio) window.gameAudio.playSwitchFlip();
        if (this.onToggle) this.onToggle(this.isActivated);
        return this.isActivated;
    }

    draw(ctx) {
        const x = this.x;
        const y = this.y;
        const s = this.size;

        // Base box
        ctx.fillStyle = '#1e2530';
        ctx.beginPath();
        ctx.roundRect(x, y, s, s, 6);
        ctx.fill();

        ctx.strokeStyle = this.isActivated ? '#10b981' : '#64748b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Switch Slot
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 12, y + 8, s - 24, s - 16);

        // Lever Handle (toggles angle)
        const angle = this.isActivated ? Math.PI / 4 : -Math.PI / 4;
        ctx.save();
        ctx.translate(x + s / 2, y + s / 2);
        ctx.rotate(angle);

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(0, -14);
        ctx.stroke();

        // Handle knob
        ctx.fillStyle = this.isActivated ? '#10b981' : '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -14, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// =================================================================
// 5. Retractable Bridge Block (Crosses Chasms when activated)
// =================================================================
class BridgeBlock {
    constructor(x, y, size = 48) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.isExtended = false;
        this.extension = 0; // 0 to 1
    }

    setExtended(extended) {
        this.isExtended = extended;
    }

    update(dt) {
        const target = this.isExtended ? 1 : 0;
        this.extension += (target - this.extension) * dt * 4;
    }

    isWalkable() {
        return this.extension > 0.8;
    }

    draw(ctx) {
        if (this.extension < 0.05) return;
        const x = this.x;
        const y = this.y;
        const s = this.size;
        const currentW = s * this.extension;

        // Wooden Bridge Planks
        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(x, y + 4, currentW, s - 8);

        ctx.strokeStyle = '#3e2714';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y + 4, currentW, s - 8);

        // Planks seams
        ctx.strokeStyle = '#2b180d';
        ctx.beginPath();
        for (let i = 12; i < currentW; i += 12) {
            ctx.moveTo(x + i, y + 4);
            ctx.lineTo(x + i, y + s - 4);
        }
        ctx.stroke();
    }
}

// =================================================================
// 6. Security Gate (Opens via Switch)
// =================================================================
class GateDoor {
    constructor(x, y, w = 48, h = 48, id = 1) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.id = id;
        this.isOpen = false;
        this.openOffset = 0;
    }

    open() {
        if (!this.isOpen) {
            this.isOpen = true;
            if (window.gameAudio) window.gameAudio.playDoorOpen();
        }
    }

    update(dt) {
        if (this.isOpen && this.openOffset < this.h) {
            this.openOffset = Math.min(this.h, this.openOffset + dt * 60);
        }
    }

    isSolid() {
        return this.openOffset < this.h * 0.75;
    }

    draw(ctx) {
        const x = this.x;
        const y = this.y;
        const w = this.w;
        const h = this.h;

        // Iron Portcullis Bars
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();

        ctx.fillStyle = '#334155';
        const curY = y - this.openOffset;

        // Vertical iron bars
        for (let bx = x + 6; bx < x + w; bx += 10) {
            ctx.fillRect(bx, curY, 4, h);
        }
        // Horizontal cross bars
        ctx.fillRect(x, curY + 12, w, 4);
        ctx.fillRect(x, curY + h - 12, w, 4);

        ctx.restore();

        // Frame
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
    }
}

// =================================================================
// 7. Exit Door (Locked / Unlocked / Light Beam)
// =================================================================
class ExitDoor {
    constructor(x, y, w = 64, h = 48, requiredKeys = 1) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.requiredKeys = requiredKeys;
        this.isOpen = false;
        this.canOpen = false;
        this.openProgress = 0;
        this.glowTime = 0;
    }

    update(dt) {
        this.glowTime += dt * 3;
        if (this.isOpen && this.openProgress < 1) {
            this.openProgress = Math.min(1, this.openProgress + dt * 2.2);
        }
    }

    open() {
        if (this.isOpen) return false;
        this.isOpen = true;
        if (window.gameAudio) window.gameAudio.playDoorOpen();
        return true;
    }

    canInteract(player) {
        // Generous door interaction zone in front of the door
        const doorBounds = { x: this.x - 6, y: this.y, w: this.w + 12, h: this.h + 26 };
        return Utils.circleRectIntersect(player.x, player.y, player.radius, 
                                        doorBounds.x, doorBounds.y, doorBounds.w, doorBounds.h);
    }

    checkExit(player) {
        if (!this.isOpen || this.openProgress < 0.25) return false;
        // Trigger zone extending into door portal threshold
        const doorBounds = { x: this.x - 6, y: this.y, w: this.w + 12, h: this.h + 16 };
        return Utils.circleRectIntersect(player.x, player.y, player.radius, 
                                        doorBounds.x, doorBounds.y, doorBounds.w, doorBounds.h);
    }

    draw(ctx) {
        const x = this.x;
        const y = this.y;
        const w = this.w;
        const h = this.h;

        // Subtle Unlocked Golden Aura around portal frame
        if (!this.isOpen && this.canOpen) {
            const pulse = 0.8 + Math.sin(this.glowTime * 2) * 0.2;
            const auraGrad = ctx.createRadialGradient(x + w / 2, y + h / 2, 8, x + w / 2, y + h / 2, w * 0.9);
            auraGrad.addColorStop(0, `rgba(251, 191, 36, ${0.4 * pulse})`);
            auraGrad.addColorStop(0.6, `rgba(245, 158, 11, ${0.15 * pulse})`);
            auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
            ctx.fillStyle = auraGrad;
            ctx.fillRect(x - 20, y - 20, w + 40, h + 50);
        }

        // Arched Stone Portal Frame
        ctx.fillStyle = '#1e222a';
        ctx.beginPath();
        ctx.roundRect(x - 4, y - 6, w + 8, h + 8, [8, 8, 2, 2]);
        ctx.fill();

        ctx.strokeStyle = this.canOpen ? '#f59e0b' : '#4a505b';
        ctx.lineWidth = 3;
        ctx.stroke();

        if (this.isOpen) {
            // Radiant Golden Light Streaming Out
            const lightAlpha = 0.5 + Math.sin(this.glowTime) * 0.15;
            const beamGrad = ctx.createLinearGradient(x + w / 2, y, x + w / 2, y + h + 60);
            beamGrad.addColorStop(0, `rgba(255, 235, 140, ${lightAlpha * 0.95})`);
            beamGrad.addColorStop(0.3, `rgba(255, 200, 50, ${lightAlpha * 0.65})`);
            beamGrad.addColorStop(1, 'rgba(255, 170, 0, 0)');

            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(x + 6, y + 10);
            ctx.lineTo(x + w - 6, y + 10);
            ctx.lineTo(x + w + 30, y + h + 60);
            ctx.lineTo(x - 30, y + h + 60);
            ctx.closePath();
            ctx.fill();

            // Inner Portal void glowing bright gold/white
            const portalGrad = ctx.createRadialGradient(x + w / 2, y + h / 2, 4, x + w / 2, y + h / 2, w / 2);
            portalGrad.addColorStop(0, '#ffffff');
            portalGrad.addColorStop(0.4, '#ffd54f');
            portalGrad.addColorStop(1, '#ff8f00');
            ctx.fillStyle = portalGrad;
            ctx.beginPath();
            ctx.roundRect(x + 4, y + 4, w - 8, h - 4, 6);
            ctx.fill();

            // Slide doors
            const slideOffset = (w * 0.42) * this.openProgress;
            ctx.fillStyle = '#4a2f18';
            ctx.fillRect(x + 4 - slideOffset, y + 6, (w - 8) / 2, h - 8);
            ctx.fillRect(x + w / 2 + slideOffset, y + 6, (w - 8) / 2, h - 8);

            // "EXIT" banner
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#ffe082';
            ctx.shadowBlur = 8;
            ctx.fillText('EXIT', x + w / 2, y - 10);
            ctx.shadowBlur = 0;
        } else {
            // Closed Heavy Wooden Doors
            ctx.fillStyle = '#4a2f18';
            ctx.beginPath();
            ctx.roundRect(x + 4, y + 4, w - 8, h - 4, 6);
            ctx.fill();

            ctx.strokeStyle = '#2d1b0c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + w / 2, y + 4);
            ctx.lineTo(x + w / 2, y + h);
            ctx.stroke();

            // Iron bands
            ctx.fillStyle = '#2c3138';
            ctx.fillRect(x + 6, y + 14, w - 12, 5);
            ctx.fillRect(x + 6, y + h - 14, w - 12, 5);

            // Padlock Graphic
            const padX = x + w / 2;
            const padY = y + h / 2;

            if (this.canOpen) {
                // UNLOCKED STATE (🔓)
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.roundRect(padX - 8, padY - 4, 16, 13, 3);
                ctx.fill();
                ctx.strokeStyle = '#34d399';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Open lifted shackle
                ctx.strokeStyle = '#fcd34d';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(padX - 3, padY - 8, 5, Math.PI, 0);
                ctx.lineTo(padX + 2, padY - 4);
                ctx.stroke();

                // "UNLOCKED" label
                ctx.fillStyle = '#4ade80';
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 6;
                ctx.fillText('🔓 UNLOCKED', padX, y - 8);
                ctx.shadowBlur = 0;
            } else {
                // LOCKED STATE (🔒)
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.roundRect(padX - 8, padY - 5, 16, 13, 3);
                ctx.fill();
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Closed shackle
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(padX, padY - 5, 5, Math.PI, 0);
                ctx.stroke();

                // Keyhole
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(padX, padY + 1, 2, 0, Math.PI * 2);
                ctx.rect(padX - 1, padY + 1, 2, 4);
                ctx.fill();

                // "LOCKED" label
                ctx.fillStyle = '#cbd5e1';
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(this.requiredKeys > 1 ? `🔒 ${this.requiredKeys} KEYS` : '🔒 LOCKED', padX, y - 8);
            }
        }
    }
}

// =================================================================
// 8. Spike Trap (Retracting / Active cycle)
// =================================================================
class SpikeTrap {
    constructor(x, y, size = 48, cycleOffset = 0, cycleTime = 2.4) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.cycleTime = cycleTime;
        this.time = cycleOffset;
        this.state = 'retracted';
        this.spikeHeight = 0;
        this.isPermanentlyDisabled = false;
    }

    disable() {
        this.isPermanentlyDisabled = true;
        this.state = 'retracted';
        this.spikeHeight = 0;
    }

    update(dt) {
        if (this.isPermanentlyDisabled) return;
        this.time = (this.time + dt) % this.cycleTime;

        const p = this.time / this.cycleTime;
        if (p < 0.5) {
            this.state = 'retracted';
            this.spikeHeight = 0;
        } else if (p < 0.68) {
            this.state = 'warning';
            this.spikeHeight = 0.2 + Math.sin(this.time * 30) * 0.08;
        } else if (p < 0.94) {
            if (this.state !== 'active' && window.gameAudio) {
                window.gameAudio.playSpikeTrap();
            }
            this.state = 'active';
            this.spikeHeight = 1.0;
        } else {
            this.state = 'retracting';
            this.spikeHeight = (1.0 - p) / 0.06;
        }
    }

    isDangerous() {
        return this.state === 'active' && this.spikeHeight > 0.6;
    }

    checkHit(player) {
        if (!this.isDangerous()) return false;
        return Utils.circleRectIntersect(player.x, player.y, player.radius * 0.7,
                                        this.x + 4, this.y + 4, this.size - 8, this.size - 8);
    }

    draw(ctx) {
        const x = this.x;
        const y = this.y;
        const s = this.size;

        ctx.fillStyle = '#1c1f24';
        ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
        ctx.strokeStyle = '#333b47';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, s - 4, s - 4);

        ctx.fillStyle = '#0a0c0e';
        const cols = 3;
        const pad = s / (cols + 1);
        for (let r = 0; r < cols; r++) {
            for (let c = 0; c < cols; c++) {
                const hx = x + (c + 1) * pad;
                const hy = y + (r + 1) * pad;
                ctx.beginPath();
                ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
                ctx.fill();

                if (this.spikeHeight > 0.05) {
                    const h = this.spikeHeight * 16;
                    ctx.fillStyle = this.state === 'warning' ? '#e2e8f0' : '#f87171';
                    ctx.beginPath();
                    ctx.moveTo(hx - 3, hy);
                    ctx.lineTo(hx, hy - h);
                    ctx.lineTo(hx + 3, hy);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(hx, hy - h + 1, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        if (this.state === 'warning') {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
        } else if (this.state === 'active') {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
        }
    }
}

// =================================================================
// 9. Pressure Plate
// =================================================================
class PressurePlate {
    constructor(x, y, id = 1, size = 42, onActivate = null) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.id = id;
        this.isPressed = false;
        this.onActivate = onActivate;
    }

    update(player, crates) {
        let pressedNow = false;

        if (Utils.circleRectIntersect(player.x, player.y, player.radius * 0.7, 
                                     this.x, this.y, this.size, this.size)) {
            pressedNow = true;
        }

        if (!pressedNow && crates) {
            for (const crate of crates) {
                if (Utils.rectIntersect(
                    { x: this.x, y: this.y, w: this.size, h: this.size },
                    { x: crate.x + 4, y: crate.y + 4, w: crate.w - 8, h: crate.h - 8 }
                )) {
                    pressedNow = true;
                    break;
                }
            }
        }

        if (pressedNow && !this.isPressed) {
            this.isPressed = true;
            if (window.gameAudio) window.gameAudio.playPressurePlate();
            if (this.onActivate) this.onActivate();
        } else if (!pressedNow && this.isPressed) {
            this.isPressed = false;
        }
    }

    draw(ctx) {
        const x = this.x;
        const y = this.y;
        const s = this.size;

        ctx.fillStyle = '#262930';
        ctx.beginPath();
        ctx.roundRect(x, y, s, s, 6);
        ctx.fill();

        const inset = this.isPressed ? 6 : 4;
        const color = this.isPressed ? '#22c55e' : '#ef4444';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x + inset, y + inset, s - inset * 2, s - inset * 2, 4);
        ctx.fill();

        if (this.isPressed) {
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#86efac';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + inset, y + inset, s - inset * 2, s - inset * 2);
            ctx.shadowBlur = 0;
        }
    }
}

// =================================================================
// 10. Rotating Spiked Mace Hazard
// =================================================================
class RotatingMace {
    constructor(cx, cy, armLength = 110, arms = 4, speed = 1.2) {
        this.cx = cx;
        this.cy = cy;
        this.armLength = armLength;
        this.numArms = arms;
        this.speed = speed;
        this.angle = 0;
        this.maceRadius = 14;
    }

    update(dt) {
        this.angle += this.speed * dt;
    }

    checkHit(player) {
        for (let i = 0; i < this.numArms; i++) {
            const a = this.angle + (i * Math.PI * 2 / this.numArms);
            const mx = this.cx + Math.cos(a) * this.armLength;
            const my = this.cy + Math.sin(a) * this.armLength;

            if (Utils.dist(player.x, player.y, mx, my) < player.radius + this.maceRadius) {
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        ctx.fillStyle = '#1e2229';
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, 6, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < this.numArms; i++) {
            const a = this.angle + (i * Math.PI * 2 / this.numArms);
            const mx = this.cx + Math.cos(a) * this.armLength;
            const my = this.cy + Math.sin(a) * this.armLength;

            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(this.cx, this.cy);
            ctx.lineTo(mx, my);
            ctx.stroke();

            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(this.cx, this.cy);
            ctx.lineTo(mx, my);
            ctx.stroke();

            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(mx, my, this.maceRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.stroke();

            const spikes = 8;
            for (let s = 0; s < spikes; s++) {
                const sa = a + (s * Math.PI * 2 / spikes);
                const sx1 = mx + Math.cos(sa) * this.maceRadius;
                const sy1 = my + Math.sin(sa) * this.maceRadius;
                const sx2 = mx + Math.cos(sa) * (this.maceRadius + 7);
                const sy2 = my + Math.sin(sa) * (this.maceRadius + 7);

                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(sx1, sy1);
                ctx.lineTo(sx2, sy2);
                ctx.stroke();
            }

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// =================================================================
// 11. Lava Pit
// =================================================================
class LavaPit {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.time = Math.random() * 10;
        this.bubbles = [
            { x: x + w * 0.3, y: y + h * 0.4, size: 4, phase: 0 },
            { x: x + w * 0.7, y: y + h * 0.6, size: 6, phase: 2 },
            { x: x + w * 0.5, y: y + h * 0.8, size: 5, phase: 4 },
        ];
    }

    update(dt) {
        this.time += dt * 2.5;
        this.bubbles.forEach(b => { b.phase += dt * 3; });
    }

    checkHit(player) {
        return Utils.circleRectIntersect(player.x, player.y, player.radius * 0.7,
                                        this.x + 4, this.y + 4, this.w - 8, this.h - 8);
    }

    draw(ctx) {
        const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
        grad.addColorStop(0, '#b91c1c');
        grad.addColorStop(0.5, '#ea580c');
        grad.addColorStop(1, '#f59e0b');

        ctx.fillStyle = grad;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        const glowAlpha = 0.25 + Math.sin(this.time) * 0.1;
        ctx.fillStyle = `rgba(255, 235, 59, ${glowAlpha})`;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        this.bubbles.forEach(b => {
            const bScale = Math.sin(b.phase);
            if (bScale > 0) {
                ctx.fillStyle = '#ffedd5';
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size * bScale, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
}

// =================================================================
// 12. Puzzle Pedestal (Ancient Symbols)
// =================================================================
class PuzzlePedestal {
    constructor(x, y, index, symbol, color, size = 46) {
        this.x = x;
        this.y = y;
        this.index = index;
        this.symbol = symbol;
        this.color = color;
        this.size = size;
        this.isLit = false;
        this.flashTimer = 0;
    }

    update(dt) {
        if (this.flashTimer > 0) this.flashTimer -= dt;
    }

    draw(ctx) {
        const x = this.x;
        const y = this.y;
        const s = this.size;

        ctx.fillStyle = '#1e2229';
        ctx.beginPath();
        ctx.roundRect(x, y, s, s, 8);
        ctx.fill();

        ctx.strokeStyle = this.isLit ? this.color : '#374151';
        ctx.lineWidth = 3;
        ctx.stroke();

        if (this.isLit) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 14;
        }

        ctx.fillStyle = this.isLit ? this.color : '#4b5563';
        const cx = x + s / 2;
        const cy = y + s / 2;

        ctx.beginPath();
        if (this.symbol === 'triangle') {
            ctx.moveTo(cx, cy - 12);
            ctx.lineTo(cx + 12, cy + 10);
            ctx.lineTo(cx - 12, cy + 10);
            ctx.closePath();
        } else if (this.symbol === 'diamond') {
            ctx.moveTo(cx, cy - 13);
            ctx.lineTo(cx + 13, cy);
            ctx.lineTo(cx, cy + 13);
            ctx.lineTo(cx - 13, cy);
            ctx.closePath();
        } else if (this.symbol === 'circle') {
            ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        } else if (this.symbol === 'star') {
            const spikes = 5;
            const outerR = 13;
            const innerR = 6;
            let rot = Math.PI / 2 * 3;
            let step = Math.PI / spikes;
            ctx.moveTo(cx, cy - outerR);
            for (let i = 0; i < spikes; i++) {
                let px = cx + Math.cos(rot) * outerR;
                let py = cy + Math.sin(rot) * outerR;
                ctx.lineTo(px, py);
                rot += step;
                px = cx + Math.cos(rot) * innerR;
                py = cy + Math.sin(rot) * innerR;
                ctx.lineTo(px, py);
                rot += step;
            }
            ctx.closePath();
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// =================================================================
// 13. Enemy Sentinel AI (Stealth, Vision Cone, Hiding Occlusion)
// =================================================================
class EnemySentinel {
    constructor(x, y, waypoints, visionRange = 180, fov = Math.PI / 2.3) {
        this.x = x;
        this.y = y;
        this.waypoints = waypoints;
        this.waypointIndex = 0;
        this.speed = 70;
        this.chaseSpeed = 115;
        this.visionRange = visionRange;
        this.fov = fov;
        this.angle = 0;
        this.radius = 16;

        this.state = 'PATROL'; // PATROL, DETECTED, CHASE, SEARCHING
        this.alertTimer = 0;
        this.lostTimer = 0;
        this.searchAngleOffset = 0;
        this.pulseTime = 0;
    }

    update(dt, player, solidBlocks, crates) {
        this.pulseTime += dt * 5;

        const distToPlayer = Utils.dist(this.x, this.y, player.x, player.y);
        let canSeePlayer = false;

        if (distToPlayer <= this.visionRange) {
            const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
            let angleDiff = Math.abs(angleToPlayer - this.angle);
            while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

            if (angleDiff <= this.fov / 2) {
                let isBlocked = false;
                const obstacles = [...solidBlocks, ...crates];
                for (const obs of obstacles) {
                    const box = { x: obs.x, y: obs.y, w: obs.w || obs.size, h: obs.h || obs.size };
                    const lines = [
                        [box.x, box.y, box.x + box.w, box.y],
                        [box.x + box.w, box.y, box.x + box.w, box.y + box.h],
                        [box.x + box.w, box.y + box.h, box.x, box.y + box.h],
                        [box.x, box.y + box.h, box.x, box.y]
                    ];
                    for (const [x1, y1, x2, y2] of lines) {
                        if (Utils.lineIntersect(this.x, this.y, player.x, player.y, x1, y1, x2, y2)) {
                            isBlocked = true;
                            break;
                        }
                    }
                    if (isBlocked) break;
                }

                if (!isBlocked) {
                    canSeePlayer = true;
                }
            }
        }

        if (canSeePlayer) {
            if (this.state === 'PATROL' || this.state === 'SEARCHING') {
                this.state = 'DETECTED';
                this.alertTimer = 0.35;
                if (window.gameAudio) window.gameAudio.playEnemyAlert();
            } else if (this.state === 'DETECTED') {
                this.alertTimer -= dt;
                if (this.alertTimer <= 0) {
                    this.state = 'CHASE';
                }
            }
            this.lostTimer = 2.2;
        } else {
            if (this.state === 'CHASE' || this.state === 'DETECTED') {
                this.lostTimer -= dt;
                if (this.lostTimer <= 0) {
                    this.state = 'SEARCHING';
                    this.alertTimer = 1.8;
                }
            } else if (this.state === 'SEARCHING') {
                this.alertTimer -= dt;
                this.searchAngleOffset = Math.sin(this.pulseTime) * 0.8;
                if (this.alertTimer <= 0) {
                    this.state = 'PATROL';
                }
            }
        }

        if (this.state === 'CHASE') {
            const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
            this.angle = targetAngle;
            this.x += Math.cos(targetAngle) * this.chaseSpeed * dt;
            this.y += Math.sin(targetAngle) * this.chaseSpeed * dt;
        } else if (this.state === 'PATROL') {
            const wp = this.waypoints[this.waypointIndex];
            const dx = wp.x - this.x;
            const dy = wp.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 8) {
                this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
            } else {
                const targetAngle = Math.atan2(dy, dx);
                this.angle = targetAngle;
                this.x += (dx / dist) * this.speed * dt;
                this.y += (dy / dist) * this.speed * dt;
            }
        }
    }

    checkHit(player) {
        return Utils.dist(this.x, this.y, player.x, player.y) < this.radius + player.radius * 0.8;
    }

    draw(ctx) {
        const lookAngle = this.angle + (this.state === 'SEARCHING' ? this.searchAngleOffset : 0);
        const coneColor = (this.state === 'CHASE' || this.state === 'DETECTED')
            ? 'rgba(239, 68, 68, 0.45)'
            : 'rgba(244, 63, 94, 0.22)';

        ctx.fillStyle = coneColor;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.visionRange, lookAngle - this.fov / 2, lookAngle + this.fov / 2);
        ctx.closePath();
        ctx.fill();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        const eyeColor = (this.state === 'CHASE' || this.state === 'DETECTED') ? '#ef4444' : '#fbbf24';
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.radius * 0.45, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        if (this.state === 'DETECTED' || this.state === 'CHASE') {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(this.x, this.y - 28, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 15px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('!', this.x, this.y - 23);
        } else if (this.state === 'SEARCHING') {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(this.x, this.y - 28, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('?', this.x, this.y - 23);
        }
    }
}

// =================================================================
// 14. Laser Trap
// =================================================================
class LaserTrap {
    constructor(x1, y1, x2, y2, isActive = true) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.isActive = isActive;
        this.time = 0;
    }

    update(dt) {
        this.time += dt * 8;
    }

    checkHit(player, crates) {
        if (!this.isActive) return false;
        let endX = this.x2;
        let endY = this.y2;

        if (crates) {
            for (const crate of crates) {
                const box = { x: crate.x, y: crate.y, w: crate.w, h: crate.h };
                const lines = [
                    [box.x, box.y, box.x + box.w, box.y],
                    [box.x + box.w, box.y, box.x + box.w, box.y + box.h],
                    [box.x + box.w, box.y + box.h, box.x, box.y + box.h],
                    [box.x, box.y + box.h, box.x, box.y]
                ];
                for (const [lx1, ly1, lx2, ly2] of lines) {
                    const hit = Utils.lineIntersect(this.x1, this.y1, endX, endY, lx1, ly1, lx2, ly2);
                    if (hit) {
                        endX = hit.x;
                        endY = hit.y;
                    }
                }
            }
        }

        const distToLaser = this.distToSegment(player.x, player.y, this.x1, this.y1, endX, endY);
        return distToLaser < player.radius * 0.8;
    }

    distToSegment(px, py, x1, y1, x2, y2) {
        const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        if (l2 === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
    }

    draw(ctx, crates) {
        this.drawPylon(ctx, this.x1, this.y1);
        this.drawPylon(ctx, this.x2, this.y2);

        if (!this.isActive) return;

        let curEndX = this.x2;
        let curEndY = this.y2;
        if (crates) {
            for (const crate of crates) {
                const box = { x: crate.x, y: crate.y, w: crate.w, h: crate.h };
                const lines = [
                    [box.x, box.y, box.x + box.w, box.y],
                    [box.x + box.w, box.y, box.x + box.w, box.y + box.h],
                    [box.x + box.w, box.y + box.h, box.x, box.y + box.h],
                    [box.x, box.y + box.h, box.x, box.y]
                ];
                for (const [lx1, ly1, lx2, ly2] of lines) {
                    const hit = Utils.lineIntersect(this.x1, this.y1, curEndX, curEndY, lx1, ly1, lx2, ly2);
                    if (hit) {
                        curEndX = hit.x;
                        curEndY = hit.y;
                    }
                }
            }
        }

        const beamWidth = 3 + Math.sin(this.time) * 1.5;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = beamWidth + 6;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(curEndX, curEndY);
        ctx.stroke();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = beamWidth;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(curEndX, curEndY);
        ctx.stroke();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(curEndX, curEndY);
        ctx.stroke();
    }

    drawPylon(ctx, x, y) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 6, y - 8, 12, 16);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 6, y - 8, 12, 16);

        ctx.fillStyle = this.isActive ? '#ef4444' : '#475569';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

window.GameObstacles = {
    Utils,
    Crate,
    KeyItem,
    FlyingKeyParticle,
    SwitchLever,
    BridgeBlock,
    GateDoor,
    ExitDoor,
    SpikeTrap,
    PressurePlate,
    RotatingMace,
    LavaPit,
    PuzzlePedestal,
    EnemySentinel,
    LaserTrap
};
