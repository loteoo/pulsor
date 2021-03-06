import { Action } from '@pulsor/core'

const Init: Action = { count: 0 }
const Decrement: Action = (state) => ({ count: state.count! - 1 })
const Increment: Action = (state) => ({ count: state.count! + 1 })

export default (
  <main init={Init}>
    <h1>{({ count }) => count}</h1>
    <button onclick={Decrement}>-</button>
    <button onclick={Increment}>+</button>
  </main>
)

