
if (typeof window !== 'undefined') {

  const _createElement = document.createElement.bind(document);

  // @ts-ignore
  document.createElement = (type) => {

    const el = _createElement(type) as HTMLElement;
    console.log('Created a dom element', el)
    // console.log('Created element ', type)




    const _setAttribute = el.setAttribute.bind(el);
    el.setAttribute = (...args) => {
      console.log('setAttribute', args)
      _setAttribute(...args)
    }



    return el
  }
}

