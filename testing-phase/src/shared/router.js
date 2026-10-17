/**
 * E-Cell MSIT — Testing Phase Lab Router
 * - Handles navigation between all 4 test animations
 * - Manages clean lifecycle unmount / mount
 * - Renders a sleek floating switcher pill
 */

import { TESTING_ANIMATIONS, resolveAnimation } from '../registry.js';

export class Router {
  constructor(viewportContainer, selectorContainer) {
    this.viewportContainer = viewportContainer;
    this.selectorContainer = selectorContainer;
    this.currentAnimation = null;

    this.renderSelector();
    this.bindEvents();
    this.handleRoute();
  }

  renderSelector() {
    if (!this.selectorContainer) return;

    this.selectorContainer.innerHTML = `
      <nav class="lab-switcher-nav" aria-label="Testing Phase Selector">
        <div class="lab-switcher-title">
          <span class="lab-switcher-sparkle">🧪</span>
          <span class="lab-switcher-text">Testing Phase</span>
        </div>
        <div class="lab-switcher-pills">
          ${TESTING_ANIMATIONS.map((anim) => `
            <a
              href="${anim.hash}"
              class="lab-pill-btn"
              data-id="${anim.id}"
              title="${anim.description}"
            >
              <span class="pill-dot ${anim.id === '4' ? 'final' : ''}"></span>
              <span class="pill-name">${anim.shortTitle}</span>
            </a>
          `).join('')}
        </div>
      </nav>
    `;
  }

  bindEvents() {
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });
  }

  handleRoute() {
    const hash = window.location.hash;
    const targetAnimation = resolveAnimation(hash);

    if (this.currentAnimation && this.currentAnimation.id === targetAnimation.id) {
      return;
    }

    if (this.currentAnimation && this.currentAnimation.module) {
      try {
        this.currentAnimation.module.unmount?.();
      } catch (err) {
        console.error('Error during unmount:', err);
      }
    }

    this.viewportContainer.innerHTML = '';
    this.currentAnimation = targetAnimation;

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

    document.title = `E-Cell MSIT Lab — ${targetAnimation.title}`;
    this.updateSelectorUI(targetAnimation.id);
  }

  updateSelectorUI(activeId) {
    if (!this.selectorContainer) return;
    const pills = this.selectorContainer.querySelectorAll('.lab-pill-btn');
    pills.forEach((pill) => {
      if (pill.getAttribute('data-id') === activeId) {
        pill.classList.add('active');
        pill.setAttribute('aria-current', 'page');
      } else {
        pill.classList.remove('active');
        pill.removeAttribute('aria-current');
      }
    });
  }
}
