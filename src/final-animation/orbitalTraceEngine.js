/**
 * Animation 4: Orbital Trace Engine
 * 
 * Cinematic Fusion of:
 * - Dual-colour orbital comet trails & ambient stardust from Animation 1
 * - Exact SVG geometric path tracing & solid-colour fill from Animation 3
 * - Deep cinematic blue radial background (#0B1220, #101B30, #123B70)
 * - Sequenced typography reveal ("eCell MSIT" -> "IDEAS INSPIRE INVEST")
 * 
 * NOTE: The logo is NEVER assembled from particles. It is revealed with architectural
 * SVG precision while the orbital comet trails and ambient stardust frame the emblem.
 */

import { BRAND } from '../shared/brand.js';
import { SVG_EMBLEM_PATHS } from '../shared/paths.js';

export const TIMING_ORBITAL_TRACE = {
  traceStart: 250,         // 0.25s: Tracing sparks ignite & single 1-dot orbital comet awakens
  emblemTraceEnd: 2350,    // 0.25 - 2.35s: Upper green & lower blue SVG paths trace with sparks & fill
  centerEEnd: 3000,        // 2.35 - 3.0s: Central lowercase 'e' traces & trail reaches 100% full length
  logoResolveEnd: 3350,    // 3.0 - 3.35s: Emblem settles, subtle glow swell settles into background
  wordmarkEnd: 3900,       // 3.35 - 3.9s: "eCell MSIT" wordmark reveals
  taglineEnd: 4500,        // 3.9 - 4.5s: "IDEATE. INSPIRE. INVEST." reveals
  totalDuration: 4500      // 4.5s: Total duration (settles into continuous ambient hold)
};

export class OrbitalTraceEngine {
  constructor(canvas, svgContainer, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.svgContainer = svgContainer;
    this.callbacks = callbacks;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.emblemRadius = 140;

    this.startTime = 0;
    this.elapsed = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.speed = 1.0;
    this.reducedMotion = false;
    this.rafId = null;

    // Atmospheric elements
    this.ambientParticles = [];
    this.orbitalTrail = [];
    this.orbitAngle = 0;
    this.orbitActive = false;
    this.trailLengthFactor = 0; // Starts at 0 (only 1 dot: the head) and expands to 1.0 (full trail)
    this.stardustDroplets = [];

    // Glow intensity state
    this.ambientGlowAlpha = 0.15;
    this.glowSwellAlpha = 0;

    // SVG elements
    this.pathElements = {
      upper: [],
      lower: [],
      centerE: null
    };
    this.sparkElements = [];

    this.boundListeners = {};
    this.initMouseListeners();
    this.buildSVGDOM();
    this.resize();
  }

  initMouseListeners() {
    this.mouse = { x: -9999, y: -9999, active: false };

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

  removeListeners() {
    if (this.boundListeners.onMouseMove) {
      this.canvas.removeEventListener('mousemove', this.boundListeners.onMouseMove);
      this.canvas.removeEventListener('mouseleave', this.boundListeners.onMouseLeave);
    }
  }

  buildSVGDOM() {
    this.svgContainer.innerHTML = `
      <div class="orbital-trace-wrap">
        <svg class="orbital-trace-svg" viewBox="${SVG_EMBLEM_PATHS.viewBox}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="orb-glow-green" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="15" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="orb-glow-blue" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="15" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="orb-glow-white" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="18" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- Upper Green Segment Paths -->
          <g id="orb-upper-group">
            ${SVG_EMBLEM_PATHS.upper.map((d, i) => `
              <path class="orb-path orb-upper-path" data-index="${i}" d="${d}" fill="none" fill-opacity="0" stroke="none" />
            `).join('')}
          </g>

          <!-- Lower Blue Segment Paths -->
          <g id="orb-lower-group">
            ${SVG_EMBLEM_PATHS.lower.map((d, i) => `
              <path class="orb-path orb-lower-path" data-index="${i}" d="${d}" fill="none" fill-opacity="0" stroke="none" />
            `).join('')}
          </g>

          <!-- Central Lowercase 'e' Path -->
          <path class="orb-path orb-center-e" d="${SVG_EMBLEM_PATHS.centerE}" fill="none" fill-opacity="0" stroke="none" />

          <!-- Traveling Energy Spark Heads -->
          <g id="orb-sparks-group"></g>
        </svg>
      </div>
    `;

    const svg = this.svgContainer.querySelector('.orbital-trace-svg');
    const upperPaths = Array.from(svg.querySelectorAll('.orb-upper-path'));
    const lowerPaths = Array.from(svg.querySelectorAll('.orb-lower-path'));
    const centerEPath = svg.querySelector('.orb-center-e');
    const sparksGroup = svg.querySelector('#orb-sparks-group');

    const setupPath = (pathEl, color, filterId) => {
      const len = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = `${len} ${len}`;
      pathEl.style.strokeDashoffset = `${len}`;
      pathEl.style.stroke = color;
      pathEl.style.strokeWidth = '14px';
      pathEl.style.fill = color;
      pathEl.style.fillOpacity = '0';
      pathEl.style.filter = `url(#${filterId})`;
      return { el: pathEl, length: len, color };
    };

    this.pathElements.upper = upperPaths.map(p => setupPath(p, BRAND.colors.green, 'orb-glow-green'));
    this.pathElements.lower = lowerPaths.map(p => setupPath(p, BRAND.colors.blue, 'orb-glow-blue'));
    this.pathElements.centerE = setupPath(centerEPath, BRAND.colors.textMain, 'orb-glow-white');

    this.sparkElements = [];
    const allPaths = [...this.pathElements.upper, ...this.pathElements.lower, this.pathElements.centerE];
    for (const p of allPaths) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '17');
      circle.setAttribute('fill', '#FFFFFF');
      circle.setAttribute('filter', p.color === BRAND.colors.green ? 'url(#orb-glow-green)' : 'url(#orb-glow-blue)');
      circle.style.opacity = '0';
      sparksGroup.appendChild(circle);
      this.sparkElements.push({ circle, targetPath: p });
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
    // Offset emblem slightly upward to balance the grander emblem and typography
    const emblemOffset = isMobile ? 54 * this.dpr : 72 * this.dpr;
    this.centerY = this.height / 2 - emblemOffset;

    // Make the animation noticeably bigger and more impactful
    const targetEmblemDiameter = Math.min(displayWidth * 0.52, isMobile ? 220 : 280);
    this.emblemRadius = (targetEmblemDiameter / 2) * this.dpr;

    this.initAtmosphere();
  }

  initAtmosphere() {
    // 1. Ambient Background Micro-particles (42 subtle green & blue drifting specks)
    this.ambientParticles = [];
    const ambientCount = 42;
    for (let i = 0; i < ambientCount; i++) {
      this.ambientParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.32 * this.dpr,
        vy: (Math.random() - 0.5) * 0.32 * this.dpr,
        radius: (0.8 + Math.random() * 1.6) * this.dpr,
        color: Math.random() > 0.5 ? BRAND.colors.green : BRAND.colors.blue,
        alpha: 0.14 + Math.random() * 0.22,
        pulseSpeed: 0.012 + Math.random() * 0.02,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    // 2. Single Coordinated Blue & Green Orbital Comet Trail
    // Tilted gracefully at +18 deg (~ +0.31 rad) around emblem
    this.orbitalTrail = [];
    const trailCount = 32;
    for (let i = 0; i < trailCount; i++) {
      const frac = i / (trailCount - 1);
      const isHead = i === trailCount - 1;
      this.orbitalTrail.push({
        frac: frac,
        offsetAngle: frac * Math.PI * 0.95, // Segmented sweeping arc
        distX: this.emblemRadius * 1.45,
        distY: this.emblemRadius * 0.90,
        tilt: 0.31,
        baseRadius: (1.2 + frac * 2.8) * this.dpr,
        // Alternating authentic brand green and brand blue!
        color: i % 2 === 0 ? BRAND.colors.green : BRAND.colors.blue,
        alpha: Math.pow(frac, 1.3) * 0.95,
        isHead: isHead
      });
    }

    this.stardustDroplets = [];
  }

  start() {
    this.startTime = performance.now();
    this.elapsed = 0;
    this.isRunning = true;
    this.isPaused = false;

    // Reset SVG paths
    const reset = (item) => {
      item.el.style.strokeDashoffset = `${item.length}`;
      item.el.style.fillOpacity = '0';
    };
    this.pathElements.upper.forEach(reset);
    this.pathElements.lower.forEach(reset);
    reset(this.pathElements.centerE);

    this.sparkElements.forEach(s => s.circle.style.opacity = '0');

    this.callbacks.onPhaseChange?.('atmosphere', 0);

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
    this.removeListeners();
    if (this.svgContainer) {
      this.svgContainer.innerHTML = '';
    }
  }

  setSpeed(multiplier) {
    this.speed = Math.max(0.4, Math.min(2.5, multiplier));
  }

  setReducedMotion(enabled) {
    this.reducedMotion = enabled;
    if (enabled) {
      const fillAll = (item) => {
        item.el.style.strokeDashoffset = '0';
        item.el.style.fillOpacity = '1';
        item.el.style.strokeWidth = '0';
      };
      this.pathElements.upper.forEach(fillAll);
      this.pathElements.lower.forEach(fillAll);
      fillAll(this.pathElements.centerE);
      this.sparkElements.forEach(s => s.circle.style.opacity = '0');
      this.callbacks.onPhaseChange?.('hold', TIMING_ORBITAL_TRACE.totalDuration);
    }
  }

  loop(currentTime) {
    if (!this.isRunning || this.isPaused) return;

    this.elapsed = (currentTime - this.startTime) * this.speed;

    if (!this.reducedMotion) {
      this.update(this.elapsed);
    }

    this.render();

    this.rafId = requestAnimationFrame(this.loop);
  }

  update(elapsed) {
    // 1. Orbital comet starts in sync with tracing start (300ms) as a single dot, expanding to full length by centerEEnd
    if (elapsed < TIMING_ORBITAL_TRACE.traceStart) {
      this.orbitActive = false;
      this.trailLengthFactor = 0;
    } else {
      this.orbitActive = true;
      this.orbitAngle += 0.025 * this.speed;

      // Trail grows dynamically from 1 dot (head) to full length by the time logo is fully traced
      const traceDuration = TIMING_ORBITAL_TRACE.centerEEnd - TIMING_ORBITAL_TRACE.traceStart;
      const progress = Math.min(1.0, (elapsed - TIMING_ORBITAL_TRACE.traceStart) / traceDuration);
      this.trailLengthFactor = Math.min(1.0, 1 - Math.pow(1 - progress, 1.8));
    }

    // 2. Update Ambient Floating Micro-particles
    for (const amb of this.ambientParticles) {
      amb.x += amb.vx;
      amb.y += amb.vy;
      if (amb.x < 0) amb.x = this.width;
      if (amb.x > this.width) amb.x = 0;
      if (amb.y < 0) amb.y = this.height;
      if (amb.y > this.height) amb.y = 0;
    }

    // 3. Emit fine stardust droplets dropping in the wake of the leading orbital head (snake litter effect)
    if (this.orbitActive) {
      const head = this.orbitalTrail[this.orbitalTrail.length - 1];
      if (head && Math.random() < 0.62 * this.speed) {
        // Emitted right behind the leading head to follow it in its wake
        const trailOffset = Math.random() * 0.12;
        const curA = this.orbitAngle + head.offsetAngle - trailOffset;
        const rx = Math.cos(curA) * head.distX;
        const ry = Math.sin(curA) * head.distY;
        const rotX = rx * Math.cos(head.tilt) - ry * Math.sin(head.tilt);
        const rotY = rx * Math.sin(head.tilt) + ry * Math.cos(head.tilt);

        // Backward tangent drift against direction of travel
        const tanX = -Math.sin(curA) * 0.45 * this.dpr;
        const tanY = Math.cos(curA) * 0.45 * this.dpr;

        const randChoice = Math.random();
        const dropColor = randChoice < 0.45 ? BRAND.colors.blue : (randChoice < 0.85 ? BRAND.colors.green : '#FFFFFF');

        this.stardustDroplets.push({
          x: this.centerX + rotX,
          y: this.centerY + rotY,
          vx: -tanX * 0.28 + (Math.random() - 0.5) * 0.45 * this.dpr,
          vy: -tanY * 0.28 + (Math.random() - 0.5) * 0.45 * this.dpr,
          radius: (1.0 + Math.random() * 1.5) * this.dpr,
          color: dropColor,
          alpha: 0.92,
          life: 1.0,
          decay: 0.016 + Math.random() * 0.018
        });
      }
    }

    // Update stardust droplets
    for (let i = this.stardustDroplets.length - 1; i >= 0; i--) {
      const drop = this.stardustDroplets[i];
      drop.x += drop.vx;
      drop.y += drop.vy;
      drop.life -= drop.decay;
      if (drop.life <= 0) {
        this.stardustDroplets.splice(i, 1);
      }
    }

    // 4. Glow Alpha Lifecycle Curve
    if (elapsed < TIMING_ORBITAL_TRACE.traceStart) {
      this.ambientGlowAlpha = 0.15;
      this.glowSwellAlpha = 0;
    } else if (elapsed < TIMING_ORBITAL_TRACE.centerEEnd) {
      this.ambientGlowAlpha = 0.2 + (elapsed / TIMING_ORBITAL_TRACE.centerEEnd) * 0.35;
      this.glowSwellAlpha = 0;
    } else if (elapsed < TIMING_ORBITAL_TRACE.logoResolveEnd) {
      // Swell peak when emblem locks in
      const t = (elapsed - TIMING_ORBITAL_TRACE.centerEEnd) / (TIMING_ORBITAL_TRACE.logoResolveEnd - TIMING_ORBITAL_TRACE.centerEEnd);
      this.glowSwellAlpha = Math.sin(t * Math.PI) * 0.45;
      this.ambientGlowAlpha = 0.6;
    } else {
      // Settles into subtle calm backlight
      this.glowSwellAlpha = 0;
      this.ambientGlowAlpha = 0.45;
    }

    // 5. SVG Tracing Execution
    // Petal tracing starts cleanly at traceStart (350ms)
    const traceStart = TIMING_ORBITAL_TRACE.traceStart;
    const traceDuration = TIMING_ORBITAL_TRACE.emblemTraceEnd - traceStart;

    if (elapsed >= traceStart) {
      const traceElapsed = Math.min(traceDuration, elapsed - traceStart);
      const traceProgress = Math.min(1.0, traceElapsed / traceDuration);
      // Smooth cubic ease-out
      const ease = 1 - Math.pow(1 - traceProgress, 2.4);

      const updateList = (list) => {
        for (const item of list) {
          const offset = item.length * (1 - ease);
          item.el.style.strokeDashoffset = `${offset}`;

          if (traceProgress > 0.72) {
            const fillT = (traceProgress - 0.72) / 0.28;
            item.el.style.fillOpacity = `${fillT}`;
            item.el.style.strokeWidth = `${Math.max(1, 14 * (1 - fillT))}px`;
          } else {
            item.el.style.fillOpacity = '0';
            item.el.style.strokeWidth = '14px';
          }
        }
      };

      updateList(this.pathElements.upper);
      updateList(this.pathElements.lower);

      // Update Petal Spark Heads
      const allPetals = [...this.pathElements.upper, ...this.pathElements.lower];
      for (let i = 0; i < allPetals.length; i++) {
        const p = allPetals[i];
        const s = this.sparkElements[i];
        if (traceProgress < 0.98 && traceProgress > 0.02) {
          const pt = p.el.getPointAtLength(p.length * ease);
          s.circle.setAttribute('cx', pt.x);
          s.circle.setAttribute('cy', pt.y);
          s.circle.style.opacity = '1';
        } else {
          s.circle.style.opacity = '0';
        }
      }
    }

    // Central Lowercase 'e' Tracing
    const centerStart = TIMING_ORBITAL_TRACE.emblemTraceEnd;
    const centerDuration = TIMING_ORBITAL_TRACE.centerEEnd - centerStart;

    if (elapsed >= centerStart) {
      const centerElapsed = Math.min(centerDuration, elapsed - centerStart);
      const centerProgress = Math.min(1.0, centerElapsed / centerDuration);
      const centerEase = 1 - Math.pow(1 - centerProgress, 2.2);

      const ce = this.pathElements.centerE;
      ce.el.style.strokeDashoffset = `${ce.length * (1 - centerEase)}`;

      if (centerProgress > 0.72) {
        const fillT = (centerProgress - 0.72) / 0.28;
        ce.el.style.fillOpacity = `${fillT}`;
        ce.el.style.strokeWidth = `${Math.max(1, 14 * (1 - fillT))}px`;
      } else {
        ce.el.style.fillOpacity = '0';
        ce.el.style.strokeWidth = '14px';
      }

      // Spark for center 'e'
      const eSpark = this.sparkElements[this.sparkElements.length - 1];
      if (centerProgress < 0.98 && centerProgress > 0.02) {
        const pt = ce.el.getPointAtLength(ce.length * centerEase);
        eSpark.circle.setAttribute('cx', pt.x);
        eSpark.circle.setAttribute('cy', pt.y);
        eSpark.circle.style.opacity = '1';
      } else {
        eSpark.circle.style.opacity = '0';
      }
    }

    // 6. Notify Callbacks of Phase Changes
    if (elapsed < TIMING_ORBITAL_TRACE.traceStart) {
      this.callbacks.onPhaseChange?.('atmosphere', elapsed);
    } else if (elapsed < TIMING_ORBITAL_TRACE.orbitStart) {
      this.callbacks.onPhaseChange?.('tracing', elapsed);
    } else if (elapsed < TIMING_ORBITAL_TRACE.emblemTraceEnd) {
      this.callbacks.onPhaseChange?.('orbitalTracing', elapsed);
    } else if (elapsed < TIMING_ORBITAL_TRACE.centerEEnd) {
      this.callbacks.onPhaseChange?.('centerE', elapsed);
    } else if (elapsed < TIMING_ORBITAL_TRACE.logoResolveEnd) {
      this.callbacks.onPhaseChange?.('resolving', elapsed);
    } else if (elapsed < TIMING_ORBITAL_TRACE.wordmarkEnd) {
      this.callbacks.onPhaseChange?.('wordmark', elapsed);
    } else if (elapsed < TIMING_ORBITAL_TRACE.taglineEnd) {
      this.callbacks.onPhaseChange?.('tagline', elapsed);
    } else {
      this.callbacks.onPhaseChange?.('hold', elapsed);
    }
  }

  render() {
    const ctx = this.ctx;

    // 1. Deep Cinematic Blue Radial Background
    const bgGrad = ctx.createRadialGradient(
      this.centerX, this.centerY, 10,
      this.centerX, this.centerY, Math.max(this.width, this.height) * 0.74
    );
    bgGrad.addColorStop(0, '#101B30');
    bgGrad.addColorStop(0.62, '#0B1220');
    bgGrad.addColorStop(1, '#070B14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Ambient Micro-particles (Scattered deep in the field)
    for (const amb of this.ambientParticles) {
      ctx.fillStyle = amb.color;
      ctx.globalAlpha = amb.alpha;
      ctx.beginPath();
      ctx.arc(amb.x, amb.y, amb.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Stardust droplets shed in the wake of the leading orbital head (snake litter effect)
    for (const drop of this.stardustDroplets) {
      ctx.fillStyle = drop.color;
      ctx.globalAlpha = drop.alpha * drop.life;
      ctx.shadowColor = drop.color;
      ctx.shadowBlur = 6 * this.dpr;
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // 4. Layered Illumination Behind Emblem
    const totalGlow = Math.min(1.0, this.ambientGlowAlpha + this.glowSwellAlpha);
    if (totalGlow > 0.02) {
      ctx.save();
      const glowR = this.emblemRadius * 1.85;

      // Upper Green Aura
      const greenAura = ctx.createRadialGradient(
        this.centerX, this.centerY - this.emblemRadius * 0.35, 10,
        this.centerX, this.centerY - this.emblemRadius * 0.35, glowR
      );
      greenAura.addColorStop(0, `rgba(0, 200, 83, ${0.24 * totalGlow})`);
      greenAura.addColorStop(0.55, `rgba(0, 200, 83, ${0.08 * totalGlow})`);
      greenAura.addColorStop(1, 'rgba(11, 18, 32, 0)');
      ctx.fillStyle = greenAura;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY - this.emblemRadius * 0.35, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Lower Blue Aura
      const blueAura = ctx.createRadialGradient(
        this.centerX, this.centerY + this.emblemRadius * 0.35, 10,
        this.centerX, this.centerY + this.emblemRadius * 0.35, glowR
      );
      blueAura.addColorStop(0, `rgba(0, 114, 255, ${0.24 * totalGlow})`);
      blueAura.addColorStop(0.55, `rgba(0, 114, 255, ${0.08 * totalGlow})`);
      blueAura.addColorStop(1, 'rgba(11, 18, 32, 0)');
      ctx.fillStyle = blueAura;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY + this.emblemRadius * 0.35, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Subtle Warm Core
      const coreGrad = ctx.createRadialGradient(
        this.centerX, this.centerY, 0,
        this.centerX, this.centerY, this.emblemRadius * 0.65
      );
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.22 * totalGlow})`);
      coreGrad.addColorStop(0.6, `rgba(255, 255, 255, ${0.06 * totalGlow})`);
      coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, this.emblemRadius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 5. Single Blue & Green Orbital Comet Trail (Dynamically expanding trail length)
    if (this.orbitActive) {
      ctx.save();
      const minFrac = 1.0 - this.trailLengthFactor;

      for (const orb of this.orbitalTrail) {
        // The head is always visible; tail particles emerge as trailLengthFactor increases
        if (!orb.isHead && orb.frac < minFrac) {
          continue;
        }

        const curAngle = this.orbitAngle + orb.offsetAngle;
        const rawX = Math.cos(curAngle) * orb.distX;
        const rawY = Math.sin(curAngle) * orb.distY;

        const rotX = rawX * Math.cos(orb.tilt) - rawY * Math.sin(orb.tilt);
        const rotY = rawX * Math.sin(orb.tilt) + rawY * Math.cos(orb.tilt);

        const orbX = this.centerX + rotX;
        const orbY = this.centerY + rotY;

        ctx.fillStyle = orb.isHead ? '#FFFFFF' : orb.color;

        // Smooth opacity ramp for newly emerged tail segments
        const ramp = orb.isHead ? 1.0 : Math.min(1.0, (orb.frac - minFrac) / 0.12 + 0.15);
        ctx.globalAlpha = orb.alpha * ramp;

        // Shadow halo for comet body
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = (orb.isHead ? 20 : 9) * this.dpr;

        ctx.beginPath();
        ctx.arc(orbX, orbY, orb.baseRadius, 0, Math.PI * 2);
        ctx.fill();

        // Extra halo for comet head
        if (orb.isHead) {
          ctx.beginPath();
          ctx.fillStyle = '#0072FF';
          ctx.globalAlpha = 0.55;
          ctx.arc(orbX, orbY, orb.baseRadius * 1.85, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }
}
