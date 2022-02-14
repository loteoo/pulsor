
import { isSame } from './utils'
import normalize from './normalize';
import reduce from './reduce';
import { Context, Cycle, VNode, Lens, NormalizedVNode } from './types';
import createLens from './createLens';

// ====

function removeNode(vNode: NormalizedVNode, parent: Node | undefined, cycle: Cycle, scope?: Lens) {

  reduce(vNode.clear, vNode.el, cycle, scope, vNode, 'clear');

  // @ts-ignore
  if (vNode.el?.clearEffects) {
    // @ts-ignore
    vNode.el?.clearEffects.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
  }

  //@ts-ignore
  if (vNode.children?.length) {
    for (const ch of vNode.children) {
      removeNode(ch, vNode.el, cycle, scope);
    }
  }

  if (vNode.el?.parentNode === parent && vNode.el) {
    parent?.removeChild(vNode.el);
  }

}


// ===

const createNode = (vNode: VNode, parent: Node | undefined, before: Node, cycle: Cycle, ctx: any, isSvg: boolean, scope?: Lens) => {

  if (!cycle.dryRun) {
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
  }

  patchNode(
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
    scope,
  );

  if (!cycle.dryRun) {
    parent?.insertBefore(vNode.el!, before);
  }
};


// ===============



const patchProp = (el: HTMLElement, key: string, oldValue: any, newValue: any, cycle: Cycle, isSvg: boolean, ctx: Context, scope?: Lens) => {
  if (key.startsWith("on")) {
    const eventName = key.slice(2);
    //@ts-ignore
    el.__scope = scope;
    //@ts-ignore
    el[eventName] = newValue;
    if (!newValue) {
      el.removeEventListener(eventName, cycle.domEmitter!);
    } else if (!oldValue) {
      el.addEventListener(eventName, cycle.domEmitter!);
    }
    return;
  }

  if (typeof newValue === 'function') {
    newValue = newValue(
      scope ? scope.get(cycle.state) : cycle.state,
      ctx
    );
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
    for (const k in { ...(typeof oldValue === 'object' ? oldValue : {}), ...newValue }) {
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


const patchNode = (oldVNode: NormalizedVNode, newVNode: VNode, cycle: Cycle, ctx: Context, isSvg: boolean, scope?: Lens) => {

  // ?? why are these needed?!!
  newVNode.el = oldVNode.el;

  const el = oldVNode.el;

  if (newVNode.ctx) {
    ctx = typeof newVNode.ctx === 'function'
      ? newVNode.ctx(oldVNode.ctx!)
      : newVNode.ctx
  }

  if (newVNode.scope) {
    if (typeof newVNode.scope === 'string') {
      scope = createLens(newVNode.scope);
    } else {
      scope = newVNode.scope;
    }
  }

  if (newVNode.init && oldVNode.init == null) {
    reduce(newVNode.init, el, cycle, scope, oldVNode, 'init');
  }

  if (!newVNode.tag && newVNode.text == null) {
    return;
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

    for (const key in { ...oldVNode.props, ...newVNode.props }) {
      const oldVal = ['value', 'selected', 'checked'].includes(key) ? (el as any)[key] : oldVNode.props?.[key];
      if (oldVal !== newVNode.props?.[key] && !['key', 'init', 'clear', 'ctx'].includes(key)) {
        patchProp(el as HTMLElement, key, oldVNode.props?.[key], newVNode.props?.[key], cycle, isSvg, ctx, scope);
      }
    }
  }

  const parent = oldVNode.el;
  const oldCh: NormalizedVNode[] = (oldVNode.children ?? []);
  const newCh = normalize(newVNode.children, cycle, ctx, scope);

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
  let elmToMove: NormalizedVNode;
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
      patchNode(oldStartVNode, newStartVNode, cycle, ctx, isSvg, scope);
      oldStartVNode = oldCh[++oldStartIdx];
      newStartVNode = newCh[++newStartIdx];
    } else if (isSame(oldEndVNode, newEndVNode)) {
      patchNode(oldEndVNode, newEndVNode, cycle, ctx, isSvg, scope);
      oldEndVNode = oldCh[--oldEndIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldStartVNode, newEndVNode)) {
      patchNode(oldStartVNode, newEndVNode, cycle, ctx, isSvg, scope);
      parent?.insertBefore(oldStartVNode.el!, oldEndVNode.el!.nextSibling!);
      oldStartVNode = oldCh[++oldStartIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldEndVNode, newStartVNode)) {
      patchNode(oldEndVNode, newStartVNode, cycle, ctx, isSvg, scope);
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
        createNode(newStartVNode, parent, oldStartVNode.el!, cycle, ctx, isSvg, scope);
      } else {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.tag !== newStartVNode.tag) {
          createNode(newStartVNode, parent, oldStartVNode.el!, cycle, ctx, isSvg, scope);
        } else {
          patchNode(elmToMove, newStartVNode, cycle, ctx, isSvg, scope);
          oldCh[idxInOld] = undefined as any;
          parent?.insertBefore(elmToMove.el!, oldStartVNode.el!);
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
          createNode(ch, parent, before, cycle, ctx, isSvg, scope);
        }
      }
    } else {
      for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        const ch = oldCh[i];
        if (ch != null) {
          removeNode(ch, parent!, cycle, scope);
        }
      }
    }
  }
};

const patch = (a: NormalizedVNode, b: VNode, cycle: Cycle) => {
  if (cycle.needsRerender) {
    while (cycle.needsRerender) {
      cycle.needsRerender = false;
      patchNode(a, { ...b }, cycle, {}, false);
    }
  }
}

export default patch
