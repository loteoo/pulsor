const Init = (name) => ({ [name]: 1 })
const Decrement = (name) => (state) => ({ [name]: state[name] - 1 })
const Increment = (name) => (state) => ({ [name]: state[name] + 1 })

export default (
  <main>
    <p>Test</p>
    <div init={Init('counterA')}>
      <h1>{({ counterA }) => {
        console.log('Rendering counterA')
        return <span>{counterA}</span>
      }}</h1>
      <button onclick={Decrement('counterA')}>-</button>
      <button onclick={Increment('counterA')}>+</button>
    </div>
    <div init={Init('counterB')}>
      <h1>{({ counterB }) => {
        console.log('Rendering counterB')
        return <span>{counterB}</span>
      }}</h1>
      <button onclick={Decrement('counterB')}>-</button>
      <button onclick={Increment('counterB')}>+</button>
    </div>
  </main>
)
