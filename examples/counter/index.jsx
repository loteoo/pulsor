import styles from './app.module.css'

const init = {
  count: 0
}

const increment = state => ({
  ...state,
  count: state.count + 1
})

const decrement = state => ({
  ...state,
  count: state.count - 1
})

const app = (
  <main init={init} class={styles.app}>
    <h1>{({ count }) => count}</h1>
    <button onclick={decrement}>-</button>
    <button onclick={increment}>+</button>
  </main>
)

export default app
