import { h } from "./h";

export const jsx: JSXPragma = (type, props, ...children) =>
  typeof type === "function"
    ? type(props ?? {}, children)
    : h(type, props, children);

export const Fragment: FragmentPragma = (props, children) => ({
  props,
  children,
  key: props?.key,
  init: props?.init,
  listener: props?.listener,
})
