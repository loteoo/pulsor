# @puslor/core

Core runtime for the pulsor framework

## Installation
```
npm install @pulsor/core
```

## Usage

```typescript
import { run } from '@pulsor/core'

// App definition
const app = {
  type: 'h1',
  children: {
    text: 'Hello world'
  }
}

// Run app
run(app)

```

See the [main repo](https://github.com/loteoo/pulsor) for more info.
