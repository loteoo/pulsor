import { Action, Task, VNode } from "@pulsor/core"

const Init: Action = {
  count: 0
}

const Increment: Action = state => ({
  count: state.count! + 1
})

const Decrement: Action = state => ({
  count: state.count! - 1
})

const TrackTask: Task = {
  run: (emit) => {
    const logKey = (e: KeyboardEvent) => {
      emit('keydown', e.code)
    }
    document.addEventListener('keydown', logKey)
    return () => {
      document.removeEventListener('keydown', logKey)
    }
  },
  onkeydown: (state: State, key: string) => [{ ...state, key }, { run: () => { console.log(key) } }]
}

const createTracker = () => ({
  key: 'tracker',
  init: [{ inited: 'yes' }, TrackTask],
  clear: { cleared: 'yes', inited: undefined },
})

const app: VNode = {
  init: Init,
  children: state => [
    <main>
      {{
        type:'button',
        children: {
          key: state.count,
          init: {
            run: () => {
              // console.log('count changed!')
            }
          },
        }
      }}
      <p>fobas</p>
      <h1>{state.count}</h1>
      <button key="btn-1" onclick={Decrement}>-</button>
      <button key="btn-2" onclick={Increment}>+</button>
      {state.count! >= 3 && createTracker()}
      {state.count! >= 6 && {
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
