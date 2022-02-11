import { match, MatchFunction } from "path-to-regexp";
import { h, ActionFunction, Action, VChildNode, VNode, Component, Effect } from '../core/src'

export type State = {
  location: {
    path: string;
    query: Record<string, string>;
    hash: string;
  }
}

const parseQueryString = (qs?: string) => {
  return qs ? Object.fromEntries(new URLSearchParams(qs)) : {}
}

const HandleRouteChange: ActionFunction<State> = (_, url: string) => {
  const [rest, hash] = url.split('#')
  const [path, queryString] = rest.split('?')
  return [
    {
      location: () => ({
        path,
        query: parseQueryString(queryString),
        hash,
      })
    },
    Boolean(hash) && {
      effect: () => {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({
              behavior: 'smooth',
            });
          }
        })
      },
    }
  ]
}

const InitRoute = (params: any): Action => ({
  location: {
    params,
  },
})

const TrackRouteChange: Action = {
  effect: (dispatch) => {
    const handleLocationChange = () => {
      dispatch(HandleRouteChange, window.location.pathname + window.location.search + window.location.hash)
    }

    addEventListener('pushstate', handleLocationChange)
    addEventListener('popstate', handleLocationChange)
    return () => {
      removeEventListener('pushstate', handleLocationChange)
      removeEventListener('popstate', handleLocationChange)
    }
  },
}

export const navigate = (href: string): Effect => ({
  effect: () => {
    history.pushState(null, '', href)
    dispatchEvent(new CustomEvent("pushstate"))
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

export const EnhanceLinkClicks: Action = (state: any, ev: any) => ({
  effect: () => {
    let clicked: HTMLElement | null = ev.target as HTMLElement;

    // Crawl up dom tree, look if click landed inside a <a /> tag
    const anchor = clicked.closest('a')

    // If <a /> tag found
    if (anchor) {
      const href = anchor.getAttribute('href');

      if (href && (href.startsWith('/') || href.startsWith('#'))) {
        ev.preventDefault();
        history.pushState(null, '', href)
        dispatchEvent(new CustomEvent("pushstate"))
      }
    }
  },
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

  const Router: Component = ({ props }: any) => (state, ctx) => ({
    tag: 'div',
    props,
    init: [
      HandleRouteChange(
        state,
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}${window.location.hash}`
          : ctx.ssr?.url ?? '/',
      ),
      TrackRouteChange,
    ],
    children: (state: any) => {
      for (const route of Object.keys(routes)) {
        const maybeMatch = matchers[route](state.location.path)
        if (maybeMatch) {
          return {
            tag: 'div',
            key: route,
            init: InitRoute(maybeMatch.params),
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
