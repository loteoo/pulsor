import { defineConfig } from "vite";
import path from 'path';

const appToCliPath = path.relative(process.cwd(), __dirname);
const rootNodePath = process.cwd().replace(/\\/g, '/');


const mainFile = `import initialAppModule from '${rootNodePath}';

import { run } from '@pulsor/core';

let app = initialAppModule;

const rootApp = [
  () => app,
  {
    init: {
      run: (emit) => {
        if (import.meta.hot) {
          import.meta.hot.accept('./index', (newModule) => {
            app = newModule.default
            emit('hrmupdate')
          })
        }
      },
      onhrmupdate: (state) => ({ ...state })
    }
  },
];

run(rootApp);
`

const middleware = () => {
  return {
    name: "middleware",
    apply: "serve",
    configureServer(viteDevServer) {
      return () => {
        viteDevServer.middlewares.use(async (req, res, next) => {

          if (req.url === "/index.html") {
            req.url = `/${appToCliPath}/index.html`
          }

          next();
        });
      };
    },
    load(id) {
      if (id === '/main.ts') {
        return mainFile
      }
    }
  };
};

export default defineConfig({
  plugins: [middleware()],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from '@pulsor/core'`
  },
  server: {
    fs: {
      strict: false,
    },
  },
  resolve: {
    alias: {
      // '@pulsor/core': `${path.resolve(__dirname).replace(/\\/g, '/')}/node_modules/@pulsor/core/src`,
      '@pulsor/core': `${path.resolve(__dirname).replace(/\\/g, '/') + '/../core/src'}`, // For core development
    }
  },
});
