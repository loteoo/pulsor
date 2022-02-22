# @pulsor/core

Core runtime for the pulsor framework


## Getting started

### Installation
```bash
npm install @pulsor/core
```

### Basic usage

In pulsor, your app is a single tree of vNodes that describes your whole app. You pass this "definition" to the `run` function, along with a `mount` node to start off the client runtime.

```typescript
import { run } from '@pulsor/core';

const app: VNode = // app definition ...

run(app, document.body);
```

The `mount` node can be a standard DOM element, or a `NormalizedVNode` object for hydration purposes.

You write pulsor apps using these 2 building blocks:

- [VNodes](#vnodes)
- [Actions](#actions)

## VNodes

### Syntax

You could checkout the type definition of the `VNode` object [here](https://github.com/loteoo/pulsor/blob/main/pkg/core/src/types.ts), but we think code examples are a better way to give you an idea of what vNodes look like. Below are some examples using different syntaxes that you can choose from.

#### Raw VNode syntax

```typescript
import { run } from '@pulsor/core';

// App definition
const app: VNode = {
  tag: 'div',
  children: [
    {
      tag: 'h1',
      children: 'Hello world'
    },
    {
      tag: 'img',
      props: {  
        src: 'https://cool-site.com/frog.jpg',
        alt: 'Frog doing backflip'
      }
    },
  ]
};

// Run app
run(app, document.body);
```

#### Using the h helper

```typescript
const app = (
  h('div', {}, [
    h('h1', {}, 'Hello world'),
    h('img', {
      src: 'https://cool-site.com/frog.jpg',
      alt: 'Frog doing backflip'
    }),
  ])
);
```

#### Using JSX

```tsx
const app = (
  <div>
    <h1>Hello world</h1>
    <img src="https://cool-site.com/frog.jpg" alt="Frog doing backflip" />
  </div>
);
```

### Dynamic rendering

So far, above examples were only displaying static data, but the real power of pulsor comes from dynamically rendering the UI based on some current state.

This is possible in pulsor by passing a function for the `children` property of a vNode in the vNode tree. This children function will receive the current state as a parameter, returning the correct JSX for this given state.


```tsx
const app = (
  <ul init={{ items: ['a', 'b', 'c'] }}>
    {state => state.items.map(letter => (
      <li>{letter}</li>
    ))}
  </ul>
);
```

You can add this `init` property on any elements. It is an `Action` that is ran before rendering the children elements. More on this later.

Without going to deep into `Action`s for now, this is an example for a counter:

```tsx
const app = (
  <main init={{ count: 0 }}>
    <h1>{state => state.count}</h1>
    <button onclick={state => ({ count: state.count - 1 })}>-</button>
    <button onclick={state => ({ count: state.count + 1 })}>+</button>
  </main>
);
```

Feel free to write the rendering logic however you see fit.

```tsx
const app = (
  <main
    init={{
      count: 0,
      items: ['a', 'b', 'c'],
    }}
  >
    {state => {
      const { count, items } = state;
      const totalItems = items.length;

      if (count > 100) {
        return (
          <h1>That's a lot of clicking!</h1>
        )
      }

      return (
        <>
          <h1>{count}</h1>
          <button onclick={{ count: count - 1 }}>-</button>
          <button onclick={{ count: count + 1 }}>+</button>
          <p>Total items: {totalItems}</p>
          <ul>
            {items.map(letter => (
              <li>{letter}</li>
            ))}
          </ul>
        </>
      )
    }}
  </main>
);
```

Named actions and composition is encouraged :

```tsx
// Actions
const Init = { count: 0 };
const Decrement = (state) => ({ count: state.count - 1 });
const Increment = (state) => ({ count: state.count + 1 });

// Derive state
const CurrentCount = ({ count }) => count;

const app = (
  <main init={Init}>
    <h1>{CurrentCount}</h1>
    <button onclick={Decrement}>-</button>
    <button onclick={Increment}>+</button>
  </main>
);
```

### Props

As you've seen in above examples, you can set DOM props and HTML attributes via either the `props` object on the VNode, or as a standard JSX prop:
```tsx
const foo = (state) => (
  <h1
    id="title"
    class={state.isBig ? 'big-title' : undefined}
    data-count={state => state.count}
  >
    I have some props!
  </h1>
)
```

You can pass a function as well as a prop, which will receive the current state before returning the prop's desired value.
```tsx
const foo = (
  <h1
    init={{ count: 2, isBig: true }}
    id="title"
    class={state => state.isBig ? 'big-title' : undefined}
    data-count={state => state.count}
  >
    I have some props!
  </h1>
)
```

#### Special props

Other than all the native DOM props and HTML attributes you can set, there also some "Special props" in pulsor that adds extra functionnality to your markup.

- **class**

The `class` props can also be an object defining classes to toggle based on some conditions.

```tsx
const foo = (state) => (
  <h1
    class={{
      'big-title': state.isBig,
      'foo': false,
      'bar': true,
    }}
  >
    Conditional classes!
  </h1>
)
```

- **style**

The `style` object can accept a CSS object on top of a raw CSS string.

```tsx
const foo =(
  <h1
    style={{
      backgroundColor: 'red',
      color: 'green',
    }}
  >
    Christmas colors!
  </h1>
)
```


- **on`event`**

Any props that starts with `on`, ex: `onclick`, will attach an `Action` to be dispatched when the DOM event occurs on the node.

- **init**

The `init` prop is a life-cycle `Action` that you can add to any node. The state changes are applied immediately after the node is created, but the important part is that this runs before patching the `children` nodes, where you can use a function to compute children nodes based on the state.

The side effects here can also return a `cleanup` function that is ran when the node is removed.

- **clear**

The `clear` props is basically the same as the `init` prop, except it runs when the nodes are removed.

- **key**

The `key` props, similar to how it is in React, allows you to uniquely identify a vNode during the diff / patch process of the framework.

This allows you to do things like re-order nodes in a list instead of deleting / re-creating them, or combined with the `init` or `clear` props, manage life-cycle events of a node properly, or run side-effects based on the state.


```tsx
const ShuffleItems = (state) => {
  const shuffle = [...state.items];
  shuffle.sort(() => (Math.random() > .5) ? 1 : -1);
  return shuffle;
}

const app = (
  <div>
    <h1>Item shuffle:</h1>
    <ul
      init={{ items: ['a', 'b', 'c'] }}
    >
      {({ items }) => items.map(letter => (
        <li key={letter}>
          {letter}
        </li>
      ))}
    </ul>
    <button onclick={ShuffleItems}>Re-order list!</button>
  </div>
);
```


## Actions

An `Action` is a simple data structure that represents the only 2 things you can do:
- `Update` the state
- Run side `Effect`s

These are the building blocks of an action.

There are 2 places where you can "hook up" actions in pulsor:

- Life-cycle events: `init`, `clear`
- DOM events: `onclick`, `onsubmit`, `onkeydown`, etc.

An action is either an `Update` object, an `Effect` object, an array of both, a function that returns an action, or a children action.

This structure makes any action easily composable with any other action by just combining them in an array. Updates are ran sequentially, so that an dynamic action based on the state could depend on the resulting state of a previous action.

You can find the TypeScript defininion of Actions [here](https://github.com/loteoo/pulsor/blob/main/pkg/core/src/types.ts), but once again, code examples makes it easier to understand!


### Update

An update object is a javascript object that defines changes to be applied to the state.

```tsx
// State before: { count: 2 }
const ResetCount = {
  count: 0
}
// State after: { count: 0 }
```

Values in the object will be recursively "applied" to nested objects

```tsx
// State before: { user: { firstName: 'John', lastName: 'Doe' } }
const ChangeFirstName = {
  user: {
    firstName: 'Jane'
  }
}
// State after: { user: { firstName: 'Jane', lastName: 'Doe' } }
```

Values explicitely set to `undefined` in an update object will remove the property from the state.

```tsx
// State before: { count: 2, user: { firstName: 'John', lastName: 'Doe' } }
const RemoveSomeFields = {
  count: undefined,
  user: {
    lastName: undefined
  }
}
// State after: { user: { firstName: 'Jane' } }
```


### Effect

An effect is simply an object that has the `effect` key defined on it. This "side-effects" functions will be queued up, and ran after the the patching process has completed.

```tsx
const SayHello = {
  effect: () => {
    alert('Hello!');
  }
}
```

The effects functions will receive a `dispatch` function as parameter, which will allow them to run actions when external events occur. They can also be async.


```tsx
const FetchUser = {
  effect: async (dispatch) => {
    const currentUser = await fetchCurrentUser();
    dispatch({
      me: currentUser
    })
  }
}
```

When an effect is dispatched from an `init` event, it can optionally return a cleanup function, to clear event listeners or cleanup the memory.

```tsx
const TrackKeystrokes = {
  effect: (dispatch) => {
    const logKey = (e: KeyboardEvent) => {
      dispatch({ lastKeystroke: e.code })
    }
    document.addEventListener('keydown', logKey)
    return () => {
      document.removeEventListener('keydown', logKey)
    }
  }
}
```

### Composing actions

The power of Actions in pulsor comes from the fact that they can easily be composed (or decomposed) to work together, at a very fine-grained level - all in declarative way.


```tsx
const ResetCount = { count: 0 };

const SaveLastCount = state => ({ lastCount: state.count });

const StartNewGame = [
  SaveLastCount,
  state => ({ numberOfTimesPlayed: state.numberOfTimesPlayed + 1 }),
  ResetCount,
];

const PreventDefault = (state, ev) => ({
  effect: () => ev.preventDefault()
});

const SaveUserName = (state, ev) => ({
  userName: ev.target.name.value
});

const SaveCountToApi = (state, ev) => ({
  effect: async () => {
    await fetch('/api/counts', {
      method: 'POST',
      body: JSON.stringify({ count: state.count })
    })
  }
});

const SubmitCounterGame = [
  PreventDefault,
  SaveUserName,
  state => state.count !== 0 && [
    SaveCountToApi,
    StartNewGame,
  ]
];

const app = (
  <form onsubmit={SubmitCounterGame}>
    <CounterGame />
    <input type="text" name="user" required />
    <button type="submit">Submit</button>
  </form>
);
```

<details><summary>Giberish examples to help illustrate the possibilities</summary>

All of the variables below are valid actions.

```tsx
const SimpleUpdate1 = {
  someFieldToChange: 'foo'
}

const SimpleUpdate2 = {
  someOtherField: 'bar',
  someObject: {
    nestedField: 'baz'
  }
}

const SayHelloEffect = {
  effect: () => {
    alert('Hello!');
  }
}

const CreateSomeAction = (text) => state => ({
  someTextBasedOnState: `${text} current count: ${state.count}`
})

const CombinedAction = [
  SimpleUpdate1,
  SimpleUpdate2,
  SayHelloEffect,
  [
    [
      [
        state => [
          { feelFreeToNestThese: 'yay?' }
        ]
      ]
    ]
  ],
  state => state => state => state => [
    { thisWorks: 'but why?' },
    CreateSomeAction('This is why'),
  ],
]

const LogSomeValueLater = (value) => ({
  effect: () => console.log(value)
})

const DynamicAction = state => [
  { someField: 'Hello there' },
  SimpleUpdate1,
  state.someBooleanValue && SimpleUpdate2, // Conditional actions
  state => [
    state.someObject.nestedField === 'baz' ? {
      wow: 'yes',
    } : {
      notWow: 'no'
    }
  ],
  state => state.wow === 'yes' && SayHello,
  state => state.items.map(item => LogSomeValueLater(item))
]



// These two below are parametered actions (functions with a parameter to create the action)

const SetCurrentUser = (user) => ({
  me: user,
})

const BigOlAction = (user) => [
  SetCurrentUser(user),
  DynamicAction,
]

```
</details>
