/**
 * E-Cell MSIT Animation Lab — Lightweight Hash Router & Selector
 * - Handles navigation between animation pages without server configuration
 * - Manages strict lifecycle (clean unmount of previous animation, clean mount of next)
 * - Renders a sleek, unobtrusive floating selector pill
 */

import { ANIMATIONS, resolveAnimation } from '../registry.js';

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
      <nav class="lab-switcher-nav" aria-label="Animation Lab Selector">
        <div class="lab-switcher-title">
          <span class="lab-switcher-sparkle">✦</span>
          <span class="lab-switcher-text">Animation Lab</span>
        </div>
        <div class="lab-switcher-pills">
          ${ANIMATIONS.map((anim) => `
            <a
              href="${anim.hash}"
              class="lab-pill-btn"
              data-id="${anim.id}"
              title="${anim.description}"
            >
              <span class="pill-dot"></span>
              <span class="pill-name">${anim.shortTitle}</span>
              ${anim.status === 'in-dev' ? '<span class="pill-tag dev">WIP</span>' : ''}
              ${anim.status === 'planned' ? '<span class="pill-tag plan">Idea</span>' : ''}
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
    document.title = `E-Cell MSIT Lab — ${targetAnimation.title}`;

    // 4. Update selector active pill
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
