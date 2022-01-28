// @ts-check
const fs = require('fs')
const path = require('path')
const express = require('express')
const { loadConfigFromFile, mergeConfig, normalizePath } = require('vite')
const renderToString = require('../core/dist/renderToString').default;
const diff = require('../core/dist/run').diff;

const configPath = path.resolve(__dirname, 'vite.config.ts');

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

process.env.MY_CUSTOM_SECRET = 'API_KEY_qwertyuiop'

async function createServer(
  isProd = process.env.NODE_ENV === 'production'
) {

  const root = process.cwd();

  const app = express()

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite
  if (!isProd) {

    const loadResult = await loadConfigFromFile({ mode: 'development', command: 'serve' }, configPath);

    const config = mergeConfig(loadResult.config, {
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: 'ssr',
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100
        }
      }
    })

    // console.log({ config })


    vite = await require('vite').createServer(config)
    // use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    // app.use(require('compression')())
    app.use(
      require('serve-static')(path.resolve(root, 'dist/client'), {
        index: false
      })
    )
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      const args = process.argv.slice(2);
      const rootVNodePath = args[0];

      let html
      if (!isProd) {
        const document = (await vite.ssrLoadModule(normalizePath(`/document`))).default;
        const rootVNode = (await vite.ssrLoadModule(normalizePath(`/${rootVNodePath}`))).default;
        const combined = document(rootVNode);

        // TODO: dev pkg should define a way for various other pkgs to set some "Initial state" server-side
        // (atm, this would be needed for the location pkg, but for now it's hardcoded)...

        // maybe a root node could be added that injects res / res into the vnode tree ctx object.
        // (this way other packages can be "aware" of it and use it to their needs)

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

        const oldVNode = { tag: combined.tag, };

        
        diff(oldVNode, combined, cycle);

        // console.log(JSON.stringify(oldVNode, null, 2))

        // @ts-ignore
        const renderedHtml = renderToString(oldVNode, cycle, {});

        html = await vite.transformIndexHtml(url, renderedHtml);

      } else {
        // template = indexProd
        // render = require('./dist/server/entry-server.js').render
      }

      const context = {}
      // const appHtml = render(url, context)
      // const appHtml = '<h1>Hello from server</h1>'

      // if (context.url) {
      //   // Somewhere a `<Redirect>` was rendered
      //   return res.redirect(301, context.url)
      // }

      // const html = template.replace(`<!--app-html-->`, appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app, vite }
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(3000, () => {
      console.log('http://localhost:3000')
    })
  )
}

// for test use
exports.createServer = createServer