import { isTask } from './utils';

// TODO: maybe this should return the tasks instead?
const reduce = (state: State, action: Action, payload: any, cycle: Cycle): State => {

  // Ignore falsy values
  if (!action) {
    return state
  }

  // Process arrays recurcively
  if (Array.isArray(action)) {
    return action.reduce(
      (state: State, action: Action) => reduce(state, action, payload, cycle),
      {}
    )
  }

  // Handle subactions
  if (typeof action === "function") {
    return reduce(state, action(state, payload), payload, cycle);
  }

  // Run tasks
  if (isTask(action)) {
    action.run(cycle.createEmitter(action), payload)
    return state
  }

  // Action is now a state result
  return action;
};

export default reduce
