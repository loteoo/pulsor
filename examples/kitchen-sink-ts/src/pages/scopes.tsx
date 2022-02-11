
const ManuallyScopedCounter = ({ name }: any) => (
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

const ScopedCounter = ({ scope }: any) => (
  <div scope={scope} init={{ count: 0 }}>
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
  <>
    <ManuallyScopedCounter name="a" />
    <ManuallyScopedCounter name="b" />
    <ScopedCounter scope="foo" />
    <ScopedCounter scope="very.deep.state" />
    {console.log}
  </>
);
