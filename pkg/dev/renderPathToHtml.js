const path = require('path');
const stringify = require('../core/dist/stringify').default;
const diff = require('../core/dist/run').diff;

// TODO: This should be "reqToHtml"
const renderPathToHtml = (url, headImports) => {

  const rootVNode = require(path.resolve(process.cwd(), 'dist/.pulsor/app.js')).default;

  if (!headImports) {
    headImports = require(path.resolve(process.cwd(), 'dist/.pulsor/head.json'));
  }

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

  const oldVNode = { tag: rootVNode.tag, props: rootVNode.props };


  diff(oldVNode, { ...rootVNode }, cycle);

  // @ts-ignore
  const renderedHtml = stringify(oldVNode, cycle, {});

  const headHtmlImports = stringify({
    tag: 'head',
    children: headImports
  }).slice(6, -7).replaceAll(' data-pulsorhydrate="true"', '');

  const html = renderedHtml.replace('</head>', `${headHtmlImports}</head>`);

  return `<!DOCTYPE html>\n${html}`;
}


exports.renderPathToHtml = renderPathToHtml;
