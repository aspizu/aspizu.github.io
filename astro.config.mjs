// @ts-check
import gemtext from "astro-gemtext"
import {defineConfig} from "astro/config"

// https://astro.build/config
export default defineConfig({
    site: "https://aspizu.github.io",
    integrations: [gemtext({layout: "/src/layouts/Layout.astro"})],
    prefetch: {
        defaultStrategy: "load",
        prefetchAll: true,
    },
    build: {
        format: "file",
        inlineStylesheets: "always",
    },
})
