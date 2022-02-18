import path from 'path';

/** @type {import('@pulsor/cli').Config} */
const config = {
  // Config goes here
  resolve: {
    alias: {
      '@pulsor/location': path.resolve(__dirname, '../pkg/location/src')
    }
  }
};

export default config
