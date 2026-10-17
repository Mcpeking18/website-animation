/**
 * E-Cell MSIT Animation Lab Registry
 * Central registry mapping routes to fully functional animation modules.
 */

import { animation1 } from './animations/animation1/index.js';
import { animation2 } from './animations/animation2/index.js';
import { animation3 } from './animations/animation3/index.js';

export const ANIMATIONS = [
  {
    id: '1',
    hash: '#/animation/1',
    aliases: ['#/', '#', '', '#/1', '#/particle'],
    title: '01 · Particle',
    shortTitle: 'Particle',
    description: 'Dynamic particle convergence with cinematic dual-tone halo and orbital trail',
    status: 'active',
    module: animation1,
  },
  {
    id: '2',
    hash: '#/animation/2',
    aliases: ['#/2', '#/pulse'],
    title: '02 · Pulse',
    shortTitle: 'Pulse',
    description: 'Harmonic breathing pulse with acoustic wavefronts and reactive stardust',
    status: 'active',
    module: animation2,
  },
  {
    id: '3',
    hash: '#/animation/3',
    aliases: ['#/3', '#/trace'],
    title: '03 · Trace',
    shortTitle: 'Trace',
    description: 'Luminous electric path tracing along authentic SVG geometric contours',
    status: 'active',
    module: animation3,
  },
];

/**
 * Resolve an animation by hash, name, or route string
 */
export function resolveAnimation(route) {
  const cleanRoute = (route || '').trim().toLowerCase();

  // Try exact match on hash
  let match = ANIMATIONS.find((a) => a.hash.toLowerCase() === cleanRoute);
  if (match) return match;

  // Try aliases
  match = ANIMATIONS.find((a) => a.aliases && a.aliases.some(alias => alias.toLowerCase() === cleanRoute));
  if (match) return match;

  // Try by ID or shortTitle
  match = ANIMATIONS.find((a) =>
    a.id === cleanRoute.replace(/^#\/?(animation\/)?/, '') ||
    a.shortTitle.toLowerCase() === cleanRoute.replace(/^#\/?(animation\/)?/, '')
  );
  if (match) return match;

  // Default to Animation 1 (Particle)
  return ANIMATIONS[0];
}
