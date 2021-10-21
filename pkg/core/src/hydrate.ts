import { h } from "./h";

export const hydrate = (el: DomElement): VElement => {
  if (el.nodeType === 3) {
    return el.nodeValue as string;
  }
  const type = el.nodeName.toLowerCase();
  const children = [].map.call(el.childNodes, hydrate) as VChildNode[];
  return h(type, {}, children);
};
