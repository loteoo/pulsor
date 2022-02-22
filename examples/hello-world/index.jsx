export default (
  <div init={{ count: 0 }}>
    <h2>{state => state.count}</h2>
    <button onclick={state => ({ count: state.count + 1 })}>+</button>

    <div>a</div>
    {state => state.count < 3 && (
      <div>b</div>
    )}
    <div>c</div>
    <div>d</div>
    <div>e</div>
    <div>f</div>
    <div>g</div>
  </div>
)
