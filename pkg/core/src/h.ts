import { VProps, VChildNode, HyperScript } from './types';

export const h: HyperScript = (tag, props, ...children: VChildNode[]) =>
  typeof tag === "function"
    ? tag(props ?? {}, children)
    : { tag, props, children };

export const Fragment = (_: VProps, children: VChildNode) => children
