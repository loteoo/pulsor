#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs')
const path = require('path');

const viteBinary = path.resolve(__dirname, 'node_modules/.bin/vite')
const viteConfig = path.resolve(__dirname, 'vite.config.js')

const command = `${viteBinary} --config ${viteConfig}`

// console.log('command', command)

const nodeProcess = exec(command)

nodeProcess.stdout.pipe(process.stdout)
