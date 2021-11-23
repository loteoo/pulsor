

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

const Decrement: Action = (state, ev) => ({ ...state, count: state.count - 1 })
const Increment: Action = (state, ev) => ({ ...state, count: state.count + 1 })

const app: VChildNode = [
  {
    init: { count: 0 },
    children: (state) => (
      <main>
        <h3>Counter</h3>
        <h1>{state.count}</h1>
        <button onclick={Decrement}>-</button>
        <button onclick={Increment}>+</button>
      </main>
    )
  },
  <style>{css}</style>
]


export default app

