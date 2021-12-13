import fs from 'fs';
import path from 'path';
import { defineConfig, mergeConfig } from "vite";

const appToCliPath = path.relative(process.cwd(), __dirname);
const htmlFilePath = path.resolve(__dirname, 'index.html');
const tempHtmlFilePath = path.resolve(process.cwd(), 'index.html');

// ====

const sufixesToCheck = [
  '.js', '.jsx', '.ts', '.tsx',
  '/index.js', '/index.jsx', '/index.ts', '/index.tsx',
]

const getExactName = (path) => {
  if (path.includes('.')) {
    return path;
  }
  for (const suffix of sufixesToCheck) {
    const str = `${path}${suffix}`
    if (fs.existsSync(str)) {
      return str;
    }
  }
  return false;
}

// ===

const isProject = fs.existsSync(path.resolve(process.cwd(), 'package.json'));

const projectPulsor = '@pulsor/core';
const cliPulsor = path.resolve(__dirname, 'node_modules/@pulsor/core/src');

const pulsorPath = isProject ? projectPulsor : cliPulsor;
// const pulsorPath = path.resolve(__dirname, '../core/src');

// ===
const createMainFile = (rootNode) => `import initialAppModule from '${rootNode}';

import { run } from '${pulsorPath}';

let app = initialAppModule;

let rootApp = app;

if (import.meta.hot) {
  rootApp = {
    init: {
      run: (emit) => {
        const handler = () => emit('hrmupdate')
        window.addEventListener('hmr', handler)
        return () => window.removeEventListener('hmr', handler)
      },
      onhrmupdate: ({ })
    },
    children: () => app,
  };

  import.meta.hot.accept('${rootNode.split('/').at(-1)}', (newModule) => {
    app = newModule.default
    dispatchEvent(new CustomEvent("hmr"))
  })
}

run(rootApp);
`

const pulsorDevPlugin = () => {

  let rootNode;
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
      rootNode = getExactName(path.resolve(process.cwd(), config.root || '.'));

      Object.assign(config, mergeConfig(config, defineConfig({
        root: process.cwd(),
        esbuild: {
          jsxFactory: 'h',
          jsxFragment: 'Fragment',
          jsxInject: `import { h, Fragment } from '${pulsorPath}'`
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
      if (['/main.ts', './main.ts'].includes(id)) {
        return '\0/main.ts';
      }
    },
    load(id) {
      if (id === '\0/main.ts') {
        return createMainFile(rootNode);
      }
    },
    closeBundle() {
      fs.rmSync(tempHtmlFilePath);
    },
  };
};

module.exports = pulsorDevPlugin;