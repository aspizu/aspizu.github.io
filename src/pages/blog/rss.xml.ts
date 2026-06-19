import dates from "@/content/dates.json"
import rss from "@astrojs/rss"
import type {APIContext} from "astro"
import {getCollection} from "astro:content"

export async function GET(context: APIContext) {
    const blogs = await getCollection("blogs")
    return rss({
        title: "aspizu's blog",
        description: "technology, music, and whatever else",
        trailingSlash: false,
        site: context.site! + "/blog",
        items: blogs.map((blog) => ({
            title: blog.data.title,
            description: blog.data.description,
            pubDate: new Date(dates[blog.id]),
            link: `/blog/${blog.id}/`,
        })),
    })
}
