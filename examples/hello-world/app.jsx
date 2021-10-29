const promtTask = {
  run: (emit) => {
    const test = prompt('What\'s your name?')
    emit('answer', test)
  },
  onanswer: (state, answer) => ({
    ...state,
    answer
  })
}

const app = (
  <main init={promtTask}>
    <h1>Hello {state => state.answer}!</h1>
    <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
  </main>
)

export default app