import { Update, Action } from "@pulsor/core"

type User = {
  id: number;
  firstName: string;
  lastName: string;
  extraProperty?: string;
}

export type UpdateState = {
  update: {
    count: number;
    foo?: string;
    user?: User;
  }
}

// ===

const userA: User = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  extraProperty: 'Test prop'
}

const userB: User = {
  id: 2,
  firstName: 'Jane',
  lastName: 'Donut',
}

// ===

const Init: Update<UpdateState> = {
  update: {
    count: 0
  }
}

const SimpleUpdate: Update<UpdateState> = {
  update: {
    foo: 'bar'
  }
}

const SetUserA: Action = {
  update: {
    user: userA,
  },
}

const SetFirstname: Update = {
  update: {
    user: {
      firstName: 'Foo bar',
    }
  }
}

const ReplaceWithUserB: Action<UpdateState> = {
  update: {
    user: () => ({
      ...userB,

    }),
  }
}

const Test: Action<UpdateState> = ({
  effect: (emit) => {

  },
  onaction: () => ({

  })
})


const RemoveKey: Update<UpdateState> = {
  update: {
    foo: undefined
  }
}

const IncrementNested: Update<UpdateState> = ({
  update: {
    count: count => count + 1
  }
})

export default (
  <div init={Init}>
    <pre>
      <code>{s => `state.update: ${JSON.stringify(s.update, null, 2)}`}</code>
    </pre>
    <p><button type="button" onclick={SimpleUpdate}>SimpleUpdate</button></p>
    <p><button type="button" onclick={SetUserA}>SetUserA</button></p>
    <p><button type="button" onclick={SetFirstname}>SetFirstname</button></p>
    <p><button type="button" onclick={ReplaceWithUserB}>ReplaceWithUserB</button></p>
    <p><button type="button" onclick={IncrementNested}>IncrementNested</button></p>
    <p><button type="button" onclick={RemoveKey}>RemoveKey</button></p>
  </div>
)
