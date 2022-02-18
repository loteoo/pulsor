import { VNode } from "@pulsor/core"

const document = (root: VNode) => (
  <html>
    <head>
      <title>Virtual DOM unleashed</title>
    </head>
    <body>
      {root}
    </body>
  </html>
)

export default document