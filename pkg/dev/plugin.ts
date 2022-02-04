import fs from 'fs';
import path from 'path';
import { defineConfig, mergeConfig, normalizePath } from "vite";
import { Cycle } from '../core/src';
import { diff } from '../core/src/run';
import stringify from '../core/src/stringify';
import http from 'http';

// ====

const sufixesToCheck = [
  '.js', '.jsx', '.ts', '.tsx',
  '/index.js', '/index.jsx', '/index.ts', '/index.tsx',
]

const getExactPath = (path) => {
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

const pulsorIsInstalled = () => {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const hasPackageJson = fs.existsSync(packageJsonPath);

  if (hasPackageJson) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (packageJson && packageJson.dependencies && packageJson.dependencies['@pulsor/core']) {
      return true
    }
  }

  return false
}

const projectPulsor = '@pulsor/core';
const cliPulsor = normalizePath(path.resolve(__dirname, 'node_modules/@pulsor/core/src'));

// const pulsorPath = pulsorIsInstalled() ? projectPulsor : cliPulsor;
const pulsorPath = normalizePath(path.resolve(__dirname, '../core/src'));

// ===
const pulsorDevPlugin = () => {

  let rootNodePath;
  let styleSheets = [];

  return {
    name: "pulsor-dev",

    // Change path to index.html during dev
    configureServer(server) {

      server.httpServer = http.createServer(server.middlewares);

      return () => {

        server.middlewares.use(async (req, res, next) => {

          const rootVNode = (await server.ssrLoadModule('@pulsor-root')).default;

          const cycle: Cycle = {
            state: {
              location: {
                path: req.url,
              }
            },
            needsRerender: true,
            sideEffects: [],
            dryRun: true,
          }

          const oldVNode = { tag: rootVNode.tag, };

          rootVNode.ctx = {
            req,
            res
          }

          diff(oldVNode, { ...rootVNode }, cycle);

          const renderedHtml = stringify(oldVNode, cycle, {});

          const html = await server.transformIndexHtml(req.url, renderedHtml);

          res.end(html);

          next();
        });
      };
    },

    config(config) {

      const rootVNodePath = config.root;

      rootNodePath = normalizePath(getExactPath(path.resolve(process.cwd(), rootVNodePath)));

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
        },
      })));

    },
    transform(code, id, ssr) {
      if (ssr && id.endsWith('.css') && !styleSheets.includes(code)) {
        styleSheets.push(code);
      }
    },
    transformIndexHtml() {
      const styleScripts = styleSheets.map((code) => ({
        tag: 'style',
        attrs: {
          type: 'text/css',
        },
        children: code,
        injectTo: 'head',
      }))
      return [
        {
          tag: 'script',
          attrs: {
            defer: true,
            async: true,
            type: 'module',
            src: '@pulsor-client',
          },
          injectTo: 'head',
        },
        ...styleScripts,
      ];
    },
    resolveId(id) {
      if (id.endsWith('@pulsor-client')) {
        return '\0@pulsor-client';
      }
      if (id.endsWith('@pulsor-root')) {
        return '\0@pulsor-root';
      }
      if (id.endsWith('@pulsor-document')) {
        return '\0@pulsor-document';
      }
    },
    load(id) {
      if (id === '\0@pulsor-root') {

        return `
import initialAppModule from '${rootNodePath}'
import document from '@pulsor-document'

export const fresh = initialAppModule;

let app = initialAppModule;

let rootApp = app;

if (import.meta.hot) {
  rootApp = [
    {
      init: {
        effect: (emit) => {
          import.meta.hot.accept((newModule) => {
            app = newModule.fresh;
            emit({});
          });
        }
      },
    },
    () => app,
  ];
}


const root = document(rootApp)

export default root`;
      }

      if (id === '\0@pulsor-client') {
        return `import rootApp from '@pulsor-root';

import { run } from '${pulsorPath}';

run(rootApp, document);`;
      }
      if (id === '\0@pulsor-document') {
        return `import { h } from '${pulsorPath}'

const document = (root) => (
  h('html', {}, [
    h('head', {}, [
      h('title', {}, 'Pulsor dev server')
    ]),
    h('body', {}, [
      root
    ])
  ])
)

export default document`;
      }
    },
  };
};

export default pulsorDevPlugin;
