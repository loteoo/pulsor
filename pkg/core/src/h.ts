import { Component, VProps, VChildNode, VNode } from './types';

export const h = <T = string | Component>(type: T, props: VProps = {}, ...children: VChildNode[]): T extends Function ? VChildNode : VNode =>
  typeof type === "function"
    ? type(props, children)
    : { type, props, children };

export const Fragment = (_: VProps, children: VChildNode) => children
