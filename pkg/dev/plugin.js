import fs from 'fs';
import path from 'path';
import { defineConfig, mergeConfig } from "vite";

const cliPulsor = path.resolve(__dirname, 'node_modules/@pulsor/core/src');
const appToCliPath = path.relative(process.cwd(), __dirname);
const htmlFilePath = path.resolve(__dirname, 'index.html');
const tempHtmlFilePath = path.resolve(process.cwd(), 'index.html');

const createMainFile = (root) => `import initialAppModule from '${root}';

import { run } from '@pulsor/core';

let app = initialAppModule;

// const rootApp = [
//   () => app,
//   {
//     init: {
//       run: (emit) => {
//         if (import.meta.hot) {
//           import.meta.hot.accept('./index', (newModule) => {
//             app = newModule.default
//             emit('hrmupdate')
//           })
//         }
//       },
//       onhrmupdate: (state) => ({ ...state })
//     }
//   },
// ];

run(app);
`

const pulsorDevPlugin = () => {

  const isProject = fs.existsSync(path.resolve(process.cwd(), 'package.json'));

  let root;
  return {
    name: "pulsor-dev",

    // Change path to index.html during dev
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === "/index.html") {
            req.url = `/${appToCliPath}/index.html`
          }
          next();
        });
      };
    },

    config(config, { command }) {
      root = path.resolve(process.cwd(), config.root || '.');

      Object.assign(config, mergeConfig(config, defineConfig({
        root: process.cwd(),
        esbuild: {
          jsxFactory: 'h',
          jsxFragment: 'Fragment',
          jsxInject: `import { h, Fragment } from '@pulsor/core'`
        },
        resolve: {
          alias: !isProject
            ? {
              '@pulsor/core': cliPulsor,
            } : {}
        },
        server: {
          fs: {
            strict: false
          }
        }
      })));

      // Change path to index.html during build
      if (command === 'build') {
        fs.copyFileSync(htmlFilePath, tempHtmlFilePath);
      }
    },
    resolveId(id) {
      if (id === './main.ts') {
        return '/main.ts';
      }
    },
    load(id) {
      if (id === '/main.ts') {
        const main = createMainFile(root);
        return main;
      }
    },
    closeBundle() {
      fs.rmSync(tempHtmlFilePath);
    },
  };
};

module.exports = pulsorDevPlugin;