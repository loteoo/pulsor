const Init = [
  { count: 0 },
  {
    effect: () => {
      console.clear();
    }
  }
]
const Decrement = (state) => ({ count: state.count - 1 })
const Increment = (state) => ({ count: state.count + 1 })

export default (
  <main init={Init}>
    <h1>{({ count }) => count}</h1>
    <button onclick={Decrement}>-</button>
    <button onclick={Increment}>+</button>
    
    <hr />
    <p>top</p>
    {({ count }) => count > 1 && {
      children: <p>middle 1</p>
    }}
    <p>bottom</p>
    <hr />

    {({ count }) => ({
      // key: count,
      // type: 'div',
      children: {
        // type: 'div', // TODO: Fix the remove logic in patch
        children: [
          {
            key: `sub-${count}`,
            children: <p>{`hey-${count}`}</p>
          },
          {
            key: `test-${count}`,
            children: <p>{`hey2-${count}`}</p>
          },
        ]
      }
    })}
    <hr />
  </main>
)
