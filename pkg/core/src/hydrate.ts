import { h } from "./h";

export const hydrate = (el: DomElement): VNode => {
  if (el.nodeType === 3) {
    return {
      text: String(el.nodeValue),
      el,
    };
  }
  const type = el.nodeName.toLowerCase();
  const children = [].map.call(el.childNodes, hydrate) as VChildNode[];
  
  const vNode =  h(type, {}, children);
  vNode.el = el;
  console.log('hydrated', el)

  return vNode;
};
