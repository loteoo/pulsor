const createLens = (path: string) => {

  const get = (state: State) => {

    const parts = path.split('.')
    let ref = state;
    let curr;

    while (parts.length) {
      curr = parts.shift();
      ref = (ref as any)[(curr as string)];
      if (ref === undefined) {
        return ref;
      }
    }

    return ref;
  }

  const set = (value: any) => {

    const parts = path.split('.')

    let update = {} as any;
    let ref = update;
    let curr;

    const last = parts.pop() as string;

    while (parts.length) {
      curr = parts.shift() as string;
      ref[curr] = {};
      ref = ref[curr];
    }
    ref[last] = value;

    return update;
  }

  return {
    get,
    set
  }
}

export default createLens;
