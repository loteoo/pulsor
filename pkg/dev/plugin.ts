import fs from 'fs';
import path from 'path';
import { defineConfig, mergeConfig, normalizePath } from "vite";

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
const createMainFile = (rootNode, accept) => `import initialAppModule from '/root.ts';

import { run } from '${pulsorPath}';

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


run(rootApp, document);
`

const pulsorDevPlugin = () => {

  let rootNode;
  let styleSheets = [];
  let customDocument;

  return {
    name: "pulsor-dev",

    config(config, { command }) {

      const args = process.argv.slice(2);
      const rootVNodePath = args[1] ?? args[0];

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
      if (ssr && id.endsWith('.css')) {
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
            src: './main.ts',
          },
          injectTo: 'head',
        },
        ...styleScripts,
      ];
    },
    resolveId(id) {
      if (['/main.ts', './main.ts'].includes(id)) {
        return '\0/main.ts';
      }
      if (['/root.ts', './root.ts'].includes(id)) {
        return '\0/root.ts';
      }
    },
    load(id) {
      if (id === '\0/main.ts') {

        const accept = normalizePath(path.relative(process.cwd(), rootNode));

        return createMainFile(rootNode, accept);
      }
      if (id === '\0/root.ts') {

        return `
        import { h } from '${pulsorPath}'
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

const root = document(initialAppModule)

export default root
`
      }
    },
    closeBundle() {
      // fs.rmSync(projectHtmlFilePath);
    },
  };
};

export default pulsorDevPlugin;
