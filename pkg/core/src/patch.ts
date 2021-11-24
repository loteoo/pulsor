
import { isSame } from './utils'
import normalize from './normalize';

// ====

function moveVNode(
  parentElm: Node,
  vNode: VNode,
  before?: Node,
): void {
  if (vNode.type || vNode.text != null) {
    parentElm.insertBefore(vNode.el!, before!);
    // @ts-ignore
  } else if (vNode.children?.length) {
    for (const ch of (vNode.children as VNode[])) {
      moveVNode(parentElm, ch, before)
    }
  }
}

function getFragmentEl(chArray: VNode[], initialIdx: number, ignoreSibling?: boolean): Node | null {
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
      const checkInside = getFragmentEl((vNode.children as VNode[]), 0);
      if (checkInside) {
        el = checkInside;
        break;
      }
    }

    if (ignoreSibling) {
      break
    }

    idx++;
  }

  return el as Node | null;

}


// ===

const createNode = (vNode: VNode, parent: Node, before: Node, cycle: Cycle, ctx: any) => {

  if (vNode.text != null) {
    vNode.el = document.createTextNode(String(vNode.text));
  } else if (!vNode.type) {
    vNode.el = document.createDocumentFragment();
  } else {
    vNode.el = document.createElement(vNode.type!);
  }

  patchNode(
    {
      type: vNode.type,
      text: vNode.text,
      el: vNode.el,
      children: [],
    },
    vNode,
    cycle,
    ctx,
  );

  parent.insertBefore(vNode.el, before);

  if (!vNode.type && vNode.text == null) {
    vNode.el = parent;
  }
};


// ===============



const patchProp = (el: HTMLElement, key: string, oldValue: any, newValue: any, oldVNode: VNode, newVNode: VNode, cycle: Cycle) => {
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

  // Handle the rest as attributes (visible in the DOM)
  if (newValue == null || newValue === false) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, newValue);
  }

};

const patchProps = (el: HTMLElement, oldVNode: VNode, newVNode: VNode, cycle: Cycle) => {

  const oldProps: any = {
    ...oldVNode?.props,
  };
  const newProps: any = {
    ...newVNode?.props,
  };
  for (const key in { ...oldProps, ...newProps }) {
    const oldVal = ['value', 'selected', 'checked'].includes(key) ? (el as any)[key] : oldProps[key];
      if (oldVal !== newProps[key] && !['key', 'init', 'clear', 'ctx'].includes(key)) {
      patchProp(el, key, oldProps[key], newProps[key], oldVNode, newVNode, cycle);
    }
  }
};


const patchNode = (oldVNode: VNode, newVNode: VNode, cycle: Cycle, ctx: any) => {

  const el: Node = (newVNode.el = oldVNode.el!);

  if (newVNode?.init && oldVNode?.init == null) {
    oldVNode.clearTasks = cycle.dispatch('init', newVNode?.init, el, true);
  }
  newVNode.clearTasks = oldVNode.clearTasks // ?? why is this needed?!!

  if (newVNode?.ctx) {
    ctx = typeof newVNode.ctx === 'function'
      ? newVNode.ctx(oldVNode.ctx)
      : newVNode.ctx
  }

  // Patch text nodes
  if (newVNode.text != null && oldVNode.text !== newVNode.text) {
    el.textContent = String(newVNode.text);
    return;
  }

  patchProps(el as HTMLElement, oldVNode, newVNode, cycle);

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
      patchNode(oldStartVNode, newStartVNode, cycle, ctx);
      oldStartVNode = oldCh[++oldStartIdx];
      newStartVNode = newCh[++newStartIdx];
    } else if (isSame(oldEndVNode, newEndVNode)) {
      patchNode(oldEndVNode, newEndVNode, cycle, ctx);
      oldEndVNode = oldCh[--oldEndIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldStartVNode, newEndVNode)) {
      patchNode(oldStartVNode, newEndVNode, cycle, ctx);
      moveVNode(el, oldStartVNode, getFragmentEl(oldCh, oldEndIdx)?.nextSibling!);
      oldStartVNode = oldCh[++oldStartIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldEndVNode, newStartVNode)) {
      patchNode(oldEndVNode, newStartVNode, cycle, ctx);
      moveVNode(el, oldEndVNode, getFragmentEl(oldCh, oldStartIdx)!);
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
        createNode(newStartVNode, el, getFragmentEl(oldCh, oldStartIdx)!, cycle, ctx);
      } else {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.type !== newStartVNode.type) {
          createNode(newStartVNode, el, getFragmentEl(oldCh, oldStartIdx)!, cycle, ctx);
        } else {
          patchNode(elmToMove, newStartVNode, cycle, ctx);
          oldCh[idxInOld] = undefined as any;
          moveVNode(el, elmToMove, getFragmentEl(oldCh, oldStartIdx)!);
        }
      }
      newStartVNode = newCh[++newStartIdx];
    }
  }
  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : getFragmentEl(newCh, newEndIdx + 1);
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        const ch = newCh[i];
        if (ch != null) {
          createNode(ch, el, before, cycle, ctx)
        }
      }
    } else {
      for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        const ch = oldCh[i];
        if (ch != null) {
          const chEl = getFragmentEl(oldCh, i, true);
          
          // TODO: recursively call all clear props on all sub-nodes
          if (ch.clear) {
            cycle.dispatch('clear', ch.clear, chEl, true)
          }
          if (ch.clearTasks) {
            ch.clearTasks.forEach(cleanup => cleanup())
          }
          if (chEl) {
            el.removeChild(chEl)
          }
        }
      }
    }
  }
};


export default patchNode
