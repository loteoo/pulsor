const Init = {
  count: 0
}

const Increment = state => ({
  count: state.count + 1
})

const Decrement = state => ({
  count: state.count - 1
})

const TrackTask = {
  run: (emit) => {
    const logKey = (e) => {
      emit('keydown', e.code)
    }
    document.addEventListener('keydown', logKey)
    return () => {
      document.removeEventListener('keydown', logKey)
    }
  },
  onkeydown: (state, key) => [{ ...state, key }, { run: () => { console.log(key) } }]
}

const createTracker = () => ({
  init: [{ inited: 'yes' }, TrackTask],
  clear: { cleared: 'yes', inited: undefined },
})

const app = {
  init: Init,
  children: state => [
    <main>
      {{
        children: {
          type:'button',
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
      {state.count >= 3 && createTracker()}
      {state.count >= 6 && {
        init: { fooclear: 'init' },
        clear: { fooclear: 'done' },
      }}
      {{
        // mount: document.head,
        // type: 'div',
        children: <span>Hello {state => state.count}!</span>
      }}
      <pre>
        <code>
          {s => JSON.stringify(s, null, 2)}
        </code>
      </pre>
    </main>,
    <style>{css}</style>
  ]
}


const css = /* CSS */ `
  body {
    font-family: sans-serif;
    font-size: 1.25em;
    line-height: 1.75;
    max-width: 70ch;
    padding: 3em 1em;
    margin: auto;
  }
`

export default app
