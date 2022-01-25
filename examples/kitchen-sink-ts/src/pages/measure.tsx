const promtTask = {
  effect: (emit, el) => {
    emit('width', el.clientWidth)
  },
  onwidth: (state, width) => ({
    width
  })
}

const app = (
  <main init={promtTask}>
    <h1>Width: {state => state.width}!</h1>
  </main>
)

export default app
