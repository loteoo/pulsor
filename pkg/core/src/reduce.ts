import { isTask } from './utils';

const isObj = (val: any) => val instanceof Object && !Array.isArray(val)

const deepAssign = (source: any, update: any) => {
  for (const key of Object.keys(update)) {

    // Delete "undefined" keys
    if (update[key] === undefined) {
      if (source[key]) {
        delete source[key]
      }
    
    // Recursive apply on sub objects
    } else if (isObj(update[key])) {
      if (!isObj(source[key])) {
        source[key] = {}
      }
      deepAssign(source[key], update[key])
    
    // Apply everything else
    } else {
      source[key] = update[key]
    }
  }
}

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
  deepAssign(cycle.state, action)

};

export default reduce
