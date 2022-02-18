import { State, Update } from './types'
import { isObj } from './utils'

const deepAssign = (source: State, update: Update) => {
  for (const key of Object.keys(update)) {

    // Delete "undefined" keys
    if (update[key] === undefined) {
      if (key in source) {
        delete source[key]
      }

    // Recursive apply on sub objects
    } else if (isObj(update[key])) {
      if (!isObj(source[key])) {
        source[key] = {}
      }

      deepAssign(source[key], update[key])

    } else if (typeof update[key] === 'function') {
      // Apply functions
      source[key] = update[key](source[key])
    } else {
      // Apply everything else
      source[key] = update[key]
    }
  }
}

export default deepAssign
