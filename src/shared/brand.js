/**
 * E-Cell MSIT — Shared Brand Configuration
 * Unified brand tokens, color palettes, typography, and asset paths
 * for all animations in the Animation Lab.
 */

export const BRAND = {
  name: 'eCell MSIT',
  organization: 'Entrepreneurship Cell, MSIT',
  tagline: 'IDEAS INSPIRE INVEST',

  colors: {
    green: '#00C853',        // Primary Brand Green (Top emblem petals)
    greenGlow: 'rgba(0, 200, 83, 0.45)',
    blue: '#0072FF',         // Primary Brand Blue (Bottom emblem petals)
    blueGlow: 'rgba(0, 114, 255, 0.45)',
    black: '#0A0A0A',        // Neutral Black (Central lowercase 'e', typography)
    background: '#F4F4F4',   // Clean Light Canvas Background
    grey: '#9CA3AF',         // Neutral Grey
    greyDark: '#4B5563',     // Darker Grey for Subtitles
    white: '#FFFFFF',
    glowHalo: 'rgba(255, 255, 255, 0.85)',
  },

  fonts: {
    display: "'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, sans-serif",
    tagline: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },

  assets: {
    // Relative to base URL
    emblemPng: 'assets/final_ecell_logo.png',
    emblemSvg: 'assets/final_ecell_logo.svg',
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
