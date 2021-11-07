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
        return `import app from '${process.cwd().replace(/\\/g, '/')}';

import { pulsor } from '${pathToPulsor}';

pulsor(app);
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
