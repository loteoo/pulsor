const Init = [
  { count: 0 },
  {
    run: () => {
      console.clear();
    }
  }
]
const Decrement = (state) => ({ count: state.count - 1 })
const Increment = (state) => ({ count: state.count + 1 })

export default (
  <main init={Init}>
    <h2>
      diffing--
    </h2>
    <h1>{({ count }) => count}</h1>
    <button onclick={Decrement}>-</button>
    <button onclick={Increment}>+</button>
    <hr />
    <p>top</p>
    {({ count }) => count > 1 && {
      key: 'mid',
      tag: 'div',
      children: <p>middle 1</p>
    }}
    <p>bottom</p>
    <hr />

    {({ count }) => ({
      tag: 'span',
      children: [
        {
          tag: 'div',
          children: [
            {
              key: `sub-${count}`,
              tag: 'div',
              children: <p>{`hey-${count}`}</p>
            },
            {
              key: `test-${count}`,
              tag: 'div',
              children: <p>{`hey2-${count}`}</p>
            },
          ]
        },
        {
          tag: 'div',
          children: [
            {
              key: `sub-${count}`,
              tag: 'div',
              children: <p>{`hey-${count}`}</p>
            },
            {
              key: `test-${count}`,
              tag: 'div',
              children: <p>{`hey2-${count}`}</p>
            },
          ]
        }
      ]
    })}
    <hr />
  </main>
)
