import { VChildNode, VNode } from './types';

const nodeTypesToHydrate = [1, 3];

const hydrate = (el: Node): VNode => {
  if (el.nodeType === 3) {
    return {
      text: String(el.nodeValue),
      el,
    };
  }
  const tag = el.nodeName.toLowerCase();
  let children: VChildNode[] = [];

  if (tag === 'head') {
    const elems = [].filter.call(
      (el as HTMLHeadElement).children,
      (el: HTMLElement) => el.dataset['pulsorhydrate'],
    );
    children = elems.map(hydrate);
  } else {
    children = [].filter.call(
      el.childNodes,
      (el: Node) => nodeTypesToHydrate.includes(el.nodeType)
    ).map(hydrate);
  }

  const vNode: VNode = {
    tag,
    children,
    el,
  };
  return vNode;
};

export default hydrate;