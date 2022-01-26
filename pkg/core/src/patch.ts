
import { isSame } from './utils'
import normalize from './normalize';
import reduce from './reduce';
import { Context, Cycle, VNode } from './types';

// ====

function recurseRemove(vNode: VNode, parent: Node, cycle: Cycle) {

  reduce(vNode.clear, vNode.el, cycle, vNode, 'clear');

  // @ts-ignore
  if (vNode.el?.clearEffects) {
    // @ts-ignore
    vNode.el.clearEffects.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
  }

  //@ts-ignore
  if (vNode.children?.length) {
    for (const ch of (vNode.children as VNode[])) {
      recurseRemove(ch, vNode.el!, cycle);
    }
  }

  parent?.removeChild(vNode.el!);
}


// ===

const createNode = (vNode: VNode, parent: Node | undefined, before: Node, cycle: Cycle, ctx: any, isSvg: boolean) => {

  if (vNode.text != null) {
    vNode.el = document.createTextNode(String(vNode.text));
  } else if (vNode.tag) {
    if (vNode.tag === 'svg') {
      isSvg = true;
    }
    if (isSvg) {
      vNode.el = document.createElementNS('http://www.w3.org/2000/svg', vNode.tag!);
    } else {
      vNode.el = document.createElement(vNode.tag!);
    }
  } else {
    vNode.el = document.createComment('');
  }
  
  patch(
    {
      tag: vNode.tag,
      text: vNode.text,
      el: vNode.el,
      children: [],
    },
    vNode,
    cycle,
    ctx,
    isSvg,
  );

  parent?.insertBefore(vNode.el!, before);
};


// ===============



const patchProp = (el: HTMLElement, key: string, oldValue: any, newValue: any, cycle: Cycle, isSvg: boolean) => {
  if (key.startsWith("on")) {
    const eventName = key.slice(2);
    //@ts-ignore
    el[eventName] = newValue;
    if (!newValue) {
      el.removeEventListener(eventName, cycle.domEmitter);
    } else if (!oldValue) {
      el.addEventListener(eventName, cycle.domEmitter);
    }
    return;
  }

  if (typeof newValue === 'function') {
    newValue = newValue(cycle.state)
  }

  if (key === 'class' && typeof newValue === "object") {
    let cur: any;
    let oldClass = oldValue ?? {};
    for (key in oldClass) {
      if (oldClass[key] && !Object.prototype.hasOwnProperty.call(newValue, key)) {
        // was `true` and now not provided
        el.classList.remove(key);
      }
    }
    for (key in newValue) {
      cur = newValue[key];
      if (cur !== oldClass[key]) {
        (el.classList as any)[cur ? "add" : "remove"](key);
      }
    }
    return;
  }

  if (key === 'style' && typeof newValue === "object") {
    for (const k in { ...oldValue, ...newValue }) {
      const val = newValue[k] ?? '';
      if (k.startsWith('--')) {
        el[key].setProperty(k, val)
      } else {
        // @ts-ignore
        el[key][k] = val
      }
    }
    return
  }

  // Handle "method" properties ex: value, selected, checked, open, innerHTML, innerText, etc
  if (key in el && !isSvg) {
    if (newValue == null) {
      // @ts-ignore
      el[key] = ''
    } else {
      // @ts-ignore
      el[key] = newValue
    }
    return
  }

  // Handle the rest as html attributes
  if (newValue == null || newValue === false) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, newValue);
  }
};


const patch = (oldVNode: VNode, newVNode: VNode, cycle: Cycle, ctx: Context, isSvg: boolean) => {

  // ?? why are these needed?!!
  newVNode.el = oldVNode.el!;

  const el = oldVNode.el;

  if (newVNode?.init && oldVNode?.init == null) {
    reduce(newVNode?.init, el, cycle, oldVNode, 'init');
  }

  if (newVNode?.ctx) {
    ctx = typeof newVNode.ctx === 'function'
      ? newVNode.ctx(oldVNode.ctx!)
      : newVNode.ctx
  }

  if (el) {
    // Patch text nodes
    if (newVNode.text != null && oldVNode.text !== newVNode.text) {
      el.textContent = String(newVNode.text);
      return;
    }

    if (newVNode.tag === 'svg') {
      isSvg = true;
    }

    for (const key in { ...oldVNode?.props, ...newVNode?.props }) {
      const oldVal = ['value', 'selected', 'checked'].includes(key) ? (el as any)[key] : oldVNode?.props?.[key];
      if (oldVal !== newVNode?.props?.[key] && !['key', 'init', 'clear', 'ctx'].includes(key)) {
        patchProp(el as HTMLElement, key, oldVNode?.props?.[key], newVNode?.props?.[key], cycle, isSvg);
      }
    }
  }

  const parent = oldVNode.el;
  const oldCh: VNode[] = ((oldVNode.children as VNode[]) ?? []);
  const newCh = normalize(newVNode.children, cycle, ctx);

  oldVNode.children = newVNode.children = newCh;

  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVNode = oldCh[0];
  let oldEndVNode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVNode = newCh[0];
  let newEndVNode = newCh[newEndIdx];
  let oldKeyToIdx: Record<string, number> | undefined;
  let idxInOld: number;
  let elmToMove: VNode;
  let before: any;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVNode == null) {
      oldStartVNode = oldCh[++oldStartIdx];
    } else if (oldEndVNode == null) {
      oldEndVNode = oldCh[--oldEndIdx];
    } else if (newStartVNode == null) {
      newStartVNode = newCh[++newStartIdx];
    } else if (newEndVNode == null) {
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldStartVNode, newStartVNode)) {
      patch(oldStartVNode, newStartVNode, cycle, ctx, isSvg);
      oldStartVNode = oldCh[++oldStartIdx];
      newStartVNode = newCh[++newStartIdx];
    } else if (isSame(oldEndVNode, newEndVNode)) {
      patch(oldEndVNode, newEndVNode, cycle, ctx, isSvg);
      oldEndVNode = oldCh[--oldEndIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldStartVNode, newEndVNode)) {
      patch(oldStartVNode, newEndVNode, cycle, ctx, isSvg);
      parent?.insertBefore(oldStartVNode.el!, oldEndVNode.el!.nextSibling!);
      oldStartVNode = oldCh[++oldStartIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldEndVNode, newStartVNode)) {
      patch(oldEndVNode, newStartVNode, cycle, ctx, isSvg);
      parent?.insertBefore(oldEndVNode.el!, oldStartVNode.el!);
      oldEndVNode = oldCh[--oldEndIdx];
      newStartVNode = newCh[++newStartIdx];
    } else {
      if (oldKeyToIdx === undefined) {
        oldKeyToIdx = {};
        for (let i = oldStartIdx; i <= oldEndIdx; ++i) {
          const key = oldCh[i]?.key;
          if (key !== undefined) {
            oldKeyToIdx[key as string] = i;
          }
        }
      }
      idxInOld = oldKeyToIdx[newStartVNode.key as string];
      if (idxInOld === undefined) {
        createNode(newStartVNode, parent, oldStartVNode.el!, cycle, ctx, isSvg);
      } else {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.tag !== newStartVNode.tag) {
          createNode(newStartVNode, parent, oldStartVNode.el!, cycle, ctx, isSvg);
        } else {
          patch(elmToMove, newStartVNode, cycle, ctx, isSvg);
          oldCh[idxInOld] = undefined as any;
          parent?.insertBefore(elmToMove as Node, oldStartVNode.el!);
        }
      }
      newStartVNode = newCh[++newStartIdx];
    }
  }
  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].el;
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        const ch = newCh[i];
        if (ch != null) {
          createNode(ch, parent, before, cycle, ctx, isSvg);
        }
      }
    } else {
      for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        const ch = oldCh[i];
        if (ch != null) {
          recurseRemove(ch, parent!, cycle);
        }
      }
    }
  }
};


export default patch
