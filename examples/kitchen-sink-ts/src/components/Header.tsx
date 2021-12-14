import routes from '/src/utils/routes';

export default (
  <header
    style={{
      display: 'flex',
      justifyContent: 'space-between'
    }}
  >
    <details>
      <summary>Menu</summary>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        {Object.keys(routes)
          .filter(p => p !== '/')
          .map((path) => (
            <li>
              <a href={path}>{path.slice(1)}</a>
            </li>
          ))
        }
      </ul>
    </details>
    <strong>
      Demo app
    </strong>
  </header>
)