/**
 * E-Cell MSIT Animation Lab Registry
 * Central registry mapping routes to animation modules.
 * Adding a new animation in the future only requires adding an entry here!
 */

import { animation1 } from './animations/animation1/index.js';
import { animation2 } from './animations/animation2/index.js';
import { animation3 } from './animations/animation3/index.js';

export const ANIMATIONS = [
  {
    id: '1',
    hash: '#/animation/1',
    aliases: ['#/', '#', '', '#/1'],
    title: '01 · Particle Glow',
    shortTitle: '01 · Glow',
    description: 'Particle convergence with cinematic illumination and orbital aura',
    status: 'active',
    module: animation1,
  },
  {
    id: '2',
    hash: '#/animation/2',
    aliases: ['#/2'],
    title: '02 · Geometric Pulse',
    shortTitle: '02 · Pulse',
    description: 'Vector morphing and synchronized harmonic pulse',
    status: 'in-dev',
    module: animation2,
  },
  {
    id: '3',
    hash: '#/animation/3',
    aliases: ['#/3'],
    title: '03 · Kinetic Trace',
    shortTitle: '03 · Trace',
    description: 'Continuous line drawing and typographic synthesis',
    status: 'planned',
    module: animation3,
  },
];

/**
 * Resolve an animation by hash or route string
 */
export function resolveAnimation(route) {
  const cleanRoute = (route || '').trim();

  // Try exact match on hash
  let match = ANIMATIONS.find((a) => a.hash === cleanRoute);
  if (match) return match;

  // Try aliases
  match = ANIMATIONS.find((a) => a.aliases && a.aliases.includes(cleanRoute));
  if (match) return match;

  // Try by ID
  match = ANIMATIONS.find((a) => a.id === cleanRoute.replace(/^#\/?(animation\/)?/, ''));
  if (match) return match;

  // Default to Animation 1
  return ANIMATIONS[0];
}
