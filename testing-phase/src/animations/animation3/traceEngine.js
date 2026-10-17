/**
 * Animation 3: Trace Engine
 * - Exact SVG geometry from official Final Ecell Logo svg
 * - Luminous energy tracing traveling along the perimeter of emblem segments:
 *   - Green light (#00C853) for upper paths
 *   - Blue light (#0072FF) for lower paths
 *   - Luminous white light (#F4F4F4) for the central lowercase 'e'
 * - Progressive fill and illumination of the emblem
 * - Sequenced typography reveals
 * - High performance & clean lifecycle disposal
 */

import { BRAND } from '../../shared/brand.js';

export const TIMING_TRACE = {
  emblemTraceEnd: 2000, // 0.0 - 2.0s: Upper & lower petals traced with energy
  centerEEnd: 2800,     // 2.0 - 2.8s: Central lowercase 'e' traced & filled
  wordmarkEnd: 3500,    // 2.8 - 3.5s: eCell MSIT wordmark reveals
  taglineEnd: 4200,     // 3.5 - 4.2s: IDEAS INSPIRE INVEST tagline reveals
  holdStart: 4200       // 4.2s+: Settles into subtle ambient aura
};

// Official SVG Path Definitions (from Final Ecell Logo svg.svg, viewBox 0 0 2083 1192)
export const SVG_EMBLEM_PATHS = {
  viewBox: '0 0 2083 1192',
  upper: [
    // Center wedge
    'M748.336,-0c-0.273,0 119.386,191.541 119.386,191.541l342.31,-0.022l130.322,-191.519l-592.017,0Z',
    // Inner left petal
    'M705.964,12.5l130.119,191.541l-246.131,379.374l-277.931,0l393.942,-570.915Z',
    // Inner right petal
    'M1383.987,12.5l-130.119,191.541l246.131,379.374l277.931,0l-393.942,-570.915Z',
    // Outer left wing
    'M360.704,47.746l126.604,180.421l-232.554,355.25l-254.754,0l360.704,-535.671Z',
    // Outer right wing
    'M1721.473,47.746l-126.605,180.419l232.555,355.25l254.753,0l-360.703,-535.669Z'
  ],
  lower: [
    // Center wedge
    'M748.336,1191.462c-0.273,0 119.386,-191.541 119.386,-191.541l342.31,0.022l130.322,191.519l-592.017,0Z',
    // Inner left petal
    'M705.964,1178.962l130.119,-191.541l-246.131,-379.374l-277.931,0l393.942,570.915Z',
    // Inner right petal
    'M1383.987,1178.962l-130.119,-191.541l246.131,-379.374l277.931,0l-393.942,570.915Z',
    // Outer left wing
    'M360.704,1143.717l126.604,-180.421l-232.554,-355.25l-254.754,0l360.704,535.671Z',
    // Outer right wing
    'M1721.473,1143.717l-126.605,-180.419l232.555,-355.25l254.753,0l-360.703,535.669Z'
  ],
  centerE: 'M1323.293,646.125l-418.268,0c10.079,80.63 65.512,125.984 151.181,125.984c65.512,0 110.866,-25.197 136.063,-70.551l120.945,55.433c-45.354,90.709 -136.063,141.102 -262.047,141.102c-181.417,0 -297.323,-125.984 -297.323,-302.362c0,-176.378 115.905,-302.362 292.283,-302.362c181.417,0 282.205,125.984 282.205,297.323c0,20.157 -5.039,40.315 -5.039,55.433Zm-418.268,-105.827l277.165,0c-10.079,-80.63 -60.472,-125.984 -136.063,-125.984c-75.591,0 -131.024,45.354 -141.102,125.984Z'
};

export class TraceEngine {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.startTime = 0;
    this.elapsed = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.speed = 1.0;
    this.reducedMotion = false;
    this.rafId = null;

    this.pathElements = {
      upper: [],
      lower: [],
      centerE: null
    };

    this.sparkElements = [];
    this.buildSVGDOM();
  }

  buildSVGDOM() {
    this.container.innerHTML = `
      <div class="trace-canvas-wrap">
        <!-- Subtle Ambient Background Glow Floor -->
        <div class="trace-bg-glow"></div>

        <!-- SVG Emblem Container -->
        <svg class="trace-svg" viewBox="${SVG_EMBLEM_PATHS.viewBox}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Glowing Filters -->
            <filter id="trace-glow-green" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="14" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="trace-glow-blue" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="14" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="trace-glow-white" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="18" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- Upper Green Segment Paths -->
          <g id="trace-upper-group">
            ${SVG_EMBLEM_PATHS.upper.map((d, i) => `
              <path class="trace-path trace-upper-path" data-index="${i}" d="${d}" />
            `).join('')}
          </g>

          <!-- Lower Blue Segment Paths -->
          <g id="trace-lower-group">
            ${SVG_EMBLEM_PATHS.lower.map((d, i) => `
              <path class="trace-path trace-lower-path" data-index="${i}" d="${d}" />
            `).join('')}
          </g>

          <!-- Central Lowercase 'e' Path -->
          <path class="trace-path trace-center-e" d="${SVG_EMBLEM_PATHS.centerE}" />

          <!-- Traveling Energy Spark Heads -->
          <g id="trace-sparks-group"></g>
        </svg>
      </div>
    `;

    const svg = this.container.querySelector('.trace-svg');
    const upperPaths = Array.from(svg.querySelectorAll('.trace-upper-path'));
    const lowerPaths = Array.from(svg.querySelectorAll('.trace-lower-path'));
    const centerEPath = svg.querySelector('.trace-center-e');
    const sparksGroup = svg.querySelector('#trace-sparks-group');

    // Precalculate exact path lengths
    const setupPath = (pathEl, color, filterId) => {
      const len = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = `${len} ${len}`;
      pathEl.style.strokeDashoffset = `${len}`;
      pathEl.style.stroke = color;
      pathEl.style.strokeWidth = '14px';
      pathEl.style.fill = color;
      pathEl.style.fillOpacity = '0';
      pathEl.style.filter = `url(#${filterId})`;
      return { el: pathEl, length: len, color, currentOffset: len };
    };

    this.pathElements.upper = upperPaths.map(p => setupPath(p, BRAND.colors.green, 'trace-glow-green'));
    this.pathElements.lower = lowerPaths.map(p => setupPath(p, BRAND.colors.blue, 'trace-glow-blue'));
    this.pathElements.centerE = setupPath(centerEPath, BRAND.colors.textMain, 'trace-glow-white');

    // Create glowing spark circles that ride at the head of each stroke
    this.sparkElements = [];
    const allPaths = [...this.pathElements.upper, ...this.pathElements.lower, this.pathElements.centerE];
    for (const p of allPaths) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '18');
      circle.setAttribute('fill', '#FFFFFF');
      circle.setAttribute('filter', p.color === BRAND.colors.green ? 'url(#trace-glow-green)' : 'url(#trace-glow-blue)');
      circle.style.opacity = '0';
      sparksGroup.appendChild(circle);
      this.sparkElements.push({ circle, targetPath: p });
    }
  }

  start() {
    this.startTime = performance.now();
    this.elapsed = 0;
    this.isRunning = true;
    this.isPaused = false;

    // Reset styles
    const reset = (item) => {
      item.el.style.strokeDashoffset = `${item.length}`;
      item.el.style.fillOpacity = '0';
    };
    this.pathElements.upper.forEach(reset);
    this.pathElements.lower.forEach(reset);
    reset(this.pathElements.centerE);

    this.sparkElements.forEach(s => s.circle.style.opacity = '0');

    this.callbacks.onPhaseChange?.('petals', 0);

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
    if (this.container) {
      this.container.innerHTML = '';
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
    }
  }

  loop(currentTime) {
    if (!this.isRunning || this.isPaused) return;

    if (this.reducedMotion) return;

    this.elapsed = (currentTime - this.startTime) * this.speed;
    this.update(this.elapsed);

    this.rafId = requestAnimationFrame(this.loop);
  }

  update(elapsed) {
    // Phase 1: Emblem Petals Tracing (0 - 2000ms)
    const petalTime = Math.min(TIMING_TRACE.emblemTraceEnd, elapsed);
    const petalProgress = Math.min(1.0, petalTime / TIMING_TRACE.emblemTraceEnd);
    // Smooth cubic ease-out
    const petalEase = 1 - Math.pow(1 - petalProgress, 2.5);

    const updatePetals = (list) => {
      for (const item of list) {
        const offset = item.length * (1 - petalEase);
        item.el.style.strokeDashoffset = `${offset}`;

        // As tracing finishes (progress > 0.8), fade in solid fill
        if (petalProgress > 0.75) {
          const fillAlpha = (petalProgress - 0.75) / 0.25;
          item.el.style.fillOpacity = `${fillAlpha}`;
          item.el.style.strokeWidth = `${Math.max(1, 14 * (1 - fillAlpha))}px`;
        } else {
          item.el.style.fillOpacity = '0';
          item.el.style.strokeWidth = '14px';
        }
      }
    };

    updatePetals(this.pathElements.upper);
    updatePetals(this.pathElements.lower);

    // Update Spark Heads on Petals
    const activeSparkProgress = petalEase;
    const allPetals = [...this.pathElements.upper, ...this.pathElements.lower];
    for (let i = 0; i < allPetals.length; i++) {
      const p = allPetals[i];
      const s = this.sparkElements[i];
      if (petalProgress < 0.96 && petalProgress > 0.02) {
        const currentDist = p.length * activeSparkProgress;
        const pt = p.el.getPointAtLength(currentDist);
        s.circle.setAttribute('cx', pt.x);
        s.circle.setAttribute('cy', pt.y);
        s.circle.style.opacity = '1';
      } else {
        s.circle.style.opacity = '0';
      }
    }

    // Phase 2: Central 'e' Tracing (1900 - 2800ms)
    const centerStartTime = 1900;
    if (elapsed > centerStartTime) {
      const centerElapsed = Math.min(TIMING_TRACE.centerEEnd - centerStartTime, elapsed - centerStartTime);
      const centerProgress = Math.min(1.0, centerElapsed / (TIMING_TRACE.centerEEnd - centerStartTime));
      const centerEase = 1 - Math.pow(1 - centerProgress, 2.2);

      const ce = this.pathElements.centerE;
      ce.el.style.strokeDashoffset = `${ce.length * (1 - centerEase)}`;

      if (centerProgress > 0.75) {
        const fillAlpha = (centerProgress - 0.75) / 0.25;
        ce.el.style.fillOpacity = `${fillAlpha}`;
        ce.el.style.strokeWidth = `${Math.max(1, 14 * (1 - fillAlpha))}px`;
      } else {
        ce.el.style.fillOpacity = '0';
        ce.el.style.strokeWidth = '14px';
      }

      // Spark for center 'e'
      const eSpark = this.sparkElements[this.sparkElements.length - 1];
      if (centerProgress < 0.98 && centerProgress > 0.02) {
        const currentDist = ce.length * centerEase;
        const pt = ce.el.getPointAtLength(currentDist);
        eSpark.circle.setAttribute('cx', pt.x);
        eSpark.circle.setAttribute('cy', pt.y);
        eSpark.circle.style.opacity = '1';
      } else {
        eSpark.circle.style.opacity = '0';
      }
    }

    // Phased Callback triggers
    if (elapsed < TIMING_TRACE.emblemTraceEnd) {
      this.callbacks.onPhaseChange?.('petals', elapsed);
    } else if (elapsed < TIMING_TRACE.centerEEnd) {
      this.callbacks.onPhaseChange?.('centerE', elapsed);
    } else if (elapsed < TIMING_TRACE.wordmarkEnd) {
      this.callbacks.onPhaseChange?.('wordmark', elapsed);
    } else if (elapsed < TIMING_TRACE.taglineEnd) {
      this.callbacks.onPhaseChange?.('tagline', elapsed);
    } else {
      this.callbacks.onPhaseChange?.('hold', elapsed);
    }
  }
}
