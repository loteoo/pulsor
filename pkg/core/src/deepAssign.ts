import { isObj } from './utils'

const deepAssign = (source: any, update: any) => {
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

    // Apply everything else
    } else {
      source[key] = update[key]
    }
  }
}

export default deepAssign
