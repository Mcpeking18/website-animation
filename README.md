# E-Cell MSIT — Particle Logo Reveal Animation Prototype

A high-performance, standalone particle logo reveal animation built for **E-Cell MSIT** (Entrepreneurship Cell of Maharaja Surajmal Institute of Technology).

Built with **Vanilla JavaScript**, **HTML5 Canvas 2D**, and **CSS** (bundled with Vite). Zero heavy frameworks, zero third-party animation libraries, and 60+ FPS physics-driven particle simulation.

---

## 🎨 Brand Identity

| Element | Specification |
| :--- | :--- |
| **Brand Name** | `eCell MSIT` |
| **Tagline** | `IDEAS INSPIRE INVEST` |
| **Primary Green** | `#00C853` (Top 5 emblem petals/segments) |
| **Primary Blue** | `#0072FF` (Bottom 5 emblem petals/segments) |
| **Neutral Black** | `#0A0A0A` (Central lowercase 'e', typography) |
| **Clean Background** | `#F4F4F4` |
| **Secondary Gray** | `#6B7280` / `#9CA3AF` |

---

## ⏱️ Animation Timeline & Phases

The reveal sequence runs through 5 distinct phases over **3.5 seconds**:

1. **Phase A: Particle Arrival (`0.0s – 0.9s`)**
   - Canvas begins clean on `#F4F4F4`.
   - Thousands of particles spawn outside the logo perimeter and stream inwards along smooth curved trajectories.
   - Green particles emerge from the top, blue from the bottom, and black towards the center.

2. **Phase B: Logo Formation (`0.9s – 2.3s`)**
   - Particles gravitate towards their exact pixel-sampled target positions on the official E-Cell emblem.
   - Damped spring physics (`spring = 0.08`, `damping = 0.83`) decelerate and lock particles into a crisp, high-definition emblem.

3. **Phase C: Wordmark Reveal (`2.3s – 2.9s`)**
   - The brand title **`eCell MSIT`** glides into view with a smooth opacity fade and vertical easing (`translateY(18px) → 0`).

4. **Phase D: Tagline Reveal (`2.9s – 3.5s`)**
   - The tagline **`IDEAS INSPIRE INVEST`** reveals beneath the title with tracking expansion (`letter-spacing: 0.22em → 0.36em`) and opacity transition.

5. **Phase E: Final Lock & Ambient Drift (`3.5s+`)**
   - The composition holds stably in place with 100% legibility.
   - A subtle crossfade renders the sharp master vector emblem over the particles.
   - Faint ambient micro-particles drift lazily in the peripheral background to keep the screen alive without distracting from the logo.

---

## 🕹️ Interactive Controls

- **Replay**: Click the **Replay** button or press <kbd>R</kbd> or <kbd>Space</kbd> at any time.
- **Speed**: Toggle playback speeds (`0.5x` slow-motion, `1.0x` standard, `1.5x` fast).
- **Density**: Cycle particle counts between **Standard** (~1.6k), **Rich** (~2.6k), and **Ultra** (~4.0k).
- **Mouse & Touch Repulsion**: Move your cursor or touch-drag across the canvas to push particles with an interactive magnetic field; release to watch them spring back into position.
- **Reduced Motion**: Respects the user's OS accessibility preference (`prefers-reduced-motion`) and provides a manual toggle for instant fade-in without motion.

---

## 📁 Repository Structure

```text
ecell/
├── index.html                  # Semantic HTML5 shell with Canvas and Google Fonts
├── vite.config.js              # Vite bundler config with relative base path ('./')
├── package.json                # Project dependencies and deployment scripts
├── public/
│   └── assets/
│       ├── final_ecell_logo.png  # Master raster emblem (sampled for particle coordinates)
│       ├── final_ecell_logo.svg  # Master vector emblem (for crisp final hold crossfade)
│       └── ecell_text_part.svg   # Official typography asset
├── src/
│   ├── main.js                 # Timeline controller, UI bindings & lifecycle events
│   ├── particleEngine.js       # Canvas 2D particle simulation, DPR scaling & physics
│   └── style.css               # Brand styles, fluid typography & glassmorphism UI
├── dist/                       # Production build output (generated via npm run build)
└── README.md                   # Complete documentation
```

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 3. Local Production Preview
```bash
npm run build
npm run preview
```
Serves the fully optimized, minified production build locally on `http://localhost:4173/`.

---

## 🌐 How to Deploy (Using npm)

You can deploy this project online using npm in several ways:

### Option 1: GitHub Pages (Recommended)
This repository is configured with `gh-pages` and relative asset paths (`base: './'`).

1. Initialize git and link your GitHub repository (if not already done):
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. Deploy directly with npm:
   ```bash
   npm run deploy
   ```
   *This automatically builds the project (`npm run build`) and publishes the `dist/` folder to the `gh-pages` branch on GitHub.*
3. On GitHub, go to **Repository Settings → Pages** and set source to the `gh-pages` branch. Your site will be live at `https://<your-username>.github.io/<your-repo-name>/`.

---

### Option 2: Vercel (Instant 1-Command Deployment)
Deploy live with zero configuration using Vercel CLI via npm:
```bash
npm run deploy:vercel
# or directly:
npx vercel
```
Follow the quick CLI prompts to get an instant live HTTPS URL (e.g. `https://ecell-msit.vercel.app`).

---

### Option 3: Surge.sh (Free Static Hosting in 10 Seconds)
```bash
npm run deploy:surge
# or directly:
npx surge dist
```
Enter your desired domain (e.g. `ecell-msit-intro.surge.sh`) and it is immediately live.

---

### Option 4: Netlify
Run:
```bash
npx netlify deploy --prod --dir=dist
```
Or drag and drop the `dist/` folder directly onto [Netlify Drop](https://app.netlify.com/drop).

---

## ⚙️ How to Tune Parameters

All physics and animation parameters are centralized in `src/particleEngine.js` and `src/main.js`:

- **Particle Count / Density**: In `src/main.js`, edit `DENSITY_CONFIGS` to change the sampling grid step (`step: 7` for ~1.6k particles, `step: 5` for ~2.6k, `step: 4` for ~4.0k).
- **Spring Stiffness & Damping**: In `src/particleEngine.js`, adjust `this.spring = 0.08` (higher = snappier snap-back) and `this.damping = 0.83` (higher = more oscillation, lower = quicker settle).
- **Repulsion Radius**: In `src/particleEngine.js`, edit `this.mouseRadius = 90` to increase or decrease the interactive cursor push distance.
- **Phase Durations**: In `src/particleEngine.js`, adjust `this.duration = 3.5` and the phase breakpoints (`0.9`, `2.3`, `2.9`, `3.5`).
- **Brand Colors**: In `src/style.css`, edit the `:root` CSS variables (`--color-green: #00C853;`, `--color-blue: #0072FF;`, etc.).

---

## 📄 License
Created for E-Cell MSIT. All logo designs, assets, and trademarks belong to E-Cell MSIT.
