import createLens from './createLens';
import deepAssign from './deepAssign';
import { Action, Cycle, VNode, ActionFunction, Effect, Lens } from './types';
import { isEffect } from './utils';

/**
 * Reduces an action object into a single update "result" and an array of effects
 */
const reduce = (action: Action, payload: any, cycle: Cycle, scope?: Lens, vNode?: VNode, parentAction?: string) => {

  // Ignore falsy values
  if (!action) {
    return;
  }

  // Recurse on arrays
  if (Array.isArray(action)) {
    for (const sub of action) {
      if ((sub as any).scope) {
        scope = createLens((sub as any).scope);
        delete (sub as any)['scope'];
      }
      reduce(sub, payload, cycle, scope, vNode, parentAction);
    }
    return;
  }

  // Handle subactions
  if (typeof action === "function") {
    const sub = (action as ActionFunction)(cycle.state, payload);
    reduce(sub, payload, cycle, scope, vNode, action.name);
    return;
  }

  // Push effects in effect array
  if (isEffect(action)) {
    const effect = action as Effect;
    effect.payload = payload;
    effect.vNode = vNode;

    const sideEffect = () => {
      const cleanup = effect.effect((_action, _payload, _eventName, _scope) => {
        setTimeout(() => {
          cycle.dispatch?.(_action, _payload, _eventName, _scope ?? scope)
        })
      }, effect.payload)
      if (cleanup && effect.vNode) {
        if (effect.vNode.el) {
          // @ts-ignore
          if (!effect.vNode.el?.clearEffects) {
            // @ts-ignore
            effect.vNode.el.clearEffects = [];
          }
          // @ts-ignore
          effect.vNode.el.clearEffects.push(cleanup)
        }
      }
    }

    cycle.effects.push(sideEffect);
    return;
  }

  if ((action as any).scope) {
    scope = createLens((action as any).scope);
    delete action['scope'];
  }

  if (scope) {
    action = scope.set(action)
  }

  deepAssign(cycle.state, action);
  cycle.needsRerender = true;
};

export default reduce
