export const h: HyperScript = (type, props, ...children) => ({
  type,
  props,
  children,
  key: props?.key,
  init: props?.init,
  clear: props?.clear,
  subscription: props?.subscription,
})
