/**
 * Animation 2: Pulse Engine
 * - Official E-Cell emblem centred and undistorted
 * - Soft, controlled breathing pulse of light behind the emblem
 * - Harmonious dual-tone green (#00C853) & blue (#0072FF) halo
 * - Gentle radiating energy wavefronts / rings
 * - Reactive micro-stardust particles responding to pulse waves
 * - Clean lifecycle management (stop, destroy, remove listeners)
 */

import { BRAND } from '../../shared/brand.js';

export const TIMING_PULSE = {
  introEnd: 1200,     // 0 - 1.2s: Emblem awakens with initial breath
  wordmarkEnd: 2200,  // 1.2 - 2.2s: Wordmark reveals
  taglineEnd: 3200,   // 2.2 - 3.2s: Tagline reveals
  holdStart: 3200     // 3.2s+: Continuous breathing pulse hold
};

export class PulseEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.callbacks = callbacks;

    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.centerX = 0;
    this.centerY = 0;
    this.emblemRadius = 110;
    this.logoScale = 1;

    this.startTime = 0;
    this.elapsed = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.tempo = 1.0;
    this.reducedMotion = false;

    this.rafId = null;
    this.emblemImage = null;
    this.emblemDimensions = null;
    this.emblemAlpha = 0;

    // Pulse Wavefront Rings
    this.wavefronts = [];
    this.lastWaveSpawn = 0;

    // Reactive Stardust Particles
    this.stardust = [];

    // Interactive mouse coordinates
    this.mouse = { x: -9999, y: -9999, active: false };

    this.boundListeners = {};
    this.initMouseListeners();
  }

  initMouseListeners() {
    this.boundListeners.onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * this.dpr;
      this.mouse.y = (e.clientY - rect.top) * this.dpr;
      this.mouse.active = true;
    };

    this.boundListeners.onMouseLeave = () => {
      this.mouse.active = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    };

    this.canvas.addEventListener('mousemove', this.boundListeners.onMouseMove);
    this.canvas.addEventListener('mouseleave', this.boundListeners.onMouseLeave);
  }

  removeMouseListeners() {
    if (this.boundListeners.onMouseMove) {
      this.canvas.removeEventListener('mousemove', this.boundListeners.onMouseMove);
      this.canvas.removeEventListener('mouseleave', this.boundListeners.onMouseLeave);
    }
  }

  resize() {
    const parent = this.canvas.parentElement;
    const displayWidth = parent?.clientWidth || window.innerWidth;
    const displayHeight = parent?.clientHeight || window.innerHeight;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.width = Math.round(displayWidth * this.dpr);
    this.height = Math.round(displayHeight * this.dpr);

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.centerX = this.width / 2;
    const isMobile = displayWidth < 640;
    const emblemOffset = isMobile ? 48 * this.dpr : 62 * this.dpr;
    this.centerY = this.height / 2 - emblemOffset;

    const targetEmblemDiameter = Math.min(displayWidth * 0.44, isMobile ? 180 : 215);
    this.emblemRadius = (targetEmblemDiameter / 2) * this.dpr;

    if (this.emblemDimensions && this.emblemDimensions.width > 0) {
      this.logoScale = (targetEmblemDiameter * this.dpr) / this.emblemDimensions.width;
    }

    this.initStardust();
  }

  initStardust() {
    this.stardust = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = (this.emblemRadius * 0.9) + Math.random() * (Math.max(this.width, this.height) * 0.45);
      this.stardust.push({
        baseX: this.centerX + Math.cos(angle) * dist,
        baseY: this.centerY + Math.sin(angle) * dist,
        x: this.centerX + Math.cos(angle) * dist,
        y: this.centerY + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: (0.75 + Math.random() * 1.35) * this.dpr,
        color: Math.random() > 0.5 ? BRAND.colors.green : BRAND.colors.blue,
        alpha: 0.15 + Math.random() * 0.25,
        driftSpeed: (0.15 + Math.random() * 0.25) * this.dpr,
        driftAngle: Math.random() * Math.PI * 2
      });
    }
  }

  setEmblem(imageObj) {
    this.emblemImage = imageObj;
    const nw = imageObj.naturalWidth || imageObj.width || 500;
    const nh = imageObj.naturalHeight || imageObj.height || 286;
    this.emblemDimensions = { width: nw, height: nh };

    const displayWidth = this.canvas.parentElement?.clientWidth || window.innerWidth;
    const isMobile = displayWidth < 640;
    const targetEmblemDiameter = Math.min(displayWidth * 0.44, isMobile ? 180 : 215);
    this.logoScale = (targetEmblemDiameter * this.dpr) / nw;
  }

  start() {
    this.startTime = performance.now();
    this.elapsed = 0;
    this.isRunning = true;
    this.isPaused = false;
    this.wavefronts = [];
    this.lastWaveSpawn = 0;
    this.emblemAlpha = 0;

    this.callbacks.onPhaseChange?.('intro', 0);

    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.loop = this.loop.bind(this);
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy() {
    this.stop();
    this.removeMouseListeners();
    this.stardust = [];
    this.wavefronts = [];
  }

  setTempo(multiplier) {
    this.tempo = Math.max(0.4, Math.min(2.5, multiplier));
  }

  setReducedMotion(enabled) {
    this.reducedMotion = enabled;
    if (enabled) {
      this.emblemAlpha = 1;
      this.render();
    }
  }

  loop(currentTime) {
    if (!this.isRunning || this.isPaused) return;

    if (this.reducedMotion) {
      this.render();
      return;
    }

    this.elapsed = (currentTime - this.startTime) * this.tempo;
    this.update(this.elapsed);
    this.render();

    this.rafId = requestAnimationFrame(this.loop);
  }

  update(elapsed) {
    // 1. Phased reveals
    if (elapsed < TIMING_PULSE.introEnd) {
      this.emblemAlpha = Math.min(1.0, elapsed / 800);
      this.callbacks.onPhaseChange?.('intro', elapsed);
    } else if (elapsed < TIMING_PULSE.wordmarkEnd) {
      this.emblemAlpha = 1.0;
      this.callbacks.onPhaseChange?.('wordmark', elapsed);
    } else if (elapsed < TIMING_PULSE.taglineEnd) {
      this.emblemAlpha = 1.0;
      this.callbacks.onPhaseChange?.('tagline', elapsed);
    } else {
      this.emblemAlpha = 1.0;
      this.callbacks.onPhaseChange?.('hold', elapsed);
    }

    // 2. Spawn gentle acoustic wavefronts at periodic intervals
    // Cycle every ~2.4 seconds
    const waveCycle = 2400;
    if (elapsed - this.lastWaveSpawn > waveCycle) {
      this.lastWaveSpawn = elapsed;
      this.wavefronts.push({
        born: elapsed,
        radius: this.emblemRadius * 0.95,
        maxRadius: this.emblemRadius * 2.8,
        speed: 0.085 * this.dpr
      });
    }

    // Update existing wavefronts
    for (let i = this.wavefronts.length - 1; i >= 0; i--) {
      const w = this.wavefronts[i];
      const age = Math.max(0, elapsed - w.born);
      w.radius = Math.max(0.1, this.emblemRadius * 0.95 + age * (0.075 * this.dpr));
      if (w.radius > w.maxRadius) {
        this.wavefronts.splice(i, 1);
      }
    }

    // 3. Update stardust particles (gentle drift + pulse response)
    for (const p of this.stardust) {
      p.driftAngle += 0.01;
      p.x += Math.cos(p.driftAngle) * p.driftSpeed * 0.25 + p.vx;
      p.y += Math.sin(p.driftAngle) * p.driftSpeed * 0.25 + p.vy;

      // Soft damping
      p.vx *= 0.94;
      p.vy *= 0.94;

      // Check distance from expanding wavefronts
      const dx = p.x - this.centerX;
      const dy = p.y - this.centerY;
      const dist = Math.hypot(dx, dy);

      for (const w of this.wavefronts) {
        const ringDiff = Math.abs(dist - w.radius);
        if (ringDiff < 20 * this.dpr) {
          // Gentle push in radial direction
          const push = (1 - ringDiff / (20 * this.dpr)) * 0.8 * this.dpr;
          p.vx += (dx / (dist || 1)) * push;
          p.vy += (dy / (dist || 1)) * push;
        }
      }
    }
  }

  render() {
    const ctx = this.ctx;

    // 1. Deep cinematic blue radial background
    const bgGrad = ctx.createRadialGradient(
      this.centerX, this.centerY, 10,
      this.centerX, this.centerY, Math.max(this.width, this.height) * 0.72
    );
    bgGrad.addColorStop(0, '#101B30');
    bgGrad.addColorStop(0.65, '#0B1220');
    bgGrad.addColorStop(1, '#070B14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Calculate breathing pulse factor (Smooth sine breathing curve)
    // 1 complete breath every 2.4s
    const breathPhase = (this.elapsed * 0.0026) % (Math.PI * 2);
    const breath = Math.sin(breathPhase) * 0.5 + 0.5; // 0.0 -> 1.0 -> 0.0
    const pulseScale = 1.0 + breath * 0.32; // Glow expands up to 1.32x
    const pulseOpacity = 0.55 + breath * 0.35; // 0.55 -> 0.90

    // 3. Radiating Concentric Wavefront Rings (Behind emblem)
    ctx.save();
    for (const w of this.wavefronts) {
      if (!w.radius || w.radius <= 0) continue;
      const progress = Math.max(0, Math.min(1, (w.radius - this.emblemRadius * 0.95) / (w.maxRadius - this.emblemRadius * 0.95)));
      const ringAlpha = Math.sin(progress * Math.PI) * 0.18;
      const safeRadius = Math.max(0.1, w.radius);

      ctx.strokeStyle = `rgba(0, 200, 83, ${ringAlpha * 0.5})`;
      ctx.lineWidth = 1.5 * this.dpr;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY - this.emblemRadius * 0.15, safeRadius, Math.PI, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(0, 114, 255, ${ringAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY + this.emblemRadius * 0.15, safeRadius, 0, Math.PI);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Soft Breathing Pulse Halo (Dual Green & Blue auras behind emblem)
    ctx.save();
    const glowRadius = this.emblemRadius * 1.75 * pulseScale;

    // Upper Green Breathing Aura
    const greenAura = ctx.createRadialGradient(
      this.centerX, this.centerY - this.emblemRadius * 0.32, 10,
      this.centerX, this.centerY - this.emblemRadius * 0.32, glowRadius
    );
    greenAura.addColorStop(0, `rgba(0, 200, 83, ${0.36 * pulseOpacity})`);
    greenAura.addColorStop(0.55, `rgba(0, 200, 83, ${0.10 * pulseOpacity})`);
    greenAura.addColorStop(1, 'rgba(11, 18, 32, 0)');
    ctx.fillStyle = greenAura;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY - this.emblemRadius * 0.32, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Lower Blue Breathing Aura
    const blueAura = ctx.createRadialGradient(
      this.centerX, this.centerY + this.emblemRadius * 0.32, 10,
      this.centerX, this.centerY + this.emblemRadius * 0.32, glowRadius
    );
    blueAura.addColorStop(0, `rgba(0, 114, 255, ${0.36 * pulseOpacity})`);
    blueAura.addColorStop(0.55, `rgba(0, 114, 255, ${0.10 * pulseOpacity})`);
    blueAura.addColorStop(1, 'rgba(11, 18, 32, 0)');
    ctx.fillStyle = blueAura;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY + this.emblemRadius * 0.32, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle Radiant Floor Pool beneath emblem
    const floorGrad = ctx.createRadialGradient(
      this.centerX, this.centerY + this.emblemRadius * 0.95, 0,
      this.centerX, this.centerY + this.emblemRadius * 0.95, glowRadius * 1.15
    );
    floorGrad.addColorStop(0, `rgba(18, 59, 112, ${0.5 * pulseOpacity})`);
    floorGrad.addColorStop(0.5, `rgba(0, 114, 255, ${0.12 * pulseOpacity})`);
    floorGrad.addColorStop(1, 'rgba(11, 18, 32, 0)');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.ellipse(this.centerX, this.centerY + this.emblemRadius * 0.95, glowRadius * 1.1, glowRadius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 5. Reactive Stardust Micro-particles
    for (const p of this.stardust) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * (0.8 + breath * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Official Emblem — Kept perfectly sharp, stable, and undistorted
    if (this.emblemImage && this.emblemDimensions && this.emblemAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = this.emblemAlpha;

      const imgW = this.emblemDimensions.width * this.logoScale;
      const imgH = this.emblemDimensions.height * this.logoScale;

      ctx.drawImage(
        this.emblemImage,
        this.centerX - imgW / 2,
        this.centerY - imgH / 2,
        imgW,
        imgH
      );
      ctx.restore();
    }

    ctx.globalAlpha = 1.0;
  }
}
