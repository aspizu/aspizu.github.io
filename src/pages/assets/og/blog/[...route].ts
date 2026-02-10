import {OGImageRoute} from "astro-og-canvas"
import {getCollection} from "astro:content"

const blogs = await getCollection("blogs")

// Map the array of content collection entries to create an object.
// Converts [{ id: 'post.md', data: { title: 'Example', description: '' } }]
// to { 'post.md': { title: 'Example', description: '' } }
const pages = Object.fromEntries(blogs.map(({id, data}) => [id, data]))

export const {getStaticPaths, GET} = await OGImageRoute({
    // Tell us the name of your dynamic route segment.
    // In this case it’s `route`, because the file is named `[...route].ts`.
    param: "route",

    pages: pages,

    getImageOptions: (path, page) => ({
        title: page.title,
        description: page.description,
        quality: 100,
        format: "WEBP",
        padding: 128,
        bgImage: {
            path: "src/assets/og-background.png",
            fit: "fill",
            position: "center",
        },
        font: {
            title: {size: 75, families: ["Figtree SemiBold"]},
            description: {
                size: 32,
                families: ["Figtree Medium"],
                color: [192, 192, 192],
            },
        },
        fonts: [300, 400, 500, 600, 700, 800, 900].map(
            (weight) =>
                `https://cdn.jsdelivr.net/fontsource/fonts/figtree@latest/latin-${weight}-normal.ttf`,
        ),
    }),
})
