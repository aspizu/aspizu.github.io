import dates from "@/content/dates.json"
import rss from "@astrojs/rss"
import type {APIContext} from "astro"
import {getCollection} from "astro:content"

export async function GET(context: APIContext) {
    const blogs = await getCollection("blogs")
    const publishDates = new Map<string, string>(Object.entries(dates))

    return rss({
        title: "aspizu's blog",
        description: "technology, music, and whatever else",
        trailingSlash: false,
        site: context.site! + "/blog",
        items: blogs.map((blog) => {
            const publishDate = publishDates.get(blog.id)
            if (!publishDate) {
                throw new Error(`Missing publish date for blog "${blog.id}"`)
            }

            return {
                title: blog.data.title,
                description: blog.data.description,
                pubDate: new Date(publishDate),
                link: `/blog/${blog.id}/`,
            }
        }),
    })
}
