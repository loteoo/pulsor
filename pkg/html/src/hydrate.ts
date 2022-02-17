import { NormalizedVNode } from '../../core/src'

const nodeTypesToHydrate = [1, 3];

/**
 * Turns a DOM tree into a VNode Tree
 */
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

  let key = el.dataset?.pulsorkey ? el.dataset.pulsorkey : undefined;

  const vNode: NormalizedVNode = {
    tag,
    props,
    children,
    key,
    el,
  };

  return vNode;
};

export default hydrate;
