
export const isVChildNodeFn = (vnode: VChildNode): vnode is VChildNodeFn => typeof vnode === 'function';

export const isString = (value?: any): boolean => ['string', 'number', 'bigint'].includes(typeof value);

export const isModuleNode = (vnode: VChildNode) => typeof vnode === 'object' && !!vnode && !Array.isArray(vnode) && (vnode as any).type === undefined;

export const isRenderable = (value: any) => ![false, null, undefined].includes(value)

export const isTask = (action: Action): action is Task => typeof action === 'object' && !!action && typeof (action as Task).run === 'function';

export const isSame = (a: any, b: any) => {
  return a?.key === b?.key && a?.type === b?.type;
}
