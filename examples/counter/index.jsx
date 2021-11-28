const Init = { count: 0 }
const Decrement = (state) => ({ count: state.count - 1 })
const Increment = (state) => ({ count: state.count + 1 })

const app = {
  init: Init,
  children: (state) => (
    <main>
      <h1>{state.count}</h1>
      <button onclick={Decrement}>-</button>
      <button onclick={Increment}>+</button>
    </main>
  )
}

export default app

