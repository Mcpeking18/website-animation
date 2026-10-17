/**
 * Animation 1: Particle Convergence with Cinematic Glow
 * Standardized module interface:
 * - mount(container): Builds DOM, initializes engine, binds listeners, starts reveal
 * - unmount(): Cleans up engine, disposes canvas, removes all event listeners
 */

import { ParticleGlowEngine, TIMING_A1 } from './particleGlowEngine.js';
import { BRAND } from '../../shared/brand.js';
import './style.css';

export class Animation1Module {
  constructor() {
    this.container = null;
    this.engine = null;
    this.logoAsset = null;

    this.currentDensityIndex = 1;
    this.densityConfigs = [
      { step: 5, label: 'Standard (~1.8k)' },
      { step: 4, label: 'Rich (~2.6k)' },
      { step: 3, label: 'Ultra (~4.2k)' },
    ];

    this.currentSpeedIndex = 1;
    this.speedConfigs = [0.5, 1.0, 1.5];

    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.boundHandlers = {};
  }

  mount(container) {
    this.container = container;

    // Render Clean Semantic HTML Shell
    container.innerHTML = `
      <div class="anim1-root">
        <!-- Fullscreen Canvas -->
        <canvas class="anim1-canvas" aria-hidden="true"></canvas>

        <!-- Brand Typography -->
        <section class="anim1-typography-layer" aria-live="polite">
          <h1 class="anim1-wordmark">
            <span>e</span><span>Cell</span> <span>MSIT</span>
          </h1>
          <p class="anim1-tagline">IDEAS INSPIRE INVEST</p>
        </section>

        <!-- Top Status Bar -->
        <header class="anim1-status-bar">
          <div class="anim1-brand-badge">
            <span class="anim1-status-dot"></span>
            <span class="anim1-society-title">E-Cell MSIT</span>
            <span class="anim1-phase-badge">Phase A: Particles Arrive</span>
          </div>
          <div class="anim1-timer-display">0.0s / 4.0s</div>
        </header>

        <!-- Controls Bar -->
        <nav class="anim1-controls-bar" aria-label="Animation 1 Controls">
          <button class="anim1-ctrl-btn primary btn-replay" title="Replay Animation (Press 'R' or Space)">
            <svg class="anim1-ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Replay</span>
            <kbd class="anim1-kbd-hint">R</kbd>
          </button>

          <button class="anim1-ctrl-btn btn-speed" title="Toggle Speed">
            <span>⚡</span>
            <span class="speed-label">1.0x</span>
          </button>

          <button class="anim1-ctrl-btn btn-density" title="Toggle Particle Density">
            <span>✦</span>
            <span class="density-label">Rich (~2.6k)</span>
          </button>

          <button class="anim1-ctrl-btn btn-motion" title="Toggle Reduced Motion">
            <span>♿</span>
            <span class="motion-label">${this.isReducedMotion ? 'Reduced' : 'Standard'}</span>
          </button>
        </nav>

        <!-- Timeline Progress -->
        <div class="anim1-timeline-bar-wrap">
          <div class="anim1-timeline-progress"></div>
        </div>
      </div>
    `;

    // Cache elements
    this.canvas = container.querySelector('.anim1-canvas');
    this.wordmark = container.querySelector('.anim1-wordmark');
    this.tagline = container.querySelector('.anim1-tagline');
    this.phaseBadge = container.querySelector('.anim1-phase-badge');
    this.timerDisplay = container.querySelector('.anim1-timer-display');
    this.timelineProgress = container.querySelector('.anim1-timeline-progress');

    this.btnReplay = container.querySelector('.btn-replay');
    this.btnSpeed = container.querySelector('.btn-speed');
    this.speedLabel = container.querySelector('.speed-label');
    this.btnDensity = container.querySelector('.btn-density');
    this.densityLabel = container.querySelector('.density-label');
    this.btnMotion = container.querySelector('.btn-motion');
    this.motionLabel = container.querySelector('.motion-label');

    this.initEngine();
    this.bindEvents();
  }

  initEngine() {
    const PHASE_TITLES = {
      'A': 'Phase A: Particles Arrive',
      'B': 'Phase B: Emblem Forms & Densifies',
      'C': 'Phase C: Cinematic Glow & Orbit',
      'D': 'Phase D: Wordmark Reveal',
      'E': 'Phase E: Tagline Reveal',
      'F': 'Phase F: Complete & Hold'
    };

    this.engine = new ParticleGlowEngine(this.canvas, {
      onPhaseChange: (phase) => {
        if (this.phaseBadge) {
          this.phaseBadge.textContent = PHASE_TITLES[phase] || `Phase ${phase}`;
        }

        // Phase D+: Wordmark reveal
        if (phase === 'D' || phase === 'E' || phase === 'F') {
          this.wordmark?.classList.add('is-revealed');
        } else {
          this.wordmark?.classList.remove('is-revealed');
        }

        // Phase E+: Tagline reveal
        if (phase === 'E' || phase === 'F') {
          this.tagline?.classList.add('is-revealed');
        } else {
          this.tagline?.classList.remove('is-revealed');
        }
      },
      onProgress: (progress, elapsed) => {
        if (this.timelineProgress) {
          this.timelineProgress.style.width = `${progress * 100}%`;
        }
        if (this.timerDisplay) {
          const sec = (elapsed / 1000).toFixed(1);
          this.timerDisplay.textContent = `${sec}s / 4.0s`;
        }
      },
      onComplete: () => {
        if (this.timelineProgress) this.timelineProgress.style.width = '100%';
        if (this.timerDisplay) this.timerDisplay.textContent = '4.0s / 4.0s';
        if (this.phaseBadge) this.phaseBadge.textContent = 'Phase F: Complete';
      }
    });

    this.engine.resize();

    // Load authentic master emblem with dark-mode contrast
    const emblemSrc = BRAND.resolveAsset(BRAND.assets.emblemDarkSvg || BRAND.assets.emblemPng);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = emblemSrc;

    const onLoaded = (imageObj) => {
      this.logoAsset = imageObj;
      const count = this.engine.setTargetsFromImage(
        imageObj,
        this.densityConfigs[this.currentDensityIndex].step
      );

      if (this.densityLabel) {
        this.densityLabel.textContent = `${count} Particles`;
      }

      if (this.isReducedMotion) {
        this.engine.setReducedMotion(true);
        this.wordmark?.classList.add('is-revealed');
        this.tagline?.classList.add('is-revealed');
      } else {
        this.engine.start();
      }
    };

    img.onload = () => onLoaded(img);
    img.onerror = () => {
      const fallbackImg = new Image();
      fallbackImg.src = BRAND.resolveAsset(BRAND.assets.emblemSvg);
      fallbackImg.onload = () => onLoaded(fallbackImg);
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

    this.boundHandlers.onSpeedClick = () => {
      this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.speedConfigs.length;
      const speed = this.speedConfigs[this.currentSpeedIndex];
      if (this.engine) this.engine.setSpeed(speed);
      if (this.speedLabel) this.speedLabel.textContent = `${speed.toFixed(1)}x`;
    };

    this.boundHandlers.onDensityClick = () => {
      this.currentDensityIndex = (this.currentDensityIndex + 1) % this.densityConfigs.length;
      const config = this.densityConfigs[this.currentDensityIndex];
      if (this.logoAsset && this.engine) {
        const count = this.engine.setTargetsFromImage(this.logoAsset, config.step);
        if (this.densityLabel) this.densityLabel.textContent = `${count} Particles`;
        this.replay();
      }
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
    this.btnSpeed?.addEventListener('click', this.boundHandlers.onSpeedClick);
    this.btnDensity?.addEventListener('click', this.boundHandlers.onDensityClick);
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

export const animation1 = new Animation1Module();
