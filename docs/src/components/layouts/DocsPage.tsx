import pkgs from "/src/utils/pkgs";

const slugify = (s: string) => encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'))

const links: any[] = [];

// for (let i = 0; i < toc.length; i++) {
//   const prev = toc[i - 1];
//   const curr = toc[i];

//   if (curr.level > (prev?.level ?? 0)) {
//     links.push({
//       href: slugify(curr.content),
//       label: curr.content,
//       children: [],
//     })
//   } else {

//   }
  
// }

const HandleClicks = (_: any, ev: any) => ({
  effect: () => {
    // If is an anchor link with an ID
    if (ev.target.matches(':is(h1, h2, h3, h4, h5, h6)[id]')) {
      location.hash = `#${ev.target.id}`
    }
  }
})


export default (pkg: any) => (
  <div class="docs-layout">
    <aside>
      <ul class="sticky">
        {pkgs.map(p => (
          <li key={p.id}>
            <a
              href={`/docs/${p.id}`}
              class={{
                'sidebar-active': p.id === pkg.id
              }}
            >
              {p.name}
            </a>
            {p.id === pkg.id && (
              <ul>
                {pkg.readme.toc.filter((h: any) => h.content !== pkg.name).map((heading: any) => (
                  <li style={{ paddingLeft: `${Math.max(heading.level - 1, 0)}rem`}}>
                    <a href={`#${slugify(heading.content)}`}>
                      <span innerHTML={heading.content} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
    <div onclick={HandleClicks} class="markdown-content" innerHTML={pkg.readme.html} />
  </div>
)
