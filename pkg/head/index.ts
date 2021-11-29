const Head = (_: any, children: VNode[]) => {
  const updated = children
    .flat()
    .map((ch) => ({
      ...ch,
      init: {
        run: () => {
          const el = document.querySelector(`head ${ch.type}${ch.props?.property ? `[property=${ch.props?.property}]` : ''}${ch.props?.name ? `[name=${ch.props?.name}]` : ''}`);
          if (el) {
            el.remove()
          }
        }
      }
    }));

  return {
    mount: document.head,
    children: updated,
  }
}


export default Head;