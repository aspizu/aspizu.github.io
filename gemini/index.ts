import {build} from "./src/build"

process.chdir("./gemini")

const config = {
    gemlog: {
        title: "aspizu's gemlog",
        description: "I write about computer stuff.",
    },
}

await build({
    out: "./dist/",
    base: "gemini://tilde.club",
    dir: "~aspizu",
    ...config,
})

await build({
    out: "../src/pages/",
    base: "",
    ext: ".html",
    ...config,
})
