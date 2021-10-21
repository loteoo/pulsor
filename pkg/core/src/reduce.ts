import { isTask } from './utils';

// TODO: maybe this should return the tasks instead?
const reduce = (state: State, action: Action, cycle: Cycle): State => {

  // Ignore falsy values
  if (!action) {
    return state
  }

  // Process arrays recurcively
  if (Array.isArray(action)) {
    return action.reduce(
      (state: State, action: Action) => reduce(state, action, cycle),
      {}
    )
  }

  // Handle subactions
  if (typeof action === "function") {
    return reduce(state, action(state), cycle);
  }

  // Run tasks
  if (isTask(action)) {
    action.run(cycle.createEmitter(action))
    return state
  }

  // Action is now a state result
  return action;
};

export default reduce
