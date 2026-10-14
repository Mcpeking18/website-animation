# E-Cell MSIT — Particle Logo Reveal Animation Prototype

A modern, standalone particle logo reveal animation developed for **E-Cell MSIT** (Entrepreneurship Cell of Maharaja Surajmal Institute of Technology).

Built with **HTML5 Canvas 2D**, **Vanilla JavaScript**, and **Vite**, featuring physics-based spring settling, device pixel ratio scaling, responsive typography, and authentic brand identity representation.

---

## Brand Identity

| Element | Value / Spec |
| :--- | :--- |
| **Brand Name** | `eCell MSIT` |
| **Tagline** | `IDEAS INSPIRE INVEST` |
| **Primary Green** | `#00C853` (Top emblem segments) |
| **Primary Blue** | `#0072FF` (Bottom emblem segments) |
| **Neutral Black** | `#0A0A0A` (Central lowercase 'e', wordmark) |
| **Light Background** | `#F4F4F4` |
| **Neutral Grey** | `#9CA3AF` / `#4B5563` |

---

## Animation Timeline & Sequences

The animation runs for approximately **3.2 seconds** before entering a stable, held final state:

1. **Phase A — Particle Arrival (`0.0s – 0.8s`)**:
   - The screen begins clean on `#F4F4F4`.
   - Small particles emerge from outside the logo bounding box and stream inwards from multiple angles.
   - Green particles emerge from upper directions, blue from lower directions, and black towards center.
   - Smooth curved trajectories simulate scattered ideas converging into a singular identity.

2. **Phase B — Logo Formation (`0.8s – 2.0s`)**:
   - Particles converge onto exact coordinates sampled from the official E-Cell MSIT emblem using an off-screen canvas.
   - Damped spring physics (`spring = 0.08`, `damping = 0.82`) decelerate particles into their target positions without harsh flashes or bloom.
   - The geometric emblem and central lowercase `'e'` become fully recognizable.

3. **Phase C — Wordmark Reveal (`2.0s – 2.6s`)**:
   - The wordmark **`eCell MSIT`** smoothly fades in with a gentle upward translation (`translateY(18px) -> 0`).
   - Bold geometric typography preserving brand proportions.

4. **Phase D — Tagline Reveal (`2.6s – 3.2s`)**:
   - The tagline **`IDEAS INSPIRE INVEST`** reveals beneath the wordmark with clean uppercase typography, letter-spacing expansion (`0.22em -> 0.36em`), and opacity fade.

5. **Phase E — Final Hold (`3.2s+`)**:
   - The full brand composition is held in a centred, stable, and legible position.
   - Particles settle permanently into crisp targets, with a gentle crossfade into the sharp vector emblem.
   - Very subtle, faint ambient particles drift in the peripheral background to keep the interface feeling dynamic without degrading logo legibility.

---

## Interactive Features

- **Replay**: Click the **Replay** button or press the <kbd>R</kbd> or <kbd>Space</kbd> key at any time to re-run the animation.
- **Speed Control**: Toggle between `0.5x` (slow motion for inspecting particle dynamics), `1.0x` (standard 3.2s timing), and `1.5x` (accelerated).
- **Particle Density**: Toggle between `1.1k` (Fast), `1.6k` (Optimal), and `2.6k` (Ultra Detailed).
- **Interactive Physics**: Hover or touch-drag over the canvas to gently push particles with a soft magnetic repulsive force; release to watch them snap back to the logo coordinates.
- **Accessibility (`prefers-reduced-motion`)**: Automatically detects the user's OS reduced-motion preference or allows manual toggle to instantly present the complete logo with a static fade.
- **Automatic Tab Visibility Handling**: Automatically pauses the rendering loop when the browser tab is hidden and resumes seamlessly when reopened.
- **Graceful Fallback**: If network or image assets are unavailable, an integrated mathematical vector generator guarantees the emblem forms flawlessly.

---

## Project Structure

```text
ecell/
├── index.html                  # Main HTML markup with typography and status layers
├── package.json                # Project dependencies and npm scripts
├── public/
│   └── assets/
│       ├── ecell_raw.png       # Original isolated emblem asset
│       ├── emblem.svg          # Crisp vector SVG emblem
│       ├── wordmark.svg        # Isolated wordmark SVG
│       ├── tagline.svg         # Isolated tagline SVG
│       └── full_logo.svg       # Full brand composition SVG
├── src/
│   ├── main.js                 # App initialization, timeline management & UI wiring
│   ├── particleEngine.js       # High-performance Canvas 2D particle simulation
│   ├── logoProcessor.js        # Background removal, brand color calibration & pixel sampler
│   ├── logoFallback.js         # Mathematical fallback target generator
│   └── style.css               # Styling, design tokens, typography & responsiveness
└── README.md                   # Documentation & run instructions
```

---

## How to Install and Run Locally

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; tested on v22.16.0)
- **npm** (v9 or higher)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open your browser at:
```
http://localhost:5173/
```

### 4. Build for Production
To create an optimized production bundle:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## Logo Extraction Notes & Limitations

- The source image was extracted from the official E-Cell MSIT repository (`ecellmsit.github.io`).
- Background removal is handled dynamically in `logoProcessor.js` to ensure transparent rendering on `#F4F4F4`.
- The central lowercase `'e'` is calibrated to brand black (`#0A0A0A`).
- Both the pixel-sampled raster asset and a mathematical vector SVG (`emblem.svg`) are included. When integrating into the production site, the SVG or transparent PNG can be directly swapped in `public/assets/`.
