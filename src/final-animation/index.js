/**
 * Animation 4: Orbital Trace (Cinematic Orbital Comets + SVG Tracing)
 * Standardized module interface:
 * - mount(container): Builds DOM, initializes engine, binds listeners, starts reveal
 * - unmount(): Cleans up engine, removes all event listeners
 */

import { OrbitalTraceEngine, TIMING_ORBITAL_TRACE } from './orbitalTraceEngine.js';
import './style.css';

export class Animation4Module {
  constructor() {
    this.container = null;
    this.engine = null;

    this.currentSpeedIndex = 1;
    this.speedConfigs = [0.75, 1.0, 1.4];

    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.boundHandlers = {};
  }

  mount(container) {
    this.container = container;

    // Semantic HTML Layout
    container.innerHTML = `
      <div class="anim4-root">
        <!-- Canvas Layer (Deep gradient, ambient stardust, dual orbital comets) -->
        <canvas class="anim4-canvas"></canvas>

        <!-- SVG Tracing Mount Container -->
        <div class="anim4-svg-container"></div>

        <!-- Brand Typography -->
        <section class="anim4-typography-layer" aria-live="polite">
          <h1 class="anim4-wordmark">
            <span>e</span><span>Cell</span> <span>MSIT</span>
          </h1>
          <p class="anim4-tagline">IDEAS INSPIRE INVEST</p>
        </section>

        <!-- Top Status Bar -->
        <header class="anim4-status-bar">
          <div class="anim4-brand-badge">
            <span class="anim4-status-dot"></span>
            <span class="anim4-society-title">E-Cell MSIT</span>
            <span class="anim4-phase-badge">Orbital Atmosphere</span>
          </div>
          <div class="anim4-timer-display">0.0s / 4.9s</div>
        </header>

        <!-- Controls Bar -->
        <nav class="anim4-controls-bar" aria-label="Orbital Trace Animation Controls">
          <button class="anim4-ctrl-btn primary btn-replay" title="Replay Animation (Press 'R' or Space)">
            <svg class="anim4-ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Replay</span>
            <kbd class="anim4-kbd-hint">R</kbd>
          </button>

          <button class="anim4-ctrl-btn btn-speed" title="Toggle Tracing Speed">
            <span>⚡</span>
            <span class="speed-label">1.0x Speed</span>
          </button>

          <button class="anim4-ctrl-btn btn-motion" title="Toggle Reduced Motion">
            <span>♿</span>
            <span class="motion-label">${this.isReducedMotion ? 'Reduced' : 'Standard'}</span>
          </button>
        </nav>
      </div>
    `;

    // Cache elements
    this.canvas = container.querySelector('.anim4-canvas');
    this.svgContainer = container.querySelector('.anim4-svg-container');
    this.wordmark = container.querySelector('.anim4-wordmark');
    this.tagline = container.querySelector('.anim4-tagline');
    this.phaseBadge = container.querySelector('.anim4-phase-badge');
    this.timerDisplay = container.querySelector('.anim4-timer-display');

    this.btnReplay = container.querySelector('.btn-replay');
    this.btnSpeed = container.querySelector('.btn-speed');
    this.speedLabel = container.querySelector('.speed-label');
    this.btnMotion = container.querySelector('.btn-motion');
    this.motionLabel = container.querySelector('.motion-label');

    this.initEngine();
    this.bindEvents();
  }

  initEngine() {
    const PHASE_TITLES = {
      'atmosphere': 'Phase A · Atmosphere Awakens',
      'tracing': 'Phase B · Tracing SVG Petals',
      'orbitalTracing': 'Phase B · Orbital Energy Arrives',
      'centerE': 'Phase C · Tracing Lettermark',
      'resolving': 'Phase C · Emblem Resolves',
      'wordmark': 'Phase D · Wordmark Emerges',
      'tagline': 'Phase E · Tagline Expands',
      'hold': 'Phase F · Celestial Orbital Hold'
    };

    this.engine = new OrbitalTraceEngine(this.canvas, this.svgContainer, {
      onPhaseChange: (phase, elapsed) => {
        if (this.phaseBadge && PHASE_TITLES[phase]) {
          this.phaseBadge.textContent = PHASE_TITLES[phase];
        }

        if (this.timerDisplay && typeof elapsed === 'number') {
          const sec = (elapsed / 1000).toFixed(1);
          this.timerDisplay.textContent = `${sec}s / 5.1s`;
        }

        // Trigger typography reveals sequentially
        if (phase === 'wordmark' || phase === 'tagline' || phase === 'hold') {
          this.wordmark?.classList.add('is-revealed');
        } else {
          this.wordmark?.classList.remove('is-revealed');
        }

        if (phase === 'tagline' || phase === 'hold') {
          this.tagline?.classList.add('is-revealed');
        } else {
          this.tagline?.classList.remove('is-revealed');
        }
      }
    });

    if (this.isReducedMotion) {
      this.engine.setReducedMotion(true);
      this.wordmark?.classList.add('is-revealed');
      this.tagline?.classList.add('is-revealed');
    } else {
      this.engine.start();
    }
  }

  bindEvents() {
    this.boundHandlers.onResize = () => {
      this.engine?.resize();
    };
    window.addEventListener('resize', this.boundHandlers.onResize);

    // Replay
    this.boundHandlers.onReplay = () => {
      this.wordmark?.classList.remove('is-revealed');
      this.tagline?.classList.remove('is-revealed');
      this.engine?.start();
    };
    this.btnReplay?.addEventListener('click', this.boundHandlers.onReplay);

    // Speed toggle
    this.boundHandlers.onSpeedToggle = () => {
      this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.speedConfigs.length;
      const speed = this.speedConfigs[this.currentSpeedIndex];
      this.engine?.setSpeed(speed);
      if (this.speedLabel) {
        this.speedLabel.textContent = `${speed}x Speed`;
      }
    };
    this.btnSpeed?.addEventListener('click', this.boundHandlers.onSpeedToggle);

    // Reduced Motion toggle
    this.boundHandlers.onMotionToggle = () => {
      this.isReducedMotion = !this.isReducedMotion;
      this.engine?.setReducedMotion(this.isReducedMotion);
      if (this.motionLabel) {
        this.motionLabel.textContent = this.isReducedMotion ? 'Reduced' : 'Standard';
      }
      if (this.isReducedMotion) {
        this.wordmark?.classList.add('is-revealed');
        this.tagline?.classList.add('is-revealed');
      } else {
        this.boundHandlers.onReplay();
      }
    };
    this.btnMotion?.addEventListener('click', this.boundHandlers.onMotionToggle);

    // Keyboard Shortcuts (R = Replay, Space = Replay)
    this.boundHandlers.onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'KeyR' || e.code === 'Space') {
        e.preventDefault();
        this.boundHandlers.onReplay();
      }
    };
    window.addEventListener('keydown', this.boundHandlers.onKeyDown);
  }

  unmount() {
    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
    }

    if (this.boundHandlers.onResize) {
      window.removeEventListener('resize', this.boundHandlers.onResize);
    }
    if (this.boundHandlers.onKeyDown) {
      window.removeEventListener('keydown', this.boundHandlers.onKeyDown);
    }

    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}

export const finalAnimation = new Animation4Module();
export const animation4 = finalAnimation;
