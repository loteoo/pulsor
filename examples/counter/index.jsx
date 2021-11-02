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

const fooModule = {
  // type: 'p',
  key: 'foo-module',
  init: (s) => ({ ...s, tes: 'yes' }),
  cleanup: (s) => ({ ...s, tes: 'no' }),
  children: (s) => ({
    children: {
      children: <a href="#">toto - {s.count}</a>
    }
  }),
}

const listener = (emit) => {

  const logKey = (e) => {
    console.log(e.code)
  }

  document.addEventListener('keydown', logKey);

  return () => document.removeEventListener('keydown', logKey)
}


const app = {
  init,
  children: (state) => (
    <main class={styles.app}>
      <h1>{state.count}</h1>
      <button onclick={decrement}>-</button>
      <button onclick={increment}>+</button>
      <p>
        {state.count > 10 && (
          <button listener={listener}>listening</button>
        )}
      </p>
      <br />
      {console.log}
      <br />
      {state.count <= 2 && fooModule}
      <p>a</p>
      {state.count > 6 && (
        <input key="foo" />
      )}
      <p>b</p>
      {state.count <= 6 && (
        <input key="foo" />
      )}
      <p>c</p>
      {state.count > 2 && fooModule}
      <p>d</p>
    </main>
  )
}


export default app
