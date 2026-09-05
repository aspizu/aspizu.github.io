import {getContainerRenderer} from "@astrojs/mdx/container-renderer"
import rss from "@astrojs/rss"
import type {APIRoute} from "astro"
import {experimental_AstroContainer as AstroContainer} from "astro/container"
import {loadRenderers} from "astro:container"
import {getCollection, render} from "astro:content"

import {getPageSlug} from "#utils/page-slug"

export const GET: APIRoute = async ({site}) => {
  const weeknotes = (
    await getCollection("pages", (page) =>
      getPageSlug(page).startsWith("weeknotes/"),
    )
  ).toSorted(
    (left, right) =>
      right.data.updatedAt.getTime() - left.data.updatedAt.getTime(),
  )
  const container = await AstroContainer.create({
    renderers: await loadRenderers([getContainerRenderer()]),
  })

  return rss({
    title: "aspiz.uk weeknotes",
    description: "Weeknotes from aspizu.",
    site: new URL("/weeknotes", site),
    trailingSlash: false,
    customData: "<language>en</language>",
    items: await Promise.all(
      weeknotes.map(async (page) => {
        const {Content} = await render(page)
        const link = new URL(`/${getPageSlug(page)}`, site).href

        return {
          title: page.data.title,
          pubDate: page.data.date,
          link,
          content: await container.renderToString(Content, {
            request: new Request(link),
          }),
        }
      }),
    ),
  })
}
