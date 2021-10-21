
export const isVChildNodeFn = (vnode: VChildNode): vnode is VChildNodeFn => typeof vnode === 'function';

export const isVTextElement = (vnode?: VChildNode): vnode is VTextElement => ['string', 'number', 'bigint'].includes(typeof vnode);

export const isModuleNode = (vnode: VChildNode) => typeof vnode === 'object' && !!vnode && !Array.isArray(vnode) && (vnode as any).type === undefined;

export const isRenderable = (value: any) => ![false, null, undefined].includes(value)

export const isTask = (action: Action): action is Task => typeof action === 'object' && !!action && typeof (action as Task).run === 'function';

export const isSame = (a: any, b: any) => {

  const val = a === b || (a?.type === b?.type && a?.key === b?.key);

  // console.log('isSame', a, b, val)

  return val

}
