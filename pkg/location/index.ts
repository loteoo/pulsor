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


const HandleRouteChange: ActionFunction = ({ location, ...state }, route) => {
  return {
    location: {
      ...location,
      ...parseUrl(route)
    },
    ...state,
  }
}

const SetMatchParams = (params: any): Action => ({ location, ...state }) => {
  return {
    location: {
      ...location,
      params,
    },
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



export const navigate = (href: string) => ({
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
      onclick: navigate(href)
    },
    children
  )


export const EnhanceLinkClicks = (state: any, ev: any) => ({
  run: (emit: any) => {
    let target: HTMLElement | null = ev.target as HTMLElement;

    // Crawl up dom tree, look if click landed inside a <a /> tag
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }

    // If <a /> tag found
    if (target) {

      const href = target.getAttribute('href');

      if (href && href.startsWith('/')) {
        ev.preventDefault();
        history.pushState(null, '', href)
        setTimeout(() => {
          dispatchEvent(new CustomEvent("pushstate"))
        })
      }
    }
  }
})

export const LinkEnhancer = (_: any, children: VChildNode) =>
  h(
    'div',
    {
      onclick: EnhanceLinkClicks
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

  const Router: Component = () => ({
    init: (state) => HandleRouteChange(state, window.location.pathname + window.location.search),
    subscription: {
      subscribe: TrackRouteChange,
      onroutechange: HandleRouteChange,
    },
    children: (state: any) => {
      for (const route of Object.keys(routes)) {
        const maybeMatch = matchers[route](state.location.path)
        if (maybeMatch) {
          return {
            key: route,
            init: SetMatchParams(maybeMatch.params),
            children: routes[route],
          }
        }
      }
      return
    }
  })


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
