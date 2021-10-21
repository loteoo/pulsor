
import { isModuleNode, isRenderable, isSame, isVTextElement } from './utils'
import reduce from './reduce';
import flatten from './flatten';


const createElement = (vElement: VElement, cycle: Cycle): DomElement => {

  if (!isRenderable(vElement)) {
    return document.createTextNode('');
  }

  if (isVTextElement(vElement)) {
    return document.createTextNode(String(vElement))
  }

  // TODO: Move this to patchProps
  if (vElement.init) {
    // @ts-ignore
    const nextState = reduce(cycle.state, vElement.init, cycle);
    // Sometimes, actions are just tasks with no state transformation
    if (cycle.state !== nextState) {
      cycle.state = nextState
      cycle.needsRerender = true
      console.log('state updated', cycle.state)
    }
  }

  // TODO: Move this to patchProps
  if (vElement.listener) {
    vElement.listener(cycle.createEmitter(vElement))
  }

  if (isModuleNode(vElement)) {
    return document.createComment('module')
  }

  const el = document.createElement((vElement as VDomElement).type!);

  patchProps(el, {}, (vElement as VDomElement).props, cycle);
  patchChildren(el, flatten((vElement as VDomElement).children, cycle), cycle);

  return el
};


// ===============



const patchProp = (el: HTMLElement, key: string, value: any, nextValue: any, cycle: Cycle) => {
  if (key.startsWith("on")) {
    const eventName = key.slice(2);
    //@ts-ignore
    el[eventName] = nextValue;
    if (!nextValue) {
      el.removeEventListener(eventName, cycle.domEmitter);
    } else if (!value) {
      el.addEventListener(eventName, cycle.domEmitter);
    }
    return;
  }
  if (nextValue == null || nextValue === false) {
    el.removeAttribute(key);
    return;
  }

  if (typeof nextValue === 'function') {
    nextValue = nextValue(cycle.state)
  }

  el.setAttribute(key, nextValue);
};

const patchProps = (el: HTMLElement, props: any, nextProps: any, cycle: Cycle) => {
  // console.log('patchProps', el, props, nextProps)
  const mergedProps = { ...props, ...nextProps };
  for (const key of Object.keys(mergedProps)) {
    if (props[key] !== nextProps[key] && !['key', 'init', 'clear'].includes(key)) {
      patchProp(el, key, props[key], nextProps[key], cycle);
    }
  }
};



const patchChildren = (el: HTMLElement, newCh: VElement[], cycle: Cycle) => {
  //@ts-ignore
  const oldCh: VElement[] = el['old_v_children'] ?? [];

  let oldStartIdx = 0
  let newStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let oldStartVNode = oldCh[0]
  let oldEndVNode = oldCh[oldEndIdx]
  let newEndIdx = newCh.length - 1
  let newStartVNode = newCh[0]
  let newEndVNode = newCh[newEndIdx]
  let oldKeyToIdx, idxInOld, vnodeToMove, elmToMove;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVNode == null) {
      oldStartVNode = oldCh[++oldStartIdx] // VNode has been moved left
    } else if (oldEndVNode == null) {
      oldEndVNode = oldCh[--oldEndIdx]
    } else if (isSame(oldStartVNode, newStartVNode)) {
      patchElement(el.childNodes[oldStartIdx] as DomElement, oldStartVNode, newStartVNode, cycle)
      oldStartVNode = oldCh[++oldStartIdx]
      newStartVNode = newCh[++newStartIdx]
    } else if (isSame(oldEndVNode, newEndVNode)) {
      patchElement(el.childNodes[oldEndIdx] as DomElement, oldEndVNode, newEndVNode, cycle)
      oldEndVNode = oldCh[--oldEndIdx]
      newEndVNode = newCh[--newEndIdx]
    } else if (isSame(oldStartVNode, newEndVNode)) { // VNode moved right
      patchElement(el.childNodes[oldStartIdx] as DomElement, oldStartVNode, newEndVNode, cycle)
      el.insertBefore(el.childNodes[oldStartIdx], el.childNodes[oldEndIdx].nextSibling)
      oldStartVNode = oldCh[++oldStartIdx]
      newEndVNode = newCh[--newEndIdx]
    } else if (isSame(oldEndVNode, newStartVNode)) { // VNode moved left
      patchElement(el.childNodes[oldEndIdx] as DomElement, oldEndVNode, newStartVNode, cycle)
      el.insertBefore(el.childNodes[oldEndIdx], el.childNodes[oldStartIdx])
      oldEndVNode = oldCh[--oldEndIdx]
      newStartVNode = newCh[++newStartIdx]
    } else {
      if (oldKeyToIdx == null) {
        oldKeyToIdx = {}
        for (let key, i = oldStartIdx; i <= oldEndIdx; ++i) {
          key = (oldCh[i] as VDomElement).key
          //@ts-ignore
          if (key) oldKeyToIdx[key] = i
        }
      }
      if ((newStartVNode as VDomElement).key) {
        idxInOld = oldKeyToIdx[(newStartVNode as VDomElement).key!]
      } else {
        for (let i = oldStartIdx; i < oldEndIdx; i++) {
          const c = oldCh[i]
          if (c && isSame(newStartVNode, c)) idxInOld = i
        }
      }
      if (idxInOld == null) { // New element
        el.insertBefore(createElement(newStartVNode, cycle), el.childNodes[newStartIdx])
      } else {
        vnodeToMove = oldCh[idxInOld]
        elmToMove = el.childNodes[idxInOld]
        if (isSame(vnodeToMove, newStartVNode)) {
          patchElement(elmToMove as DomElement, vnodeToMove, newStartVNode, cycle) // TODO: validate that elmToMove is the right thing to pass
          // @ts-ignore
          oldCh[idxInOld] = undefined
          el.insertBefore(elmToMove, el.childNodes[oldStartIdx])
        } else {
          // same key but different element. treat as new element
          el.insertBefore(createElement(newStartVNode, cycle), el.childNodes[newStartIdx])
        }
      }
      newStartVNode = newCh[++newStartIdx]
    }
  }
  if (oldStartIdx > oldEndIdx) {
    for (let i = newStartIdx; i <= newEndIdx; ++i) {
      if (newCh[i] !== undefined) {
        el.insertBefore(createElement(newCh[i], cycle), el.childNodes[i])
      }
    }
  } else if (newStartIdx > newEndIdx) {
    for (let i = oldEndIdx; oldStartIdx <= i; --i) {
      el.childNodes[i].remove();
    }
  }

  //@ts-ignore
  el['old_v_children'] = newCh;
};

const patchElement = (el: DomElement, oldVElement: VElement, nextVElement: VElement, cycle: Cycle) => {

  if (!isRenderable(nextVElement)) {
    if (oldVElement === nextVElement) {
      return;
    }
    el.replaceWith(createElement(nextVElement, cycle));
    return;
  }

  if (!isRenderable(oldVElement) && oldVElement !== nextVElement) {
    el.replaceWith(createElement(nextVElement, cycle));
    return;
  }

  if (isVTextElement(oldVElement) || isVTextElement(nextVElement)) {
    if (oldVElement !== nextVElement) {
      el.replaceWith(createElement(nextVElement, cycle));
      return;
    }
    return;
  }

  if (
    (oldVElement as VDomElement).type !== (nextVElement as VDomElement).type
    || ((oldVElement as VDomElement).key !== (nextVElement as VDomElement).key) // key support
  ) {
    el.replaceWith(createElement(nextVElement, cycle));
    return;
  }

  // Not patchable
  if (isModuleNode(nextVElement) && isModuleNode(oldVElement)) {
    return;
  }

  if ((nextVElement as VDomElement).props) {
    patchProps(el as HTMLElement, (oldVElement as VDomElement)?.props ?? {}, (nextVElement as VDomElement)?.props ?? {}, cycle);
  }
  if ((nextVElement as VDomElement).children) {
    patchChildren(el as HTMLElement, flatten((nextVElement as VDomElement).children, cycle), cycle);
  }

};


export default patchElement
