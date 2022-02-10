import reduce from './reduce';
import patch from './patch';
import { VNode, Action, Dispatch, Cycle, NormalizedVNode } from './types';

export const diff = (a: NormalizedVNode, b: VNode, cycle: Cycle) => {
  if (cycle.needsRerender) {
    while (cycle.needsRerender) {
      cycle.needsRerender = false;
      patch(a, { ...b }, cycle, {}, false);
    }
  }
}

const run = (app: VNode, mount: HTMLElement | NormalizedVNode) => {

  function domEmitter(ev: Event) {
    // @ts-ignore
    dispatch((this[ev.type] as Action), ev, ev.type, this.__scope);
  }

  const oldVNode = mount instanceof HTMLElement
    ? { tag: mount.tagName, el: mount }
    : mount;

  const dispatch: Dispatch = (action, payload, eventName, scope) => {

    // Apply state updates
    reduce(action, payload, cycle, scope, undefined, eventName);

    const nextVNode = {
      ...oldVNode,
      children: app
    };

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
