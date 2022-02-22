import { Action } from "@pulsor/core";

const promtTask: Action = {
  effect: (dispatch, el) => {
    dispatch({ width: el.clientWidth})
  },
}

const app = (
  <main init={promtTask}>
    <h1>Width: {state => state.width}!</h1>
  </main>
)

export default app
