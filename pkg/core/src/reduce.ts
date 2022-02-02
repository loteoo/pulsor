import deepAssign from './deepAssign';
import { Action, Cycle, VNode, ActionFunction, Effect } from './types';
import { isEffect } from './utils';

/**
 * Reduces an action object into a single update "result" and an array of effects
 */
const reduce = (action: Action, payload: any, cycle: Cycle, vNode?: VNode, parentAction?: string) => {

  // Ignore falsy values
  if (!action) {
    return;
  }

  // Recurse on arrays
  if (Array.isArray(action)) {
    for (const sub of action) {
      reduce(sub, payload, cycle, vNode, parentAction);
    }
    return;
  }

  // Handle subactions
  if (typeof action === "function") {
    const sub = (action as ActionFunction)(cycle.state, payload);
    reduce(sub, payload, cycle, vNode, action.name);
    return;
  }

  // Push effects in effect array
  if (isEffect(action)) {
    const effect = action as Effect;
    effect.payload = payload;
    effect.vNode = vNode;

    const sideEffect = () => {
      const cleanup = effect.effect((...args) => {
        setTimeout(() => {
          cycle.dispatch(...args)
        })
      }, effect.payload)
      if (cleanup && effect.vNode) {
        // @ts-ignore
        if (!effect.vNode.el.clearEffects) {
          // @ts-ignore
          effect.vNode.el.clearEffects = [];
        }
        // @ts-ignore
        effect.vNode.el.clearEffects.push(cleanup)
      }
    }

    cycle.sideEffects.push(sideEffect);
    return;
  }

  deepAssign(cycle.state, action);
  cycle.needsRerender = true;
};

export default reduce
