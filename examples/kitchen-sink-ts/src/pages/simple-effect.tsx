import { Action } from "/../../pkg/core/src"

const promtTask: Action = {
  effect: (dispatch) => {
    dispatch({ answer: prompt('What\'s your name?') })
  }
}

const app = (
  <main init={promtTask}>
    <h1>Hello {state => state.answer}!</h1>
  </main>
)

export default app
