import reduce from './reduce';
import patch from './patch';
import { VNode, Action, Dispatch, Cycle, NormalizedVNode } from './types';

// import './debug';

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

    patch(oldVNode, nextVNode, cycle);

    // Run Effects
    if (cycle.effects.length > 0) {
      cycle.effects.forEach((effect) => effect());
      cycle.effects = [];
    }

  }

  const cycle: Cycle = {
    state: {},
    effects: [],
    needsRerender: false,
    dryRun: false,
    domEmitter,
    dispatch,
  }

  dispatch({}, undefined, 'root init');
}


export default run
