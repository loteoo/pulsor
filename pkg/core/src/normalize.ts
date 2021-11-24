import { isVChildNodeFunction, isRenderable, isString } from './utils';

const normalize = (_vNodes: VChildNode = [], cycle: Cycle, ctx: any): VNode[] => {
  const vNodes = Array.isArray(_vNodes) ? [..._vNodes] : [_vNodes];

  let i = 0;
  while (i < vNodes.length) {

    if (!isRenderable(vNodes[i])) {
      vNodes.splice(i, 1);
      continue;
    }

    if (isString(vNodes[i])) {
      vNodes[i] = {
        text: vNodes[i] as string
      }
      continue;
    }

    if (isVChildNodeFunction(vNodes[i])) {
      vNodes[i] = (vNodes[i] as VChildNodeFunction)(cycle.state, ctx)
      continue;
    }

    if (Array.isArray(vNodes[i])) {
      vNodes.splice(i, 1, ...(vNodes[i] as VChildNode[]));
      continue;
    }

    const vNode = vNodes[i] as VNode;
    vNodes[i] = {
      key: vNode.props?.key,
      init: vNode.props?.init,
      clear: vNode.props?.clear,
      ctx: vNode.props?.ctx,
      ...vNode,
    }

    i++;
  }

  return vNodes as VNode[];
}

export default normalize
