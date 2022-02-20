import { Config } from '@pulsor/cli';
import path from 'path';
import mdPlugin, { Mode } from 'vite-plugin-markdown';

const markdownPlugin = mdPlugin({ mode: [Mode.HTML] })

const config: Config = {
  plugins: [markdownPlugin],
  resolve: {
    alias: {
      '@pulsor/location': path.resolve(__dirname, '../pkg/location/src')
    }
  },
  server: {
    fs: {
      strict: false
    }
  }
};

export default config
