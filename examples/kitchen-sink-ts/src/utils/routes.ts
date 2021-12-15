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
}, {})

export default routes;