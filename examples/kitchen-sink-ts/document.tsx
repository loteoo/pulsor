import { VNode } from "@pulsor/core"

const document = (root: VNode) => (
  <html>
    <head>
      <title data-pulsor-hydrate={true}>Test {(state: any) => state.location?.path}</title>
    </head>
    <body>
      <div data-pulsor-hydrate={true}>
        {root}
      </div>
    </body>
  </html>
)

export default document