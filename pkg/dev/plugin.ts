import fs from 'fs';
import path from 'path';
import { defineConfig, mergeConfig, normalizePath, transformWithEsbuild, build } from "vite";
import { Cycle } from '../core/src';
import { diff } from '../core/src/run';
import stringify from '../core/src/stringify';
import http from 'http';
import { renderPathToHtml } from './renderPathToHtml';

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
  info: () => {},
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
          };

          const oldVNode = { tag: rootVNode.tag, };

          rootVNode.ctx = {
            req,
            res
          };

          diff(oldVNode, { ...rootVNode }, cycle);

          const renderedHtml = stringify(oldVNode, cycle, {});

          const html = await server.transformIndexHtml(req.url, renderedHtml);

          res.end(html);

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
      })));


      if (!_config.build.rollupOptions) {
        _config.build.rollupOptions = {
          input: {
            app: '@pulsor-client'
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
        const result = await transformWithEsbuild(code, 'document.tsx');
        return {
          ...result,
          code: `import { h, Fragment } from '${pulsorPath}';\n${result.code}`
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
      // Stop from "infinite loop" building
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

        /// ==== BUIlD SPA HTML

        // console.log('config', config)

        // Build Document Node bundle
        await build({
          ...config,
          root: rootNodePath,
          logLevel: 'warn',
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

        const cycle = {
          state: {},
          needsRerender: true,
          sideEffects: [],
          dryRun: true,
        } as Cycle;

        const oldVNode = { tag: rootVNode.tag, };

        diff(oldVNode, { ...rootVNode }, cycle);


        // @ts-ignore
        const renderedHtml = stringify(oldVNode, cycle, {});


        const headHtmlImports = stringify({
          tag: 'head',
          children: headImports
        }, cycle, {}).slice(6, -7).replaceAll(' data-pulsorhydrate="true"', '');

        const html = renderedHtml.replace('</head>', `${headHtmlImports}</head>`);

        const cleaned = html.replace(/<body>.*<\/body>/, '<body></body>')

        fs.writeFileSync(
          path.resolve(path.resolve(process.cwd(), 'dist/index.html')),
          cleaned,
          'utf-8'
        );

        fs.rmSync(path.resolve(process.cwd(), 'dist/.pulsor'), {
          recursive: true,
        });

        /// ==== END BUIlD SPA HTML
        return
      }

      // Build SSR
      await build({
        ...config,
        root: rootNodePath,
        build: {
          ...config.build,
          outDir: 'dist/.pulsor',
          emptyOutDir: false,
          ssr: true,
          rollupOptions: {
            input: {
              app: '@pulsor-root'
            }
          }
        },
        customLogger,
      });

      if (config.build.buildTarget === 'static') {

        const pathQueue = [
          '/'
        ];

        for (const url of pathQueue) {

          const html = renderPathToHtml(url, headImports);

          const pattern = /href="(.*?)"/g;

          const internalLinks = html
            .match(pattern)
            .map(hrefAttr => hrefAttr.slice(6, -1))
            .filter(href => {
              if (!href.startsWith('/') || href.includes('.')) {
                return false;
              }
              return true;
            });

          const newLinks = internalLinks.filter(
            href => !pathQueue.includes(href)
          );

          pathQueue.push(...newLinks);

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
