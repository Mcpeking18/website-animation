/**
 * E-Cell MSIT — Testing Phase Lab Entry Point
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
