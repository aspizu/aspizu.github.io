import {existsSync} from "node:fs"
import {resolve} from "node:path"
import {fileURLToPath} from "node:url"

import {findAndReplace} from "mdast-util-find-and-replace"

const wikiPagesDirectory = fileURLToPath(
  new URL("../content/pages/wiki/", import.meta.url),
)
export default function remarkWikiWords() {
  return (tree: Parameters<typeof findAndReplace>[0]) => {
    findAndReplace(
      tree,
      [
        /(?<![\p{L}\p{N}_])\p{Lu}\p{Ll}+(?:\p{Lu}\p{Ll}+)+(?![\p{L}\p{N}_])/gu,
        (value) => {
          const pagePath = resolve(wikiPagesDirectory, value)

          if (
            ![
              `${pagePath}.md`,
              `${pagePath}.mdx`,
              resolve(pagePath, "index.md"),
              resolve(pagePath, "index.mdx"),
            ].some(existsSync)
          ) {
            return false
          }

          return {
            children: [{type: "text", value}],
            type: "link",
            url: `/wiki/${value}`,
          }
        },
      ],
      {
        ignore: [
          "link",
          "linkReference",
          "mdxJsxFlowElement",
          "mdxJsxTextElement",
        ],
      },
    )
  }
}
