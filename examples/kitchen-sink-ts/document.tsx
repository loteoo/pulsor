import { VNode } from "@pulsor/core"

const document = (root: VNode) => (
  <html>
    <head>
      <title>Test {(state: any) => state.location?.path}</title>
    </head>
    <body>
      {root}
    </body>
  </html>
)

export default document