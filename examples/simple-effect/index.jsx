const promtTask = {
  run: (emit) => {
    const answer = prompt('What\'s your name?')
    emit('answer', answer)
  },
  onanswer: (state, answer) => ({
    answer
  })
}

const app = (
  <main init={promtTask}>
    <h1>Hello {state => state.answer}!</h1>
  </main>
)

export default app
