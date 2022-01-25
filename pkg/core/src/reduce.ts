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

    // @ts-ignore
    // console.group(action.name || parentAction);

    const sub = (action as ActionFunction)(cycle.state, payload);

    // @ts-ignore
    reduce(sub, payload, cycle, vNode, action.name);
    // console.groupEnd();
    return;
  }

  // Push effects in effect array
  if (isEffect(action)) {
    const effect = action as Effect;
    effect.payload = payload;
    effect.vNode = vNode;
    cycle.effects.push(effect);
    // console.log(`enqueued effect`, effect)
    return;
  }

  // console.log(action)
  deepAssign(cycle.state, action);
  cycle.needsRerender = true;
};

export default reduce
