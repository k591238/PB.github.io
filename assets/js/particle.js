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
        count: isMobile ? 60 : 100,
        maxSpeed: isMobile ? 2.0 : 2.6,
        maxForce: 0.055,
        // world half-size (boids wrap in a cube)
        worldR: isMobile ? 300 : 420,
        // Boid weights
        sepWeight: 1.7,
        aliWeight: 1.0,
        cohWeight: 0.85,
        wanderWeight: 0.55,   // random wander power
        wanderSpeed: 0.055,  // how fast wander angle drifts per frame
        // Perception radii
        sepRadius: 40,
        aliRadius: 85,
        cohRadius: 85,
        // Camera
        fov: 350,    // perspective focal length (px)
        camSmooth: 0.015,  // lerp speed of camera toward mouse target
        camMaxX: 0.65,   // max pitch (rad)
        camMaxY: Math.PI,// max yaw (rad, full 360 possible)
        // Mouse blob (screen-space)
        blobRadius: isMobile ? 90 : 130,
        blobRepelSS: 2.2,    // screen-space repulsion strength
        // Trail
        trailLen: 20,
        // Colors
        birdColor: '#d9ff82',
        trailColor: 'rgba(217,255,130,0.22)',
        blobBg: 'rgba(217,255,130,0.08)',
        blobBorder: 'rgba(217,255,130,0.55)',
        hudColor: 'rgba(217,255,130,0.75)',
        hudBg: 'rgba(10,14,8,0.75)',
        // Wing
        wingSpan: isMobile ? 5 : 7,
        wingAngle: 0.52,
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

    function updateCamera() {
        if (mouseInside) {
            tgtRotY = normX * CFG.camMaxY;
            tgtRotX = -normY * CFG.camMaxX;
        }
        camRotX += (tgtRotX - camRotX) * CFG.camSmooth;
        camRotY += (tgtRotY - camRotY) * CFG.camSmooth;
    }

    /* 3-D → screen projection */
    function project(x3, y3, z3) {
        // rotate Y (yaw)
        const cy = Math.cos(camRotY), sy = Math.sin(camRotY);
        const rx = x3 * cy + z3 * sy;
        const rz = -x3 * sy + z3 * cy;
        // rotate X (pitch)
        const cx2 = Math.cos(camRotX), sx2 = Math.sin(camRotX);
        const ry = y3 * cx2 - rz * sx2;
        const rz2 = y3 * sx2 + rz * cx2;
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
       FLOCK STATE
    ──────────────────────────────────────────── */
    let W = 0, H = 0;
    let boids = [];

    function initBoids() {
        boids = [];
        for (let i = 0; i < CFG.count; i++) boids.push(new Boid());
    }

    /* ── vector helpers ── */
    function len3(x, y, z) { return Math.sqrt(x * x + y * y + z * z); }

    function limit3(x, y, z, max) {
        const m = len3(x, y, z);
        if (m > max && m > 0) { const s = max / m; return [x * s, y * s, z * s]; }
        return [x, y, z];
    }

    function setMag3(x, y, z, mag) {
        const m = len3(x, y, z) || 1;
        return [x * m / m * mag / m * m, y / m * mag, z / m * mag];
        // simplified:
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
            if (mouseInside && b.proj) {
                const dsx = b.proj.sx - screenMX;
                const dsy = b.proj.sy - screenMY;
                const d2s = dsx * dsx + dsy * dsy;
                if (d2s < CFG.blobRadius * CFG.blobRadius && d2s > 0.1) {
                    const ds = Math.sqrt(d2s);
                    const f = CFG.blobRepelSS * (1 - ds / CFG.blobRadius);
                    // push in screen direction, un-project roughly by dividing out depth
                    const dep = b.proj.depth || 0.5;
                    fx += (dsx / ds) * f / dep;
                    fy += (dsy / ds) * f / dep;
                }
            }

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
        const wa = CFG.wingAngle;
        const alpha = Math.min(1, p.depth * 1.4 + 0.3);

        const lx = p.sx + Math.cos(ang + Math.PI - wa) * ws;
        const ly = p.sy + Math.sin(ang + Math.PI - wa) * ws;
        const rx = p.sx + Math.cos(ang + Math.PI + wa) * ws;
        const ry = p.sy + Math.sin(ang + Math.PI + wa) * ws;

        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(p.sx, p.sy);
        ctx.lineTo(rx, ry);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = CFG.birdColor;
        ctx.lineWidth = 1.2 * p.depth + 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    /* ── blob tracking (screen space) ── */
    function drawBlob() {
        if (!mouseInside) return;
        const r = CFG.blobRadius;
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let count = 0;

        for (const b of boids) {
            if (!b.proj) continue;
            const dx = b.proj.sx - screenMX, dy = b.proj.sy - screenMY;
            if (dx * dx + dy * dy < r * r) {
                if (b.proj.sx < minX) minX = b.proj.sx;
                if (b.proj.sx > maxX) maxX = b.proj.sx;
                if (b.proj.sy < minY) minY = b.proj.sy;
                if (b.proj.sy > maxY) maxY = b.proj.sy;
                count++;
            }
        }

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
            ctx.fillText(`n:${count}`, bx + 2, by2 - 4);
        }

        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
    }

    /* ── HUD ── */
    function drawHUD() {
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

    /* ────────────────────────────────────────────
       MAIN LOOP
    ──────────────────────────────────────────── */
    let rafId = null, running = false;

    function draw() {
        ctx.clearRect(0, 0, W, H);

        updateCamera();
        updateBoids();
        sortBoids();

        for (const b of boids) drawTrail(b);
        for (const b of boids) drawBird(b);

        drawBlob();
        drawHUD();

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
