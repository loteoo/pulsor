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
        Build modern web applications with <u>just</u> the features you need.
        Pulsor aims to be a more productive simplification of React + Redux by implementing the state management directly in the VDOM event system. 
        This approach allows us to design a much more declarative, simpler and symetrical API for managing application state - all in a tiny, lightweight runtime.
      </p>
      <p>
        We believe that any UI (and it's behaviors) can be defined as a single, strongly typed, nested data structure <sup><small>(functions allowed)</small></sup>.
      </p>
      <p>Here's what we have so far :</p>
    </section>
    <section class="docs-fork">
      <a href="/docs#vnode">
        <code>VNode&lt;State&gt;</code>
        <p>Render UI elements declaratively.</p>
      </a>
      <a href="/docs#action">
        <code>Action&lt;State&gt;</code>
        <p>Update the state & run side-effects declaratively.</p>
      </a>
    </section>
    <section class="text-section">
      <p>
        The project is still in an experimental (design) phase, with it's main goal being to try to design the best “API” for building any frontend app with less code and more fun.
        Let's take the time to explore as many different ways do it and iteratively land on the most concise solution, or die trying!
      </p>
    </section>
  </>
)