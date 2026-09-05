import rss from "@astrojs/rss"
import type {APIRoute} from "astro"
import {getCollection} from "astro:content"

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

  return rss({
    title: "aspiz.uk weeknotes",
    description: "Weeknotes from aspizu.",
    site: new URL("/weeknotes", site),
    trailingSlash: false,
    customData: "<language>en</language>",
    items: weeknotes.map((page) => ({
      title: page.data.title,
      pubDate: page.data.date,
      link: new URL(`/${getPageSlug(page)}`, site).href,
    })),
  })
}
