import {relative, resolve} from "node:path"

const pagesDirectory = resolve("./src/content/pages")

interface PageSlugSource {
  data: {slug?: string}
  filePath?: string
  id: string
}

export function getPageSlug(page: PageSlugSource) {
  if (typeof page.data.slug === "string") return page.data.slug

  const sourcePath = page.filePath
    ? relative(pagesDirectory, resolve(page.filePath)).replaceAll("\\", "/")
    : page.id

  return sourcePath
    .replace(/\.(?:md|mdx)$/, "")
    .replace(/(^|\/)index$/, "$1")
    .replace(/\/$/, "")
}
