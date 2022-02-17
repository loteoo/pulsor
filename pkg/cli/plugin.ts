import fs from 'fs';
import path from 'path';
import http from 'http';
import { defineConfig, mergeConfig, normalizePath, transformWithEsbuild, build } from "vite";
import { stringify } from '../html/src';
import { renderPage } from './renderPage';

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



const customLogger = {
  log: console.log,
  info: () => {},
  warn: console.warn,
  error: console.error,
}

const projectPulsor = '@pulsor/core';
const cliPulsor = normalizePath(path.resolve(__dirname, 'node_modules/@pulsor/core/src'));

// const pulsorPath = pulsorIsInstalled() ? projectPulsor : cliPulsor;
const pulsorPath = normalizePath(path.resolve(__dirname, '../core/src'));

// ===
const pulsorDevPlugin = () => {

  let config;
  let configEnv;
  let rootNodePath;
  let styleSheets = [];


  return {
    name: "pulsor-dev",

    // Change path to index.html during dev
    configureServer(server) {

      server.httpServer = http.createServer(server.middlewares);

      return () => {

        server.middlewares.use(async (req, res, next) => {

          const rootVNode = (await server.ssrLoadModule('@pulsor-combined-root')).default;

          const renderedHtml = await stringify(rootVNode, {
            ssr: {
              url: req.url
            }
          });

          const html = await server.transformIndexHtml(req.url, renderedHtml);

          res.end(`<!DOCTYPE html>\n${html}`);

          next();
        });
      };
    },

    config(_config, _configEnv) {

      const rootVNodePath = _config.root;

      rootNodePath = normalizePath(getExactPath(path.resolve(process.cwd(), rootVNodePath)));

      Object.assign(_config, mergeConfig(_config, defineConfig({
        root: process.cwd(),
        esbuild: {
          jsxFactory: 'h',
          jsxFragment: 'Fragment',
          jsxInject: `import { h, Fragment } from '${pulsorPath}'`
        },
        resolve: {
          alias: {
            '@pulsor/html': path.resolve(__dirname, '../html/src')
          }
        }
      })));


      if (!_config.build?.rollupOptions) {
        _config.build = {
          ..._config.build,
          rollupOptions: {
            input: {
              app: '@pulsor-client'
            }
          }
        }
      }

      if (!_config.build.buildTarget) {
        _config.build.buildTarget = 'spa'
      }


      if (_configEnv.command === 'build' && !_config.build.ssr) {
        console.log(`=> Building for ${_config.build.buildTarget}`);

        if (_config.build.nojs && !['static', 'ssr'].includes(_config.build.buildTarget)) {
          throw new Error('You should only use --nojs option with HTML-producing build targets: --buildTarget="static" or --buildTarget="ssr".')
        }
      }

      configEnv = _configEnv;
      config = _config;
    },
    async transform(code, id, ssr) {
      if (ssr && id.endsWith('.css') && !styleSheets.includes(code)) {
        styleSheets.push(code);
      }
      if (id === '\0@pulsor-document') {
        const result = await transformWithEsbuild(code, 'document.tsx', config.esbuild);
        return {
          ...result,
          code: `${config.esbuild.jsxInject}\n${result.code}`,
        }
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
      if (id.endsWith('@pulsor-combined-root')) {
        return '\0@pulsor-combined-root';
      }
      if (id.endsWith('@pulsor-document')) {
        return '\0@pulsor-document';
      }
    },
    load(id) {
      if (id === '\0@pulsor-combined-root') {

        return `
import initialAppModule from '${rootNodePath}'
import document from '@pulsor-document'

export let fresh = initialAppModule;

let app = fresh;

if (typeof window !== 'undefined' && import.meta.hot) {
  app = [
    {
      init: {
        effect: (dispatch) => {
          const handler = () => dispatch({})
          window.addEventListener('hmr', handler)
          return () => window.removeEventListener('hmr', handler)
        }
      },
    },
    () => window.__hrm_vnode ?? fresh,
  ];
  import.meta.hot.accept((newModule) => {
    window.__hrm_vnode = newModule.fresh;
    dispatchEvent(new CustomEvent("hmr"));
  });
}

const root = document(app);

export default root`;
      }

      if (id === '\0@pulsor-client') {
        return `import rootApp from '@pulsor-combined-root';

import { run } from '${pulsorPath}';
import { hydrate } from '@pulsor/html';

run(rootApp, hydrate(document));`;
      }
      if (id === '\0@pulsor-document') {
        const projectDocument = getExactPath(`${process.cwd()}/document`);
        if (fs.existsSync(projectDocument)) {
          return fs.readFileSync(projectDocument, 'utf-8');
        }
        const cliDocument = getExactPath(`${__dirname}/document`);
        if (fs.existsSync(cliDocument)) {
          return fs.readFileSync(cliDocument, 'utf-8');
        }
      }
    },




    async writeBundle(_, output) {

      // Don't run when running sub-build commands:
      // (Stops from "infinite loop" building)
      if (config.build.ssr) {
        return;
      }

      const headImports = [];

      const bundles = Object.keys(output).map(key => output[key]);

      if (!config.build.nojs) {
        const jsEntries = bundles.filter(bundle => bundle.isEntry);
        for (const bundle of jsEntries) {
          headImports.push({
            tag: 'script',
            props: {
              async: true,
              type: 'module',
              crossorigin: true,
              src: `/${bundle.fileName}`
            }
          });
          for (const chunkFileName of bundle.imports) {
            headImports.push({
              tag: 'link',
              props: {
                rel: 'modulepreload',
                href: `/${chunkFileName}`
              }
            });
          }
        }
      }

      const cssFiles = bundles.filter(bundle => bundle.fileName.endsWith('.css'));
      for (const cssFile of cssFiles) {
        headImports.push({
          tag: 'link',
          props: {
            rel: 'stylesheet',
            href: `/${cssFile.fileName}`
          }
        })
      }

      if (config.build.buildTarget === 'spa') {

        // Build Document Node bundle
        await build({
          ...config,
          root: rootNodePath,
          logLevel: 'warn',
          publicDir: false,
          build: {
            ...config.build,
            outDir: 'dist/.pulsor',
            emptyOutDir: false,
            ssr: true,
            rollupOptions: {
              input: {
                document: '@pulsor-document'
              }
            }
          },
          customLogger,
        });

        const rootVNode = require(path.resolve(process.cwd(), 'dist/.pulsor/document.js')).default();

        const html = await renderPage('/', { ...rootVNode }, headImports);

        fs.writeFileSync(
          path.resolve(path.resolve(process.cwd(), 'dist/index.html')),
          html,
          'utf-8'
        );

        fs.rmSync(path.resolve(process.cwd(), 'dist/.pulsor'), {
          recursive: true,
        });

        return;
      }

      // Build SSR
      await build({
        ...config,
        root: rootNodePath,
        publicDir: false,
        build: {
          ...config.build,
          outDir: 'dist/.pulsor',
          emptyOutDir: false,
          ssr: true,
          rollupOptions: {
            input: {
              app: '@pulsor-combined-root'
            }
          }
        },
        customLogger,
      });

      if (config.build.buildTarget === 'static') {

        const rootVNode = require(path.resolve(process.cwd(), 'dist/.pulsor/app.js')).default;

        const pathQueue = [
          '/'
        ];

        for (const url of pathQueue) {

          const html = await renderPage(url, { ...rootVNode }, headImports);

          const pattern = /href="(.*?)"/g;

          const matches = html.match(pattern);

          if (matches) {

            const internalLinks = html
              .match(pattern)
              .map(hrefAttr => hrefAttr.slice(6, -1))
              .filter(href => {
                if (!href.startsWith('/') || href.includes('.') || href.startsWith('#') || href.startsWith('/#')) {
                  return false;
                }
                return true;
              });

            const newLinks = internalLinks.filter(
              href => !pathQueue.includes(href)
            );

            pathQueue.push(...newLinks);

          }

          const dirName = path.resolve(process.cwd(), `dist/${url}`);

          fs.mkdirSync(dirName, { recursive: true });

          fs.writeFileSync(
            path.resolve(dirName, 'index.html'),
            html,
            'utf-8'
          );
        }

        fs.rmSync(path.resolve(process.cwd(), 'dist/.pulsor'), {
          recursive: true,
        });
      }

      if (config.build.buildTarget === 'ssr') {
        fs.writeFileSync(
          path.resolve(process.cwd(), 'dist/.pulsor/head.json'),
          JSON.stringify(headImports, null, 2),
          'utf-8'
        );
      }

    }
  };
};

export default pulsorDevPlugin;
