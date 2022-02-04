#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { cac } = require('cac');
const { createServer, loadConfigFromFile, mergeConfig, build } = require('vite');
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
  .option(
    '--target [target]',
    `["spa" | "static" | "ssr"] Specified build target (default: spa)`
  )
  .action(async (root, options) => {
    try {

      const buildTarget = options.target ?? 'spa';

      console.log('Building for', buildTarget)

      const configPath = path.resolve(__dirname, 'vite.config.ts');

      const loadResult = await loadConfigFromFile({ mode: 'development', command: 'serve' }, configPath);

      const config = mergeConfig(loadResult.config, {
        root,
        // customLogger: {
        //   info: (str) => {
        //     const vStr = pkg => `${pkg.name} v${pkg.version}`
        //     const vitePkg = require('vite/package.json');
        //     const cliPkg = require('./package.json');
        //     console.info(str.replace(vStr(vitePkg), vStr(cliPkg)))
        //   },
        // }
      })

      // Build client
      const buildResult = await build({
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

      let headImports = [];

      const entries = buildResult.output.filter(bundle => bundle.isEntry);
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

      const cssFiles = buildResult.output.filter(bundle => bundle.fileName.endsWith('.css'));
      for (const cssFile of cssFiles) {
        headImports.push({
          tag: 'link',
          props: {
            rel: 'stylesheet',
            href: `/${cssFile.fileName}`
          }
        })
      }

      // TODO: only do this when necessary (head.json only when SSR)
      fs.mkdirSync(path.resolve(process.cwd(), 'dist/.pulsor'), { recursive: true });
      fs.writeFileSync(
        path.resolve(process.cwd(), 'dist/.pulsor/head.json'),
        JSON.stringify(headImports, null, 2),
        'utf-8'
      );


      if (buildTarget === 'spa') {
        fs.writeFileSync(
          path.resolve(path.resolve(process.cwd(), 'dist/index.html')),
          (await buildSpaHtml(config)),
          'utf-8'
        );
        return;
      } else {
        // Build SSR
        await build({
          ...config,
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
          }
        });
      }


      if (buildTarget === 'static') {

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
        return;
      }



    } catch (e) {
      console.error(
        `error during build:\n${e.stack}`,
        { error: e }
      )
      process.exit(1)
    }
  })




// TODO: This should be "reqToHtml"
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


const buildSpaHtml = async (config) => {

  // Build SSR
  await build({
    ...config,
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
    }
  });

  const rootVNode = require(path.resolve(process.cwd(), 'dist/.pulsor/document.js')).default();
  const headImports = require(path.resolve(process.cwd(), 'dist/.pulsor/head.json'));

  const cycle = {
    state: {},
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

  const cleaned = html.replace(/<body>.*<\/body>/, '<body></body>')

  return cleaned
}



// serve command
cli
  .command('serve', 'Start the production server')
  .option('--ssr', `[boolean] Enable server-side rendering`)
  .option('--port <port>', `[number] specify port`)
  .action(async (options) => {
    try {
      const port = options.port ?? 3000;
      const app = connect();

      if (!options.ssr) {
        if (!fs.existsSync(path.resolve(process.cwd(), 'dist/index.html'))) {
          throw new Error('No static build found. Please run "pulsor build" before serving the app.')
        }
      }

      app.use(
        sirv(
          path.resolve(process.cwd(), 'dist'),
          {
            single: true,
          }
        )
      );

      if (options.ssr) {
        if (fs.existsSync(path.resolve(process.cwd(), 'dist/index.html'))) {
          throw new Error('Static (non-SSR) build found. Please run \'pulsor build --target=ssr\' before serving the app in SSR mode.')
        }
        if (!fs.existsSync(path.resolve(process.cwd(), 'dist/.pulsor/app.js'))) {
          throw new Error('No SSR build found. Please run \'pulsor build --target=ssr\' before serving the app in SSR mode.')
        }
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
      }

      http.createServer(app).listen(port);

      console.log(
        `${options.ssr ? 'SSR' : 'Static file'} server running on http://localhost:${port}/`
      );

    } catch (e) {
      console.error(
        `error when starting server:\n${e.stack}`,
        { error: e }
      )
      process.exit(1)
    }
  })



cli.help()
cli.version(require('./package.json').version)
cli.parse()
