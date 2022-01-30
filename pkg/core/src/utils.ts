import { VNode, VChildNode, VChildNodeFunction, Action, Effect } from './types';

export const isVChildNodeFunction = (vnode: VChildNode): vnode is VChildNodeFunction => typeof vnode === 'function';

export const isString = (value?: any): boolean => ['string', 'number', 'bigint'].includes(typeof value);

export const isModuleNode = (vnode: VChildNode) => typeof vnode === 'object' && !!vnode && !Array.isArray(vnode) && (vnode as any).type === undefined;

export const isRenderable = (value: any) => ![true, false, null, undefined].includes(value);

export const isEffect = (action: Action): action is Effect => typeof action === 'object' && !!action && typeof (action as Effect).effect === 'function';

export const isSame = (a: VNode, b: VNode, compareKeys: boolean) => {
  if (compareKeys) {
    return a.tag === b.tag && a.key === b.key
  }
  return a.tag === b.tag;
};

export const isObj = (val: any) => typeof val === 'object' && !Array.isArray(val) && val !== null;
