/**
 * E-Cell MSIT — Animation Registry
 * 
 * Main / Official Presentation:
 * - Final Animation Ecell (Orbital Trace Engine)
 * 
 * Testing Phase Concepts (Organized for archival & comparative review):
 * - Concept 01: Particle Convergence
 * - Concept 02: Pulse
 * - Concept 03: Trace
 */

import { finalAnimation } from './final-animation/index.js';
import { animation1 } from './testing-phase/animation1/index.js';
import { animation2 } from './testing-phase/animation2/index.js';
import { animation3 } from './testing-phase/animation3/index.js';

export const FINAL_ANIMATION = {
  id: 'final',
  hash: '#/final',
  aliases: ['', '#', '#/', '#/final', '#/orbital', '#/orbital-trace', '#/4'],
  title: 'Final Animation Ecell',
  shortTitle: 'Final Animation',
  description: 'Official E-Cell MSIT Final Orbital Trace Animation — Synchronized comet trail with architectural SVG reveal',
  status: 'final',
  module: finalAnimation,
};

export const TESTING_ANIMATIONS = [
  {
    id: '1',
    hash: '#/testing/1',
    aliases: ['#/1', '#/particle', '#/testing/particle'],
    title: 'Testing Concept 01 · Particle',
    shortTitle: '01 · Particle',
    description: 'Dynamic particle convergence with dual-tone halo and orbital trail',
    status: 'testing',
    module: animation1,
  },
  {
    id: '2',
    hash: '#/testing/2',
    aliases: ['#/2', '#/pulse', '#/testing/pulse'],
    title: 'Testing Concept 02 · Pulse',
    shortTitle: '02 · Pulse',
    description: 'Harmonic breathing pulse with acoustic wavefronts and reactive stardust',
    status: 'testing',
    module: animation2,
  },
  {
    id: '3',
    hash: '#/testing/3',
    aliases: ['#/3', '#/trace', '#/testing/trace'],
    title: 'Testing Concept 03 · Trace',
    shortTitle: '03 · Trace',
    description: 'Luminous electric path tracing along authentic SVG geometric contours',
    status: 'testing',
    module: animation3,
  },
  {
    id: 'final',
    hash: '#/final',
    aliases: ['#/testing/4', '#/testing/final'],
    title: 'Final Animation Ecell',
    shortTitle: '04 · Final Orbit',
    description: 'Official E-Cell MSIT Final Orbital Trace Animation',
    status: 'final',
    module: finalAnimation,
  }
];

export const ALL_ANIMATIONS = [FINAL_ANIMATION, ...TESTING_ANIMATIONS.slice(0, 3)];

/**
 * Resolve an animation by hash, name, or route string.
 * Defaults immediately to FINAL_ANIMATION.
 */
export function resolveAnimation(route) {
  const cleanRoute = (route || '').trim().toLowerCase();

  // Root or empty route returns the Final Animation
  if (!cleanRoute || cleanRoute === '#' || cleanRoute === '#/' || cleanRoute === '#/final') {
    return FINAL_ANIMATION;
  }

  // Check aliases on Final Animation first
  if (FINAL_ANIMATION.aliases.some(alias => alias.toLowerCase() === cleanRoute)) {
    return FINAL_ANIMATION;
  }

  // Check testing animations
  for (const anim of TESTING_ANIMATIONS) {
    if (anim.hash.toLowerCase() === cleanRoute) return anim;
    if (anim.aliases && anim.aliases.some(alias => alias.toLowerCase() === cleanRoute)) {
      return anim;
    }
    if (anim.id === cleanRoute.replace(/^#\/?(testing\/|animation\/)?/, '')) {
      return anim;
    }
  }

  // Default to the Final Animation
  return FINAL_ANIMATION;
}
