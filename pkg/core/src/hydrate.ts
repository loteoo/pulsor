const hydrate = (el: Node): VNode => {
  if (el.nodeType === 3) {
    return {
      text: String(el.nodeValue),
      el,
    };
  }
  const type = el.nodeName.toLowerCase();
  // const children = [].map.call(el.childNodes, hydrate) as VChildNode[];
  const vNode: VNode = {
    type,
    el,
  };
  // console.log('hydrated', el)

  return vNode;
};

export default hydrate;
