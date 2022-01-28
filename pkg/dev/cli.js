#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// const viteBinary = path.resolve(__dirname, 'node_modules/.bin/vite');
// const viteConfig = path.resolve(__dirname, 'vite.config.ts');
const serverFile = path.resolve(__dirname, 'server.js');

const args = process.argv.slice(2)
// .concat(['--config', viteConfig]);

// spawn(viteBinary, args, {
//   stdio: 'inherit',
//   shell: true,
// });

spawn(`node ${serverFile}`, args, {
  stdio: 'inherit',
  shell: true,
});