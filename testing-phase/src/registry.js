/**
 * E-Cell MSIT Testing Phase Registry
 * Historical record of all animation concepts:
 * - 01: Particle Convergence
 * - 02: Harmonic Pulse
 * - 03: Electric Trace
 * - 04: Orbital Trace
 */

import { animation1 } from './animations/animation1/index.js';
import { animation2 } from './animations/animation2/index.js';
import { animation3 } from './animations/animation3/index.js';
import { animation4 } from './animations/animation4/index.js';

export const FINAL_ANIMATION = {
  id: '4',
  hash: '#/animation/4',
  aliases: ['', '#', '#/', '#/4', '#/orbital', '#/orbital-trace', '#/final'],
  title: '04 · Orbital Trace',
  shortTitle: 'Orbital Trace',
  description: 'Cinematic dual-tone orbital comets framing precise SVG geometric tracing',
  status: 'final',
  module: animation4,
};

export const TESTING_ANIMATIONS = [
  {
    id: '1',
    hash: '#/animation/1',
    aliases: ['#/1', '#/particle'],
    title: '01 · Particle',
    shortTitle: 'Particle',
    description: 'Dynamic particle convergence with dual-tone halo and orbital trail',
    status: 'testing',
    module: animation1,
  },
  {
    id: '2',
    hash: '#/animation/2',
    aliases: ['#/2', '#/pulse'],
    title: '02 · Pulse',
    shortTitle: 'Pulse',
    description: 'Harmonic breathing pulse with acoustic wavefronts and reactive stardust',
    status: 'testing',
    module: animation2,
  },
  {
    id: '3',
    hash: '#/animation/3',
    aliases: ['#/3', '#/trace'],
    title: '03 · Trace',
    shortTitle: 'Trace',
    description: 'Luminous electric path tracing along authentic SVG geometric contours',
    status: 'testing',
    module: animation3,
  },
  FINAL_ANIMATION
];

export function resolveAnimation(route) {
  const cleanRoute = (route || '').trim().toLowerCase();

  for (const anim of TESTING_ANIMATIONS) {
    if (anim.hash.toLowerCase() === cleanRoute) return anim;
    if (anim.aliases && anim.aliases.some(alias => alias.toLowerCase() === cleanRoute)) {
      return anim;
    }
    if (anim.id === cleanRoute.replace(/^#\/?(animation\/)?/, '')) {
      return anim;
    }
  }

  return FINAL_ANIMATION;
}
