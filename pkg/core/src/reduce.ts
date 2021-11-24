import deepAssign from './deepAssign';
import { isTask } from './utils';

interface Result {
  update: Update;
  tasks: Task[];
}

/**
 * Reduces an action object into a single update "result" and an array of tasks
 */
const reduce = (action: Action, payload: any, cycle: Cycle): Result => {

  const result: Result = {
    update: {},
    tasks: [],
  }

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
      result.tasks.push(task);
    } else {
      deepAssign(result.update, items[i])
    }

    i++;

  }

  return result
};

export default reduce
