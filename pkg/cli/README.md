# @pulsor/cli

Vite-based development environment to facilitate running and building pulsor apps.

It mostly extends vite, then adds pulsor-specific features.

Huge praise to [vite](https://vitejs.dev/) / [esbuild](https://esbuild.github.io/) for doing the heavy lifting.

For documentation on how to write pulsor apps, checkout the [main repo!](https://github.com/loteoo/pulsor)

## Quick start

Install the `@pulsor/cli` CLI

```sh
npm i -g @pulsor/cli
```

Create a new app and run it:

```sh
# Create new app
echo "export default (
  <h1>Hi! 👋</h1>
);" > App.tsx;

# Run it in dev mode
pulsor App.tsx --open;
```
First line creates a file called "App.tsx" and fills it hello world content.
Second line starts the dev server with the "App.tsx" file as the "Root vNode".


Build for prod:

```sh
pulsor build App.tsx
```

Preview prod build:

```sh
pulsor serve
```

#### Notes on usage:

run
```
pulsor <app definition entrypoint>
ex:
pulsor App.tsx
````

The entrypoint resolves like a node module, so you can also do:

```
// or
pulsor App

// or

pulsor some/path
// which is same as 
pulsor some/path/index

// or

pulsor
// which is same as 
pulsor index
```

The entrypoint file should export the root vNode of your application.

## Creating templates

TODO


Checkout the vite docs for all non pulsor specific information: https://vitejs.dev/
