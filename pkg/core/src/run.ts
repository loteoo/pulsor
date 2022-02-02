import hydrate from './hydrate'
import reduce from './reduce';
import patch from './patch';
import { VNode, Action, EventData, Cycle } from './types';

export const diff = (a: VNode, b: VNode, cycle: Cycle) => {
  if (cycle.needsRerender) {
    while (cycle.needsRerender) {
      cycle.needsRerender = false;
      patch(a, b, cycle, {}, false);
    }
  }
}

const run = (app: VNode, root: Node) => {

  function domEmitter(ev: Event) {
    // @ts-ignore
    dispatch((this[ev.type] as Action), ev, ev.type);
  }

  const oldVNode = hydrate(root);

  const dispatch = (action: Action, payload?: EventData, eventName?: string) => {

    // Apply state updates
    reduce(action, payload, cycle, undefined, eventName);

    const nextVNode = {
      ...oldVNode,
      children: app
    }

    diff(oldVNode, nextVNode, cycle);

    // Run Effects
    if (cycle.sideEffects.length > 0) {
      cycle.sideEffects.forEach((effect) => effect())
      cycle.sideEffects = [];
    }
  }

  const cycle: Cycle = {
    state: {},
    needsRerender: false,
    dryRun: false,
    domEmitter,
    dispatch,
    sideEffects: [],
  }

  dispatch({}, undefined, 'root init')
}


export default run
