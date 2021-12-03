import { VProps, VChildNode, HyperScript } from './types';

export const h: HyperScript = (type, props, ...children: VChildNode[]) =>
  typeof type === "function"
    ? type(props ?? {}, children)
    : { type, props, children };

export const Fragment = (_: VProps, children: VChildNode) => children
