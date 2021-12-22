/// <reference types="vite/client" />
import { ConfigEnv, UserConfig } from "vite";
import { VNode } from '@pulsor/core'

type PulsorConfig = UserConfig & {
  document?: (root: VNode) => VNode;
}

type UserConfigExport = PulsorConfig | Promise<PulsorConfig> | UserConfigFn;

type UserConfigFn = (env: ConfigEnv) => PulsorConfig | Promise<PulsorConfig>;

export type Config = UserConfigExport;
