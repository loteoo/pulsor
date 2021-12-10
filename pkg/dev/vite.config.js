import fs from 'fs';
import path from 'path';
import { defineConfig, mergeConfig } from "vite";

import pulsorDevPlugin from './plugin';

const configPath = path.resolve(process.cwd(), 'pulsor.config.js');

let userConfig;

if (fs.existsSync(configPath)) {
  userConfig = require(configPath);
}

const defaultConfig = defineConfig({
  plugins: [pulsorDevPlugin()],
});

const config = mergeConfig(userConfig, defaultConfig);

module.exports = config;