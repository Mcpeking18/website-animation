/**
 * E-Cell MSIT Particle Logo Reveal — Main Application (Vanilla JavaScript)
 * Orchestrates Canvas 2D engine, sequential typography reveals, and user interactions.
 */

import './style.css';
import { ParticleEngine, BRAND_COLORS, TIMING } from './particleEngine.js';

// DOM Elements
const canvas = document.getElementById('particle-canvas');
const wordmark = document.getElementById('brand-wordmark');
const tagline = document.getElementById('brand-tagline');
const phaseBadge = document.getElementById('phase-badge');
const timerDisplay = document.getElementById('timer-display');
const timelineProgress = document.getElementById('timeline-progress');

// Controls
const btnReplay = document.getElementById('btn-replay');
const btnSpeed = document.getElementById('btn-speed');
const speedLabel = document.getElementById('speed-label');
const btnDensity = document.getElementById('btn-density');
const densityLabel = document.getElementById('density-label');
const btnReducedMotion = document.getElementById('btn-reduced-motion');
const motionLabel = document.getElementById('motion-label');

// State
let engine = null;
let logoAsset = null;
let currentDensityIndex = 1; // 0: Standard, 1: Rich, 2: Ultra
const DENSITY_CONFIGS = [
  { step: 4, label: 'Standard (~1.8k)' },
  { step: 3, label: 'Rich (~2.6k)' },
  { step: 2, label: 'Ultra (~4.2k)' }
];

let currentSpeedIndex = 1; // 0: 0.5x, 1: 1.0x, 2: 1.5x
const SPEED_CONFIGS = [0.5, 1.0, 1.5];

let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PHASE_TITLES = {
  'A': 'Phase A: Particles Arrive',
  'B': 'Phase B: Logo Forms & Darkens',
  'C': 'Phase C: Wordmark Appears',
  'D': 'Phase D: Tagline Appears',
  'E': 'Phase E: Identity Complete'
};

function handlePhaseChange(phase, elapsed) {
  if (phaseBadge) {
    phaseBadge.textContent = PHASE_TITLES[phase] || `Phase ${phase}`;
  }

  // Phase C: Wordmark Reveal (2.3s – 2.9s)
  if (phase === 'C' || phase === 'D' || phase === 'E') {
    wordmark?.classList.add('is-revealed');
  } else {
    wordmark?.classList.remove('is-revealed');
  }

  // Phase D: Tagline Reveal (2.9s – 3.5s)
  if (phase === 'D' || phase === 'E') {
    tagline?.classList.add('is-revealed');
  } else {
    tagline?.classList.remove('is-revealed');
  }
}

function updateProgressUI() {
  if (!engine) return;

  const elapsed = engine.elapsed;
  const total = TIMING.totalDuration;
  const progress = Math.min(1.0, elapsed / total);

  if (timelineProgress) {
    timelineProgress.style.width = `${progress * 100}%`;
  }

  if (timerDisplay) {
    const sec = (elapsed / 1000).toFixed(1);
    timerDisplay.textContent = `${sec}s / 3.5s`;
  }

  if (engine.isRunning && !engine.isPaused) {
    requestAnimationFrame(updateProgressUI);
  }
}

function replayAnimation() {
  if (!engine) return;

  wordmark?.classList.remove('is-revealed');
  tagline?.classList.remove('is-revealed');

  if (isReducedMotion) {
    wordmark?.classList.add('is-revealed');
    tagline?.classList.add('is-revealed');
    engine.setReducedMotion(true);
    return;
  }

  engine.start();
  requestAnimationFrame(updateProgressUI);
}

function initAnimation() {
  engine = new ParticleEngine(canvas, {
    onPhaseChange: (phase, elapsed) => {
      handlePhaseChange(phase, elapsed);
    },
    onComplete: () => {
      if (timelineProgress) timelineProgress.style.width = '100%';
      if (timerDisplay) timerDisplay.textContent = '3.5s / 3.5s';
      if (phaseBadge) phaseBadge.textContent = 'Phase E: Complete';
    }
  });

  engine.resize();

  // Load official final logo asset with support for root or subpath deployments
  const baseUrl = (import.meta.env.BASE_URL || './').replace(/\/?$/, '/');
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = `${baseUrl}assets/final_ecell_logo.png`;

  const onLoaded = (imageObj) => {
    logoAsset = imageObj;
    const count = engine.setTargetsFromImage(imageObj, DENSITY_CONFIGS[currentDensityIndex].step);
    if (densityLabel) densityLabel.textContent = `${count} Particles`;

    if (isReducedMotion) {
      engine.setReducedMotion(true);
      if (motionLabel) motionLabel.textContent = 'Reduced';
      wordmark?.classList.add('is-revealed');
      tagline?.classList.add('is-revealed');
    } else {
      engine.start();
      requestAnimationFrame(updateProgressUI);
    }
  };

  img.onload = () => onLoaded(img);

  img.onerror = () => {
    // Fallback to SVG
    const svgImg = new Image();
    svgImg.src = `${baseUrl}assets/final_ecell_logo.svg`;
    svgImg.onload = () => onLoaded(svgImg);
  };
}

function setupEvents() {
  window.addEventListener('resize', () => {
    if (engine) engine.resize();
  });

  btnReplay?.addEventListener('click', replayAnimation);

  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
      e.preventDefault();
      replayAnimation();
    }
  });

  btnSpeed?.addEventListener('click', () => {
    currentSpeedIndex = (currentSpeedIndex + 1) % SPEED_CONFIGS.length;
    const speed = SPEED_CONFIGS[currentSpeedIndex];
    if (speedLabel) speedLabel.textContent = `${speed.toFixed(1)}x`;
    if (engine) engine.setSpeed(speed);
  });

  btnDensity?.addEventListener('click', () => {
    currentDensityIndex = (currentDensityIndex + 1) % DENSITY_CONFIGS.length;
    const config = DENSITY_CONFIGS[currentDensityIndex];
    if (densityLabel) densityLabel.textContent = config.label;

    if (engine && logoAsset) {
      const count = engine.setTargetsFromImage(logoAsset, config.step);
      if (densityLabel) densityLabel.textContent = `${count} Particles`;
      replayAnimation();
    }
  });

  btnReducedMotion?.addEventListener('click', () => {
    isReducedMotion = !isReducedMotion;
    if (motionLabel) motionLabel.textContent = isReducedMotion ? 'Reduced' : 'Standard';
    if (btnReducedMotion) {
      if (isReducedMotion) btnReducedMotion.classList.add('active');
      else btnReducedMotion.classList.remove('active');
    }
    if (engine) {
      engine.setReducedMotion(isReducedMotion);
      if (!isReducedMotion) {
        replayAnimation();
      }
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!engine) return;
    if (document.hidden) {
      engine.pause();
    } else {
      engine.resume();
      requestAnimationFrame(updateProgressUI);
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupEvents();
  initAnimation();
});
