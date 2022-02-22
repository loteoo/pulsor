# @pulsor/location

Routing utilities for pulsor

## Installation
```bash
npm install @pulsor/location
```

## Usage

Use the `createRouter` function to setup your routes. It will return a `TrackLocation` Action that you need to hook-up near the top of your app (above the router), then use the `Router` component where you want the routes to be rendered.

### Routing

```jsx
import { createRouter } from '@pulsor/location'

const { Router, TrackLocation } = createRouter({
  routes: {
    '/': <h1>Home page</h1>,
    '/about': <h1>About page</h1>,
    '/contact': <h1>Contact page</h1>,
  }
})

const app = (
  <main init={TrackLocation}>
    <header>App header</header>
    <Router />
    <footer>App footer</footer>
  </main>
)

```

### Client-side navigation

Option 1
```jsx
import { Navigate } from '@pulsor/location'

const GoToAboutPage = Navigate('/')

const app = (
  <button onclick={GoToAboutPage}>Go to About page</button>
)

```

Option 2
```jsx
import { Link } from '@pulsor/location'

const app = (
  <Link href="/about">About page</Link>
)

```

Option 3
```jsx
import { CaptureLinkClicks } from '@pulsor/location'

const app = (
  <main id="root" onclick={CaptureLinkClicks}>
    <nav>
      <a href="/about">About page</a>
    </nav>
  </main>
)

```

