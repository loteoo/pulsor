// import { hydrate } from './hydrate'
import reduce from './reduce';
import patchElement from './patch';
import deepAssign from './deepAssign';
import runTasks from './runTasks';

// function stato(path: string | string[], value?: any) {

//   if (typeof path == 'string') {
//     path = path.split('.');
//   }

//   if (!Array.isArray(path)) {
//     throw new Error('path must be a string or an array');
//   }

//   let ref = stato;
//   let curr;

//   while (path.length) {
//     curr = path.shift();
//     ref = (ref as any)[(curr as string)];
//     if (ref === undefined) {
//       return ref;
//     }
//   }

//   if (value) {
//     ref = value
//     return stato
//   }

//   return ref;
// }


// const stato2 = {}

// const handler = {
//   get: function (target: any, prop: any, receiver: any) {
//     if (typeof target[prop] === "function") {
//       return target[prop](target)
//     }
//     // @ts-ignore
//     return Reflect.get(...arguments);
//   },
// };

// const stateWithSelectors = new Proxy(stato2, handler);


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

        dispatch(eventName, eventsObject[handlerKey] as Action, payload)
      }
    }

  const oldVNode: VNode = {
    el: document.body,
  }


  const dispatch: Dispatch = (eventName, action, payload) => {

    // console.clear()
    // console.count('Dispatch')

    // Apply state updates
    const tasks = reduce(action, payload, cycle);

    cycle.needsRerender = true;
    
    cycle.tasks.push(...tasks);

    while (cycle.needsRerender) {
      cycle.needsRerender = false;

      const nextVNode = {
        children: app
      }
      oldVNode.children = patchElement(oldVNode, nextVNode, cycle, {});
    }

    // Run Tasks
    if (cycle.tasks.length) {
      setTimeout(() => {
        runTasks(cycle.tasks, cycle);
        cycle.tasks = [];
      })
    }
    

    // console.log({
    //   eventName,
    //   // action: (action as (() => void)).name ?? 'Anonymous action',
    //   action,
    //   payload,
    //   state: cycle.state
    // })
  }

  // if (!el) {
  //   const root = document.createElement('div')
  //   document.body.appendChild(root);
  //   el = root;
  // }

  // const oldVNode = hydrate(mount ?? document.body) as VNode;

  const cycle: Cycle = {
    state: {},
    needsRerender: false,
    domEmitter,
    createEmitter,
    tasks: [],
  }


  window.oldVNode = oldVNode

  window.nextVNode = app

  dispatch('root init', {})

}
