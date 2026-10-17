/**
 * Final Animation Ecell — Application Entry Point
 * 
 * Direct full-screen cinematic reveal of the official E-Cell MSIT emblem.
 * No router, no extraneous pages, pure single-purpose presentation.
 */

import './style.css';
import { finalAnimation } from './final-animation/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    finalAnimation.mount(app);
  }
});
