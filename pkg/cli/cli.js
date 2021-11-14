#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const viteBinary = path.resolve(__dirname, 'node_modules/.bin/vite');
const viteConfig = path.resolve(__dirname, 'vite.config.js')

spawn(viteBinary, ['--config', viteConfig], {
  shell: true,
  stdio: 'inherit'
});