import { match, MatchFunction } from "path-to-regexp";
import { h, Action, VChildNode, VNode, Component, Effect, VProps, Dispatch } from '@pulsor/core'
import { hydrate } from '@pulsor/html'

export type RouteStatus = 'loading' | 'loaded' | 'notfound';

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
    status?: RouteStatus;
  }
}

export const Navigate = (href: string): Effect => ({
  effect: () => {
    history.pushState(null, '', href);
    dispatchEvent(new CustomEvent("pushstate"));
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

export const CaptureLinkClicks = (CustomNavigateAction: any = Navigate): Action<State> => (_, ev) => ({
  effect: (dispatch) => {
    let clicked: HTMLElement | null = ev.target as HTMLElement;

    // Crawl up dom tree, look if click landed inside a <a /> tag
    const anchor = clicked.closest('a')

    // If <a /> tag found
    if (anchor) {
      const href = anchor.getAttribute('href');

      if (href && (href.startsWith('/') || href.startsWith('#'))) {
        ev.preventDefault();
        dispatch(CustomNavigateAction(href));
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
    // Remove trailing slashes
    url = (url !== '/' && url.endsWith('/')) ? url.slice(0, -1) : url;

    // Decompose path
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

    let status: RouteStatus = 'loaded';

    let extraFx;
    if (route) {

      const currRoute = routes[route];
      const routeNeedsLoading = (currRoute as any).lazy;

      if (routeNeedsLoading) {
        if (typeof window !== 'undefined') {
          status = 'loading';
        }
        const SSRLoadPageBundle = () => ({
          effect: async (dispatch: Dispatch) => {

            // @ts-ignore
            const bundle = await currRoute.lazy();

            // @ts-ignore
            routes[route] = bundle.default;
            dispatch({
              location: {
                status: 'loaded'
              }
            });
          }
        });

        extraFx = SSRLoadPageBundle;
      }
    } else {
      status = 'notfound';
    }


    return [
      {
        location: () => ({
          path,
          query,
          params,
          hash,
          route,
          status,
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
      },

      // @ts-ignore
      extraFx
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

    if (!state.location) {
      throw new Error('Missing location state. Please add the "TrackLocation" action to the "init" of a top-level node in your app.')
    }

    let children;

    switch (state.location.status) {
      case 'notfound':
        children = notFound ?? 'Page not found.'
        break;

      case 'loading':
        children = loader ?? 'Loading...';
        if (typeof window !== 'undefined') {
          const router = document.querySelector(`[data-path="${state.location.path}"]`);
          if (router) {
            // @ts-ignore
            if (router.vnode && router.vnode.children) {
              // @ts-ignore
              children = router.vnode.children;
            } else {
              children = hydrate(router).children;
            }
          }
        }
        break;

      case 'loaded':
        const currRoute = routes[state.location.route!];
        children = currRoute as VNode<State>;
        break;
    }

    return {
      tag: 'div',
      key: state.location.path,
      props: {
        ...props,
        'data-path': state.location.path,
      },
      children,
    }
  };

  return {
    TrackLocation,
    Router
  }
}
