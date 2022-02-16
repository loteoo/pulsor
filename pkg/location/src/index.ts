import { match, MatchFunction } from "path-to-regexp";
import { h, Action, VChildNode, VNode, Component, Effect, VProps, Dispatch } from '../../core/src'
import { hydrate } from '../../html/src'

export type State = {
  ssr?: {
    url?: string;
  },
  location: {
    path: string;
    query: Record<string, string>;
    params: Record<string, string>;
    hash: string;
    route?: string;
  }
}

export const Navigate = (href: string): Effect => ({
  effect: () => {
    history.pushState(null, '', href)
    dispatchEvent(new CustomEvent("pushstate"))
  }
})

interface LinkProps extends VProps {
  href: string;
}

export const Link = ({ href, ...rest }: LinkProps, children: VChildNode) =>
  h(
    'a',
    {
      ...rest,
      onclick: Navigate(href)
    },
    children
  )

export const CaptureLinkClicks: Action<State> = (_, ev) => ({
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

interface Options {
  routes: Record<string, VNode | Promise<VNode>>;
}

interface RouterProps {
  props: VProps;
  loader: VNode;
  notFound: VNode;
}

export const createRouter = ({ routes }: Options) => {
  const matchers: Record<string, MatchFunction> = {};

  for (const route of Object.keys(routes)) {
    matchers[route] = match(route)
  }

  const HandleRouteChange = (url: string): Action<State> => {
    const [rest, hash] = url.split('#');
    const [path, queryString] = rest.split('?');

    let query = {};
    if (queryString) {
      query = Object.fromEntries(new URLSearchParams(queryString));
    }

    let params = {};
    let route: string | undefined;
    for (const _route of Object.keys(routes)) {
      const maybeMatch = matchers[_route](path);
      if (maybeMatch) {
        params = maybeMatch.params;
        route = _route;
      }
    }

    return [
      {
        location: () => ({
          path,
          query,
          params,
          hash,
          route,
        })
      },
      Boolean(hash) && {
        effect: () => {
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) {
              el.scrollIntoView();
            }
          })
        },
      }
    ]
  };

  const TrackRouteChange: Action<State> = {
    effect: (dispatch) => {
      const handleLocationChange = () => {
        dispatch(HandleRouteChange(window.location.pathname + window.location.search + window.location.hash))
      }

      addEventListener('pushstate', handleLocationChange)
      addEventListener('popstate', handleLocationChange)
      return () => {
        removeEventListener('pushstate', handleLocationChange)
        removeEventListener('popstate', handleLocationChange)
      }
    },
  };

  const TrackLocation: Action<State> = (state) => {
    return [
      HandleRouteChange(
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}${window.location.hash}`
          : state.ssr?.url ?? '/',
      ),
      TrackRouteChange,
    ];
  }

  const Router: Component<State> = ({ props, loader, notFound }: RouterProps) => (state) => {

    let init;
    let children;

    if (!state.location.route) {
      children = notFound ?? 'Page not found.'
    } else {

      // @ts-ignore
      const currRoute = routes[state.location.route];
      const routeNeedsLoading = (currRoute as any).lazy;

      if (routeNeedsLoading) {

        const SSRLoadPageBundle = () => ({
          effect: async (dispatch: Dispatch) => {

            // @ts-ignore
            const bundle = await currRoute.lazy();

            // @ts-ignore
            routes[state.location.route] = bundle.default;
            dispatch(Navigate(state.location.path));
          }
        });

        init = SSRLoadPageBundle;
        children = loader ?? 'Loading...';

        if (typeof window !== 'undefined') {
          const router = document.querySelector(`[data-path="${state.location.path}"]`);
          if (router) {
            const old = hydrate(router);
            children = old.children;
          }
        }
      } else {
        children = currRoute as VNode<State>;
      }
    }



    return {
      tag: 'div',
      key: state.location.path,
      init,
      props: {
        ...props,
        'data-path': state.location.path,
      },
      children: [children],
    }
  };

  return {
    TrackLocation,
    Router
  }
}
