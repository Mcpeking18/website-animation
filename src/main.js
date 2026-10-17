/**
 * E-Cell MSIT — Animation Lab
 * Application Entry Point
 * Orchestrates router, animation lifecycle, and switcher bar.
 */

import './style.css';
import { Router } from './shared/router.js';

document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('animation-viewport');
  const switcher = document.getElementById('lab-switcher');

  if (viewport && switcher) {
    new Router(viewport, switcher);
  }
});
