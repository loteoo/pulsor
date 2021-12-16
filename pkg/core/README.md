# @puslor/core

Core runtime for the pulsor framework

## Installation
```
npm install @pulsor/core
```

## Basic usage

```typescript
import { run } from '@pulsor/core';

const app = // app definition ...

run(app);
```

The app is a single tree of vNodes describing the whole app.

<details>
  <summary>Raw hello world</summary>

```typescript
import { run } from '@pulsor/core';

// App definition
const app = {
  type: 'div',
  children: [
    {
      type: 'h1',
      children: 'Hello world'
    }
  ]
};

// Run app
run(app);
```

</details>

<details>
  <summary>Using the <code>h</code> helper directly</summary>

```typescript
import { run, h } from '@pulsor/core';

// App definition
const app = (
  h('div', {}, [
    h('h1', {}, 'Hello world')
  ])
);

// Run app
run(app);
```

> h stands for HyperScript: h(type, props, ...children)

</details>

<details open>
  <summary>Using JSX</summary>

```tsx
import { run } from '@pulsor/core';

// App definition
const app = (
  <div>
    <h1>Hello world</h1>
  </div>
)

// Run app
run(app);
```

</details>


#### Counter

```tsx
import { run } from '@pulsor/core';

const Init = { count: 0 };
const Decrement = (state) => ({ count: state.count - 1 });
const Increment = (state) => ({ count: state.count + 1 });

const app = (
  <main init={Init}>
    <h1>{(state) => state.count}</h1>
    <button onclick={Decrement}>-</button>
    <button onclick={Increment}>+</button>
  </main>
);

run(app);
```


---

Docs coming soon!

<!-- Please checkout the [docs](https://github.com/loteoo/pulsor/docs) for more info! -->
