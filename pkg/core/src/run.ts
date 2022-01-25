import hydrate from './hydrate'
import reduce from './reduce';
import patch from './patch';
import runEffects from './runEffects';
import { VNode, Effect, Emitter, Action, EventData, Cycle } from './types';

const run = (app: VNode, root: Node) => {

  console.log({ run: 'runrun' })

  function domEmitter(event: any) {
    // @ts-ignore
    dispatch(event.type, (this[event.type] as Action), event);
  }

  const createEmitter = (eventsObject: Effect & VNode): Emitter =>
    (eventName, payload) => {
      const handlerKey = `on${eventName}`;

      //@ts-ignore
      if (eventsObject[handlerKey]) {
        //@ts-ignore

        setTimeout(() => {
          dispatch(eventName, eventsObject[handlerKey] as Action, payload)
        })
      }
    }

  const oldVNode = hydrate(root);

  // @ts-ignore
  window.oldVNode = oldVNode

  const dispatch = (eventName: string, action: Action, payload?: EventData) => {

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
    if (cycle.effects.length > 0) {
      // console.log(`Running ${cycle.effects.length} effects`)
      runEffects(cycle.effects, cycle);
      cycle.effects = [];
    } else {
      // console.log('No effects')
    }

    // console.groupEnd();
  }

  const cycle: Cycle = {
    state: {},
    needsRerender: false,
    domEmitter,
    createEmitter,
    effects: [],
  }

  dispatch('root init', {})
}


export default run
