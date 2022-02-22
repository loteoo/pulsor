import { Config } from '@pulsor/cli';
import path from 'path';
import mdPlugin, { Mode } from 'vite-plugin-markdown';
import mdItConstruct from 'markdown-it';
import mdAnchors from 'markdown-it-anchor';

// import hljs from 'highlight.js/lib/core';

const mdIt = mdItConstruct({
  html: true,
  // highlight: function (str, lang) {
  //   if (lang && hljs.getLanguage(lang)) {
  //     try {
  //       return hljs.highlight(str, { language: lang }).value;
  //     } catch (__) { }
  //   }

  //   return ''; // use external default escaping
  // },
}).use(mdAnchors)


const markdownPlugin = mdPlugin({
  mode: [Mode.HTML, Mode.TOC],
  markdownIt: mdIt
})

const config: Config = {
  plugins: [markdownPlugin],
  resolve: {
    alias: {
      // '@pulsor/location': path.resolve(__dirname, '../pkg/location/src')
    }
  },
  server: {
    fs: {
      strict: false
    }
  }
};

export default config
