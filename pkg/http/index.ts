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
    run: async (emit) => {
      try {
        const response = await fetch(args.url);
        const data = await response[args.resolve ?? 'json']();
        emit('complete', data);
      } catch (error) {
        emit('error', error);
      }
    },
    oncomplete: (_, data) => ({
      [args.name]: {
        loading: false,
        data,
      }
    }),
    onerror: (_, error) => ({
      [args.name]: {
        loading: false,
        error,
      }
    }),
  }
]

export default Http;