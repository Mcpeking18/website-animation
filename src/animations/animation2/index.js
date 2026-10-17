/**
 * Animation 2 Placeholder Module
 * Standardized module interface:
 * - mount(container): Renders clean placeholder state
 * - unmount(): Cleans up
 */

import { BRAND } from '../../shared/brand.js';

export class Animation2Module {
  constructor() {
    this.container = null;
  }

  mount(container) {
    this.container = container;
    container.innerHTML = `
      <div style="
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #F4F4F4;
        text-align: center;
        padding: 2rem;
        user-select: none;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          max-width: 520px;
          width: 100%;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        ">
          <!-- Logo Watermark -->
          <img
            src="${BRAND.resolveAsset(BRAND.assets.emblemSvg)}"
            alt="E-Cell MSIT"
            style="width: 72px; height: 72px; opacity: 0.85;"
          />

          <div style="
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(0, 114, 255, 0.08);
            color: #0072FF;
            padding: 0.3rem 0.8rem;
            border-radius: 9999px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #0072FF;"></span>
            Animation 2 · In Development
          </div>

          <h2 style="
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 1.6rem;
            font-weight: 800;
            color: #0A0A0A;
            letter-spacing: -0.02em;
            margin: 0;
          ">
            Geometric Vector Pulse
          </h2>

          <p style="
            font-family: 'Outfit', sans-serif;
            font-size: 0.92rem;
            color: #4B5563;
            line-height: 1.5;
            margin: 0;
          ">
            This route is reserved for the next brand intro concept. The modular architecture is ready to plug in its animation engine here without touching Animation 1.
          </p>

          <a href="#/animation/1" style="
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
            background: #0A0A0A;
            color: #FFFFFF;
            padding: 0.6rem 1.4rem;
            border-radius: 9999px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.82rem;
            font-weight: 600;
            text-decoration: none;
            transition: transform 0.2s ease, background-color 0.2s ease;
          " onmouseover="this.style.transform='translateY(-1px)'; this.style.backgroundColor='#262626'" onmouseout="this.style.transform='none'; this.style.backgroundColor='#0A0A0A'">
            <span>← Return to Animation 1</span>
          </a>
        </div>
      </div>
    `;
  }

  unmount() {
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}

export const animation2 = new Animation2Module();
