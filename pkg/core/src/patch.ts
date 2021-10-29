
import { isModuleNode, isSame } from './utils'
import reduce from './reduce';
import flatten from './flatten';


// const realCreateElement = document.createElement.bind(document)
// document.createElement = (name: any, props: any) => {
//   let el = realCreateElement(name, props)
//   console.log('Created element: ', el.tagName)
//   return el
// }


// ====


type KeyToIndexMap = { [key: string]: number };


function createKeyToOldIdx(
  children: VNode[],
  beginIdx: number,
  endIdx: number
): KeyToIndexMap {
  const map: KeyToIndexMap = {};
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = children[i]?.key;
    if (key !== undefined) {
      map[key as string] = i;
    }
  }
  return map;
}


function addVNodes(
  parentElm: Node,
  before: Node | null,
  vnodes: VNode[],
  startIdx: number,
  endIdx: number,
  cycle: Cycle
) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx];
    if (ch != null) {
      parentElm.insertBefore(createNode(ch, cycle), before);
    }
  }
}


function removeVNodes(
  parentElm: Node,
  vnodes: VNode[],
  startIdx: number,
  endIdx: number
): void {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx];
    if (ch != null) {
      parentElm.removeChild(ch.el!)
    }
  }
}


// ===


const createElm = (vNode: VNode): Node => {
  if (vNode.text != null) {
    return document.createTextNode(String(vNode.text));
  }

  if (isModuleNode(vNode)) {
    return document.createComment('module');
  }

  return document.createElement(vNode.type!);
}

const createNode = (vNode: VNode, cycle: Cycle): Node => {

  const el = createElm(vNode);
  
  // TODO: Move this to patchProps
  if (vNode.init) {
    // @ts-ignore
    const nextState = reduce(cycle.state, vNode.init, cycle);
    // Sometimes, actions are just tasks with no state transformation
    if (cycle.state !== nextState) {
      cycle.state = nextState
      cycle.needsRerender = true
      // TODO: Figure out a way to end the current patch cycle and let the next one continue (bc now the child nodes get patched twice)
      // console.log('state updated', cycle.state)
    }
  }

  // TODO: Move this to patchProps
  if (vNode.listener) {
    vNode.listener(cycle.createEmitter(vNode))
  }

  
  if (vNode.type) {
    patchProps(el as HTMLElement, {}, (vNode as VNode).props, cycle);
    patchChildren(el, flatten((vNode as VNode).children, cycle), cycle);
  }

  return vNode.el = el
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


  // Could be interesting? ex: <div id={state => state.foo} />
  // if (typeof newValue === 'function') {
  //   newValue = newValue(cycle.state)
  // }

  
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

const patchProps = (el: HTMLElement, oldProps: any, newProps: any, cycle: Cycle) => {
  for (const key in { ...oldProps, ...newProps }) {
    if (oldProps[key] !== newProps[key] && !['key', 'init', 'clear'].includes(key)) {
      patchProp(el, key, oldProps[key], newProps[key], cycle);
    }
  }
};



const patchChildren = (el: Node, newCh: VNode[], cycle: Cycle) => {
  //@ts-ignore
  const oldCh: VNode[] = el['old_v_children'] ?? [];

  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVNode = oldCh[0];
  let oldEndVNode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVNode = newCh[0];
  let newEndVNode = newCh[newEndIdx];
  let oldKeyToIdx: KeyToIndexMap | undefined;
  let idxInOld: number;
  let elmToMove: VNode;
  let before: any;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVNode == null) {
      oldStartVNode = oldCh[++oldStartIdx]; // VNode might have been moved left
    } else if (oldEndVNode == null) {
      oldEndVNode = oldCh[--oldEndIdx];
    } else if (newStartVNode == null) {
      newStartVNode = newCh[++newStartIdx];
    } else if (newEndVNode == null) {
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldStartVNode, newStartVNode)) {
      patchElement(oldStartVNode, newStartVNode, cycle);
      oldStartVNode = oldCh[++oldStartIdx];
      newStartVNode = newCh[++newStartIdx];
    } else if (isSame(oldEndVNode, newEndVNode)) {
      patchElement(oldEndVNode, newEndVNode, cycle);
      oldEndVNode = oldCh[--oldEndIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldStartVNode, newEndVNode)) {
      // VNode moved right
      patchElement(oldStartVNode, newEndVNode, cycle);
      el.insertBefore(
        oldStartVNode.el!,
        oldEndVNode.el!.nextSibling
      );
      oldStartVNode = oldCh[++oldStartIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (isSame(oldEndVNode, newStartVNode)) {
      // VNode moved left
      patchElement(oldEndVNode, newStartVNode, cycle);
      el.insertBefore(oldEndVNode.el!, oldStartVNode.el!);
      oldEndVNode = oldCh[--oldEndIdx];
      newStartVNode = newCh[++newStartIdx];
    } else {
      if (oldKeyToIdx === undefined) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      idxInOld = oldKeyToIdx[newStartVNode.key as string];
      if (idxInOld === undefined) {
        // New element
        el.insertBefore(
          createNode(newStartVNode, cycle),
          oldStartVNode.el!
        );
      } else {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.type !== newStartVNode.type) {
          el.insertBefore(
            createNode(newStartVNode, cycle),
            oldStartVNode.el!
          );
        } else {
          patchElement(elmToMove, newStartVNode, cycle);
          oldCh[idxInOld] = undefined as any;
          el.insertBefore(elmToMove.el!, oldStartVNode.el!);
        }
      }
      newStartVNode = newCh[++newStartIdx];
    }
  }
  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].el;
      addVNodes(
        el,
        before,
        newCh,
        newStartIdx,
        newEndIdx,
        cycle,
      );
    } else {
      removeVNodes(el, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  //@ts-ignore
  el['old_v_children'] = newCh;
};

const patchElement = (oldVNode: VNode, newVNode: VNode, cycle: Cycle) => {
  
  const el: Node = (newVNode.el = oldVNode.el!);
  
  //@ts-ignore
  const oldCh: VNode[] = el['old_v_children'] ?? [];
  const newCh = flatten(newVNode.children, cycle);

  if (newVNode.text == null) {
    if (oldCh != null && newCh != null) {
      if (oldCh !== newCh) {
        patchProps(el as HTMLElement, oldVNode.props ?? {}, newVNode.props ?? {}, cycle)
        patchChildren(el, newCh, cycle)
      };
    } else if (newCh != null) {
      if (oldVNode.text != null) {
        el.textContent = '';
      };
      addVNodes(el, null, newCh, 0, newCh.length - 1, cycle);
    } else if (oldCh != null) {
      removeVNodes(el, oldCh, 0, oldCh.length - 1);
    } else if (oldVNode.text != null) {
      el.textContent = '';
    }
  } else if (oldVNode.text !== newVNode.text) {
    if (oldCh != null) {
      removeVNodes(el, oldCh, 0, oldCh.length - 1);
    }
    el.textContent = String(newVNode.text);
  }
};


export default patchElement
