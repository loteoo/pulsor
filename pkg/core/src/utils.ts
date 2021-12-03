import { VChildNode, VChildNodeFunction, Action, Task } from './types';

export const isVChildNodeFunction = (vnode: VChildNode): vnode is VChildNodeFunction => typeof vnode === 'function';

export const isString = (value?: any): boolean => ['string', 'number', 'bigint'].includes(typeof value);

export const isModuleNode = (vnode: VChildNode) => typeof vnode === 'object' && !!vnode && !Array.isArray(vnode) && (vnode as any).type === undefined;

export const isRenderable = (value: any) => ![true, false, null, undefined].includes(value)

export const isTask = (action: Action): action is Task => typeof action === 'object' && !!action && typeof (action as Task).run === 'function';

export const isSame = (a: any, b: any) => {
  return a?.type === b?.type && a?.key === b?.key;
}

export const isObj = (val: any) => val instanceof Object && !Array.isArray(val)
