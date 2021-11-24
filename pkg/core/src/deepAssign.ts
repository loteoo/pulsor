
const isObj = (val: any) => val instanceof Object && !Array.isArray(val)

const deepAssign = (source: any, update: any) => {
  for (const key of Object.keys(update)) {

    // Delete "undefined" keys

    // TODO: fix this, as it doesn't work rn. (because we first merge the batched actions, there is nothing to delete, the undefined update key is lost)
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
