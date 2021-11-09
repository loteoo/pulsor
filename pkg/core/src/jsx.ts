import { h } from "./h";

export const jsx: JSXPragma = (type, props, ...children) =>
  typeof type === "function"
    ? type(props ?? {}, children)
    : h(type, props, children);

export const Fragment: FragmentPragma = (_: any, children) => children