import { Action } from '../core/src'

interface Args extends RequestInit {
  name: string;
  url: string;
  resolve?: 'arrayBuffer' | 'blob' | 'formData' | 'json' | 'text';
}

const Http = (args: Args): Action => [
  {
    scope: args.name,
    loading: true,
  },
  {
    effect: async (dispatch) => {
      try {
        const response = await fetch(args.url);
        const data = await response[args.resolve ?? 'json']();
        dispatch({
          loading: false,
          data,
        });
      } catch (error) {
        dispatch({
          loading: false,
          error,
        });
      }
    },
  }
];

export default Http;
