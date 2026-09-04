import {readFile} from "node:fs/promises"
import {resolve} from "node:path"

import type {APIRoute, GetStaticPaths} from "astro"
import {getCollection} from "astro:content"

import {getPageSlug} from "#utils/page-slug"

interface MarkdownSourceProps {
  filePath: string
}

export const getStaticPaths = (async () => {
  const pages = await getCollection("pages")

  return pages.flatMap((page) => {
    if (!page.filePath) return []

    return [
      {
        params: {slug: getPageSlug(page) || "index"},
        props: {filePath: resolve(page.filePath)},
      },
    ]
  })
}) satisfies GetStaticPaths

export const GET: APIRoute<MarkdownSourceProps> = async ({props}) => {
  const source = await readFile(props.filePath, "utf8")

  return new Response(source, {
    headers: {"Content-Type": "text/markdown; charset=utf-8"},
  })
}
