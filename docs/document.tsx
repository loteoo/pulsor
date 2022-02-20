import { VNode } from "@pulsor/core"

const document = (root: VNode) => (
  <html>
    <head>
      <title>Virtual DOM unleashed</title>

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
