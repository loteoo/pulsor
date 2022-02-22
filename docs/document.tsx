import { VNode } from "@pulsor/core"

const title = 'Virtual DOM unleashed';
const description = 'All-in-one UI rendering + state management solution in a tiny, ~3kb, “self rendering” virtual dom.';

const document = (root: VNode) => (
  <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="x-ua-compatible" content="IE=edge,chrome=1" />
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />

      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Facebook Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content="https://pulsor.dev/" />
      <meta property="og:site_name" content="Pulsor" />
      <meta property="og:image" name="image" content="https://cdn.thumbsmith.com/v1/u/loteoo/pulsor.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Meta Tags */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content="https://pulsor.dev/" />
      <meta name="twitter:image" content="https://cdn.thumbsmith.com/v1/u/loteoo/pulsor.png" />
      <meta name="twitter:image:width" content="1200" />
      <meta name="twitter:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />

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
