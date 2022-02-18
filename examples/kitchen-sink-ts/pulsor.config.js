import path from 'path'

/** @type {import('@pulsor/cli').Config} */
const config = {
  // Config goes here
  resolve: {
    alias: {
      // '@pulsor/core': path.resolve(__dirname, '../../pkg/core/src'),
      // '@pulsor/location': path.resolve(__dirname, '../../pkg/location'),
    }
  }
};

module.exports = config
