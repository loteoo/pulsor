import deepAssign from './deepAssign';
import { Action, Cycle, VNode, ActionFunction, Task } from './types';
import { isTask } from './utils';

/**
 * Reduces an action object into a single update "result" and an array of tasks
 */
const reduce = (action: Action, payload: any, cycle: Cycle, vNode?: VNode, parentAction?: string) => {

  // Ignore falsy values
  if (!action) {
    return;
  }

  // Recurse on arrays
  if (Array.isArray(action)) {
    for (const sub of action) {
      reduce(sub, payload, cycle, vNode, parentAction);
    }
    return;
  }

  // Handle subactions
  if (typeof action === "function") {

    // @ts-ignore
    // console.group(action.name || parentAction);

    const sub = (action as ActionFunction)(cycle.state, payload);

    // @ts-ignore
    reduce(sub, payload, cycle, vNode, action.name);
    // console.groupEnd();
    return;
  }

  // Push tasks in task array
  if (isTask(action)) {
    const task = action as Task;
    task.payload = payload;
    task.vNode = vNode;
    cycle.tasks.push(task);
    // console.log(`enqueued task`, task)
    return;
  }

  // console.log(action)
  deepAssign(cycle.state, action);
  cycle.needsRerender = true;
};

export default reduce
