/// <reference types="vite/client" />
import { ConfigEnv, UserConfig } from "vite";

type BuildTarget = 'spa' | 'ssr' | 'static' | 'web-component'

type PulsorConfig = UserConfig & {
  buildTarget?: BuildTarget;
}

type UserConfigExport = PulsorConfig | Promise<PulsorConfig> | UserConfigFn;

type UserConfigFn = (env: ConfigEnv) => PulsorConfig | Promise<PulsorConfig>;

export type Config = UserConfigExport;
