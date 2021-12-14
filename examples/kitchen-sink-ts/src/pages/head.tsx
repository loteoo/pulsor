import Head from '../../../../pkg/head'


const Init = { count: 0 }
const Decrement = (state) => ({ count: state.count - 1 })
const Increment = (state) => ({ count: state.count + 1 })

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

