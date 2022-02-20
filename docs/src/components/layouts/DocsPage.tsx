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


export default (toc: any, html: string) => (
  <div class="docs-layout">
    <aside>
      <ul>
        {pkgs.map(pkg => (
          <li key={pkg.id}><a href={`/docs/${pkg.id}`}>{pkg.name}</a></li>
        ))}
      </ul>
      <ul class="sticky">
        {toc.map((heading: any) => (
          <li>
            <a href={`#${slugify(heading.content)}`}>
              <span innerHTML={heading.content} />
            </a>
          </li>
        ))}
      </ul>
    </aside>
    <div class="markdown-content" innerHTML={html} />
  </div>
)
