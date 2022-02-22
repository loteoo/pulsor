import { VNode } from "@pulsor/core"

const document = (root: VNode) => (
  <html>
    <head>
      <title>Pulsor dev server</title>
    </head>
    <body>
      {root}
    </body>
  </html>
)

export default document