# E-Cell MSIT — Animation Lab

An extensible, standalone animation playground for **E-Cell MSIT** (Entrepreneurship Cell of Maharaja Surajmal Institute of Technology).

Built with **pure Vanilla JavaScript (ES modules)**, **HTML5 Canvas 2D**, and **CSS**. Zero heavy frameworks, zero third-party animation libraries.

The lab is architected to develop multiple alternative logo animations over time. Each animation is an isolated module with its own lifecycle (`mount` / `unmount`), accessible via a clean hash-based router.

---

## 🎨 Brand Identity Tokens (`src/shared/brand.js`)

| Token | Value / Spec | Role |
| :--- | :--- | :--- |
| **Brand Title** | `eCell MSIT` | Primary display wordmark |
| **Tagline** | `IDEAS INSPIRE INVEST` | Tracking-expanded uppercase tagline |
| **Primary Green** | `#00C853` | Top 5 emblem segments & upper glow aura |
| **Primary Blue** | `#0072FF` | Bottom 5 emblem segments & lower glow aura |
| **Neutral Black** | `#0A0A0A` | Central lowercase 'e', wordmark typography |
| **Light Canvas** | `#F4F4F4` | Clean light background |
| **Neutral Grey** | `#9CA3AF` / `#4B5563` | Subtitles, borders & badge text |

---

## 🧭 Animation Lab Routes

- **`#/animation/1`** *(Default)* — **Animation 1: Particle Convergence with Cinematic Glow**
- **`#/animation/2`** — **Animation 2: Geometric Vector Pulse** *(Reserved / In Development)*
- **`#/animation/3`** — **Animation 3: Kinetic Line Synthesis** *(Reserved / Planned)*

The minimal floating switcher pill at the bottom of the screen lets you instantly jump between concepts without dominating the canvas.

---

## ✨ Animation 1: Particle Convergence + Cinematic Glow

An atmospheric, cinematic logo reveal combining physics-driven particle convergence with soft ambient lighting:

1. **Phase A — Particle Arrival (`0.0s – 0.9s`)**:
   - Thousands of particles spawn along screen perimeters and stream inward with organic curved trajectories. Green particles arrive from top angles, blue from bottom, and black towards center.
2. **Phase B — Emblem Formation (`0.9s – 2.2s`)**:
   - Damped spring physics (`spring = 0.08`, `damping = 0.83`) decelerate particles into their sampled pixel coordinates on the official emblem. The logo densifies and darkens into crisp definition.
3. **Phase C — Cinematic Glow & Orbital Trail (`2.2s – 2.8s`)**:
   - A dual-tone radial ambient bloom (*soft green on top, blue on bottom*) develops smoothly **behind** the emblem, illuminating the scene without washing out logo colors.
   - A luminous elliptical particle trail glides gracefully around the emblem with a sparkling comet tail.
   - Subtle 4-point sparkle glints shimmer on apex vertices.
4. **Phase D — Wordmark Reveal (`2.8s – 3.4s`)**:
   - `eCell MSIT` fades into view with a smooth upward translation (`translateY(18px) → 0`).
5. **Phase E — Tagline Reveal (`3.4s – 4.0s`)**:
   - `IDEAS INSPIRE INVEST` expands beneath the wordmark with letter-spacing tracking (`0.22em → 0.36em`).
6. **Phase F — Final Composition Hold (`4.0s+`)**:
   - The glow settles into a soft ambient halo.
   - The official vector SVG crossfades smoothly for 100% vector sharpness.
   - Subtle micro-particles drift lazily in the peripheral background.

---

## 🕹️ Interactive Controls

- **Replay**: Click **Replay** or press <kbd>R</kbd> or <kbd>Space</kbd> at any time.
- **Speed**: Toggle playback speeds (`0.5x` slow-motion, `1.0x` standard, `1.5x` fast).
- **Density**: Cycle particle counts between **Standard** (~1.8k), **Rich** (~2.6k), and **Ultra** (~4.2k).
- **Interactive Cursor Repulsion**: Move your mouse or touch-drag over the canvas to gently push particles with a magnetic repulsive field.
- **Reduced Motion**: Automatically detects `prefers-reduced-motion` and includes a manual toggle for instant static presentation.

---

## 📁 Project Architecture

```text
ecell/
├── index.html                    # Minimal semantic shell with viewport and switcher containers
├── vite.config.js                # Port 5173, relative base path ('./')
├── package.json                  # Dev dependencies and npm scripts
├── public/
│   └── assets/
│       ├── final_ecell_logo.png  # Master emblem for pixel sampling
│       ├── final_ecell_logo.svg  # Master vector emblem for crisp hold
│       └── ecell_text_part.svg   # Official typography asset
├── src/
│   ├── shared/
│   │   ├── brand.js              # Centralized brand tokens, colors & asset resolver
│   │   └── router.js             # Hash-based router & switcher pill UI
│   ├── animations/
│   │   ├── animation1/           # Animation 1: Particle Glow
│   │   │   ├── particleGlowEngine.js # Canvas 2D engine with glow & orbit
│   │   │   ├── style.css         # Typography transitions & local controls
│   │   │   └── index.js          # Module implementing mount() & unmount()
│   │   ├── animation2/
│   │   │   └── index.js          # Animation 2 placeholder module
│   │   └── animation3/
│   │       └── index.js          # Animation 3 placeholder module
│   ├── registry.js               # Central animation registry
│   ├── main.js                   # Application bootstrap
│   └── style.css                 # Global playground styles & switcher pill CSS
└── README.md
```

---

## 🧩 How to Add Animation 2 (In 3 Simple Steps)

The architecture makes adding new concepts effortless without rewriting existing animations:

1. **Create the Animation Module**:
   Create `src/animations/animation2/index.js` exporting an object with `mount(container)` and `unmount()` methods:
   ```javascript
   export class Animation2Module {
     mount(container) {
       container.innerHTML = `<canvas id="canvas-2"></canvas>`;
       // Initialize your engine here
     }
     unmount() {
       // Stop RAF, unbind listeners, clean memory
     }
   }
   export const animation2 = new Animation2Module();
   ```

2. **Register in `src/registry.js`**:
   Import your module and update its entry in `ANIMATIONS`:
   ```javascript
   import { animation2 } from './animations/animation2/index.js';

   // In ANIMATIONS array:
   {
     id: '2',
     hash: '#/animation/2',
     title: '02 · Geometric Pulse',
     shortTitle: '02 · Pulse',
     status: 'active', // Changed from 'in-dev'
     module: animation2,
   }
   ```

3. **Done!** The router automatically renders the selector button, routes `#/animation/2` to your component, and handles clean unmounting when switching.

---

## 🚀 How to Run Locally

```powershell
# 1. Install dependencies (if not already installed)
npm install

# 2. Run Animation Lab dev server on port 5173
npm run dev

# 3. Test production build
npm run build
npm run preview
```
Open **`http://localhost:5173/`** in your browser.
