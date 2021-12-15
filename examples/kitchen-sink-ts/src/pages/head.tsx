import { Action } from '@pulsor/core'
import Head from '../../../../pkg/head'


const Init: Action = { count: 0 }
const Decrement: Action = (state) => ({ count: state.count! - 1 })
const Increment: Action = (state) => ({ count: state.count! + 1 })

export default (
  <main init={Init}>
    <h1>{({ count }) => count}</h1>
    <button onclick={Decrement}>-</button>
    <button onclick={Increment}>+</button>
    <Head>
      <title>Count: {({ count }) => count}</title>
    </Head>
  </main>
)

