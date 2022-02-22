import { patch, State, Cycle, VNode, NormalizedVNode } from '@pulsor/core';
import escapeHtml from './escapeHtml';

const voidElements = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]

const styleToString = (style: any) => {
  return Object.keys(style).reduce((acc, key) => (
    acc + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + style[key] + ';'
  ), '');
};

const stringifyNode = (vNode: NormalizedVNode, cycle: Cycle, addHydrationFlags?: boolean): string => {

  if (!vNode.tag) {
    if (vNode.text != null) {
      return escapeHtml(String(vNode.text));
    } else {
      return '';
    }
  }

  var html = []

  // var svg = vNode.data.ns === 'http://www.w3.org/2000/svg'

  if (vNode.tag) {
    // Open tag
    html.push('<' + vNode.tag)

    if (vNode.props) {
      for (const prop of Object.keys(vNode.props)) {
        if (prop.startsWith('on')) {
          continue;
        }

        if (['init', 'clear', 'ctx', 'key'].includes(prop)) {
          continue
        }

        if (typeof vNode.props[prop] === 'function') {
          vNode.props[prop] = vNode.props[prop](cycle.state);
        }

        if (prop === 'class' && typeof vNode.props[prop] === 'object') {
          let cls = '';

          // @ts-ignore
          for (const key of Object.keys(vNode.props[prop]).filter(k => vNode.props[prop][k])) {
            // @ts-ignore
            cls += ' ' + key;
          }

          vNode.props[prop] = cls;
        }

        if (prop === 'style' && typeof vNode.props[prop] === 'object') {
          vNode.props[prop] = styleToString(vNode.props[prop]);
        }

        if (prop === 'innerHTML') {
          html.push(` data-pulsorinnerhtml="true"`);
          continue
        }

        if (vNode.props[prop] === false) {
          continue
        }

        if (vNode.props[prop] === true) {
          html.push(` ${prop}`);
          continue
        }

        if (vNode.props[prop] === undefined) {
          continue
        }

        html.push(` ${prop}="${escapeHtml(String(vNode.props[prop]))}"`);
      }
    }


    if (vNode.key) {
      html.push(` data-pulsorkey="${vNode.key}"`);
    }

    if (addHydrationFlags) {
      html.push(` data-pulsorhydrate="true"`);
    }

    // if (props.length) {
    //   tag.push(' ' + props)
    // }
    // if (svg && CONTAINER_ELEMENTS[tagName] !== true) {
    //   tag.push(' /')
    // }

    if (voidElements.includes(vNode.tag)) {
      html.push(' />');
      return html.join('');
    } else {
      // html.push(`></${vNode.tag}>`);
      html.push('>');
    }
  }

  if (vNode.props?.innerHTML) {
    html.push(vNode.props.innerHTML);
  }

  if (vNode.children) {
    for (const child of vNode.children) {
      const addHydrationFlags = ['head', 'body'].includes(vNode.tag!);
      const childHtml = stringifyNode(child, cycle, addHydrationFlags)
      html.push(childHtml)
    }
  }

  if (vNode.tag) {
    if (!voidElements.includes(vNode.tag)) {
      html.push('</' + vNode.tag + '>')
    }
  }

  return html.join('');
}

/**
 * Turns a vNode into a HTML string
 */
const stringify = async (rootVNode: VNode, initialState?: State) => {
  const cycle = {
    state: initialState ?? {},
    effects: [] as Array<() => void>,
    needsRerender: true,
    dryRun: true,
  };

  const oldVNode = {
    ...rootVNode,
    children: [],
  };

  while (cycle.needsRerender) {

    patch(
      oldVNode,
      rootVNode,
      cycle
    );

    const ssrFXs = cycle.effects.filter(fx => fx.name.startsWith('SSR')).map(promise => promise());

    if (ssrFXs.length) {
      await Promise.all(ssrFXs);
      cycle.effects = [];
      cycle.needsRerender = true;
    }
  }


  const html = stringifyNode(oldVNode, cycle);

  return html;
}

export default stringify;
