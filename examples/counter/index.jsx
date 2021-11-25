import { Form, Input } from '../../pkg/form'

const css = /* CSS */ `
  body {
    font-family: sans-serif;
    font-size: 1.25em;
    line-height: 1.75;
    max-width: 70ch;
    padding: 3em 1em;
    margin: auto;
  }
`

const PreventDefault = {
  run: (_, ev) => ev.preventDefault()
}

const Decrement = (state, ev) => ({ count: state.count - 1 })
const Increment = (state, ev) => ({ count: state.count + 1 })

const Set = {
  foo: {
    bar: {
      baz: true
    }
  }
}
const Set2 = {
  bar: {
    bizz: 2
  }
}

const Set3 = {
  foo: undefined
}

const fullName = (s) => {
  return `${s.firstName} ${s.lastName}`
}

const app = [
  {
    init: { count: 0 },
    children: {
      init: { foo: 'foo' },
      children: {
        init: { bar: 'bar' },
        children: (state) => (
          <main>
            <h3>Counter</h3>
            <h1>{state.count}</h1>
            <p>{state.foo}</p>
            <button onclick={Decrement}>-</button>
            <button onclick={Increment}>+</button>
            <button onclick={Set}>Set</button>
            <button onclick={Set2}>Set2</button>
            <button onclick={Set3}>Set3</button>
            <p>
                <Input name="firstName" />
                <Input name="lastName" />
            </p>
            {fullName}
            <p>
              <a href="/test" onclick={[PreventDefault, { yay: 'yay'} ]}>test</a>
            </p>
            <pre>
              <code>
                {s => JSON.stringify(s, null, 2)}
              </code>
            </pre>
          </main>
        )
      }
    }
  },
  <style>{css}</style>
]

export default app

