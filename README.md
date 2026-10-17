# Final Animation Ecell — E-Cell MSIT

The official brand animation presentation for **E-Cell MSIT** (Entrepreneurship Cell of Maharaja Surajmal Institute of Technology).

Built with **pure Vanilla JavaScript (ES modules)**, **HTML5 Canvas 2D**, **SVG Path Architecture**, and **CSS**. Zero heavy frameworks, zero third-party animation dependencies.

---

## 🌟 Main Presentation: Final Animation Ecell

The showcase website presents the definitive **Orbital Trace** logo animation:

1. **Phase A — Atmosphere & Spark Ignition (`0.0s – 0.3s`)**:
   - Deep cinematic radial background (`#101B30`, `#0B1220`, `#070B14`) with floating ambient stardust micro-particles.
   - Electrical sparks ignite along the contours of the emblem.
2. **Phase B — Architectural SVG Tracing & Orbital Launch (`0.3s – 2.6s`)**:
   - The orbital comet awakens **at the exact same moment tracing starts** as a single brilliant leading dot.
   - Upper green (`#00C853`) and lower blue (`#0072FF`) emblem petals are traced with spark heads traveling ahead of the lines.
   - As tracing proceeds, the alternating green/blue comet tail emerges backwards, dynamically growing in length.
3. **Phase C — Lettermark Tracing & Full Orbital Extension (`2.6s – 3.3s`)**:
   - The central lowercase `'e'` traces and fills cleanly with pure white light.
   - The orbital comet reaches 100% full length (all 32 alternating green/blue particles + stardust embers).
4. **Phase D — Logo Settle & Warm Aura (`3.3s – 3.65s`)**:
   - Emblem turns solid with soft radial backlights behind the petals.
5. **Phase E — Sequenced Typography Reveal (`3.65s – 4.95s`)**:
   - Wordmark `eCell MSIT` slides up in pure white `#F4F4F4`.
   - Tagline `IDEAS INSPIRE INVEST` expands beneath with letter-spacing tracking (`0.28em → 0.36em`).
6. **Continuous Ambient Orbital Hold (`4.95s+`)**:
   - The orbital comet loops gracefully around the completed emblem with interactive mouse avoidance.

---

## 🧪 Testing Phase Concepts (`src/testing-phase/`)

Earlier concept prototypes are preserved in `src/testing-phase/` for reference and comparative review:

- **Concept 01 · Particle Convergence** (`#/testing/1`): Physics-driven particle convergence with dual-tone halo.
- **Concept 02 · Pulse** (`#/testing/2`): Harmonic breathing pulse with acoustic wavefronts and reactive stardust.
- **Concept 03 · Trace** (`#/testing/3`): Luminous electric path tracing along authentic SVG geometric contours.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

---

## 🎨 Brand Identity Tokens (`src/shared/brand.js`)

| Token | Value / Spec | Role |
| :--- | :--- | :--- |
| **Brand Title** | `eCell MSIT` | Primary display wordmark |
| **Tagline** | `IDEAS INSPIRE INVEST` | Tracking-expanded uppercase tagline |
| **Primary Green** | `#00C853` | Top 5 emblem segments & upper glow aura |
| **Primary Blue** | `#0072FF` | Bottom 5 emblem segments & lower glow aura |
| **Pure White** | `#F4F4F4` | Wordmark typography, central lowercase 'e' |
| **Dark Field** | `#070B14`, `#0B1220`, `#101B30` | Cinematic deep blue background radial gradient |
