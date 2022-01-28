import { VNode, Cycle } from "./types";

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

const renderToString = (vNode: VNode, cycle: Cycle, ctx: any): string => {

  if (!vNode.tag && vNode.text != null) {
    return String(vNode.text);
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

        if (typeof vNode.props[prop] === 'function') {
          vNode.props[prop] = vNode.props[prop](cycle.state);
        }

        if (prop === 'class' && typeof vNode.props[prop] === 'object') {
          let cls = '';

          // @ts-ignore
          for (const key of Object.keys(vNode.props[prop]).filter(k => vNode.props[prop][k])) {
            // @ts-ignore
            cls += ' ' + vNode.props[prop][key];
          }

          vNode.props[prop] = cls;
        }

        if (prop === 'style' && typeof vNode.props[prop] === 'object') {
          vNode.props[prop] = styleToString(vNode.props[prop])
        }

        html.push(` ${prop}="${String(vNode.props[prop])}"`)
      }
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

  if (vNode.children) {
    for (const child of vNode.children as any[]) {
      html.push(renderToString(child, cycle, ctx))
    }
  }

  if (vNode.tag) {
    if (!voidElements.includes(vNode.tag)) {
      html.push('</' + vNode.tag + '>')
    }
  }

  return html.join('');
}

export default renderToString;