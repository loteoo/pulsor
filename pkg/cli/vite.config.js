import { defineConfig } from "vite";
import path from 'path';

const appToCliPath = path.relative(process.cwd(), __dirname);
const pathToPulsor = path.join(__dirname, '/../core/src/pulsor').replace(/\\/g, '/');
const pathToJsx = path.join(__dirname, '/../core/src/jsx').replace(/\\/g, '/');

const virtualFileId = '/main.ts'


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

      if (id === virtualFileId) {
        return `import initialAppModule from '${process.cwd().replace(/\\/g, '/')}';

import { pulsor } from '${pathToPulsor}';

let app = initialAppModule;

const rootApp = [
  () => app,
  {
    subscription: {
      subscribe: (emit) => {
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

pulsor(rootApp);
        `
      }
    }
  };
};

export default defineConfig({
  plugins: [middleware()],
  esbuild: {
    jsxFactory: 'jsx',
    jsxFragment: 'Fragment',
    jsxInject: `import { jsx, Fragment } from '${pathToJsx}'`
  },
  server: {
    fs: {
      strict: false,
    },
  },
});
