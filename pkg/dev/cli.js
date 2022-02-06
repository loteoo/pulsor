#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { cac } = require('cac');
const { createServer, loadConfigFromFile, mergeConfig, build } = require('vite');
const connect = require('connect')
const http = require('http')
const sirv = require('sirv')
const renderPathToHtml = require('./renderPathToHtml').renderPathToHtml;


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
    '--buildTarget [buildTarget]',
    `["spa" | "static" | "ssr"] Specified build target (default: spa)`
  )
  .option('--nojs', `[boolean] Remove JS runtime from static HTML files (static and ssr only)`)
  .option('--prerenderPattern', `[string] Pattern to use to filter URLs to render`)
  .option('--prerenderIgnorePattern', `[string] Pattern to use to filter out URLs to render`)
  .action(async (root, options) => {
    try {

      const configPath = path.resolve(__dirname, 'vite.config.ts');

      const loadResult = await loadConfigFromFile({ mode: 'production', command: 'build' }, configPath);

      const config = mergeConfig(loadResult.config, {
        root,
        build: {
          buildTarget: options.buildTarget,
          nojs: options.nojs,
        },
        customLogger: {
          info: (str) => {
            const vStr = pkg => `${pkg.name} v${pkg.version}`
            const vitePkg = require('vite/package.json');
            const cliPkg = require('./package.json');
            console.info(str.replace(vStr(vitePkg), vStr(cliPkg)))
          },
        }
      });
      await build(config);


    } catch (e) {
      console.error(
        `error during build:\n${e.stack}`,
        { error: e }
      )
      process.exit(1)
    }
  });


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
          throw new Error('Static (non-SSR) build found. Please run \'pulsor build --buildTarget="ssr"\' before serving the app in SSR mode.')
        }
        if (!fs.existsSync(path.resolve(process.cwd(), 'dist/.pulsor/app.js'))) {
          throw new Error('No SSR build found. Please run \'pulsor build --buildTarget="ssr"\' before serving the app in SSR mode.')
        }
        app.use(async (req, res) => {
          try {
            const url = req.originalUrl;
            const html = renderPathToHtml(url);
            res.end(html);
          } catch (e) {
            console.error(e.stack);
            res.end(e.stack);
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
