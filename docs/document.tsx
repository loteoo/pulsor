import { VNode } from "@pulsor/core"

const document = (root: VNode) => (
  <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="x-ua-compatible" content="IE=edge,chrome=1" />
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />

      <title>Virtual DOM unleashed</title>
      <meta name="description" content="an all-in-one UI rendering + state management solution in a tiny, ~3kb, “self rendering” virtual dom." />


      {/* HLJS light mode */}
      <link media="(prefers-color-scheme: light)" href="/github.css" rel="stylesheet" />

      {/* HLJS dark mode */}
      <link media="(prefers-color-scheme: dark)" href="/github-dark-dimmed.css" rel="stylesheet" />
    </head>
    <body>
      {root}
    </body>
  </html>
)

export default document
