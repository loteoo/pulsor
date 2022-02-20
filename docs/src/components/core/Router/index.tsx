import { createRouter } from '@pulsor/location'
import DocsPage from '/src/components/layouts/DocsPage';
import pkgs from "/src/utils/pkgs";

const modules = import.meta.globEager('/src/pages/**/*.tsx')

const routes = Object.entries(modules).reduce((acc, [path, module]) => {
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
  // return {
  //   ...acc,
  //   [route]: {
  //     lazy: module
  //   }
  // }
}, {});

for (const pkg of pkgs) {

  console.log(pkg)
  // @ts-ignore
  routes[`/docs/${pkg.id}`] = DocsPage(pkg.readme.toc, pkg.readme.html);
}
console.log(routes)

export const { Router, TrackLocation } = createRouter({ routes });
