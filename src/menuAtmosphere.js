/**
 * Escape The Rooms - Menu Atmosphere v3 (Ultra-Cinematic)
 * Features:
 * 1. Ambient rising golden embers & fire sparks
 * 2. Floating ancient mystical runes with gentle drift & glow
 * 3. Interactive mouse sparkles & dynamic lighting trails
 * 4. Keyboard navigation (Space/Enter to start game)
 * 5. Audio hover feedback triggers
 */
(function () {
    function initAtmosphere() {
        const canvas = document.getElementById('menu-particles-canvas');
        const menuScreen = document.getElementById('screen-main-menu');
        if (!canvas || !menuScreen) return;

        const ctx = canvas.getContext('2d');
        let W = canvas.width = window.innerWidth;
        let H = canvas.height = window.innerHeight;

        function handleResize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', handleResize);

        // 1. Rising Embers
        const EMBER_COUNT = 60;
        const embers = [];
        for (let i = 0; i < EMBER_COUNT; i++) {
            embers.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 16,
                vy: -(14 + Math.random() * 32),
                r: 0.8 + Math.random() * 2.4,
                color: Math.random() > 0.4 ? 'rgba(251,191,36,' : 'rgba(249,115,22,',
                alpha: 0.2 + Math.random() * 0.7,
                flicker: 1.2 + Math.random() * 3.0,
                t: Math.random() * Math.PI * 2
            });
        }

        // 2. Floating Ancient Mystical Runes
        const RUNES = ['᚛', '᚜', 'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᛃ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛞ', 'ᛟ', '✦', '✧', '◈', '◇', '🗝'];
        const RUNE_COUNT = 18;
        const runeParticles = [];
        for (let i = 0; i < RUNE_COUNT; i++) {
            runeParticles.push({
                char: RUNES[Math.floor(Math.random() * RUNES.length)],
                x: Math.random() * W,
                y: Math.random() * H,
                vy: -(6 + Math.random() * 12),
                vx: (Math.random() - 0.5) * 8,
                size: 11 + Math.random() * 14,
                rot: Math.random() * Math.PI * 2,
                vrot: (Math.random() - 0.5) * 0.015,
                alpha: 0.15 + Math.random() * 0.45,
                phase: Math.random() * Math.PI * 2
            });
        }

        // 3. Interactive Mouse Trail Sparkles
        const sparkPool = [];
        let mouseX = W / 2;
        let mouseY = H / 2;
        let mouseActive = false;

        window.addEventListener('mousemove', (e) => {
            if (menuScreen.classList.contains('hidden')) return;
            mouseX = e.clientX;
            mouseY = e.clientY;
            mouseActive = true;

            // Spawn 1-2 subtle sparks on movement
            if (sparkPool.length < 35 && Math.random() > 0.4) {
                sparkPool.push({
                    x: mouseX + (Math.random() - 0.5) * 16,
                    y: mouseY + (Math.random() - 0.5) * 16,
                    vx: (Math.random() - 0.5) * 30,
                    vy: (Math.random() - 0.5) * 30 - 10,
                    r: 1.0 + Math.random() * 2.0,
                    alpha: 0.85,
                    life: 1.0,
                    decay: 0.025 + Math.random() * 0.035
                });
            }
        });

        // 4. Keyboard navigation shortcut (Enter/Space to start)
        window.addEventListener('keydown', (e) => {
            if (menuScreen.classList.contains('hidden')) return;
            if (e.code === 'Space' || e.code === 'Enter') {
                const playBtn = document.getElementById('btn-play');
                if (playBtn && !e.repeat) {
                    e.preventDefault();
                    playBtn.click();
                }
            }
        });

        // 5. Button Hover Audio Feedback
        const interactiveBtns = menuScreen.querySelectorAll('button, .feature-pill');
        interactiveBtns.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (window.gameAudio && typeof window.gameAudio.playUiHover === 'function') {
                    window.gameAudio.playUiHover();
                }
            });
        });

        // Animation Loop
        let lastTime = performance.now();
        function renderAtmosphere(now) {
            requestAnimationFrame(renderAtmosphere);
            if (menuScreen.classList.contains('hidden')) return;

            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            ctx.clearRect(0, 0, W, H);

            // A. Draw & Update Embers
            for (let i = 0; i < embers.length; i++) {
                const p = embers[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.t += dt * p.flicker;

                if (p.y < -15) {
                    p.y = H + 15;
                    p.x = Math.random() * W;
                }
                if (p.x < -15) p.x = W + 15;
                if (p.x > W + 15) p.x = -15;

                const currentAlpha = Math.max(0.06, p.alpha * (0.6 + Math.sin(p.t) * 0.4));

                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color + currentAlpha + ')';
                ctx.shadowColor = '#f59e0b';
                ctx.shadowBlur = p.r * 6;
                ctx.fill();
                ctx.restore();
            }

            // B. Draw & Update Floating Runes
            ctx.save();
            ctx.font = '600 14px "Cinzel", serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < runeParticles.length; i++) {
                const r = runeParticles[i];
                r.y += r.vy * dt;
                r.x += r.vx * dt;
                r.rot += r.vrot;
                r.phase += dt * 1.5;

                if (r.y < -30) {
                    r.y = H + 30;
                    r.x = Math.random() * W;
                }
                if (r.x < -30) r.x = W + 30;
                if (r.x > W + 30) r.x = -30;

                const glowAlpha = Math.max(0.08, r.alpha * (0.65 + Math.sin(r.phase) * 0.35));

                ctx.save();
                ctx.translate(r.x, r.y);
                ctx.rotate(r.rot);
                ctx.font = `600 ${r.size}px "Cinzel Decorative", serif`;
                ctx.fillStyle = `rgba(253, 230, 138, ${glowAlpha})`;
                ctx.shadowColor = 'rgba(245, 158, 11, 0.75)';
                ctx.shadowBlur = 12;
                ctx.fillText(r.char, 0, 0);
                ctx.restore();
            }
            ctx.restore();

            // C. Draw & Update Mouse Sparks
            for (let i = sparkPool.length - 1; i >= 0; i--) {
                const s = sparkPool[i];
                s.x += s.vx * dt;
                s.y += s.vy * dt;
                s.life -= s.decay;

                if (s.life <= 0) {
                    sparkPool.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 235, 150, ${s.alpha * s.life})`;
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.restore();
            }
        }

        requestAnimationFrame(renderAtmosphere);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAtmosphere);
    } else {
        initAtmosphere();
    }
})();
