const stringify = require('../html/dist/html/src/stringify').default;

const renderPage = (url, rootVNode, headImports) => {

  const renderedHtml = stringify(rootVNode, {
    ssr: {
      url
    }
  });

  const headHtmlImports = stringify({
    tag: 'head',
    children: headImports
  })
  .slice(6, -7)
  .replaceAll(' data-pulsorhydrate="true"', '');

  const html = renderedHtml.replace('</head>', `${headHtmlImports}</head>`);

  return `<!DOCTYPE html>\n${html}`;
}

exports.renderPage = renderPage;
