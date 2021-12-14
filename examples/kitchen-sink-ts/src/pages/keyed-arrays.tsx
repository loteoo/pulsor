import { Action } from "@pulsor/core";

const init = {
  list: [
    {
      id: 1,
      createdAt: new Date(),
    },
  ],
  toDoCounter: 1,
}

export type PageState = typeof init;

const sortByEarliest: Action<PageState> = (state) => {
  const sortedList = state.list.sort((a, b) => {
    return (a.createdAt as unknown as number) - (b.createdAt as unknown as number);
  });

  return {
    list: [...sortedList],
  };
}

const sortByLatest: Action<PageState> = (state) => {
  const sortedList = state.list.sort((a, b) => {
    return (b.createdAt as unknown as number) - (a.createdAt as unknown as number);
  });

  return {
    list: [...sortedList],
  };
}

const addToEnd: Action<PageState> = (state) => {
  const date = new Date();
  const nextId = state.toDoCounter + 1;
  const newList = [
    ...state.list,
    {id: nextId, createdAt: date},
  ];

  return {
    list: newList,
    toDoCounter: nextId,
  };
}

const addToStart: Action<PageState> = (state) => {
  const date = new Date();
  const nextId = state.toDoCounter + 1;
  const newList = [
    {id: nextId, createdAt: date},
    ...state.list,
  ];

  return {
    list: newList,
    toDoCounter: nextId,
  };
}



const ToDo = (props: NonNullable<NonNullable<State['list']>[0]>) => (
  <tr key={props.id}>
    <td>
      <label>{props.id}</label>
    </td>
    <td>
      <input />
    </td>
    <td>
      <label>{(props.createdAt as Date).toTimeString()}</label>
    </td>
  </tr>
);

const app = (
  <main init={init}>
    <code>key=id</code>
    <br />
    <button onclick={addToStart}>
      Add New to Start
    </button>
    <button onclick={addToEnd}>
      Add New to End
    </button>
    <button onclick={sortByEarliest}>
      Sort by Earliest
    </button>
    <button onclick={sortByLatest}>
      Sort by Latest
    </button>
    <table>
      <tr>
        <th>ID</th>
        <th />
        <th>created at</th>
      </tr>
      {(state) => {
        return state.list?.map((todo) => (
          <ToDo {...todo} />
        ))
      }}
    </table>
  </main>
);




export default app
