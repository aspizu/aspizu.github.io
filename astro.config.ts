import {fileURLToPath} from "node:url"

import {unified} from "@astrojs/markdown-remark"
import mdx from "@astrojs/mdx"
import tailwindcss from "@tailwindcss/vite"
import {defineConfig} from "astro/config"

import remarkWikiWords from "./src/utils/remark-wiki-words"

export default defineConfig({
  site: "https://aspiz.uk",
  trailingSlash: "never",
  markdown: {
    processor: unified({
      remarkPlugins: [remarkWikiWords],
      smartypants: false,
    }),
    syntaxHighlight: false,
  },
  integrations: [mdx()],
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "#assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
        "#components": fileURLToPath(
          new URL("./src/components", import.meta.url),
        ),
        "#content": fileURLToPath(new URL("./src/content", import.meta.url)),
        "#pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
        "#styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
        "#utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      },
    },
  },
})
