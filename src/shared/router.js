/**
 * E-Cell MSIT — Router & Presentation Orchestrator
 * - Seamlessly routes between the Main Showcase (Final Animation Ecell)
 *   and the Testing Phase concepts (Particle, Pulse, Trace)
 * - Strict lifecycle management (clean unmount / mount)
 */

import { FINAL_ANIMATION, TESTING_ANIMATIONS, resolveAnimation } from '../registry.js';

export class Router {
  constructor(viewportContainer, selectorContainer) {
    this.viewportContainer = viewportContainer;
    this.selectorContainer = selectorContainer;
    this.currentAnimation = null;

    this.bindEvents();
    this.handleRoute();
  }

  renderSelector(activeAnimation) {
    if (!this.selectorContainer) return;

    const isFinal = activeAnimation.id === 'final';

    if (isFinal) {
      // In Final mode: clean, executive presentation bar with subtle testing link
      this.selectorContainer.innerHTML = `
        <nav class="lab-switcher-nav final-mode-nav" aria-label="Official Animation Controls">
          <div class="lab-switcher-title">
            <span class="lab-switcher-sparkle">✦</span>
            <span class="lab-switcher-text">Final Animation Ecell</span>
          </div>
          <div class="lab-switcher-pills">
            <a
              href="#/testing/1"
              class="lab-pill-btn testing-link"
              title="Review earlier prototype concepts (Particle, Pulse, Trace)"
            >
              <span class="pill-dot testing"></span>
              <span class="pill-name">🧪 Testing Phase</span>
            </a>
          </div>
        </nav>
      `;
    } else {
      // In Testing Phase mode: full switcher showing test concepts + link back to Final
      this.selectorContainer.innerHTML = `
        <nav class="lab-switcher-nav testing-mode-nav" aria-label="Testing Phase Selector">
          <div class="lab-switcher-title">
            <span class="lab-switcher-sparkle">🧪</span>
            <span class="lab-switcher-text">Testing Phase</span>
          </div>
          <div class="lab-switcher-pills">
            ${TESTING_ANIMATIONS.slice(0, 3).map((anim) => `
              <a
                href="${anim.hash}"
                class="lab-pill-btn ${anim.id === activeAnimation.id ? 'active' : ''}"
                data-id="${anim.id}"
                title="${anim.description}"
              >
                <span class="pill-dot"></span>
                <span class="pill-name">${anim.shortTitle}</span>
              </a>
            `).join('')}
            <a
              href="#/final"
              class="lab-pill-btn final-link-btn"
              title="Return to the official Final Animation"
            >
              <span class="pill-dot final"></span>
              <span class="pill-name">★ Final Animation</span>
            </a>
          </div>
        </nav>
      `;
    }
  }

  bindEvents() {
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });
  }

  handleRoute() {
    const hash = window.location.hash;
    const targetAnimation = resolveAnimation(hash);

    // If already active, don't re-mount
    if (this.currentAnimation && this.currentAnimation.id === targetAnimation.id) {
      return;
    }

    // 1. Cleanly unmount previous animation
    if (this.currentAnimation && this.currentAnimation.module) {
      try {
        this.currentAnimation.module.unmount?.();
      } catch (err) {
        console.error('Error during animation unmount:', err);
      }
    }

    // Clear viewport container
    this.viewportContainer.innerHTML = '';
    this.currentAnimation = targetAnimation;

    // 2. Mount new animation
    try {
      targetAnimation.module.mount(this.viewportContainer);
    } catch (err) {
      console.error(`Error mounting ${targetAnimation.title}:`, err);
      this.viewportContainer.innerHTML = `
        <div style="padding: 3rem; text-align: center; color: #DC2626;">
          <h3>Failed to load animation</h3>
          <p>${err.message}</p>
        </div>
      `;
    }

    // 3. Update Document Title
    if (targetAnimation.id === 'final') {
      document.title = 'Final Animation Ecell';
    } else {
      document.title = `E-Cell MSIT Lab — ${targetAnimation.title}`;
    }

    // 4. Update selector UI
    this.renderSelector(targetAnimation);
  }
}
