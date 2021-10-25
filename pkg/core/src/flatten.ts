import { isVChildNodeFn, isRenderable, isString } from './utils';

const flatten = (_vNodes: VChildNode = [], cycle: Cycle): VNode[] => {
  const vNodes = Array.isArray(_vNodes) ? [..._vNodes] : [_vNodes];

  let i = 0;
  while (i < vNodes.length) {
    if (isString(vNodes[i])) {
      vNodes[i] = {
        text: vNodes[i] as string
      }
      continue;
    }
    if (isVChildNodeFn(vNodes[i])) {
      vNodes[i] = (vNodes[i] as VChildNodeFn)(cycle.state)
      continue;
    }
    if (Array.isArray(vNodes[i])) {
      vNodes.splice(i, 1, ...(vNodes[i] as VChildNode[]));
      continue;
    }
    if (!isRenderable(vNodes[i])) {
      vNodes.splice(i, 1);
      continue;
    }
    i++;
  }

  return vNodes as VNode[];
}

export default flatten
