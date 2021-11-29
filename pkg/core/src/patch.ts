import memoize from 'proxy-memoize';
import { isRenderable, isSame, isString, isVChildNodeFunction } from './utils'
import normalize from './normalize';
import reduce from './reduce';

// ====

function handleInlineAction(action: Action, payload: any, cycle: Cycle, vNode: VNode, eventName: string) {
  if (action) {
    // console.group(eventName);
    reduce(action, payload, cycle, vNode, eventName);
    // console.groupEnd();
    cycle.needsRerender = true;
  }
}

function moveVNode(parent: Node, vNode: VNode, before?: Node) {
  if (vNode.type || vNode.text != null) {
    parent.insertBefore(vNode.el!, before!);
    // @ts-ignore
  } else if (vNode.children?.length) {
    for (const ch of (vNode.children as VNode[])) {
      moveVNode(parent, ch, before)
    }
  }
}

function getFragmentEl(chArray: VNode[], initialIdx: number, parent: Node, ignoreSibling?: boolean): Node | null {
  const endIdx = chArray.length - 1;
  let idx = initialIdx;
  let el = null;
  while (idx <= endIdx) {
    const vNode = chArray[idx];
    if (vNode.type || vNode.text != null) {
      el = vNode.el;
      break;
    }
    // @ts-ignore
    if (vNode.children?.length) {
      const checkInside = getFragmentEl((vNode.children as VNode[]), 0, parent);
      if (checkInside) {
        if (checkInside.parentNode === parent) {
          el = checkInside;
          break;
        }
      }
    }
    if (ignoreSibling) {
      break
    }
    idx++;
  }

  return el as Node | null;
}

function runClearTasks(vNode: VNode, cycle: Cycle) {

  handleInlineAction(vNode.clear, vNode.el, cycle, vNode, 'clear');

  // @ts-ignore
  if (vNode.el.clearTasks) {
    // @ts-ignore
    vNode.el.clearTasks.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
  }

  //@ts-ignore
  if (vNode.children?.length) {
    for (const ch of (vNode.children as VNode[])) {
      runClearTasks(ch, cycle)
    }
  }
}

function renderChildFn(vNodeOrFn: any, cycle: Cycle, ctx: any): any {
  if (isVChildNodeFunction(vNodeOrFn)) {
    const key = vNodeOrFn.toString();
    vNodeOrFn = vNodeOrFn(cycle.state, ctx);
    if (vNodeOrFn) {
      vNodeOrFn.key = key;
    }
    return renderChildFn(vNodeOrFn, cycle, ctx);
  }
  if (Array.isArray(vNodeOrFn)) {
    return {
      children: normalize(vNodeOrFn, cycle, ctx)
    }
  }
  if (isString(vNodeOrFn)) {
    return {
      text: vNodeOrFn
    }
  }
  return vNodeOrFn;
}

// ===

const createNode = (vNode: VNode, parent: Node, before: Node, cycle: Cycle, ctx: any, parentOldCh: VNode[], idx: number) => {

  vNode = renderChildFn(vNode, cycle, ctx);
  parentOldCh[idx] = vNode;

  if (vNode.text != null) {
    vNode.el = document.createTextNode(String(vNode.text));
  } else if (!vNode.type) {
    vNode.el = document.createDocumentFragment();
    if (!vNode.mount) {
      vNode.mount = parent;
    }
  } else {
    vNode.el = document.createElement(vNode.type!);
  }

  patchNode(
    {
      type: vNode.type,
      text: vNode.text,
      el: vNode.el,
      mount: vNode.mount,
      children: [],
    },
    vNode,
    cycle,
    ctx,
    parentOldCh,
    idx
  );

  // console.log('insertBefore', {
  //   parent, vNode, before
  // })
  parent.insertBefore(vNode.el, before);
};


// ===============



const patchProp = (el: HTMLElement, key: string, oldValue: any, newValue: any, cycle: Cycle) => {
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
    for (const k in newValue) {
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
  if (key in el) {
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


const patchNode = (oldVNode: VNode, newVNode: VNode, cycle: Cycle, ctx: any, parentOldCh: VNode[], idxInParent: number) => {

  if (isVChildNodeFunction(newVNode)) {
    parentOldCh[idxInParent] = oldVNode = newVNode = renderChildFn(newVNode, cycle, ctx);
  }

  // ?? why are these needed?!!
  newVNode.el = oldVNode.el!;
  newVNode.mount = oldVNode.mount!;

  const el = oldVNode.el;

  if (newVNode?.init && oldVNode?.init == null) {
    handleInlineAction(newVNode?.init, el, cycle, oldVNode, 'init');
  }
  newVNode.clearTasks = oldVNode.clearTasks;

  if (newVNode?.ctx) {
    ctx = typeof newVNode.ctx === 'function'
      ? newVNode.ctx(oldVNode.ctx)
      : newVNode.ctx
  }

  if (el) {
    // Patch text nodes
    if (newVNode.text != null && oldVNode.text !== newVNode.text) {
      el.textContent = String(newVNode.text);
      return;
    }
    for (const key in { ...oldVNode?.props, ...newVNode?.props }) {
      const oldVal = ['value', 'selected', 'checked'].includes(key) ? (el as any)[key] : oldVNode?.props?.[key];
      if (oldVal !== newVNode?.props?.[key] && !['key', 'init', 'clear', 'ctx'].includes(key)) {
        patchProp(el as HTMLElement, key, oldVNode?.props?.[key], newVNode?.props?.[key], cycle);
      }
    }
  }

  const parent = oldVNode.mount ?? oldVNode.el!;
  const oldCh: VNode[] = ((oldVNode.children as VNode[]) ?? []);
  const newCh = normalize(newVNode.children, cycle, ctx);

  oldVNode.children = newVNode.children = newCh;
  if (parentOldCh) {
    parentOldCh[idxInParent].children = oldVNode.children;
  }
  
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
      patchNode(oldStartVNode, newStartVNode, cycle, ctx, oldCh, oldStartIdx);
      oldStartVNode = oldCh[++oldStartIdx];
      newStartVNode = newCh[++newStartIdx];
    } else if (isSame(oldEndVNode, newEndVNode)) {
      patchNode(oldEndVNode, newEndVNode, cycle, ctx, oldCh, oldEndIdx);
      oldEndVNode = oldCh[--oldEndIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldStartVNode, newEndVNode)) {
      patchNode(oldStartVNode, newEndVNode, cycle, ctx, oldCh, oldStartIdx);
      moveVNode(parent, oldStartVNode, getFragmentEl(oldCh, oldEndIdx, parent)?.nextSibling!);
      oldStartVNode = oldCh[++oldStartIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldEndVNode, newStartVNode)) {
      patchNode(oldEndVNode, newStartVNode, cycle, ctx, oldCh, oldEndIdx);
      moveVNode(parent, oldEndVNode, getFragmentEl(oldCh, oldStartIdx, parent)!);
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
        createNode(newStartVNode, parent, getFragmentEl(oldCh, oldStartIdx, parent)!, cycle, ctx, oldCh, newStartIdx);
      } else {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.type !== newStartVNode.type) {
          createNode(newStartVNode, parent, getFragmentEl(oldCh, oldStartIdx, parent)!, cycle, ctx, oldCh, newStartIdx);
        } else {
          patchNode(elmToMove, newStartVNode, cycle, ctx, oldCh, idxInOld);
          oldCh[idxInOld] = undefined as any;
          moveVNode(parent, elmToMove, getFragmentEl(oldCh, oldStartIdx, parent)!);
        }
      }
      newStartVNode = newCh[++newStartIdx];
    }
  }
  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : getFragmentEl(newCh, newEndIdx + 1, parent);
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        const ch = newCh[i];
        if (ch != null) {
          createNode(ch, parent, before, cycle, ctx, oldCh, i)
        }
      }
    } else {
      for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        const ch = oldCh[i];
        if (ch != null) {
          runClearTasks(ch, cycle);
          const chEl = getFragmentEl(oldCh, i, parent, true);
          if (chEl) {
            parent.removeChild(chEl)
          }
        }
      }
    }
  }
};


export default patchNode
