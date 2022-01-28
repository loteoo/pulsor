import fs from 'fs';
import path from 'path';
import { defineConfig, mergeConfig, loadConfigFromFile } from "vite";

import pulsorDevPlugin from './plugin';



const getExactPath = (path, sufixesToCheck) => {
  for (const suffix of sufixesToCheck) {
    const str = `${path}${suffix}`
    if (fs.existsSync(str)) {
      return str;
    }
  }
  return false;
}

const configPath = getExactPath(path.resolve(process.cwd(), 'pulsor.config'), ['.js', '.jsx', '.ts', '.tsx']);

const defaultConfig = defineConfig({
  plugins: [pulsorDevPlugin()],
});

const mergeConfigFiles = async (env) => {
  let config = defaultConfig;

  if (configPath) {
    const loadResult = await loadConfigFromFile(env, configPath);
    if (loadResult) {
      config = mergeConfig(loadResult.config, config);
    }
  }

  return config
}


export default mergeConfigFiles;
