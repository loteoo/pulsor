import { createRouter } from '@pulsor/location'

const modules = import.meta.globEager('../pages/**/*.tsx')

const routes = Object.entries(modules).reduce((acc, [path, module]) => {
  let route =  path
    .replace('../pages', '')
    .replace('/index', '')
    .replace('.tsx', '')
    .replace('[', ':')
    .replace(']', '');

  if (route === '') {
    route = '/'
  }
  return {
    ...acc,
    [route]: module.default
  }
}, {})

console.log({ routes })

const Router = createRouter({ routes });

export default Router
