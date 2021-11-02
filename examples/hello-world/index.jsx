const promtTask = {
  run: (emit) => {
    const answer = prompt('What\'s your name?')
    emit('answer', answer)
  },
  onanswer: (state, answer) => ({
    ...state,
    answer
  })
}

const app = (
  <main init={promtTask}>
    <h1>Hello {state => state.answer}!</h1>
    <a href="https://pulsor.dev/" target="_blank">Documentation</a>
  </main>
)

export default app