/**
 * Animation 2: Pulse (Breathing Glow & Halo)
 * Standardized module interface:
 * - mount(container): Builds DOM, initializes engine, binds listeners, starts reveal
 * - unmount(): Cleans up engine, disposes canvas, removes all event listeners
 */

import { PulseEngine, TIMING_PULSE } from './pulseEngine.js';
import { BRAND } from '../../shared/brand.js';
import './style.css';

export class Animation2Module {
  constructor() {
    this.container = null;
    this.engine = null;

    this.currentTempoIndex = 1;
    this.tempoConfigs = [0.6, 1.0, 1.5];

    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.boundHandlers = {};
  }

  mount(container) {
    this.container = container;

    // Render Clean Semantic HTML Shell
    container.innerHTML = `
      <div class="anim2-root">
        <!-- Fullscreen Canvas -->
        <canvas class="anim2-canvas" aria-hidden="true"></canvas>

        <!-- Brand Typography -->
        <section class="anim2-typography-layer" aria-live="polite">
          <h1 class="anim2-wordmark">
            <span>e</span><span>Cell</span> <span>MSIT</span>
          </h1>
          <p class="anim2-tagline">IDEAS INSPIRE INVEST</p>
        </section>

        <!-- Top Status Bar -->
        <header class="anim2-status-bar">
          <div class="anim2-brand-badge">
            <span class="anim2-status-dot"></span>
            <span class="anim2-society-title">E-Cell MSIT</span>
            <span class="anim2-phase-badge">Pulse Awakens</span>
          </div>
          <div class="anim2-timer-display">0.0s / 3.2s</div>
        </header>

        <!-- Controls Bar -->
        <nav class="anim2-controls-bar" aria-label="Pulse Animation Controls">
          <button class="anim2-ctrl-btn primary btn-replay" title="Replay Animation (Press 'R' or Space)">
            <svg class="anim2-ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Replay</span>
            <kbd class="anim2-kbd-hint">R</kbd>
          </button>

          <button class="anim2-ctrl-btn btn-tempo" title="Toggle Pulse Breathing Speed">
            <span>🫀</span>
            <span class="tempo-label">1.0x Tempo</span>
          </button>

          <button class="anim2-ctrl-btn btn-motion" title="Toggle Reduced Motion">
            <span>♿</span>
            <span class="motion-label">${this.isReducedMotion ? 'Reduced' : 'Standard'}</span>
          </button>
        </nav>
      </div>
    `;

    // Cache elements
    this.canvas = container.querySelector('.anim2-canvas');
    this.wordmark = container.querySelector('.anim2-wordmark');
    this.tagline = container.querySelector('.anim2-tagline');
    this.phaseBadge = container.querySelector('.anim2-phase-badge');
    this.timerDisplay = container.querySelector('.anim2-timer-display');

    this.btnReplay = container.querySelector('.btn-replay');
    this.btnTempo = container.querySelector('.btn-tempo');
    this.tempoLabel = container.querySelector('.tempo-label');
    this.btnMotion = container.querySelector('.btn-motion');
    this.motionLabel = container.querySelector('.motion-label');

    this.initEngine();
    this.bindEvents();
  }

  initEngine() {
    const PHASE_TITLES = {
      'intro': 'Pulse Awakens',
      'wordmark': 'Wordmark Resonates',
      'tagline': 'Tagline Harmonizes',
      'hold': 'Harmonic Breathing Hold'
    };

    this.engine = new PulseEngine(this.canvas, {
      onPhaseChange: (phase, elapsed) => {
        if (this.phaseBadge) {
          this.phaseBadge.textContent = PHASE_TITLES[phase] || phase;
        }

        if (this.timerDisplay) {
          const sec = Math.min(3.2, elapsed / 1000).toFixed(1);
          this.timerDisplay.textContent = `${sec}s / 3.2s`;
        }

        // Sequential reveals
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

    this.engine.resize();

    // Load authentic master emblem for dark mode
    const emblemSrc = BRAND.resolveAsset(BRAND.assets.emblemDarkSvg || BRAND.assets.emblemSvg);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = emblemSrc;

    img.onload = () => {
      this.engine.setEmblem(img);
      if (this.isReducedMotion) {
        this.engine.setReducedMotion(true);
        this.wordmark?.classList.add('is-revealed');
        this.tagline?.classList.add('is-revealed');
      } else {
        this.engine.start();
      }
    };

    img.onerror = () => {
      // Fallback
      const fallbackImg = new Image();
      fallbackImg.src = BRAND.resolveAsset(BRAND.assets.emblemSvg);
      fallbackImg.onload = () => {
        this.engine.setEmblem(fallbackImg);
        this.engine.start();
      };
    };
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
    this.boundHandlers.onResize = () => {
      if (this.engine) this.engine.resize();
    };

    this.boundHandlers.onKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
        e.preventDefault();
        this.replay();
      }
    };

    this.boundHandlers.onReplayClick = () => this.replay();

    this.boundHandlers.onTempoClick = () => {
      this.currentTempoIndex = (this.currentTempoIndex + 1) % this.tempoConfigs.length;
      const tempo = this.tempoConfigs[this.currentTempoIndex];
      if (this.engine) this.engine.setTempo(tempo);
      if (this.tempoLabel) this.tempoLabel.textContent = `${tempo.toFixed(1)}x Tempo`;
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

    window.addEventListener('resize', this.boundHandlers.onResize);
    window.addEventListener('keydown', this.boundHandlers.onKeyDown);

    this.btnReplay?.addEventListener('click', this.boundHandlers.onReplayClick);
    this.btnTempo?.addEventListener('click', this.boundHandlers.onTempoClick);
    this.btnMotion?.addEventListener('click', this.boundHandlers.onMotionClick);
  }

  unmount() {
    window.removeEventListener('resize', this.boundHandlers.onResize);
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

export const animation2 = new Animation2Module();
