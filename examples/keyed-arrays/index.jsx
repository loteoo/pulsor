import styles from './app.module.css'


const init = {
  list: [
    {
      id: 1,
      createdAt: new Date(),
    },
  ],
  toDoCounter: 1,
}



const sortByEarliest = (state) => {
  const sortedList = state.list.sort((a, b) => {
    return a.createdAt - b.createdAt;
  });
  
  return {
    ...state,
    list: [...sortedList],
  };
}

const sortByLatest = (state) => {
  const sortedList = state.list.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });
  
  return {
    ...state,
    list: [...sortedList],
  };
}

const addToEnd = (state) => {
  const date = new Date();
  const nextId = state.toDoCounter + 1;
  const newList = [
    ...state.list,
    {id: nextId, createdAt: date},
  ];
  
  return {
    ...state,
    list: newList,
    toDoCounter: nextId,
  };
}

const addToStart = (state) => {
  const date = new Date();
  const nextId = state.toDoCounter + 1;
  const newList = [
    {id: nextId, createdAt: date},
    ...state.list,
  ];
  
  return {
    ...state,
    list: newList,
    toDoCounter: nextId,
  };
}



const ToDo = props => (
  <tr key={props.id}>
    <td>
      <label>{props.id}</label>
    </td>
    <td>
      <input />
    </td>
    <td>
      <label>{props.createdAt.toTimeString()}</label>
    </td>
  </tr>
);

const app = (
  <main init={init} class={styles.app}>
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
      {(state) => state.list.map((todo, index) => (
        <ToDo {...todo} />
      ))}
    </table>
  </main>
);




export default app
