#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const { cac } = require('cac');
const { preview, createServer, loadConfigFromFile, mergeConfig } = require('vite');
const connect = require('connect')
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


// build command
cli
  .command('build <root>', 'Build the app')
  .action(async () => {

    const viteBinary = path.resolve(__dirname, 'node_modules/.bin/vite');
    const viteConfig = path.resolve(__dirname, 'vite.config.ts');

    const args1 = process.argv.slice(2).concat([
      '--config', viteConfig,
      '--outDir', 'dist/client',
    ]);

    spawn(viteBinary, args1, {
      stdio: 'inherit',
      shell: true,
    });

    const args2 = process.argv.slice(2).concat([
      '--config', viteConfig,
      '--outDir', 'dist/server',
      '--ssr', '/root.ts',
    ]);

    spawn(viteBinary, args2, {
      stdio: 'inherit',
      shell: true,
    });

  })


// ssr command
cli
  .command('ssr <root>', 'Start the production SSR server')
  .option('--host [host]', `[string] specify hostname`)
  .option('--port <port>', `[number] specify port`)
  .option('--open [path]', `[boolean | string] open browser on startup`)
  .action(async () => {



    const root = process.cwd();

    const app = connect()


    // app.use(
    //   require('serve-static')(path.resolve(root, 'dist/client'), {
    //     index: false
    //   })
    // )

    app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl

        const args = process.argv.slice(2);
        const rootVNodePath = args[0];

        const rootVNode = {} // TODO: LOAD VNODE FROM DIST ENTRYPOINT

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

        // console.log(JSON.stringify(oldVNode, null, 2))

        // @ts-ignore
        const renderedHtml = stringify(oldVNode, cycle, {});

        // TODO: INJECT LINKS TO JS/CSS BUNDLES

        const html = renderedHtml;

        res.end(html)

      } catch (e) {
        console.error(e.stack)
        res.status(500).end(e.stack)
      }
    })


    app.listen(3000, () => {
      console.log('http://localhost:3000')
    })

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
          build: {
            outDir: 'dist/client',
          },
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
