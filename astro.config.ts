import mdx from "@astrojs/mdx"
import tailwindcss from "@tailwindcss/vite"
import {defineConfig} from "astro/config"

export default defineConfig({
    site: "https://aspiz.uk",
    vite: {plugins: [tailwindcss()]},
    integrations: [mdx()],
    markdown: {
        shikiConfig: {
            theme: "catppuccin-mocha",
        },
    },
})
