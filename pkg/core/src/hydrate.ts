import { h } from "./h";

export const hydrate = (el: Node): VNode => {
  if (el.nodeType === 3) {
    return {
      text: String(el.nodeValue),
      el,
    };
  }
  const type = el.nodeName.toLowerCase();
  // const children = [].map.call(el.childNodes, hydrate) as VChildNode[];

  const vNode =  h(type, {});
  vNode.el = el;
  // console.log('hydrated', el)

  return vNode;
};
