import { Effect, Cycle } from './types';

const runEffects = (effects: Effect[], cycle: Cycle): void =>
  effects.forEach((effect) => {
    // console.log('effect', effect)
    const cleanup = effect.effect(cycle.createEmitter(effect), effect.payload)
    if (cleanup && effect.vNode) {
      if (!effect.vNode.clearEffects) {
        effect.vNode.clearEffects = [];
      }
      effect.vNode.clearEffects.push(cleanup)
    }
  });

export default runEffects;
