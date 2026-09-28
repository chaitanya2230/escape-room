/**
 * Escape The Rooms - Smooth Camera System
 * Smoothly tracks the player with customizable lerp, deadzone, screen shake,
 * bounds clamping, and viewport culling for large 10-level maps.
 */

class Camera {
    constructor(viewportWidth = 864, viewportHeight = 576) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;

        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;

        this.worldWidth = viewportWidth;
        this.worldHeight = viewportHeight;

        this.lerpSpeed = 5.0; // Smooth camera follow speed
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.shakeEnabled = true;

        try {
            const savedShake = localStorage.getItem('etr_camera_shake');
            if (savedShake !== null) this.shakeEnabled = savedShake === 'true';
        } catch (e) {}
    }

    setBounds(worldWidth, worldHeight) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    jumpTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.x = this.clampX(x - this.viewportWidth / 2);
        this.y = this.clampY(y - this.viewportHeight / 2);
    }

    triggerShake(duration = 0.3, intensity = 7) {
        if (!this.shakeEnabled) return;
        this.shakeTimer = duration;
        this.shakeIntensity = intensity;
    }

    update(dt) {
        // Smooth lerp towards center of player
        const desiredX = this.targetX - this.viewportWidth / 2;
        const desiredY = this.targetY - this.viewportHeight / 2;

        const clampedTargetX = this.clampX(desiredX);
        const clampedTargetY = this.clampY(desiredY);

        this.x += (clampedTargetX - this.x) * Math.min(1, this.lerpSpeed * dt);
        this.y += (clampedTargetY - this.y) * Math.min(1, this.lerpSpeed * dt);

        // Screen shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            const progress = this.shakeTimer / 0.3;
            const curIntensity = this.shakeIntensity * progress;
            this.shakeOffsetX = (Math.random() - 0.5) * curIntensity * 2;
            this.shakeOffsetY = (Math.random() - 0.5) * curIntensity * 2;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }

    clampX(x) {
        if (this.worldWidth <= this.viewportWidth) {
            return (this.worldWidth - this.viewportWidth) / 2;
        }
        return Math.max(0, Math.min(x, this.worldWidth - this.viewportWidth));
    }

    clampY(y) {
        if (this.worldHeight <= this.viewportHeight) {
            return (this.worldHeight - this.viewportHeight) / 2;
        }
        return Math.max(0, Math.min(y, this.worldHeight - this.viewportHeight));
    }

    applyTransform(ctx) {
        const renderX = Math.round(this.x + this.shakeOffsetX);
        const renderY = Math.round(this.y + this.shakeOffsetY);
        ctx.translate(-renderX, -renderY);
    }

    // Viewport culling helper for 60FPS on large maps
    isInView(objX, objY, width = 48, height = 48, margin = 64) {
        const left = this.x - margin;
        const right = this.x + this.viewportWidth + margin;
        const top = this.y - margin;
        const bottom = this.y + this.viewportHeight + margin;

        return (
            objX + width >= left &&
            objX <= right &&
            objY + height >= top &&
            objY <= bottom
        );
    }

    worldToScreen(wx, wy) {
        return {
            x: wx - this.x,
            y: wy - this.y
        };
    }

    screenToWorld(sx, sy) {
        return {
            x: sx + this.x,
            y: sy + this.y
        };
    }
}

window.Camera = Camera;
