import { hydrate } from './hydrate'
import reduce from './reduce';
import patchElement from './patch';

export const boot = (app: VNode) => {

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

  const dispatch: Dispatch = (eventName, handler, payload) => {
    // console.clear()
    const action = typeof handler === 'function' ? handler(cycle.state, payload) : handler;
    cycle.state = reduce(cycle.state, action, cycle);
    // console.log('dispatch', eventName, payload, (handler as (() => void)).name, cycle.state)
    patch()
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

  dispatch('Init app', Object)

}
