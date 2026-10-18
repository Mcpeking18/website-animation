/**
 * E-Cell MSIT — Shared Brand Configuration
 * Unified brand tokens, cinematic deep-blue color palette, typography,
 * and asset paths for all animations in the Animation Lab.
 */

export const BRAND = {
  name: 'eCell MSIT',
  organization: 'Entrepreneurship Cell, MSIT',
  tagline: 'IDEATE. INSPIRE. INVEST.',

  colors: {
    // Brand Primaries
    green: '#00C853',        // Primary Brand Green (Top emblem petals)
    blue: '#0072FF',         // Primary Brand Blue (Bottom emblem petals)

    // Cinematic Deep Blue Background Palette
    background: '#0B1220',   // Main Deep Cinematic Canvas Background
    bgSecondary: '#101B30',  // Secondary Deep Blue for subtle gradients & panels
    blueIllumination: '#123B70', // Subtle Blue Ambient Illumination
    greenGlow: 'rgba(0, 200, 83, 0.35)',
    blueGlow: 'rgba(0, 114, 255, 0.35)',

    // High-Contrast Typography & Accent
    textMain: '#F4F4F4',     // Primary Text / Central 'e' (Crisp, High Contrast)
    textSecondary: '#9CA3AF',// Secondary Text for Tagline & Subtitles
    textMuted: '#6B7280',
    white: '#FFFFFF',

    // Glassmorphism tokens
    glassBg: 'rgba(16, 27, 48, 0.78)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
    glassShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
  },

  fonts: {
    display: "'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, sans-serif",
    tagline: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },

  assets: {
    emblemPng: 'assets/final_ecell_logo.png',
    emblemSvg: 'assets/final_ecell_logo.svg',
    emblemDarkSvg: 'assets/final_ecell_logo_dark.svg',
    typographySvg: 'assets/ecell_text_part.svg',
  },

  /**
   * Helper to resolve assets considering Vite's base path
   */
  resolveAsset(path) {
    const base = (import.meta.env.BASE_URL || './').replace(/\/?$/, '/');
    return `${base}${path.replace(/^\//, '')}`;
  }
};
