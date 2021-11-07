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

  const dispatch: Dispatch = (eventName, action, payload) => {
    // console.clear()
    const nextState = reduce(cycle.state, action, payload, cycle);
    if (cycle.state !== nextState) {
      cycle.state = nextState;
      // console.log({
      //   eventName,
      //   action: (action as (() => void)).name ?? 'Anonymous action',
      //   payload,
      //   state: cycle.state
      // })
      console.count('Dispatch')
      patch()
    }
  }

  const cycle: Cycle = {
    state: {},
    needsRerender: false,
    domEmitter,
    createEmitter,
  }

  
  // if (!el) {
  //   const root = document.createElement('div')
  //   document.body.appendChild(root);
  //   el = root;
  // }

  const oldVNode = hydrate(app.mount ?? document.body) as VNode;
  const nextVNode = {
    ...oldVNode,
    children: app
  }
  
  const patch = () => {
    patchElement(oldVNode, nextVNode, cycle);
    if (cycle.needsRerender) {
      // console.log('re-rendering')
      cycle.needsRerender = false
      patch()
    }
  }

  dispatch('Init app', {})

}
