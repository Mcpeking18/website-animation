/**
 * Animation 1: Particle Convergence with Cinematic Glow
 * - Canvas 2D High-DPI simulation
 * - Damped spring convergence into official E-Cell emblem
 * - Ambient cinematic backdrop glow (dual green & blue soft bloom behind emblem)
 * - Luminous orbital particle trail around the emblem
 * - Subtle lens-flare / sparkle highlights on apex vertices
 * - Interactive cursor magnetic repulsion
 * - Clean lifecycle management (destroy, unbind listeners, cancel RAF)
 */

import { BRAND } from '../../shared/brand.js';

export const TIMING_A1 = {
  phaseAEnd: 900,   // 0.0s - 0.9s: Particles Arrive
  phaseBEnd: 2200,  // 0.9s - 2.2s: Logo Forms & Densifies
  phaseCEnd: 2800,  // 2.2s - 2.8s: Cinematic Glow & Orbital Trail
  phaseDEnd: 3400,  // 2.8s - 3.4s: Wordmark Reveals
  phaseEEnd: 4000,  // 3.4s - 4.0s: Tagline Reveals
  totalDuration: 4000 // 4.0s+: Final Composition Hold
};

export class ParticleGlowEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.callbacks = callbacks;

    this.particles = [];
    this.ambientParticles = [];
    this.sparkles = [];
    this.orbitalParticles = [];

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
    this.speedMultiplier = 1.0;
    this.reducedMotion = false;

    this.currentPhase = 'A';
    this.rafId = null;

    this.crispEmblemImage = null;
    this.contentDimensions = null;
    this.crispLogoAlpha = 0;
    this.cinematicGlowAlpha = 0;

    // Orbital trail angle & parameters
    this.orbitAngle = 0;

    this.mouse = {
      x: -9999,
      y: -9999,
      active: false,
      radius: 80
    };

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

    this.boundListeners.onTouchMove = (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = (e.touches[0].clientX - rect.left) * this.dpr;
        this.mouse.y = (e.touches[0].clientY - rect.top) * this.dpr;
        this.mouse.active = true;
      }
    };

    this.canvas.addEventListener('mousemove', this.boundListeners.onMouseMove);
    this.canvas.addEventListener('mouseleave', this.boundListeners.onMouseLeave);
    this.canvas.addEventListener('touchstart', this.boundListeners.onTouchMove, { passive: true });
    this.canvas.addEventListener('touchmove', this.boundListeners.onTouchMove, { passive: true });
    this.canvas.addEventListener('touchend', this.boundListeners.onMouseLeave);
  }

  removeMouseListeners() {
    if (this.boundListeners.onMouseMove) {
      this.canvas.removeEventListener('mousemove', this.boundListeners.onMouseMove);
      this.canvas.removeEventListener('mouseleave', this.boundListeners.onMouseLeave);
      this.canvas.removeEventListener('touchstart', this.boundListeners.onTouchMove);
      this.canvas.removeEventListener('touchmove', this.boundListeners.onTouchMove);
      this.canvas.removeEventListener('touchend', this.boundListeners.onMouseLeave);
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
    // Offset emblem slightly upward so wordmark & tagline sit in visual balance
    const isMobile = displayWidth < 640;
    const emblemOffset = isMobile ? 48 * this.dpr : 62 * this.dpr;
    this.centerY = this.height / 2 - emblemOffset;

    // Adapt scale to screen width
    const targetEmblemDiameter = Math.min(displayWidth * 0.46, isMobile ? 180 : 220);
    this.emblemRadius = (targetEmblemDiameter / 2) * this.dpr;

    if (this.contentDimensions && this.contentDimensions.width > 0) {
      this.logoScale = (targetEmblemDiameter * this.dpr) / this.contentDimensions.width;
      this.recalculateParticleTargets();
    }

    this.initAmbientParticles();
    this.initOrbitalTrail();
  }

  initAmbientParticles() {
    this.ambientParticles = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.35 * this.dpr,
        vy: (Math.random() - 0.5) * 0.35 * this.dpr,
        radius: (0.7 + Math.random() * 1.4) * this.dpr,
        color: Math.random() > 0.5 ? BRAND.colors.green : BRAND.colors.blue,
        alpha: 0.12 + Math.random() * 0.22,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  initOrbitalTrail() {
    // Elegant luminous particles forming an orbital trail around the emblem
    this.orbitalParticles = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      this.orbitalParticles.push({
        offsetAngle: (i / count) * Math.PI * 0.85, // Segmented arc
        distX: this.emblemRadius * 1.32,
        distY: this.emblemRadius * 0.88,
        tilt: -0.26, // Tilt angle in radians (~15 deg)
        baseRadius: (1.2 + (i / count) * 1.8) * this.dpr,
        color: i % 2 === 0 ? BRAND.colors.green : BRAND.colors.blue,
        alpha: (i / count) * 0.85 // Tail fades, head is brightest
      });
    }

    // Sparkle points on emblem tips
    this.sparkles = [
      { relX: 0, relY: -0.92, phase: 0 },
      { relX: -0.85, relY: -0.22, phase: 1.2 },
      { relX: 0.85, relY: -0.22, phase: 2.4 },
      { relX: -0.65, relY: 0.75, phase: 3.6 },
      { relX: 0.65, relY: 0.75, phase: 4.8 },
    ];
  }

  setTargetsFromImage(imageObj, step = 5) {
    this.crispEmblemImage = imageObj;

    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

    const nw = imageObj.naturalWidth || imageObj.width || 400;
    const nh = imageObj.naturalHeight || imageObj.height || 400;

    offCanvas.width = nw;
    offCanvas.height = nh;
    offCtx.drawImage(imageObj, 0, 0);

    const imgData = offCtx.getImageData(0, 0, nw, nh);
    const data = imgData.data;

    // Scan bounding box of non-transparent emblem pixels
    let minX = nw, maxX = 0, minY = nh, maxY = 0;
    for (let y = 0; y < nh; y += 2) {
      for (let x = 0; x < nw; x += 2) {
        const a = data[(y * nw + x) * 4 + 3];
        if (a > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (minX >= maxX || minY >= maxY) {
      minX = 0; maxX = nw; minY = 0; maxY = nh;
    }

    const bboxW = maxX - minX;
    const bboxH = maxY - minY;
    this.contentDimensions = {
      minX, minY, width: bboxW, height: bboxH
    };

    // Calculate scale
    const displayWidth = this.canvas.parentElement?.clientWidth || window.innerWidth;
    const isMobile = displayWidth < 640;
    const targetEmblemDiameter = Math.min(displayWidth * 0.46, isMobile ? 180 : 220);
    this.logoScale = (targetEmblemDiameter * this.dpr) / bboxW;

    this.particles = [];
    const sampleStep = Math.max(3, Math.min(8, step));

    for (let y = minY; y <= maxY; y += sampleStep) {
      for (let x = minX; x <= maxX; x += sampleStep) {
        const idx = (y * nw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        if (a < 65) continue; // Skip transparency

        // Determine authentic brand segment color
        let colorType = 'center';
        let hexColor = BRAND.colors.textMain;

        if (g > 130 && r < 120 && b < 140) {
          colorType = 'green';
          hexColor = BRAND.colors.green;
        } else if (b > 160 && r < 120 && g < 180) {
          colorType = 'blue';
          hexColor = BRAND.colors.blue;
        } else {
          colorType = 'center';
          hexColor = BRAND.colors.textMain;
        }

        // Relative coordinate normalized to emblem center
        const relX = (x - (minX + bboxW / 2));
        const relY = (y - (minY + bboxH / 2));

        // Spawn origin outside the emblem zone along screen perimeters
        const angle = Math.random() * Math.PI * 2;
        let spawnDist = (this.emblemRadius * 2.8) + Math.random() * (Math.max(this.width, this.height) * 0.45);

        // Directional bias: Green from top, Blue from bottom
        let originAngle = angle;
        if (colorType === 'green') {
          originAngle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8; // Top hemisphere
        } else if (colorType === 'blue') {
          originAngle = Math.PI / 2 + (Math.random() - 0.5) * 1.8; // Bottom hemisphere
        }

        const originX = this.centerX + Math.cos(originAngle) * spawnDist;
        const originY = this.centerY + Math.sin(originAngle) * spawnDist;

        // Arrival delay staggered across Phase A (0 - 850ms)
        const delay = Math.random() * 850;

        // Curved flight parameters
        const curveDir = Math.random() > 0.5 ? 1 : -1;
        const curveAmount = (18 + Math.random() * 45) * this.dpr * curveDir;

        // Damped spring physics
        const springFactor = 0.075 + Math.random() * 0.035;
        const damping = 0.81 + Math.random() * 0.04;

        this.particles.push({
          relX,
          relY,
          targetX: this.centerX + relX * this.logoScale,
          targetY: this.centerY + relY * this.logoScale,
          originX,
          originY,
          x: originX,
          y: originY,
          vx: 0,
          vy: 0,
          colorType,
          color: hexColor,
          delay,
          curveAmount,
          springFactor,
          damping,
          alpha: 0,
          targetRadius: (sampleStep >= 6 ? 1.55 : sampleStep >= 4 ? 1.25 : 1.05) * this.dpr,
          currentRadius: 0.8 * this.dpr,
          settled: false
        });
      }
    }

    return this.particles.length;
  }

  recalculateParticleTargets() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.targetX = this.centerX + p.relX * this.logoScale;
      p.targetY = this.centerY + p.relY * this.logoScale;
      if (this.currentPhase === 'F' && p.settled) {
        p.x = p.targetX;
        p.y = p.targetY;
      }
    }
  }

  start() {
    this.startTime = performance.now();
    this.elapsed = 0;
    this.isRunning = true;
    this.isPaused = false;
    this.currentPhase = 'A';
    this.crispLogoAlpha = 0;
    this.cinematicGlowAlpha = 0;
    this.orbitAngle = 0;

    // Reset particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x = p.originX;
      p.y = p.originY;
      p.vx = 0;
      p.vy = 0;
      p.alpha = 0;
      p.settled = false;
      p.currentRadius = 0.8 * this.dpr;
    }

    this.callbacks.onPhaseChange?.('A', 0);

    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.loop = this.loop.bind(this);
    this.rafId = requestAnimationFrame(this.loop);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.startTime = performance.now() - (this.elapsed / this.speedMultiplier);
      this.rafId = requestAnimationFrame(this.loop);
    }
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
    this.particles = [];
    this.ambientParticles = [];
    this.orbitalParticles = [];
    this.sparkles = [];
  }

  setSpeed(multiplier) {
    const currentProgress = this.elapsed;
    this.speedMultiplier = Math.max(0.2, Math.min(3.0, multiplier));
    this.startTime = performance.now() - (currentProgress / this.speedMultiplier);
  }

  setReducedMotion(enabled) {
    this.reducedMotion = enabled;
    if (enabled) {
      for (const p of this.particles) {
        p.x = p.targetX;
        p.y = p.targetY;
        p.alpha = 1;
        p.currentRadius = p.targetRadius;
        p.settled = true;
      }
      this.crispLogoAlpha = 1;
      this.cinematicGlowAlpha = 1;
      this.currentPhase = 'F';
      this.callbacks.onPhaseChange?.('F', TIMING_A1.totalDuration);
      this.render();
    }
  }

  loop(currentTime) {
    if (!this.isRunning || this.isPaused) return;

    if (this.reducedMotion) {
      this.render();
      return;
    }

    this.elapsed = (currentTime - this.startTime) * this.speedMultiplier;
    this.update(this.elapsed);
    this.render();

    this.rafId = requestAnimationFrame(this.loop);
  }

  update(elapsed) {
    // Determine Current Phase based on specification:
    // Phase A: 0 - 900ms: Particles arrive
    // Phase B: 900 - 2200ms: Logo forms & densifies
    // Phase C: 2200 - 2800ms: Cinematic glow & orbital trail
    // Phase D: 2800 - 3400ms: Wordmark reveals
    // Phase E: 3400 - 4000ms: Tagline reveals
    // Phase F: 4000ms+: Final composition hold
    let newPhase = 'A';
    if (elapsed >= TIMING_A1.phaseEEnd) {
      newPhase = 'F';
    } else if (elapsed >= TIMING_A1.phaseDEnd) {
      newPhase = 'E';
    } else if (elapsed >= TIMING_A1.phaseCEnd) {
      newPhase = 'D';
    } else if (elapsed >= TIMING_A1.phaseBEnd) {
      newPhase = 'C';
    } else if (elapsed >= TIMING_A1.phaseAEnd) {
      newPhase = 'B';
    }

    if (newPhase !== this.currentPhase) {
      this.currentPhase = newPhase;
      this.callbacks.onPhaseChange?.(newPhase, elapsed);
      if (newPhase === 'F') {
        this.callbacks.onComplete?.();
      }
    }

    const progress = Math.min(1.0, elapsed / TIMING_A1.totalDuration);
    this.callbacks.onProgress?.(progress, elapsed);

    // Cinematic Glow Intensity Curve
    // Begins in late Phase B (1800ms), intensifies smoothly during Phase C, settles in Phase F
    if (elapsed >= 1800) {
      const glowT = Math.min(1.0, (elapsed - 1800) / 1000);
      // Soft ease-out into settled ambient halo
      this.cinematicGlowAlpha = Math.min(0.85, 0.85 * (1 - Math.pow(1 - glowT, 2)));
    } else {
      this.cinematicGlowAlpha = 0;
    }

    // Crossfade crisp emblem in Phase F (4000ms+)
    if (elapsed >= TIMING_A1.phaseEEnd) {
      this.crispLogoAlpha = Math.min(1.0, (elapsed - TIMING_A1.phaseEEnd) / 450);
    } else {
      this.crispLogoAlpha = 0;
    }

    // Advance orbital trail rotation
    this.orbitAngle += 0.028 * this.speedMultiplier;

    // Update Particles
    const pCount = this.particles.length;
    for (let i = 0; i < pCount; i++) {
      const p = this.particles[i];

      if (elapsed < p.delay) {
        p.alpha = 0;
        continue;
      }

      const activeTime = elapsed - p.delay;

      if (elapsed < 1150) {
        // Phase A & early B: Inward curved stream
        const t = Math.min(1.0, activeTime / 880);
        const ease = 1 - Math.pow(1 - t, 3);

        const curX = p.originX + (p.targetX - p.originX) * ease;
        const curY = p.originY + (p.targetY - p.originY) * ease;

        const curve = Math.sin(t * Math.PI) * p.curveAmount;
        const dx = p.targetX - p.originX;
        const dy = p.targetY - p.originY;
        const len = Math.hypot(dx, dy) || 1;
        const perpX = -dy / len;
        const perpY = dx / len;

        p.x = curX + perpX * curve;
        p.y = curY + perpY * curve;

        p.alpha = Math.min(0.72, (activeTime / 240) * 0.72);
        p.currentRadius = 0.8 * this.dpr + (p.targetRadius - 0.8 * this.dpr) * ease;
      } else {
        // Phase B & onwards: Spring physics + darkening into crisp definition
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;

        p.vx = (p.vx + dx * p.springFactor) * p.damping;
        p.vy = (p.vy + dy * p.springFactor) * p.damping;

        // Interactive mouse repulsion
        if (this.mouse.active) {
          const mdx = p.x - this.mouse.x;
          const mdy = p.y - this.mouse.y;
          const dist = Math.hypot(mdx, mdy);
          const maxDist = this.mouse.radius * this.dpr;
          if (dist < maxDist && dist > 0.1) {
            const push = (1 - dist / maxDist) * 3.8 * this.dpr;
            p.vx += (mdx / dist) * push;
            p.vy += (mdy / dist) * push;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Darken and densify to 1.0 definition
        const darkenT = Math.min(1.0, (elapsed - 1150) / 950);
        p.alpha = 0.72 + darkenT * 0.28;
        p.currentRadius = p.targetRadius;

        if (Math.abs(p.vx) < 0.03 && Math.abs(p.vy) < 0.03 && Math.hypot(dx, dy) < 0.2) {
          p.settled = true;
          if (this.currentPhase === 'F' && !this.mouse.active) {
            p.x = p.targetX;
            p.y = p.targetY;
          }
        }
      }
    }

    // Ambient background micro-particles
    for (const amb of this.ambientParticles) {
      amb.x += amb.vx;
      amb.y += amb.vy;
      if (amb.x < 0) amb.x = this.width;
      if (amb.x > this.width) amb.x = 0;
      if (amb.y < 0) amb.y = this.height;
      if (amb.y > this.height) amb.y = 0;
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

    // 2. Ambient Background Particles
    for (const amb of this.ambientParticles) {
      ctx.fillStyle = amb.color;
      ctx.globalAlpha = amb.alpha;
      ctx.beginPath();
      ctx.arc(amb.x, amb.y, amb.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Cinematic Glow & Ambient Illumination (Behind Emblem)
    if (this.cinematicGlowAlpha > 0.01) {
      ctx.save();
      const glowRadius = this.emblemRadius * 1.85;

      // Gentle illuminated floor pool beneath emblem
      const floorGrad = ctx.createRadialGradient(
        this.centerX, this.centerY + this.emblemRadius * 0.95, 0,
        this.centerX, this.centerY + this.emblemRadius * 0.95, glowRadius * 1.2
      );
      floorGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * this.cinematicGlowAlpha})`);
      floorGrad.addColorStop(0.5, `rgba(0, 114, 255, ${0.08 * this.cinematicGlowAlpha})`);
      floorGrad.addColorStop(1, 'rgba(244, 244, 244, 0)');
      ctx.fillStyle = floorGrad;
      ctx.beginPath();
      ctx.ellipse(this.centerX, this.centerY + this.emblemRadius * 0.95, glowRadius * 1.1, glowRadius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft Green Radial Aura (Upper Hemisphere)
      const greenAura = ctx.createRadialGradient(
        this.centerX, this.centerY - this.emblemRadius * 0.35, 10,
        this.centerX, this.centerY - this.emblemRadius * 0.35, glowRadius
      );
      greenAura.addColorStop(0, `rgba(0, 200, 83, ${0.28 * this.cinematicGlowAlpha})`);
      greenAura.addColorStop(0.55, `rgba(0, 200, 83, ${0.09 * this.cinematicGlowAlpha})`);
      greenAura.addColorStop(1, 'rgba(244, 244, 244, 0)');
      ctx.fillStyle = greenAura;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY - this.emblemRadius * 0.35, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Soft Blue Radial Aura (Lower Hemisphere)
      const blueAura = ctx.createRadialGradient(
        this.centerX, this.centerY + this.emblemRadius * 0.35, 10,
        this.centerX, this.centerY + this.emblemRadius * 0.35, glowRadius
      );
      blueAura.addColorStop(0, `rgba(0, 114, 255, ${0.28 * this.cinematicGlowAlpha})`);
      blueAura.addColorStop(0.55, `rgba(0, 114, 255, ${0.09 * this.cinematicGlowAlpha})`);
      blueAura.addColorStop(1, 'rgba(244, 244, 244, 0)');
      ctx.fillStyle = blueAura;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY + this.emblemRadius * 0.35, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Central Warm Bright Core
      const coreGrad = ctx.createRadialGradient(
        this.centerX, this.centerY, 0,
        this.centerX, this.centerY, this.emblemRadius * 0.75
      );
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * this.cinematicGlowAlpha})`);
      coreGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.35 * this.cinematicGlowAlpha})`);
      coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, this.emblemRadius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 4. Luminous Orbital Light Trail (Phase C onwards)
    if (this.cinematicGlowAlpha > 0.05 && this.orbitalParticles.length > 0) {
      ctx.save();
      for (const orb of this.orbitalParticles) {
        const curAngle = this.orbitAngle + orb.offsetAngle;

        // Parametric elliptical orbit tilted around emblem
        const rawX = Math.cos(curAngle) * orb.distX;
        const rawY = Math.sin(curAngle) * orb.distY;

        // Rotate by tilt angle
        const rotX = rawX * Math.cos(orb.tilt) - rawY * Math.sin(orb.tilt);
        const rotY = rawX * Math.sin(orb.tilt) + rawY * Math.cos(orb.tilt);

        const orbX = this.centerX + rotX;
        const orbY = this.centerY + rotY;

        ctx.fillStyle = orb.color;
        ctx.globalAlpha = orb.alpha * this.cinematicGlowAlpha * 0.85;

        // Glow halo
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 8 * this.dpr;

        ctx.beginPath();
        ctx.arc(orbX, orbY, orb.baseRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 5. Render Core Logo Particles (Batch rendered by color)
    const greens = [];
    const blues = [];
    const centerParticles = [];

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.alpha <= 0.01) continue;
      if (p.colorType === 'green') greens.push(p);
      else if (p.colorType === 'blue') blues.push(p);
      else centerParticles.push(p);
    }

    const particleMult = 1.0 - (this.crispLogoAlpha * 0.88);

    // Render Greens (#00C853)
    if (greens.length > 0) {
      ctx.fillStyle = BRAND.colors.green;
      ctx.beginPath();
      for (const p of greens) {
        ctx.globalAlpha = p.alpha * particleMult;
        ctx.moveTo(p.x + p.currentRadius, p.y);
        ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // Render Blues (#0072FF)
    if (blues.length > 0) {
      ctx.fillStyle = BRAND.colors.blue;
      ctx.beginPath();
      for (const p of blues) {
        ctx.globalAlpha = p.alpha * particleMult;
        ctx.moveTo(p.x + p.currentRadius, p.y);
        ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // Render Center 'e' (#F4F4F4 on dark canvas)
    if (centerParticles.length > 0) {
      ctx.fillStyle = BRAND.colors.textMain;
      ctx.beginPath();
      for (const p of centerParticles) {
        ctx.globalAlpha = p.alpha * particleMult;
        ctx.moveTo(p.x + p.currentRadius, p.y);
        ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // 6. Subtle Sparkle Glints on Emblem Vertices (Phase C onwards)
    if (this.cinematicGlowAlpha > 0.1) {
      ctx.save();
      const time = this.elapsed * 0.003;
      for (const sp of this.sparkles) {
        const pulse = Math.sin(time + sp.phase);
        if (pulse > 0.4) {
          const spAlpha = ((pulse - 0.4) / 0.6) * 0.7 * this.cinematicGlowAlpha;
          const spX = this.centerX + sp.relX * this.emblemRadius;
          const spY = this.centerY + sp.relY * this.emblemRadius;

          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = spAlpha;
          ctx.shadowColor = '#00C853';
          ctx.shadowBlur = 10 * this.dpr;

          // Render 4-pointed sparkle star
          const size = (2.4 + pulse * 2.2) * this.dpr;
          ctx.beginPath();
          ctx.moveTo(spX, spY - size);
          ctx.lineTo(spX + size * 0.3, spY - size * 0.3);
          ctx.lineTo(spX + size, spY);
          ctx.lineTo(spX + size * 0.3, spY + size * 0.3);
          ctx.lineTo(spX, spY + size);
          ctx.lineTo(spX - size * 0.3, spY + size * 0.3);
          ctx.lineTo(spX - size, spY);
          ctx.lineTo(spX - size * 0.3, spY - size * 0.3);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 7. Render 100% Crisp Vector Emblem in Phase F Crossfade
    if (this.crispLogoAlpha > 0 && this.crispEmblemImage && this.contentDimensions) {
      ctx.globalAlpha = this.crispLogoAlpha;
      const imgW = this.contentDimensions.width * this.logoScale;
      const imgH = this.contentDimensions.height * this.logoScale;
      ctx.drawImage(
        this.crispEmblemImage,
        this.centerX - imgW / 2,
        this.centerY - imgH / 2,
        imgW,
        imgH
      );
    }

    ctx.globalAlpha = 1.0;
  }
}
