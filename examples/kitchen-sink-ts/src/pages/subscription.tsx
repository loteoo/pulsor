import { Action, Effect, VNode } from "../../../../pkg/core/src"

const Init: Action = {
  count: 0
}

const Increment: Action = state => ({
  count: state.count! + 1
})

const Decrement: Action = state => ({
  count: state.count! - 1,
})

const LogKey = (_: any, key: string) => [
  { key },
  {
    effect: () => {
      console.log(key);
    }
  }
];

const TrackKeydown: Effect = {
  effect: (dispatch) => {
    const logKey = (e: KeyboardEvent) => {
      dispatch({ key: e.code })
    }
    document.addEventListener('keydown', logKey)
    return () => {
      document.removeEventListener('keydown', logKey)
    }
  }
}

const app: VNode = {
  tag: 'div',
  init: Init,
  children: state => [
    <main>
      <p>fobas</p>
      <h1>{state.count}</h1>
      <button key="btn-1" onclick={Decrement}>-</button>
      <button key="btn-2" onclick={Increment}>+</button>
      {state.count >= 3 && ({
        key: 'tracker',
        init: [{ inited: 'yes' }, TrackKeydown],
        clear: { cleared: 'yes', inited: undefined },
      })}
      {state.count >= 6 && {
        init: { fooclear: 'init' },
        clear: { fooclear: 'done' },
      }}
      <pre>
        <code>
          {s => JSON.stringify(s, null, 2)}
        </code>
      </pre>
    </main>
  ]
}


export default app
