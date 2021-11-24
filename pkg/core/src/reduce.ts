import { isTask } from './utils';

const reduce = (state: State, action: Action, payload: any, cycle: Cycle): void => {

  // Ignore falsy values
  if (!action) {
    return
  }

  // Process arrays recurcively
  if (Array.isArray(action)) {
    for (const act of action) {
      reduce(state, act, payload, cycle)
    }
  }

  // Handle subactions
  if (typeof action === "function") {
    reduce(state, action(state, payload), payload, cycle);
  }

  // Run tasks
  if (isTask(action)) {
    action.run(cycle.createEmitter(action), payload)
  }

  // Action is now a state result
  Object.assign(cycle.state, action)
};

export default reduce
