#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

const viteBinary = path.resolve(__dirname, 'node_modules/.bin/vite')
const viteConfig = path.resolve(__dirname, 'vite.config.js')

const command = `${viteBinary} --config ${viteConfig}`

const nodeProcess = exec(command)

nodeProcess.stdout.pipe(process.stdout)
