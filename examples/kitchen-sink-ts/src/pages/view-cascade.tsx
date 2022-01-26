import { State, VChildNode } from '../../../../pkg/core/src';

export default (state: State): VChildNode => (
  <div>
    <pre>
      <code>{JSON.stringify(state, null, 2)}</code>
    </pre>
    <button onclick={{ a: true }}>set a</button>
    {state.a && ({
      init: { b: true }
    })}
    {state.b && ({
      init: { c: true }
    })}
    {state.c && ({
      init: { d: true }
    })}
    {state.d && ({
      init: { e: true }
    })}
    {state.e && ({
      init: { f: true }
    })}
    {state.f && ({
      init: { yay: true }
    })}
  </div>
)
