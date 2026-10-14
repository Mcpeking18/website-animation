/**
 * E-Cell MSIT Particle Engine (Vanilla JavaScript)
 * - Canvas 2D high-performance particle simulation
 * - Pixel sampling from official final emblem assets
 * - Sequential convergence: Particles arrive -> Logo forms & darkens -> Settles
 * - Physics: Damped spring settling & soft magnetic cursor interaction
 * - DPR (Retina/HiDPI) scaling and responsive layout
 */

export const BRAND_COLORS = {
  primaryGreen: '#00C853',
  primaryBlue: '#0072FF',
  neutralBlack: '#0A0A0A',
  lightBackground: '#F4F4F4',
  neutralGrey: '#9CA3AF',
  textSecondary: '#4B5563'
};

export const TIMING = {
  phaseAEnd: 900,   // Phase A: Dots Arrive (0 - 0.9s)
  phaseBEnd: 2300,  // Phase B: Logo Forms & Darkens (0.9 - 2.3s)
  phaseCEnd: 2900,  // Phase C: Wordmark Appears (2.3 - 2.9s)
  phaseDEnd: 3500,  // Phase D: Tagline Appears (2.9 - 3.5s)
  totalDuration: 3500 // Phase E: Final Composition Hold (3.5s+)
};

export class ParticleEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.callbacks = callbacks;

    this.particles = [];
    this.ambientParticles = [];

    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.centerX = 0;
    this.centerY = 0;
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

    this.mouse = {
      x: -9999,
      y: -9999,
      active: false,
      radius: 75
    };

    this.initMouseListeners();
  }

  initMouseListeners() {
    const updateMouse = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (clientX - rect.left) * this.dpr;
      this.mouse.y = (clientY - rect.top) * this.dpr;
      this.mouse.active = true;
    };

    const clearMouse = () => {
      this.mouse.active = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    };

    this.canvas.addEventListener('mousemove', (e) => updateMouse(e.clientX, e.clientY));
    this.canvas.addEventListener('mouseleave', clearMouse);

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    this.canvas.addEventListener('touchend', clearMouse);
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
    // Offset emblem slightly upward so wordmark & tagline sit in visual vertical center
    const isMobile = displayWidth < 640;
    this.centerY = this.height / 2 - (isMobile ? 42 * this.dpr : 58 * this.dpr);

    // Responsive scaling
    const baseTargetWidth = isMobile ? Math.min(displayWidth * 0.82, 340) : 460;
    this.logoScale = (baseTargetWidth * this.dpr) / 460;

    // Recalculate target positions
    if (this.particles.length > 0) {
      for (const p of this.particles) {
        p.targetX = this.centerX + p.relX * this.logoScale;
        p.targetY = this.centerY + p.relY * this.logoScale;
        if (this.currentPhase === 'E') {
          p.x = p.targetX;
          p.y = p.targetY;
        }
      }
    }

    this.initAmbientParticles();
  }

  initAmbientParticles() {
    this.ambientParticles = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.28 * this.dpr,
        vy: (Math.random() - 0.5) * 0.28 * this.dpr,
        radius: (1.2 + Math.random() * 1.5) * this.dpr,
        color: i % 2 === 0 ? BRAND_COLORS.primaryGreen : BRAND_COLORS.primaryBlue,
        alpha: 0.12 + Math.random() * 0.12
      });
    }
  }

  /**
   * Samples target points from an image/canvas asset
   */
  setTargetsFromImage(sourceImg, step = 3) {
    const aspect = sourceImg.width / sourceImg.height;
    const renderWidth = 460;
    const renderHeight = Math.round(renderWidth / aspect);

    const offCanvas = document.createElement('canvas');
    offCanvas.width = renderWidth;
    offCanvas.height = renderHeight;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return 0;

    offCtx.drawImage(sourceImg, 0, 0, renderWidth, renderHeight);
    const imgData = offCtx.getImageData(0, 0, renderWidth, renderHeight);
    const data = imgData.data;

    let minX = renderWidth, maxX = 0, minY = renderHeight, maxY = 0;

    // First pass: Content bounds
    for (let y = 0; y < renderHeight; y++) {
      for (let x = 0; x < renderWidth; x++) {
        const idx = (y * renderWidth + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        const isBg = a < 40 || (r > 238 && g > 238 && b > 238);
        if (!isBg) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX <= minX || maxY <= minY) return 0;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const cX = minX + contentWidth / 2;
    const cY = minY + contentHeight / 2;
    const midY = (minY + maxY) / 2;

    this.contentDimensions = { width: contentWidth, height: contentHeight };

    // Create trimmed high-res canvas for Phase E crossfade
    const trimmed = document.createElement('canvas');
    trimmed.width = contentWidth;
    trimmed.height = contentHeight;
    const tCtx = trimmed.getContext('2d');
    if (tCtx) {
      tCtx.drawImage(offCanvas, minX, minY, contentWidth, contentHeight, 0, 0, contentWidth, contentHeight);
      this.crispEmblemImage = trimmed;
    }

    this.particles = [];

    // Second pass: sample particles at step intervals
    for (let y = minY; y <= maxY; y += step) {
      for (let x = minX; x <= maxX; x += step) {
        const idx = (y * renderWidth + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        const isBg = a < 40 || (r > 238 && g > 238 && b > 238);
        if (isBg) continue;

        let brandColor = BRAND_COLORS.neutralBlack;
        let region = 'black';

        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

        if (sat > 0.22) {
          if (g > b && g > r) {
            brandColor = BRAND_COLORS.primaryGreen;
            region = 'green';
          } else if (b > g && b > r) {
            brandColor = BRAND_COLORS.primaryBlue;
            region = 'blue';
          } else {
            if (y < midY) {
              brandColor = BRAND_COLORS.primaryGreen;
              region = 'green';
            } else {
              brandColor = BRAND_COLORS.primaryBlue;
              region = 'blue';
            }
          }
        } else {
          // Central black 'e'
          brandColor = BRAND_COLORS.neutralBlack;
          region = 'black';
        }

        const relX = x - cX;
        const relY = y - cY;
        const targetX = this.centerX + relX * this.logoScale;
        const targetY = this.centerY + relY * this.logoScale;

        // Spawn origin outside logo area (edges and corners)
        let angle;
        if (region === 'green') {
          angle = -Math.PI * 0.95 + Math.random() * Math.PI * 0.9;
        } else if (region === 'blue') {
          angle = Math.PI * 0.05 + Math.random() * Math.PI * 0.9;
        } else {
          angle = Math.random() * Math.PI * 2;
        }

        const minDistance = Math.max(this.width, this.height) * 0.35;
        const maxDistance = Math.max(this.width, this.height) * 0.68;
        const spawnDist = minDistance + Math.random() * (maxDistance - minDistance);

        const originX = this.centerX + Math.cos(angle) * spawnDist;
        const originY = this.centerY + Math.sin(angle) * spawnDist;

        // Gentle curved arc perpendicular to flight vector
        const curveDir = Math.random() > 0.5 ? 1 : -1;
        const curveAmount = (35 + Math.random() * 55) * this.dpr * curveDir;

        // Staggered launch delays across Phase A (0 to 450ms)
        const delay = Math.random() * 450;

        this.particles.push({
          relX,
          relY,
          targetX,
          targetY,
          originX,
          originY,
          x: originX,
          y: originY,
          vx: 0,
          vy: 0,
          color: brandColor,
          region,
          targetRadius: Math.max(1.5 * this.dpr, (step * 0.44) * this.logoScale),
          currentRadius: 0.9 * this.dpr,
          alpha: 0,
          delay,
          curveAmount,
          springFactor: 0.075 + Math.random() * 0.03,
          damping: 0.83 + Math.random() * 0.03,
          settled: false
        });
      }
    }

    return this.particles.length;
  }

  start() {
    this.startTime = performance.now();
    this.elapsed = 0;
    this.isRunning = true;
    this.isPaused = false;
    this.currentPhase = 'A';
    this.crispLogoAlpha = 0;

    for (const p of this.particles) {
      p.x = p.originX;
      p.y = p.originY;
      p.vx = 0;
      p.vy = 0;
      p.alpha = 0;
      p.settled = false;
      p.currentRadius = 0.9 * this.dpr;
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
      this.currentPhase = 'E';
      this.callbacks.onPhaseChange?.('E', TIMING.totalDuration);
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
    // Determine Phase based on explicit timing:
    // Phase A: 0 - 900ms (Dots Arrive)
    // Phase B: 900 - 2300ms (Logo Forms & Darkens into definition)
    // Phase C: 2300 - 2900ms (Wordmark Appears)
    // Phase D: 2900 - 3500ms (Tagline Appears)
    // Phase E: 3500ms+ (Final Composition Hold)
    let newPhase = 'A';
    if (elapsed >= TIMING.phaseDEnd) {
      newPhase = 'E';
    } else if (elapsed >= TIMING.phaseCEnd) {
      newPhase = 'D';
    } else if (elapsed >= TIMING.phaseBEnd) {
      newPhase = 'C';
    } else if (elapsed >= TIMING.phaseAEnd) {
      newPhase = 'B';
    }

    if (newPhase !== this.currentPhase) {
      this.currentPhase = newPhase;
      this.callbacks.onPhaseChange?.(newPhase, elapsed);
      if (newPhase === 'E') {
        this.callbacks.onComplete?.();
      }
    }

    const progress = Math.min(1.0, elapsed / TIMING.totalDuration);
    this.callbacks.onProgress?.(progress, elapsed);

    // Crossfade crisp emblem in Phase E (3.5s+)
    if (elapsed >= TIMING.phaseDEnd) {
      this.crispLogoAlpha = Math.min(1.0, (elapsed - TIMING.phaseDEnd) / 400);
    } else {
      this.crispLogoAlpha = 0;
    }

    // Update Particles
    const pCount = this.particles.length;
    for (let i = 0; i < pCount; i++) {
      const p = this.particles[i];

      if (elapsed < p.delay) {
        p.alpha = 0;
        continue;
      }

      const activeTime = elapsed - p.delay;

      if (elapsed < 1200) {
        // Phase A & early Phase B: Inward curved flight
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

        // In Phase A, dots arrive with softer opacity (0.3 -> 0.75)
        p.alpha = Math.min(0.75, (activeTime / 260) * 0.75);
        p.currentRadius = 0.9 * this.dpr + (p.targetRadius - 0.9 * this.dpr) * ease;
      } else {
        // Phase B (Logo Darkens & Settle): Spring physics + darkening/densification
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

        // As logo forms in Phase B, it darkens from 0.75 to full 1.0 definition
        const darkenT = Math.min(1.0, (elapsed - 1200) / 900);
        p.alpha = 0.75 + darkenT * 0.25;
        p.currentRadius = p.targetRadius;

        if (Math.abs(p.vx) < 0.04 && Math.abs(p.vy) < 0.04 && Math.hypot(dx, dy) < 0.2) {
          p.settled = true;
          if (this.currentPhase === 'E' && !this.mouse.active) {
            p.x = p.targetX;
            p.y = p.targetY;
          }
        }
      }
    }

    // Ambient micro-particles
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

    // Clean brand light background
    ctx.fillStyle = BRAND_COLORS.lightBackground;
    ctx.fillRect(0, 0, this.width, this.height);

    // 1. Ambient Background Particles
    for (const amb of this.ambientParticles) {
      ctx.fillStyle = amb.color;
      ctx.globalAlpha = amb.alpha;
      ctx.beginPath();
      ctx.arc(amb.x, amb.y, amb.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Batch particles by color for max 60+ FPS efficiency
    const greens = [];
    const blues = [];
    const blacks = [];

    for (const p of this.particles) {
      if (p.alpha <= 0.01) continue;
      if (p.region === 'green') greens.push(p);
      else if (p.region === 'blue') blues.push(p);
      else blacks.push(p);
    }

    // Subtle fade of particles into crisp emblem in Phase E
    const particleMult = 1.0 - (this.crispLogoAlpha * 0.75);

    // Render Greens (#00C853)
    if (greens.length > 0) {
      ctx.fillStyle = BRAND_COLORS.primaryGreen;
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
      ctx.fillStyle = BRAND_COLORS.primaryBlue;
      ctx.beginPath();
      for (const p of blues) {
        ctx.globalAlpha = p.alpha * particleMult;
        ctx.moveTo(p.x + p.currentRadius, p.y);
        ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // Render Blacks (#0A0A0A)
    if (blacks.length > 0) {
      ctx.fillStyle = BRAND_COLORS.neutralBlack;
      ctx.beginPath();
      for (const p of blacks) {
        ctx.globalAlpha = p.alpha * particleMult;
        ctx.moveTo(p.x + p.currentRadius, p.y);
        ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // 3. Render Crisp Vector Emblem in Phase E
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
