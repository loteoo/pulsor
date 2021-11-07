import { isVChildNodeFunction, isRenderable, isString } from './utils';

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
    if (isVChildNodeFunction(vNodes[i])) {
      vNodes[i] = (vNodes[i] as VChildNodeFunction)(cycle.state)
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

    vNodes[i] = {
      ...(vNodes[i] as VNode)
    }

    i++;
  }

  return vNodes as VNode[];
}

export default flatten
