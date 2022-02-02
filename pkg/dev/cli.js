#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const { cac } = require('cac');
const { rollup } = require('rollup');
const { preview, normalizePath } = require('vite');

// Create CLI
const cli = cac('pulsor');

// dev command
cli
  .command('<root>', 'Start the development server')
  .alias('dev')
  .option('--host [host]', `[string] specify hostname`)
  .option('--port <port>', `[number] specify port`)
  .option('--open [path]', `[boolean | string] open browser on startup`)
  .action(async () => {

    const serverFile = path.resolve(__dirname, 'server.js');

    const args = process.argv.slice(2);

    spawn(`node ${serverFile}`, args, {
      stdio: 'inherit',
      shell: true,
    });
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
