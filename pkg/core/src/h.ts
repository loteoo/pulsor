type Component = (...args: any[]) => VChildNode;

export const h = (type: string | Component, props: VProps = {}, children?: VChildNode): VChildNode =>
  typeof type === "function"
    ? type(props, children)
    : { type, props, children };

export const Fragment = (_: VProps, children: VChildNode) => children
