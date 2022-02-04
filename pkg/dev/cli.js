#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { cac } = require('cac');
const { preview, createServer, loadConfigFromFile, mergeConfig, build } = require('vite');
const connect = require('connect')
const http = require('http')
const sirv = require('sirv')
const stringify = require('../core/dist/stringify').default;
const diff = require('../core/dist/run').diff;


// Create CLI
const cli = cac('pulsor');

// dev command
cli
  .command('[root]') // default command
  .alias('serve') // the command is called 'serve' in Vite's API
  .alias('dev') // alias to align with the script name
  .option('--host [host]', `[string] specify hostname`)
  .option('--port <port>', `[number] specify port`)
  .option('--https', `[boolean] use TLS + HTTP/2`)
  .option('--open [path]', `[boolean | string] open browser on startup`)
  .option('--cors', `[boolean] enable CORS`)
  .option('--strictPort', `[boolean] exit if specified port is already in use`)
  .option(
    '--force',
    `[boolean] force the optimizer to ignore the cache and re-bundle`
  )
  .action(async (root, options) => {
    try {
      const configPath = path.resolve(__dirname, 'vite.config.ts');

      const loadResult = await loadConfigFromFile({ mode: 'development', command: 'serve' }, configPath);

      const config = mergeConfig(loadResult.config, {
        root,
        base: options.base,
        mode: options.mode,
        configFile: options.config,
        logLevel: options.logLevel,
        clearScreen: options.clearScreen,
        server: {
          middlewareMode: 'ssr',
          ...options
        },
      })

      const server = await createServer(config)

      if (!server.httpServer) {
        throw new Error('HTTP server not available')
      }

      await server.listen()

      console.log('http://localhost:3000')

      // const info = server.config.logger.info

      // info(
      //   colors.cyan(`\n  vite v${require('vite/package.json').version}`) +
      //     colors.green(` dev server running at:\n`),
      //   {
      //     clear: !server.config.logger.hasWarned
      //   }
      // )

      // server.printUrls()

    } catch (e) {
      console.error(
        `error when starting dev server:\n${e.stack}`,
        { error: e }
      )
      process.exit(1);
    }
  })



// build
cli
  .command('build [root]')
  .option('--target <target>', `[string] transpile target (default: 'modules')`)
  .option('--outDir <dir>', `[string] output directory (default: dist)`)
  .option(
    '--assetsDir <dir>',
    `[string] directory under outDir to place assets in (default: _assets)`
  )
  .option(
    '--assetsInlineLimit <number>',
    `[number] static asset base64 inline threshold in bytes (default: 4096)`
  )
  .option(
    '--ssr [entry]',
    `[string] build specified entry for server-side rendering`
  )
  .option(
    '--sourcemap',
    `[boolean] output source maps for build (default: false)`
  )
  .option(
    '--minify [minifier]',
    `[boolean | "terser" | "esbuild"] enable/disable minification, ` +
      `or specify minifier to use (default: esbuild)`
  )
  .option('--manifest', `[boolean] emit build manifest json`)
  .option('--ssrManifest', `[boolean] emit ssr manifest json`)
  .option(
    '--emptyOutDir',
    `[boolean] force empty outDir when it's outside of root`
  )
  .option('-w, --watch', `[boolean] rebuilds when modules have changed on disk`)
  .action(async (root, options) => {
    try {
      const configPath = path.resolve(__dirname, 'vite.config.ts');

      const loadResult = await loadConfigFromFile({ mode: 'development', command: 'serve' }, configPath);

      const config = mergeConfig(loadResult.config, {
        root,
        base: options.base,
        mode: options.mode,
        configFile: options.config,
        logLevel: options.logLevel,
        clearScreen: options.clearScreen,
        build: options
      })

      // Build client
      const clientBuildResult = await build({
        ...config,
        build: {
          ...config.build,
          rollupOptions: {
            input: {
              app: '@pulsor-client'
            }
          }
        }
      });

      // Build SSR
      await build({
        ...config,
        build: {
          ...config.build,
          outDir: 'dist/.pulsor',
          ssr: true,
          rollupOptions: {
            input: {
              app: '@pulsor-root'
            }
          }
        }
      });


      let headImports = [];

      const entries = clientBuildResult.output.filter(bundle => bundle.isEntry);
      for (const bundle of entries) {
        headImports.push({
          tag: 'script',
          props: {
            async: true,
            type: 'module',
            crossorigin: true,
            src: `/${bundle.fileName}`
          }
        })
        for (const chunkFileName of bundle.imports) {
          headImports.push({
            tag: 'link',
            props: {
              rel: 'modulepreload',
              href: `/${chunkFileName}`
            }
          })
        }
      }

      const cssFiles = clientBuildResult.output.filter(bundle => bundle.fileName.endsWith('.css'));
      for (const cssFile of cssFiles) {
        headImports.push({
          tag: 'link',
          props: {
            rel: 'stylesheet',
            href: `/${cssFile.fileName}`
          }
        })
      }

      fs.writeFileSync(
        path.resolve(process.cwd(), 'dist/.pulsor/head.json'),
        JSON.stringify(headImports, null, 2),
        'utf-8'
      );

      const pathQueue = [
        '/'
      ];

      for (const url of pathQueue) {

        const html = renderPathToHtml(url);

        const pattern = /href="(.*?)"/g;

        const internalLinks = html
          .match(pattern)
          .map(hrefAttr => hrefAttr.slice(6, -1))
          .filter(href =>
            href.startsWith('/')
            && !href.includes('.')
          );

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

    } catch (e) {
      console.error(
        `error during build:\n${e.stack}`,
        { error: e }
      )
      process.exit(1)
    }
  })





const renderPathToHtml = (url) => {

  const rootVNode = require(path.resolve(process.cwd(), 'dist/.pulsor/app.js')).default;
  const headImports = require(path.resolve(process.cwd(), 'dist/.pulsor/head.json'));

  const cycle = {
    state: {
      location: {
        path: url
      }
    },
    needsRerender: true,
    sideEffects: [],
    dryRun: true,
  }

  const oldVNode = { tag: rootVNode.tag, };

  diff(oldVNode, { ...rootVNode }, cycle);


  // @ts-ignore
  const renderedHtml = stringify(oldVNode, cycle, {});

  const headHtmlImports = stringify({
    tag: 'head',
    children: headImports
  }).slice(6, -7).replaceAll(' data-pulsorhydrate="true"', '');

  const html = renderedHtml.replace('</head>', `${headHtmlImports}</head>`);

  return html
}



// ssr command
cli
  .command('ssr', 'Start the production SSR server')
  .option('--host [host]', `[string] specify hostname`)
  .option('--port <port>', `[number] specify port`)
  .option('--open [path]', `[boolean | string] open browser on startup`)
  .action(async () => {

    const app = connect()

    app.use(
      sirv(path.resolve(process.cwd(), 'dist'))
    );

    app.use(async (req, res) => {
      try {
        const url = req.originalUrl;
        const html = renderPathToHtml(url);
        res.end(html);
      } catch (e) {
        console.error(e.stack)
        res.end(e.stack)
      }
    })

    http.createServer(app).listen(3000);

    console.log('http://localhost:3000');
  })


cli
  .command('preview [root]')
  .option('--host [host]', `[string] specify hostname`)
  .option('--port <port>', `[number] specify port`)
  .option('--strictPort', `[boolean] exit if specified port is already in use`)
  .option('--https', `[boolean] use TLS + HTTP/2`)
  .option('--open [path]', `[boolean | string] open browser on startup`)
  .action(
    async (
      root,
      options
    ) => {
      try {
        const server = await preview({
          root: root,
          base: options.base,
          configFile: options.config,
          logLevel: options.logLevel,
          mode: options.mode,
          build: options,
          preview: {
            port: options.port,
            strictPort: options.strictPort,
            host: options.host,
            https: options.https,
            open: options.open
          }
        })
        server.printUrls()
      } catch (e) {
        console.error(
          `error when starting preview server:\n${e.stack}`,
          { error: e }
        )
        process.exit(1)
      }
    }
  )

cli.help()
cli.version(require('./package.json').version)
cli.parse()
