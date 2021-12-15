import { Action } from "@pulsor/core"

export type CounterState = {
  count: number;
}

const Init: Action<CounterState> = { count: 0 }
const Decrement: Action<CounterState> = (state) => ({ count: state.count - 1 })
const Increment: Action<CounterState> = (state) => ({ count: state.count + 1 })

export default (
  <main init={Init}>
    <h1>{({ count }) => count}</h1>
    <button onclick={Decrement}>-</button>
    <button onclick={Increment}>+</button>
  </main>
)
