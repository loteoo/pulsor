// import { hydrate } from './hydrate'
import reduce from './reduce';
import patch from './patch';
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

const run = (app: VNode) => {

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

        setTimeout(() => {
          dispatch(eventName, eventsObject[handlerKey] as Action, payload)
        })
      }
    }

  const oldVNode: VNode = {
    el: document.body,
  }


  const dispatch: Dispatch = (eventName, action, payload) => {

    console.groupCollapsed(`Dispatch: ${eventName}`)

    // Apply state updates
    reduce(action, payload, cycle, undefined, eventName);

    if (cycle.needsRerender) {
      console.group(`diff`);

      while (cycle.needsRerender) {
        cycle.needsRerender = false;

        const nextVNode = {
          children: app
        }
        patch(oldVNode, nextVNode, cycle, {});
      }

      console.groupEnd();

      console.log('Resulting state', cycle.state)
    } else {
      console.log('No state updates')
    }

    // Run Tasks
    if (cycle.tasks.length > 0) {
      console.log(`Running ${cycle.tasks.length} tasks`)
      runTasks(cycle.tasks, cycle);
      cycle.tasks = [];
    } else {
      console.log('No tasks')
    }

    console.groupEnd();
  }

  // if (!el) {
  //   const root = document.createElement('div')
  //   document.body.appendChild(root);
  //   el = root;
  // }

  // const oldVNode = hydrate(mount ?? document.body) as VNode;

  // window.oldVNode = oldVNode

  const cycle: Cycle = {
    state: {},
    needsRerender: false,
    domEmitter,
    createEmitter,
    tasks: [],
  }

  dispatch('root init', {})
}


export default run
