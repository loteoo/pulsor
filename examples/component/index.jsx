
const Counter = ({ name }) => (
  <div init={{ [name]: { count: 0 } }}>
    {(state) => {
      const counter = state[name];
      return (
        <>
          <h2>{counter.count}</h2>
          <button onclick={{ [name]: { count: counter.count - 1 } }}>-</button>
          <button onclick={{ [name]: { count: counter.count + 1 } }}>+</button>
        </>
      )
      }}
  </div>
);

const AutoScopedCounter = ({ name }) => (
  <div scope={name} init={{ count: 0 }}>
    {(counter) => (
      <>
        <h2>{counter.count}</h2>
        <button onclick={{ count: counter.count - 1 }}>-</button>
        <button onclick={{ count: counter.count + 1 }}>+</button>
      </>
    )}
  </div>
);

export default (
  <div>
    <Counter name="a" />
    <Counter name="b" />
    <AutoScopedCounter name="very.deep.state" />
    {console.log}
  </div>
);
