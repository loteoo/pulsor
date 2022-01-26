import { Action } from '../core/src'

interface Args extends RequestInit {
  name: string;
  url: string;
  resolve?: 'arrayBuffer' | 'blob' | 'formData' | 'json' | 'text';
}

const Http = (args: Args): Action => [
  {
    [args.name]: {
      loading: true
    }
  },
  {
    effect: async (dispatch) => {
      try {
        const response = await fetch(args.url);
        const data = await response[args.resolve ?? 'json']();
        dispatch({
          [args.name]: {
            loading: false,
            data,
          }
        });
      } catch (error) {
        dispatch({
          [args.name]: {
            loading: false,
            error,
          }
        });
      }
    },
  }
]

export default Http;