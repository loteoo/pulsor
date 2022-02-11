import { NormalizedVNode } from '../../core/dist/types'

const nodeTypesToHydrate = [1, 3];

const hydrate = (_el: Node): NormalizedVNode => {
  if (_el.nodeType === 3) {
    return {
      text: String(_el.nodeValue),
      el: _el,
    };
  }

  const el = _el as HTMLElement;

  const tag = el.nodeName.toLowerCase();
  let children: NormalizedVNode[] = [];

  if (el.dataset?.pulsorinnerhtml) {
  } else if (['head', 'body'].includes(tag)) {
    const elems = [].filter.call(
      el.childNodes,
      (el: HTMLElement) => el.dataset?.pulsorhydrate,
    );
    children = elems.map(hydrate);
  } else {
    children = [].filter.call(
      el.childNodes,
      (el: Node) => nodeTypesToHydrate.includes(el.nodeType)
    ).map(hydrate);
  }

  const props = {} as any;
  if (el.getAttributeNames) {
    for (const prop of el.getAttributeNames()) {
      props[prop] = el.getAttribute(prop);
    }
  }

  const vNode: NormalizedVNode = {
    tag,
    props,
    children,
    el,
  };

  if (el.dataset?.pulsorkey) {
    vNode.key = el.dataset.pulsorkey;
  }

  return vNode;
};

export default hydrate;
