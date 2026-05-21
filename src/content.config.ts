import {glob} from "astro/loaders"
import {z} from "astro/zod"
import {defineCollection} from "astro:content"

const blogs = defineCollection({
    loader: glob({pattern: "**/*.{md,mdx}", base: "src/content/blogs"}),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        tweet: z.string().url().optional(),
    }),
})

export const collections = {blogs}
