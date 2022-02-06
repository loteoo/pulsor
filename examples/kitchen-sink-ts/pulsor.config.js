import path from 'path'

/** @type {import('@pulsor/dev').Config} */
/** @type {import('../../pkg/dev').Config} */
const config = {
  // Config goes here
  resolve: {
    alias: {
      '@pulsor/core': path.resolve(__dirname, '../../pkg/core/src'),
      '@pulsor/location': path.resolve(__dirname, '../../pkg/location'),
    }
  }
};

module.exports = config