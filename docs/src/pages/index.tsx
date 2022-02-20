const packagesModules = import.meta.globEager('../../../pkg/*/package.json');

const allPkgs = Object.values(packagesModules).map(m => m.default);

const uiPkgs = ['form', 'http', 'location'];

const pkgs = allPkgs.filter(pkg => uiPkgs.includes(pkg.name.slice(8)));

export default (
  <>
    <section class="hero">
      <h1>
        Pulsor —
        an all-in-one UI rendering + state management solution in a tiny, ~3kb, “self&nbsp;rendering” virtual dom.
      </h1>
    </section>
    <section class="text-section">
      <p>
        Build modern web applications with <i>just</i> the features you need.
        Pulsor aims to be a more productive simplification of React + Redux by implementing the state management directly in the VDOM event system.
        This approach allows us to design a much more declarative, simpler and symetrical API for managing application state - all in a tiny, lightweight runtime.
      </p>
      <p>
        We believe that any UI <b>and it's interactions</b> can be defined as a simple, strongly typed, nested data structure <sup><small>(functions allowed)</small></sup>.
        Here's what we have so far :
      </p>
    </section>
    <section class="docs-fork">
      <a href="/docs/core#vnode">
        <code>VNode&lt;State&gt;</code>
        <p>Render UI elements declaratively.</p>
      </a>
      <a href="/docs/core#action">
        <code>Action&lt;State&gt;</code>
        <p>Update the state & run side-effects declaratively.</p>
      </a>
    </section>
    <section class="text-section">
      <p>
        We also believe that UI packages should manage their own state for you, in a standard, unified way that is by default inter-compatible with your application and easily composable with other packages.
      </p>
    </section>
    <section class="packages-list">
      <ul>
        {pkgs.map(pkg => (
          <li key={pkg.name}>
            <a href={`/docs#${pkg.name}`}>
              <strong>
                {pkg.name}
              </strong>
              <small>
                {pkg.version}
              </small>
              <p>
                {pkg.description}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
    <section class="text-section">
      <p>
        The project is still in an experimental (design) phase, with it's main goal being to try to design the best “API” for defining any frontend app with less code and more fun.
        Let's take the time to explore as many different ways do it and iteratively land on the most concise solution, or die trying!
      </p>
    </section>
  </>
)
