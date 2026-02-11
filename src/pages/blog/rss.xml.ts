import {gitDate} from "@/utils/git-date"
import rss from "@astrojs/rss"
import type {APIContext} from "astro"
import {getCollection} from "astro:content"

export async function GET(context: APIContext) {
    const blogs = await getCollection("blogs")
    return rss({
        title: "aspizu's blog",
        description: "technology, music, and whatever else",
        site: context.site! + "/blog",
        items: await Promise.all(
            blogs.map(async (blog) => ({
                title: blog.data.title,
                description: blog.data.description,
                pubDate: await gitDate(blog.filePath),
                link: `/blog/${blog.id}/`,
            })),
        ),
    })
}
