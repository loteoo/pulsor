import { h } from "./h";

export const jsx: JSXPragma = (type, props, ...children) =>
  typeof type === "function"
    ? type(props ?? {}, children)
    : h(type, props, children);

export const Fragment = (_props: any, children: any) => children
