import hydrate from './hydrate'
import reduce from './reduce';
import patch from './patch';
import { VNode, Action, EventData, Cycle } from './types';

const run = (app: VNode, root: Node) => {

  console.log({ run: 'runrun' })

  function domEmitter(ev: Event) {
    // @ts-ignore
    dispatch((this[ev.type] as Action), ev, ev.type);
  }

  const oldVNode = hydrate(root);

  // @ts-ignore
  window.oldVNode = oldVNode

  const dispatch = (action: Action, payload?: EventData, eventName?: string) => {

    // console.groupCollapsed(`Dispatch: ${eventName}`)

    // Apply state updates
    reduce(action, payload, cycle, undefined, eventName);

    if (cycle.needsRerender) {
      // console.group(`render`);
      while (cycle.needsRerender) {
        const nextVNode = {
          ...oldVNode,
          children: app
        }
        cycle.needsRerender = false;
        patch(oldVNode, nextVNode, cycle, {}, false);
      }

      // console.groupEnd();

      // console.log('Resulting state', cycle.state)
    } else {
      // console.log('No state updates')
    }

    // Run Effects
    if (cycle.sideEffects.length > 0) {
      // console.log(`Running ${cycle.effects.length} effects`)
      cycle.sideEffects.forEach((effect) => effect())
      cycle.sideEffects = [];
    } else {
      // console.log('No effects')
    }

    // console.groupEnd();
  }

  const cycle: Cycle = {
    state: {},
    needsRerender: false,
    domEmitter,
    dispatch,
    sideEffects: [],
  }

  dispatch({}, undefined, 'root init')
}


export default run
