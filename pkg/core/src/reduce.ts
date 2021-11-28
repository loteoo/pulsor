import deepAssign from './deepAssign';
import { isTask } from './utils';

/**
 * Reduces an action object into a single update "result" and an array of tasks
 */
const reduce = (action: Action, payload: any, cycle: Cycle, vNode?: VNode): Task[] => {

  const tasks: Task[] = [];

  const items = Array.isArray(action) ? action : [action];

  let i = 0;
  while (i < items.length) {

    // Ignore falsy values
    if (!items[i]) {
      i++;
      continue;
    }

    // Flatten arrays
    if (Array.isArray(items[i])) {
      items.splice(i, 1, ...(items[i] as Action[]));
      continue;
    }

    // Handle subactions
    if (typeof items[i] === "function") {
      items[i] = (items[i] as ActionFunction)(cycle.state, payload)
      continue;
    }

    // Push tasks in task array
    if (isTask(items[i])) {
      const task = items[i] as Task;
      task.payload = payload;
      task.vNode = vNode;
      tasks.push(task);
    } else {
      deepAssign(cycle.state, items[i])
    }

    i++;

  }

  return tasks
};

export default reduce
