import routes from '/src/utils/routes';

const css = {
  nav: {
    width: '100%',
    columnCount: 5
  },
  link: {
    display: 'block'
  }
}

export default (
  <header
    style={{
      display: 'flex',
      justifyContent: 'space-between'
    }}
  >
    <nav
      style={css.nav}
    >
      <a
        href="/"
        style={css.link}
      >
        home
      </a>
      {Object.keys(routes)
        .filter(p => p !== '/')
        .map((path) => (
            <a
              href={path}
              style={css.link}
            >
              {path.slice(1)}
            </a>
        ))
      }
    </nav>
  </header>
)

