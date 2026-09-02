import {execFile} from "node:child_process"
import {stat} from "node:fs/promises"
import {resolve} from "node:path"
import {promisify} from "node:util"

import {glob} from "astro/loaders"
import {z} from "astro/zod"
import {defineCollection} from "astro:content"

const pageFiles = glob({
  base: "./src/content/pages",
  pattern: "**/*.{md,mdx}",
})

const pages = defineCollection({
  loader: {
    name: "pages-with-last-updated",
    async load(context) {
      await pageFiles.load({
        ...context,
        async parseData({data, filePath, id}) {
          if (!filePath) throw new Error(`Missing file path for page "${id}"`)

          const absolutePath = resolve(filePath)
          let updatedAt = data.date
            ? z.coerce.date().parse(data.date)
            : undefined

          if (!updatedAt) {
            try {
              const {stdout} = await promisify(execFile)(
                "git",
                ["log", "-1", "--follow", "--format=%cI", "--", absolutePath],
                {cwd: process.cwd()},
              )
              const commitDate = stdout.trim()

              if (commitDate) updatedAt = new Date(commitDate)
            } catch {
              // Files without Git history fall back to their filesystem modification time.
            }

            updatedAt ??= (await stat(absolutePath)).mtime
          }

          return context.parseData({
            data: {...data, updatedAt},
            filePath,
            id,
          })
        },
      })
    },
  },
  schema: z.object({
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    title: z.string(),
    updatedAt: z.coerce.date(),
  }),
})

export const collections = {pages}
