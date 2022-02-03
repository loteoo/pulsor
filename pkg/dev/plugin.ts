import fs from 'fs';
import path from 'path';
import { defineConfig, mergeConfig, normalizePath } from "vite";
import { Cycle } from '../core/src';
import { diff } from '../core/src/run';
import stringify from '../core/src/stringify';
import http from 'http';

const appToCliPath = path.relative(process.cwd(), __dirname);
const cliHtmlFilePath = path.resolve(__dirname, 'build.html');
const projectHtmlFilePath = path.resolve(process.cwd(), 'index.html');

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

  let rootNode;
  let styleSheets = [];
  let customDocument;

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

          rootNode.ctx = {
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

    config(config, { command }) {

      const rootVNodePath = config.root;

      rootNode = normalizePath(getExactPath(path.resolve(process.cwd(), rootVNodePath)));

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

      // Change path to index.html during build
      if (command === 'build') {
        // fs.copyFileSync(cliHtmlFilePath, projectHtmlFilePath);
      }
      customDocument = config.document;
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
    },
    load(id) {
      const accept = normalizePath(path.relative(process.cwd(), rootNode));

      if (id === '\0@pulsor-root') {

        return `import { h } from '${pulsorPath}'

import initialAppModule from '${rootNode}'

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


let app = initialAppModule;

let rootApp = app;

if (import.meta.hot) {
  rootApp = [
    {
      init: {
        effect: (emit) => {
          const handler = () => emit({})
          window.addEventListener('hmr', handler)
          return () => window.removeEventListener('hmr', handler)
        }
      },
    },
    () => app,
  ];

  import.meta.hot.accept('${accept}', (newModule) => {
    app = newModule.default
    dispatchEvent(new CustomEvent("hmr"))
  })
}


const root = document(initialAppModule)

export default root
`
      }

      if (id === '\0@pulsor-client') {
        return `import rootApp from '@pulsor-root';

import { run } from '${pulsorPath}';

run(rootApp, document);`;
      }
    },
    closeBundle() {
      // fs.rmSync(projectHtmlFilePath);
    },
  };
};

export default pulsorDevPlugin;
