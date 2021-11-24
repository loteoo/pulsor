import { hydrate } from './hydrate'
import reduce from './reduce';
import patchElement from './patch';

export const pulsor = (app: VNode) => {

  function domEmitter(event: any) {
    // @ts-ignore
    dispatch(event.type, (this[event.type] as Action), event);
  }

  const createEmitter = (eventsObject: Task & VNode): Emitter =>
    (eventName, payload) => {
      const handlerKey = `on${eventName}`;

      //@ts-ignore
      if (eventsObject[handlerKey]) {
        //@ts-ignore

        requestAnimationFrame(() => {
          dispatch(eventName, eventsObject[handlerKey] as Action, payload)
        })
      }
    }

  const dispatch: Dispatch = (eventName, action, payload, isFromView?: boolean) => {
    // console.clear()
    reduce(cycle.state, action, payload, cycle);

    // console.count('Dispatch')
    // console.log({
    //   eventName,
    //   // action: (action as (() => void)).name ?? 'Anonymous action',
    //   action,
    //   payload,
    //   state: cycle.state
    // })
    if (isFromView) {
      cycle.needsRerender = true;
      // TODO: Figure out a way to end the current patch cycle and let the next one continue (bc now the child nodes get patched twice)
      // console.log('state updated', cycle.state)
    } else {
      patch()
    }
  }

  const cycle: Cycle = {
    state: {},
    needsRerender: false,
    domEmitter,
    createEmitter,
    dispatch,
  }

  // if (!el) {
  //   const root = document.createElement('div')
  //   document.body.appendChild(root);
  //   el = root;
  // }

  const oldVNode = hydrate(app.mount ?? document.body) as VNode;

  const patch = () => {
    const nextVNode = {
      ...oldVNode,
      children: app
    }
    patchElement(oldVNode, nextVNode, cycle, {});
    if (cycle.needsRerender) {
      // console.log('re-rendering')
      cycle.needsRerender = false
      patch()
    }
  }

  dispatch('root init', {})

}
