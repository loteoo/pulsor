
import { isSame } from './utils'
import flatten from './flatten';

// ====

function moveVNode(
  parentElm: Node,
  vNode: VNode,
  before?: Node,
): void {
  if (vNode.type || vNode.text != null) {
    parentElm.insertBefore(vNode.el!, before!);
  } else if (vNode.children) {
    for (const ch of (vNode.children as VNode[])) {
      moveVNode(parentElm, ch, before)
    }
  }
}

function getFragmentEl(vNode: VNode): Node | undefined {
  if (vNode.type || vNode.text != null) {
    return vNode.el!;
  } else if (vNode.children) {
    return getFragmentEl((vNode.children as VNode[])[0]);
  }
}


// ===

const createNode = (vNode: VNode, parent: Node, before: Node, cycle: Cycle) => {

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
    cycle
  );

  parent.insertBefore(vNode.el, before)

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

  if (key === 'key') {
    return;
  }

  if (key === 'init') {
    if (newValue && oldValue == null) {
      cycle.dispatch('init', newValue, el, true);
    }
    return;
  }

  if (key === 'listener') {
    if (newValue && oldValue == null) {
      oldVNode.listener = newVNode.listener = (newVNode.listener as Listener)(cycle.createEmitter(newVNode)) as ListenerCleanupFunction;
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


  if (newValue == null || newValue === false) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, newValue);
  }

};

const patchProps = (el: HTMLElement, oldVNode: VNode, newVNode: VNode, cycle: Cycle) => {
  const oldProps: any = {
    ...oldVNode?.props,
    init: oldVNode?.init,
    listener: oldVNode?.listener,
  };
  const newProps: any = {
    ...newVNode?.props,
    init: newVNode?.init,
    listener: newVNode?.listener,
  };
  for (const key in { ...oldProps, ...newProps }) {
      if (
        ['value', 'selected', 'checked'].includes(key)
        || oldProps[key] !== newProps[key]
    ) {
      patchProp(el, key, oldProps[key], newProps[key], oldVNode, newVNode, cycle);
    }
  }
};


const patchNode = (oldVNode: VNode, newVNode: VNode, cycle: Cycle) => {
  
  const el: Node = (newVNode.el = oldVNode.el!);

  patchProps(el as HTMLElement, oldVNode, newVNode, cycle);  // Needs to happen before flatten in case child fn needs state from init
  
  const oldCh: VNode[] = ((oldVNode.children as VNode[]) ?? []);
  const newCh = flatten(newVNode.children, cycle);

  oldVNode.children = newVNode.children = newCh;

  // ATM this is un needed as the isSame function checks for a.text === b.text
  // which and handles the diff via createTextNode
  // TODO: compare perf of both approaches
  // if (newVNode.text != null && oldVNode.text !== newVNode.text) {
  //   el.textContent = String(newVNode.text);
  //   return;
  // }

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
      patchNode(oldStartVNode, newStartVNode, cycle);
      oldStartVNode = oldCh[++oldStartIdx];
      newStartVNode = newCh[++newStartIdx];
    } else if (isSame(oldEndVNode, newEndVNode)) {
      patchNode(oldEndVNode, newEndVNode, cycle);
      oldEndVNode = oldCh[--oldEndIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldStartVNode, newEndVNode)) {
      patchNode(oldStartVNode, newEndVNode, cycle);
      moveVNode(el, oldStartVNode, getFragmentEl(oldEndVNode)?.nextSibling!);
      oldStartVNode = oldCh[++oldStartIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldEndVNode, newStartVNode)) {
      patchNode(oldEndVNode, newStartVNode, cycle);
      moveVNode(el, oldEndVNode, oldStartVNode.el!);
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
        createNode(newStartVNode, el, oldStartVNode.el!, cycle);
      } else {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.type !== newStartVNode.type) {
          createNode(newStartVNode, el, oldStartVNode.el!, cycle);
        } else {
          patchNode(elmToMove, newStartVNode, cycle);
          oldCh[idxInOld] = undefined as any;
          moveVNode(el, elmToMove, oldStartVNode.el!);
        }
      }
      newStartVNode = newCh[++newStartIdx];
    }
  }
  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : getFragmentEl(newCh[newEndIdx + 1]);
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        const ch = newCh[i];
        if (ch != null) {
          createNode(ch, el, before, cycle)
        }
      }
    } else {
      for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        const ch = oldCh[i];
        if (ch != null) {
          if (ch.cleanup) {
            cycle.dispatch('cleanup', ch.cleanup, ch.el, true)
          }
          if (ch.listener) {
            (ch.listener as ListenerCleanupFunction)()
          }
          if (ch.type || ch.text != null) {
            el.removeChild(ch.el!)
          }
        }
      }
    }
  }
};


export default patchNode
