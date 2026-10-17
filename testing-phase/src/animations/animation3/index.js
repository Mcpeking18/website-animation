/**
 * Animation 3: Trace (Geometric Path Tracing)
 * Standardized module interface:
 * - mount(container): Builds DOM, initializes engine, binds listeners, starts reveal
 * - unmount(): Cleans up engine, removes all event listeners
 */

import { TraceEngine, TIMING_TRACE } from './traceEngine.js';
import './style.css';

export class Animation3Module {
  constructor() {
    this.container = null;
    this.engine = null;

    this.currentSpeedIndex = 1;
    this.speedConfigs = [0.6, 1.0, 1.5];

    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.boundHandlers = {};
  }

  mount(container) {
    this.container = container;

    // Render Clean Semantic HTML Shell
    container.innerHTML = `
      <div class="anim3-root">
        <!-- SVG Tracing Mount Container -->
        <div class="anim3-trace-container"></div>

        <!-- Brand Typography -->
        <section class="anim3-typography-layer" aria-live="polite">
          <h1 class="anim3-wordmark">
            <span>e</span><span>Cell</span> <span>MSIT</span>
          </h1>
          <p class="anim3-tagline">IDEAS INSPIRE INVEST</p>
        </section>

        <!-- Top Status Bar -->
        <header class="anim3-status-bar">
          <div class="anim3-brand-badge">
            <span class="anim3-status-dot"></span>
            <span class="anim3-society-title">E-Cell MSIT</span>
            <span class="anim3-phase-badge">Tracing Petals</span>
          </div>
          <div class="anim3-timer-display">0.0s / 4.2s</div>
        </header>

        <!-- Controls Bar -->
        <nav class="anim3-controls-bar" aria-label="Trace Animation Controls">
          <button class="anim3-ctrl-btn primary btn-replay" title="Replay Animation (Press 'R' or Space)">
            <svg class="anim3-ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Replay</span>
            <kbd class="anim3-kbd-hint">R</kbd>
          </button>

          <button class="anim3-ctrl-btn btn-speed" title="Toggle Tracing Speed">
            <span>⚡</span>
            <span class="speed-label">1.0x Speed</span>
          </button>

          <button class="anim3-ctrl-btn btn-motion" title="Toggle Reduced Motion">
            <span>♿</span>
            <span class="motion-label">${this.isReducedMotion ? 'Reduced' : 'Standard'}</span>
          </button>
        </nav>
      </div>
    `;

    // Cache elements
    this.traceWrap = container.querySelector('.anim3-trace-container');
    this.wordmark = container.querySelector('.anim3-wordmark');
    this.tagline = container.querySelector('.anim3-tagline');
    this.phaseBadge = container.querySelector('.anim3-phase-badge');
    this.timerDisplay = container.querySelector('.anim3-timer-display');

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
      'petals': 'Tracing Petal Geometry',
      'centerE': 'Illuminating Core Lettermark',
      'wordmark': 'Wordmark Emerges',
      'tagline': 'Tagline Expands',
      'hold': 'Complete Geometry'
    };

    this.engine = new TraceEngine(this.traceWrap, {
      onPhaseChange: (phase, elapsed) => {
        if (this.phaseBadge) {
          this.phaseBadge.textContent = PHASE_TITLES[phase] || phase;
        }

        if (this.timerDisplay) {
          const sec = Math.min(4.2, elapsed / 1000).toFixed(1);
          this.timerDisplay.textContent = `${sec}s / 4.2s`;
        }

        // Sequential text reveals
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

  replay() {
    if (!this.engine) return;

    this.wordmark?.classList.remove('is-revealed');
    this.tagline?.classList.remove('is-revealed');

    if (this.isReducedMotion) {
      this.wordmark?.classList.add('is-revealed');
      this.tagline?.classList.add('is-revealed');
      this.engine.setReducedMotion(true);
      return;
    }

    this.engine.start();
  }

  bindEvents() {
    this.boundHandlers.onKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
        e.preventDefault();
        this.replay();
      }
    };

    this.boundHandlers.onReplayClick = () => this.replay();

    this.boundHandlers.onSpeedClick = () => {
      this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.speedConfigs.length;
      const spd = this.speedConfigs[this.currentSpeedIndex];
      if (this.engine) this.engine.setSpeed(spd);
      if (this.speedLabel) this.speedLabel.textContent = `${spd.toFixed(1)}x Speed`;
    };

    this.boundHandlers.onMotionClick = () => {
      this.isReducedMotion = !this.isReducedMotion;
      if (this.motionLabel) {
        this.motionLabel.textContent = this.isReducedMotion ? 'Reduced' : 'Standard';
      }
      if (this.isReducedMotion) {
        this.engine.setReducedMotion(true);
        this.wordmark?.classList.add('is-revealed');
        this.tagline?.classList.add('is-revealed');
      } else {
        this.engine.setReducedMotion(false);
        this.replay();
      }
    };

    window.addEventListener('keydown', this.boundHandlers.onKeyDown);
    this.btnReplay?.addEventListener('click', this.boundHandlers.onReplayClick);
    this.btnSpeed?.addEventListener('click', this.boundHandlers.onSpeedClick);
    this.btnMotion?.addEventListener('click', this.boundHandlers.onMotionClick);
  }

  unmount() {
    window.removeEventListener('keydown', this.boundHandlers.onKeyDown);

    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
    }

    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}

export const animation3 = new Animation3Module();
