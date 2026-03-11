/**
 * particle.js — Bird Fluid · 3D Boid + Mouse Camera Orbit
 *
 * 滑鼠移動 → 相機 yaw/pitch 旋轉（3D 視角）
 * 每隻鳥有獨立漫遊力（wander steering），飛行更隨意
 * Boid flocking 在 3D 空間運算
 * 右下角 HUD + Blob-tracking 框
 */

(function () {
    'use strict';

    /* ────────────────────────────────────────────
       CONFIG
    ──────────────────────────────────────────── */
    const isMobile = /iPhone|iPod|Android/i.test(navigator.userAgent);

    const CFG = {
        count: isMobile ? 35 : 80, // Reduced count for clarity
        maxSpeed: isMobile ? 1.6 : 2.2,
        maxForce: 0.04,
        worldR: isMobile ? 300 : 450,
        sepWeight: 2.0,
        aliWeight: 0.8,
        cohWeight: 0.5,
        wanderWeight: 0.4,
        wanderSpeed: 0.04,
        sepRadius: 50,
        aliRadius: 100,
        cohRadius: 100,
        fov: 300,
        camSmooth: 0.015,
        camMaxX: 1,    // Increased pitch range
        camMaxY: 3.5,    // Increased yaw range
        blobRadius: 100,
        blobRepelSS: 1.5,
        trailLen: 12,
        birdColor: 'rgba(200, 238, 96, 0.5)', // Boosted visibility
        trailColor: 'rgba(200, 238, 96, 0.25)',
        wingSpan: isMobile ? 4 : 6,
    };

    /* ────────────────────────────────────────────
       DOM
    ──────────────────────────────────────────── */
    const section = document.getElementById('view-home');
    if (!section) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'bird-canvas';
    canvas.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    section.insertBefore(canvas, section.firstChild);

    const ctx = canvas.getContext('2d');

    /* ────────────────────────────────────────────
       MOUSE / TOUCH
    ──────────────────────────────────────────── */
    // Normalised mouse (-1 … +1) within section
    let normX = 0, normY = 0, mouseInside = false;
    // Actual screen position for blob
    let screenMX = -9999, screenMY = -9999;

    function trackMouse(clientX, clientY) {
        const r = canvas.getBoundingClientRect();
        screenMX = clientX - r.left;
        screenMY = clientY - r.top;
        normX = (screenMX / W) * 2 - 1;   // -1 … 1
        normY = (screenMY / H) * 2 - 1;
        mouseInside = true;
    }

    section.addEventListener('mousemove', e => trackMouse(e.clientX, e.clientY));
    section.addEventListener('mouseleave', () => { mouseInside = false; });
    section.addEventListener('touchmove', e => {
        e.preventDefault();
        trackMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    section.addEventListener('touchend', () => { mouseInside = false; });

    /* ────────────────────────────────────────────
       CAMERA STATE
    ──────────────────────────────────────────── */
    let camRotX = 0.18, camRotY = 0.0;     // current camera angles (rad)
    let tgtRotX = 0.18, tgtRotY = 0.0;     // target (driven by mouse)

    // Cached trig functions for projection (Huge performance boost)
    let camCy = Math.cos(0), camSy = Math.sin(0);
    let camCx = Math.cos(0.18), camSx = Math.sin(0.18);

    function updateCamera() {
        if (mouseInside) {
            tgtRotY = normX * CFG.camMaxY;
            tgtRotX = -normY * CFG.camMaxX;
        }
        camRotX += (tgtRotX - camRotX) * CFG.camSmooth;
        camRotY += (tgtRotY - camRotY) * CFG.camSmooth;

        // Cache trigonometric values once per frame!
        camCy = Math.cos(camRotY);
        camSy = Math.sin(camRotY);
        camCx = Math.cos(camRotX);
        camSx = Math.sin(camRotX);
    }

    /* 3-D → screen projection */
    function project(x3, y3, z3) {
        // rotate Y (yaw)
        const rx = x3 * camCy + z3 * camSy;
        const rz = -x3 * camSy + z3 * camCy;
        // rotate X (pitch)
        const ry = y3 * camCx - rz * camSx;
        const rz2 = y3 * camSx + rz * camCx;
        // perspective
        const depth = CFG.fov / (CFG.fov + rz2 + CFG.worldR * 0.6);
        return {
            sx: W / 2 + rx * depth,
            sy: H / 2 + ry * depth,
            depth,          // used for wing size scale
            rz: rz2,
        };
    }

    /* ────────────────────────────────────────────
       BOID CLASS (3-D)
    ──────────────────────────────────────────── */
    class Boid {
        constructor() {
            const r = CFG.worldR;
            this.x = (Math.random() - 0.5) * r * 2;
            this.y = (Math.random() - 0.5) * r * 2;
            this.z = (Math.random() - 0.5) * r * 2;
            const spd = CFG.maxSpeed * (0.5 + Math.random() * 0.5);
            const th = Math.random() * Math.PI * 2;
            const ph = (Math.random() - 0.5) * Math.PI;
            this.vx = Math.cos(th) * Math.cos(ph) * spd;
            this.vy = Math.sin(ph) * spd;
            this.vz = Math.sin(th) * Math.cos(ph) * spd;
            // wander state
            this.wTh = Math.random() * Math.PI * 2; // wander azimuth
            this.wPh = (Math.random() - 0.5) * Math.PI; // wander elevation
            // trail: projected screen coords
            this.trail = [];
            // cached projection
            this.proj = null;
        }

        speed() {
            return Math.sqrt(this.vx * this.vx + this.vy * this.vy + this.vz * this.vz);
        }

        headingXZ() {
            return Math.atan2(this.vz, this.vx);
        }
    }

    /* ────────────────────────────────────────────
       3D TEXT SPHERE (CV Marquee)
    ──────────────────────────────────────────── */
    const TextSphere = {
        points: [],
        radius: 0,
        rotationY: 0,
        rotationX: 0,
        init() {
            this.points = [];
            this.radius = CFG.worldR * 1; // 放大球體

            // Extract CV strings from DOM
            const cvNodes = document.querySelectorAll('.cv-content.en .cv-detail');
            let strings = Array.from(cvNodes).map(n => n.textContent.trim().replace(/\s+/g, ' '));
            if (strings.length === 0) {
                strings = ["Visual Effect", "Sound Installation", "Audio-Visual", "Tech & Design", "Exhibition", "Performance", "New Media Art"];
            }

            const n = Math.min(Math.max(strings.length, 12), 24);
            const phi = Math.PI * (3 - Math.sqrt(5));
            for (let i = 0; i < n; i++) {
                const y = 1 - (i / (n - 1)) * 2;
                const r = Math.sqrt(1 - y * y);
                const theta = phi * i;

                const x = Math.cos(theta) * r;
                const z = Math.sin(theta) * r;

                // Offscreen canvas — 動態測量文字寬度避免裁切
                const text = strings[i % strings.length];
                const labelCanvas = document.createElement('canvas');
                const lCtx = labelCanvas.getContext('2d');
                const fontSize = 24;
                // 先量尺寸再設定 canvas 大小
                lCtx.font = `${fontSize}px "Kumbh Sans", "Noto Sans TC", sans-serif`;
                const textW = Math.ceil(lCtx.measureText(text).width);
                labelCanvas.width = textW + 24;  // padding
                labelCanvas.height = fontSize + 16;
                // canvas resize 後 context state 被清除，須重設 font
                lCtx.font = `${fontSize}px "Space Grotesk", "Noto Sans TC", sans-serif`;
                lCtx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // Dimmer, more recessed white
                lCtx.textAlign = 'center';
                lCtx.textBaseline = 'middle';
                lCtx.fillText(text, labelCanvas.width / 2, labelCanvas.height / 2);

                this.points.push({
                    ox: x * this.radius,
                    oy: y * this.radius,
                    oz: z * this.radius,
                    canvas: labelCanvas,
                    text: text
                });
            }
        },

        updateAndDraw(ctx, projectFunc, isMouseIn, mx, my) {
            const time = Date.now() * 0.001;
            this.rotationY = time * 0.2; // 轉慢一點配合變大的球體
            this.rotationX = Math.sin(time * 0.05) * 0.15;

            const cy = Math.cos(this.rotationY), sy = Math.sin(this.rotationY);
            const cx = Math.cos(this.rotationX), sx = Math.sin(this.rotationX);

            const renderedPoints = [];

            for (let p of this.points) {
                let ry = p.oy * cx - p.oz * sx;
                let rz = p.oy * sx + p.oz * cx;
                let rx = p.ox * cy + rz * sy;
                rz = -p.ox * sy + rz * cy;

                const proj = projectFunc(rx, ry, rz);
                if (proj && proj.depth > 0) {
                    renderedPoints.push({
                        ...proj,
                        canvas: p.canvas,
                        cw: p.canvas.width,
                        ch: p.canvas.height
                    });
                }
            }

            // painters algorithm: back to front
            renderedPoints.sort((a, b) => a.depth - b.depth);

            for (let rp of renderedPoints) {
                let alpha = Math.min(0.65, 0.05 + 0.35 * rp.depth);
                let scale = Math.max(0.1, rp.depth * 0.3);

                // Hover check
                if (isMouseIn) {
                    const dx = mx - rp.sx;
                    const dy = my - rp.sy;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    const hoverRadius = 60 * rp.depth;
                    if (d < hoverRadius) {
                        const factor = 1 - (d / hoverRadius);
                        scale += factor * 0.8;
                        alpha = Math.min(1.0, alpha + factor);
                    }
                }

                ctx.globalAlpha = alpha;
                ctx.save();
                ctx.translate(rp.sx, rp.sy);
                ctx.scale(scale, scale);
                ctx.drawImage(rp.canvas, -rp.cw / 2, -rp.ch / 2);
                ctx.restore();
            }
            ctx.globalAlpha = 1.0;
        }
    };

    /* ────────────────────────────────────────────
       FLOCK STATE
    ──────────────────────────────────────────── */
    let W = 0, H = 0;
    let boids = [];

    function initBoids() {
        boids = [];
        for (let i = 0; i < CFG.count; i++) boids.push(new Boid());

        // Init CV Text Sphere
        setTimeout(() => TextSphere.init(), 100); // 延遲確保 DOM 載入
    }

    /* ── vector helpers ── */
    function len3(x, y, z) { return Math.sqrt(x * x + y * y + z * z); }

    function limit3(x, y, z, max) {
        const m = len3(x, y, z);
        if (m > max && m > 0) { const s = max / m; return [x * s, y * s, z * s]; }
        return [x, y, z];
    }

    // steer toward direction in 3D
    function steer3(b, tx, ty, tz) {
        const m = len3(tx, ty, tz) || 1;
        tx = tx / m * CFG.maxSpeed - b.vx;
        ty = ty / m * CFG.maxSpeed - b.vy;
        tz = tz / m * CFG.maxSpeed - b.vz;
        return limit3(tx, ty, tz, CFG.maxForce);
    }

    /* ────────────────────────────────────────────
       UPDATE
    ──────────────────────────────────────────── */
    function updateBoids() {
        const sepR2 = CFG.sepRadius * CFG.sepRadius;
        const aliR2 = CFG.aliRadius * CFG.aliRadius;
        const cohR2 = CFG.cohRadius * CFG.cohRadius;
        const r = CFG.worldR;

        for (let i = 0; i < boids.length; i++) {
            const b = boids[i];

            /* project for trail */
            b.proj = project(b.x, b.y, b.z);
            b.trail.push({ sx: b.proj.sx, sy: b.proj.sy });
            if (b.trail.length > CFG.trailLen) b.trail.shift();

            /* ── Boid forces ── */
            let sx = 0, sy = 0, sz = 0, sepN = 0;
            let ax = 0, ay = 0, az = 0, aliN = 0;
            let cx3 = 0, cy3 = 0, cz3 = 0, cohN = 0;

            for (let j = 0; j < boids.length; j++) {
                if (i === j) continue;
                const o = boids[j];
                const dx = b.x - o.x, dy = b.y - o.y, dz = b.z - o.z;
                const d2 = dx * dx + dy * dy + dz * dz;

                if (d2 < sepR2 && d2 > 0) {
                    sx += dx / d2; sy += dy / d2; sz += dz / d2; sepN++;
                }
                if (d2 < aliR2) { ax += o.vx; ay += o.vy; az += o.vz; aliN++; }
                if (d2 < cohR2) { cx3 += o.x; cy3 += o.y; cz3 += o.z; cohN++; }
            }

            let fx = 0, fy = 0, fz = 0;

            if (sepN) {
                const [a, b2, c] = steer3(b, sx / sepN, sy / sepN, sz / sepN);
                fx += a * CFG.sepWeight; fy += b2 * CFG.sepWeight; fz += c * CFG.sepWeight;
            }
            if (aliN) {
                const [a, b2, c] = steer3(b, ax / aliN, ay / aliN, az / aliN);
                fx += a * CFG.aliWeight; fy += b2 * CFG.aliWeight; fz += c * CFG.aliWeight;
            }
            if (cohN) {
                const [a, b2, c] = steer3(b, cx3 / cohN - b.x, cy3 / cohN - b.y, cz3 / cohN - b.z);
                fx += a * CFG.cohWeight; fy += b2 * CFG.cohWeight; fz += c * CFG.cohWeight;
            }

            /* ── Wander force (randomly drifting target direction) ── */
            b.wTh += (Math.random() - 0.5) * CFG.wanderSpeed * 2.5;
            b.wPh += (Math.random() - 0.5) * CFG.wanderSpeed * 1.2;
            b.wPh = Math.max(-1.0, Math.min(1.0, b.wPh));

            // wander circle projected ahead of bird
            const spd = b.speed() || 0.1;
            const fwX = b.vx / spd, fwY = b.vy / spd, fwZ = b.vz / spd;
            const distAhead = 28;
            const circR = 18;
            // point on wander circle
            const wx = fwX * distAhead + Math.cos(b.wTh) * Math.cos(b.wPh) * circR - fwX * circR;
            const wy = fwY * distAhead + Math.sin(b.wPh) * circR - fwY * circR;
            const wz = fwZ * distAhead + Math.sin(b.wTh) * Math.cos(b.wPh) * circR - fwZ * circR;
            const [wa, wb2, wc] = steer3(b, wx, wy, wz);
            fx += wa * CFG.wanderWeight;
            fy += wb2 * CFG.wanderWeight;
            fz += wc * CFG.wanderWeight;

            /* ── mouse blob repulsion (screen space → 3D vector smash) ── */
            // Removed mouse blob repulsion logic as per instruction
            // if (mouseInside && b.proj) {
            //     const dsx = b.proj.sx - screenMX;
            //     const dsy = b.proj.sy - screenMY;
            //     const d2s = dsx * dsx + dsy * dsy;
            //     if (d2s < CFG.blobRadius * CFG.blobRadius && d2s > 0.1) {
            //         const ds = Math.sqrt(d2s);
            //         const f = CFG.blobRepelSS * (1 - ds / CFG.blobRadius);
            //         // push in screen direction, un-project roughly by dividing out depth
            //         const dep = b.proj.depth || 0.5;
            //         fx += (dsx / ds) * f / dep;
            //         fy += (dsy / ds) * f / dep;
            //     }
            // }

            /* ── integrate ── */
            b.vx += fx; b.vy += fy; b.vz += fz;
            [b.vx, b.vy, b.vz] = limit3(b.vx, b.vy, b.vz, CFG.maxSpeed);

            b.x += b.vx; b.y += b.vy; b.z += b.vz;

            // wrap in cube
            if (b.x > r) b.x -= r * 2; else if (b.x < -r) b.x += r * 2;
            if (b.y > r) b.y -= r * 2; else if (b.y < -r) b.y += r * 2;
            if (b.z > r) b.z -= r * 2; else if (b.z < -r) b.z += r * 2;
        }
    }

    /* ────────────────────────────────────────────
       RENDER
    ──────────────────────────────────────────── */
    // sort back-to-front for depth
    function sortBoids() {
        boids.sort((a, b2) => (a.proj ? a.proj.rz : 0) - (b2.proj ? b2.proj.rz : 0));
    }

    function drawTrail(b) {
        const t = b.trail;
        if (t.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(t[0].sx, t[0].sy);
        for (let i = 1; i < t.length; i++) ctx.lineTo(t[i].sx, t[i].sy);
        ctx.strokeStyle = CFG.trailColor;
        ctx.lineWidth = 0.9;
        ctx.stroke();
    }

    function drawBird(b) {
        const p = b.proj;
        if (!p) return;
        // depth cull: very far behind camera → skip
        if (p.depth < 0.05) return;

        // screen-space heading (project a point ahead of boid)
        const spd = b.speed() || 0.1;
        const aheadP = project(
            b.x + b.vx / spd * 8,
            b.y + b.vy / spd * 8,
            b.z + b.vz / spd * 8,
        );
        const ang = Math.atan2(aheadP.sy - p.sy, aheadP.sx - p.sx);
        const ws = CFG.wingSpan * p.depth * 1.8;
        const wa = 0.52; // Original wing angle
        const alpha = Math.min(1, p.depth * 1.4 + 0.3);

        ctx.strokeStyle = CFG.birdColor;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.2;

        // Original V-shape
        ctx.save();
        ctx.translate(p.sx, p.sy);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(-ws, -ws * Math.sin(wa));
        ctx.lineTo(0, 0);
        ctx.lineTo(-ws, ws * Math.sin(wa));
        ctx.stroke();
        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    /* ── blob tracking (screen space) ── */
    function drawBlob() {
        if (!mouseInside) return;
        const r = CFG.blobRadius;
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        const captured = [];

        for (const b of boids) {
            if (!b.proj) continue;
            const dx = b.proj.sx - screenMX, dy = b.proj.sy - screenMY;
            if (dx * dx + dy * dy < r * r) {
                if (b.proj.sx < minX) minX = b.proj.sx;
                if (b.proj.sx > maxX) maxX = b.proj.sx;
                if (b.proj.sy < minY) minY = b.proj.sy;
                if (b.proj.sy > maxY) maxY = b.proj.sy;
                captured.push(b);
            }
        }
        const count = captured.length;

        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -(Date.now() / 55) % 20;

        if (count === 0) {
            ctx.beginPath();
            ctx.arc(screenMX, screenMY, 26, 0, Math.PI * 2);
            ctx.strokeStyle = CFG.blobBorder;
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            const pad = 14;
            const bx = minX - pad, by2 = minY - pad;
            const bw = maxX - minX + pad * 2, bh = maxY - minY + pad * 2;

            ctx.beginPath();
            ctx.rect(bx, by2, bw, bh);
            ctx.fillStyle = CFG.blobBg;
            ctx.fill();
            ctx.strokeStyle = CFG.blobBorder;
            ctx.lineWidth = 1.1;
            ctx.stroke();

            // corner ticks
            ctx.setLineDash([]);
            ctx.lineDashOffset = 0;
            const tk = 8;
            ctx.lineWidth = 1.8;
            const corners = [
                [bx, by2, bx + tk, by2, bx, by2 + tk],
                [bx + bw, by2, bx + bw - tk, by2, bx + bw, by2 + tk],
                [bx, by2 + bh, bx + tk, by2 + bh, bx, by2 + bh - tk],
                [bx + bw, by2 + bh, bx + bw - tk, by2 + bh, bx + bw, by2 + bh - tk],
            ];
            for (const [x1, y1, x2, y2, x3, y3] of corners) {
                ctx.beginPath();
                ctx.moveTo(x2, y2); ctx.lineTo(x1, y1); ctx.lineTo(x3, y3);
                ctx.stroke();
            }
            ctx.font = '9px "Kumbh Sans", monospace';
            ctx.fillStyle = CFG.hudColor;
            ctx.textAlign = 'left';
        }

        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
    }

    /* ── HUD ── */
    function drawHUD() {
        if (window.innerWidth < 800) return; // 漢堡選單出現時（< 800px）隱藏 HUD
        // nearest projected bird to screen centre
        let best = boids[0];
        if (mouseInside && boids.length > 0) {
            let bestD2 = Infinity;
            for (const b of boids) {
                if (!b.proj) continue;
                const dx = b.proj.sx - screenMX, dy = b.proj.sy - screenMY;
                const d2 = dx * dx + dy * dy;
                if (d2 < bestD2) { bestD2 = d2; best = b; }
            }
        }
        if (!best || !best.proj) return;

        const p = best.proj;
        const lines = [
            `FPS  ${fps.toString().padStart(7)}`,
            `POS  ${best.x.toFixed(1).padStart(7)} , ${best.y.toFixed(1).padStart(7)} , ${best.z.toFixed(1).padStart(7)}`,
            `VEL  ${best.vx.toFixed(3).padStart(7)} , ${best.vy.toFixed(3).padStart(7)} , ${best.vz.toFixed(3).padStart(7)}`,
            `SPD  ${best.speed().toFixed(3).padStart(7)}`,
            `HDG  ${(best.headingXZ() * 180 / Math.PI).toFixed(1).padStart(7)}°`,
            `CAM  Y:${(camRotY * 180 / Math.PI).toFixed(1).padStart(6)}° X:${(camRotX * 180 / Math.PI).toFixed(1).padStart(6)}°`,
        ];

        const fSize = isMobile ? 8 : 9;
        const lh = fSize + 5;
        const padX = 10, padY = 8;
        const boxW = isMobile ? 195 : 240;
        const boxH = lines.length * lh + padY * 2;
        const bx = W - boxW - 14;
        const by = H - boxH - 14;

        ctx.fillStyle = CFG.hudBg;
        ctx.fillRect(bx, by, boxW, boxH);
        ctx.strokeStyle = 'rgba(217,255,130,0.28)';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(bx, by, boxW, boxH);

        ctx.font = `${fSize}px "Kumbh Sans", monospace`;
        ctx.fillStyle = CFG.hudColor;
        ctx.textAlign = 'left';
        lines.forEach((l, i) => ctx.fillText(l, bx + padX, by + padY + fSize + i * lh));

        // crosshair dot on the tracked bird
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = CFG.blobBorder;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(p.sx - 8, p.sy); ctx.lineTo(p.sx + 8, p.sy);
        ctx.moveTo(p.sx, p.sy - 8); ctx.lineTo(p.sx, p.sy + 8);
        ctx.strokeStyle = CFG.blobBorder;
        ctx.lineWidth = 0.8;
        ctx.stroke();
    }
    /* ── 3D World Grid (XZ plane at y=worldR*0.85) ── */
    function drawGrid() {
        const r = CFG.worldR;
        const ext = r * 2.2;
        const y = r * 0.85;
        const step = r / 5; // 適度平衡密度與效能 (原 r/8 切太碎導致幾千條線)

        ctx.lineWidth = 0.5;

        // Path Batching: instead of thousands of stroke() calls, bucket by alpha
        const buckets = new Map();

        function addLine(x1, z1, x2, z2) {
            const p1 = project(x1, y, z1);
            const p2 = project(x2, y, z2);
            if (p1.depth > 0.05 && p2.depth > 0.05) {
                const alpha = Math.min(0.4, 0.1 + 0.15 * (p1.depth + p2.depth));
                // 15 levels of transparency is visually smooth but reduces draw calls
                const key = Math.round(alpha * 30);
                if (!buckets.has(key)) buckets.set(key, { alpha, lines: [] });
                buckets.get(key).lines.push(p1.sx, p1.sy, p2.sx, p2.sy);
            }
        }

        // 收集線段
        for (let x = -ext; x <= ext + 0.01; x += step) {
            for (let z = -ext; z < ext - 0.01; z += step) {
                addLine(x, z, x, z + step);
            }
        }
        for (let z = -ext; z <= ext + 0.01; z += step) {
            for (let x = -ext; x < ext - 0.01; x += step) {
                addLine(x, z, x + step, z);
            }
        }

        // 批次繪製 (減低 Canvas overhead 95%)
        for (const bucket of buckets.values()) {
            ctx.beginPath();
            const arr = bucket.lines;
            for (let i = 0; i < arr.length; i += 4) {
                ctx.moveTo(arr[i], arr[i + 1]);
                ctx.lineTo(arr[i + 2], arr[i + 3]);
            }
            ctx.strokeStyle = `rgba(217,255,130,${bucket.alpha.toFixed(2)})`;
            ctx.stroke();
        }

        /* ── Y Axis (green line piercing through grid) ── */
        ctx.lineWidth = 1.0;
        const yExt = r * 5; // 貫穿上下
        const yStep = r / 4;
        for (let iy = -yExt; iy < yExt; iy += yStep) {
            const p1 = project(0, y + iy, 0);
            const p2 = project(0, y + iy + yStep, 0);
            if (p1.depth > 0.05 && p2.depth > 0.05) {
                const alpha = Math.min(0.7, 0.2 + 0.2 * (p1.depth + p2.depth));
                ctx.beginPath();
                ctx.moveTo(p1.sx, p1.sy);
                ctx.lineTo(p2.sx, p2.sy);
                ctx.strokeStyle = `rgba(80,255,120,${alpha.toFixed(2)})`;
                ctx.stroke();
            }
        }

        /* ── X Axis (red line piercing through grid) ── */
        for (let ix = -yExt; ix < yExt; ix += yStep) {
            const p1 = project(ix, y, 0);
            const p2 = project(ix + yStep, y, 0);
            if (p1.depth > 0.05 && p2.depth > 0.05) {
                const alpha = Math.min(0.7, 0.2 + 0.2 * (p1.depth + p2.depth));
                ctx.beginPath();
                ctx.moveTo(p1.sx, p1.sy);
                ctx.lineTo(p2.sx, p2.sy);
                ctx.strokeStyle = `rgba(255,80,80,${alpha.toFixed(2)})`;
                ctx.stroke();
            }
        }

        /* ── Z Axis (blue line piercing through grid) ── */
        for (let iz = -yExt; iz < yExt; iz += yStep) {
            const p1 = project(0, y, iz);
            const p2 = project(0, y, iz + yStep);
            if (p1.depth > 0.05 && p2.depth > 0.05) {
                const alpha = Math.min(0.7, 0.2 + 0.2 * (p1.depth + p2.depth));
                ctx.beginPath();
                ctx.moveTo(p1.sx, p1.sy);
                ctx.lineTo(p2.sx, p2.sy);
                ctx.strokeStyle = `rgba(80,140,255,${alpha.toFixed(2)})`;
                ctx.stroke();
            }
        }
    }

    /* ────────────────────────────────────────────
       MAIN LOOP
    ──────────────────────────────────────────── */
    let rafId = null, running = false;
    let fps = 0, frames = 0, lastFpsTime = 0;

    function draw() {
        const now = performance.now();
        frames++;
        if (now - lastFpsTime >= 1000) {
            fps = Math.round((frames * 1000) / (now - lastFpsTime));
            frames = 0;
            lastFpsTime = now;
        }

        ctx.clearRect(0, 0, W, H);

        updateCamera();
        updateBoids();
        sortBoids();

        drawGrid();

        // TextSphere only
        TextSphere.updateAndDraw(ctx, project, mouseInside, screenMX, screenMY);

        for (const b of boids) drawTrail(b);
        for (const b of boids) drawBird(b);

        rafId = requestAnimationFrame(draw);
    }

    /* ────────────────────────────────────────────
       RESIZE
    ──────────────────────────────────────────── */
    function resize() {
        W = section.offsetWidth;
        H = section.offsetHeight;
        canvas.width = W;
        canvas.height = H;
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 120);
    });

    /* ────────────────────────────────────────────
       PUBLIC API
    ──────────────────────────────────────────── */
    function start() {
        if (running) return;
        running = true;
        resize();
        initBoids();
        draw();
    }

    function stop() {
        if (!running) return;
        running = false;
        cancelAnimationFrame(rafId);
        rafId = null;
    }

    window.ParticleField = { start, stop };

})();
