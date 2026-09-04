import {execFile} from "node:child_process"
import {stat} from "node:fs/promises"
import {basename, extname, relative, resolve} from "node:path"
import {promisify} from "node:util"

import {glob} from "astro/loaders"
import {z} from "astro/zod"
import {defineCollection} from "astro:content"

const pageFiles = glob({
  base: "./src/content/pages",
  pattern: "**/*.{md,mdx}",
})
const pagesDirectory = resolve("./src/content/pages")

const pages = defineCollection({
  loader: {
    name: "pages-with-last-updated",
    async load(context) {
      await pageFiles.load({
        ...context,
        async parseData({data, filePath, id}) {
          if (!filePath) throw new Error(`Missing file path for page "${id}"`)

          const absolutePath = resolve(filePath)
          const slug = relative(pagesDirectory, absolutePath)
            .replaceAll("\\", "/")
            .replace(/\.(?:md|mdx)$/, "")
            .replace(/(^|\/)index$/, "$1")
            .replace(/\/$/, "")
          const pageDate = data.date
            ? z.coerce.date().parse(data.date)
            : undefined
          const fileName = basename(absolutePath, extname(absolutePath))
          let pageData = {
            description: "",
            title: fileName,
            ...data,
          }

          if (slug.startsWith("weeknotes/")) {
            if (!pageDate) {
              throw new Error(`Missing date for weeknote "${id}"`)
            }

            const dateLabel = new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "long",
              timeZone: "UTC",
              year: "numeric",
            }).format(pageDate)

            pageData = {
              ...data,
              description: "",
              title: `Weeknotes from ${dateLabel}`,
            }
          }

          let updatedAt = pageDate

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
            data: {...pageData, slug, updatedAt},
            filePath,
            id,
          })
        },
      })
    },
  },
  schema: z.object({
    date: z.coerce.date().optional(),
    description: z.string().default(""),
    slug: z.string().optional(),
    title: z.string().default(""),
    updatedAt: z.coerce.date(),
  }),
})

export const collections = {pages}
