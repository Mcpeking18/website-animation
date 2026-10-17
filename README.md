# Final Animation Ecell — E-Cell MSIT

The official brand animation presentation for **E-Cell MSIT** (Entrepreneurship Cell of Maharaja Surajmal Institute of Technology).

Built with **pure Vanilla JavaScript (ES modules)**, **HTML5 Canvas 2D**, **SVG Path Architecture**, and **CSS**. Zero frameworks, zero third-party dependencies.

---

## 🌟 Animation Overview

The showcase delivers the definitive **Orbital Trace** animation for executive presentations and sharing:

1. **Atmosphere & Spark Ignition (`0.0s – 0.3s`)**:
   - Deep cinematic radial background (`#101B30`, `#0B1220`, `#070B14`) with floating ambient stardust micro-particles.
   - Electrical sparks ignite along the emblem perimeters.
2. **Architectural SVG Tracing & Orbital Head Launch (`0.3s – 2.6s`)**:
   - The orbital comet awakens **at the exact same moment tracing starts ($300\text{ms}$)** as a single brilliant leading dot.
   - Upper green (`#00C853`) and lower blue (`#0072FF`) emblem petals trace with spark heads traveling ahead of the lines.
   - The alternating green/blue comet tail emerges backwards, dynamically elongating toward full length.
   - **Comet Head Wake ("Snake Litter Effect")**: The leading head continuously sheds a sparkling shower of brand-blue, brand-green, and white stardust embers into its wake, drifting backward against the orbital curve.
3. **Lettermark Tracing & Full Orbital Extension (`2.6s – 3.3s`)**:
   - The central lowercase `'e'` traces and fills with pure white light.
   - The orbital comet reaches 100% full length (32 alternating green/blue dots with stardust halo wake).
4. **Logo Settle & Radial Backlight Bloom (`3.3s – 3.65s`)**:
   - The emblem transitions into solid color with layered green, blue, and warm core radial glows illuminating the background.
5. **Sequenced Typography Reveal (`3.65s – 4.95s`)**:
   - Wordmark `eCell MSIT` glides upward in pure white (`#F4F4F4`).
   - Tagline `IDEAS INSPIRE INVEST` expands beneath with letter-spacing tracking (`0.28em → 0.36em`).
6. **Continuous Ambient Orbital Hold (`4.95s+`)**:
   - The orbital comet loops gracefully around the completed emblem with reactive cursor avoidance and stardust embers.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start presentation server
npm run dev

# Build production bundle
npm run build
```

> **Note:** Earlier concept prototypes are preserved in the `testing-phase/` directory and can be launched via `npm run test-lab`.

---

## ⌨️ Controls & Interaction

| Input | Action |
| :--- | :--- |
| **Replay Button** | Click the floating pill button at bottom center |
| <kbd>R</kbd> or <kbd>Space</kbd> | Instant keyboard shortcut to replay the animation from start |
| **Mouse Hover** | Interactive particle deflection — comet and stardust avoid the cursor |

---

## 🎨 Brand Identity Tokens (`src/shared/brand.js`)

| Token | Value / Spec | Role |
| :--- | :--- | :--- |
| **Brand Title** | `eCell MSIT` | Primary display wordmark (`#F4F4F4`) |
| **Tagline** | `IDEAS INSPIRE INVEST` | Tracking-expanded uppercase tagline (`#9CA3AF`) |
| **Primary Green** | `#00C853` | Top 5 emblem petals & upper halo bloom |
| **Primary Blue** | `#0072FF` | Bottom 5 emblem petals & lower halo bloom |
| **Pure White** | `#F4F4F4` | Central lowercase 'e' and wordmark typography |
| **Cosmic Dark** | `#070B14`, `#0B1220`, `#101B30` | Deep radial gradient background |

---

## 🛠️ Customization Quick Reference

- **Wordmark & Tagline Text**: [src/final-animation/index.js](file:///src/final-animation/index.js) (lines 37–40)
- **Font Sizes & Spacing**: [src/final-animation/style.css](file:///src/final-animation/style.css) (`.anim4-wordmark` and `.anim4-tagline`)
- **Phase Timings & Speeds**: [src/final-animation/orbitalTraceEngine.js](file:///src/final-animation/orbitalTraceEngine.js) (`TIMING_ORBITAL_TRACE` object)
