import { createRouter } from "@pulsor/location";

const modules = import.meta.globEager('/src/pages/**/*.tsx')

export const routes = Object.entries(modules).reduce((acc, [path, module]) => {
  let route = path
    .replace('/src/pages', '')
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

// @ts-ignore
routes['/test'] = import('/src/test-page');

export const { TrackLocation, Router } = createRouter({ routes });
