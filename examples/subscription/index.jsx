import styles from './app.module.css'

import Foo from './foo'

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
  clear: (s) => ({ ...s, tes: 'no' }),
  children: (s) => ({
    children: {
      children: <>
        <a href="#">toto - {s.count}</a>
        <input />
      </>
    }
  }),
}

const keyboardSubscription = {
  subscribe: (emit) => {

    const logKey = (e) => {
      console.log(e.code)
    }

    document.addEventListener('keydown', logKey);

    return () => document.removeEventListener('keydown', logKey)
  }

}


const initTracking = {
  run: (emit) => {
    const logKey = (e) => {
      emit('keydown', e.code)
    }
    console.log('Adding event listener')
    document.addEventListener('keydown', logKey)
    return () => {
      console.log('Removing event listener')
      document.removeEventListener('keydown', logKey)
    }
  },
  onkeydown: (state, key) => ({ ...state, key })
}

const clearTracking = {
  run: () => {
    console.log('Removing event listener')
    document.removeEventListener('keydown', logKey)
  }
}

const createTracker = () => {
  const keyboardTracker = {
    type: 'button',
    key: 'foo',
    init: initTracking,
    clear: clearTracking,
    children: { text: 'TRACK' }
  }
  return keyboardTracker
}



const app = {
  // el: document.body,
  // type: 'div',
  // mount: document.querySelector('#root'),
  // listener,
  children: (state) => ({
    init,
    children: (
      <main class={styles.app}>
        <h1>{state.count}</h1>
        <h2>key: {state.key}</h2>
        <button onclick={decrement}>-</button>
        <button onclick={increment}>+</button>
        {state.count > 10 && createTracker}
        <br />
        {/* {console.log} */}
        <br />
        {/* {state.count <= 2 && fooModule} */}
        <p>a</p>
        {state.count > 6 && (
          <input key="foo" />
        )}
        <p>b</p>
        {state.count <= 6 && (
          <input key="foo" />
        )}
        <p>c</p>
        {/* {state.count > 2 && fooModule} */}
        <p>d</p>
        <p><Foo /></p>
        <button onclick={[]}>test</button>
        {/* {{
          mount: document.head,
          children: <title>Hello {state => state.count}!</title>
        }} */}
      </main>
    )
  })
}


export default app
