import type {APIContext} from "astro"
import {getCollection, type CollectionEntry} from "astro:content"

export async function getStaticPaths() {
    const blogs = await getCollection("blogs")
    return blogs.map((blog) => ({
        params: {slug: blog.id},
        props: {blog},
    }))
}

interface Props {
    blog: CollectionEntry<"blogs">
}

export async function GET(context: APIContext) {
    const props = context.props as Props
    const blog = props.blog
    return new Response(blog.body, {
        headers: {
            "Content-Type": "text/markdown; charset=utf-8",
        },
    })
}
