import { match, MatchFunction } from "path-to-regexp";

import { h } from '../core/src/h'

const parseQueryString = (qs?: string) => {
  return qs ? Object.fromEntries(new URLSearchParams(qs)) : {}
}

const parseUrl = (url: string) => {
  const [path, queryString] = url.split('?')
  return {
    path,
    query: parseQueryString(queryString),
  }
}


const HandleRouteChange: ActionFunction = ({ location: _, ...state }, route) => {
  return {
    location: parseUrl(route),
    ...state,
  }
}

const TrackRouteChange: Listener = (emit) => {
  const handleLocationChange = () => {
    emit('routechange', window.location.pathname + window.location.search)
  }

  addEventListener('pushstate', handleLocationChange)
  addEventListener('popstate', handleLocationChange)
  return () => {
    removeEventListener('pushstate', handleLocationChange)
    removeEventListener('popstate', handleLocationChange)
  }
}



export const createNavigateTask = (href: string) => ({
  run: () => {
    history.pushState(null, '', href)
    setTimeout(() => {
      dispatchEvent(new CustomEvent("pushstate"))
    })
  }
})

interface LinkProps {
  href: string;
  [x: string]: any;
}

export const Link = ({ href, ...rest }: LinkProps, children: VChildNode) =>
  h(
    'a',
    {
      ...rest,
      onclick: createNavigateTask(href)
    },
    children
  )


interface Options {
  routes: Record<string, VNode>;
}

export const createRouter = ({ routes }: Options) => {
  const matchers: Record<string, MatchFunction> = {};

  for (const route of Object.keys(routes)) {
    matchers[route] = match(route)
  }


  const Router: Component = () => {
    return ({
      type: 'div', // TODO: support no type
      init: (state) => HandleRouteChange(state, window.location.pathname + window.location.search),
      listener: TrackRouteChange,
      onroutechange: HandleRouteChange,
      children: [
        (state: any) => {
          for (const route of Object.keys(routes)) {
            const maybeMatch = matchers[route](state.location.path)
            if (maybeMatch) {
              return {
                type: 'div',
                key: route,
                children: routes[route],
              }
            }
          }
          return
        }
      ]
    })
  }


  return Router
}

/**
 * TODO
 *
 * - The params object should be in the state
 * - There should be a `<CaptureClicks />` component that you can use, along with the `<Link />`
 *
 *
 */
