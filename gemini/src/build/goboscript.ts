import {$} from "bun"
import * as FS from "node:fs/promises"
import * as Path from "node:path"
import type {Config} from "../build"
import {
    parseDocument,
    renderDocumentToGemtext,
    transformLinksToAbsolute,
} from "../gemini"
import {pipe, windowsToUnixPath} from "../misc"

function generateGemtextTOC(title: string, paths: string[], config: Config) {
    const toc = [`# ${title}\n`]

    // Group paths by directory, normalizing and replacing dashes
    const groups = Object.groupBy(paths, (path) => {
        const parts = path.replace(/\\/g, "/").split("/")
        parts.pop() // Remove the filename
        return parts.join("/").replace(/-/g, " ")
    })

    // Iterate over each group
    for (const dir in groups) {
        // Print header only if directory is non-empty (files in root are not preceded by a header)
        if (dir) {
            toc.push(`\n## ${dir}\n`)
        }

        // Iterate over all files in this directory
        for (const path of groups[dir]!) {
            const parts = path.replace(/\\/g, "/").split("/")
            const filename = parts.pop()!
            const title = filename.replace(/\.md$/, "").replace(/-/g, " ")
            toc.push(
                `=> ${config.base}${config.dir ? `/${config.dir}` : ""}/${windowsToUnixPath(path)} ${title}\n`,
            )
        }
    }

    return toc.join("\n")
}

/** Builds the goboscript documentation mirror for gemini output. */
export async function buildGoboscript(config: Config) {
    // Don't build goboscript documentation for html output, it already exists.
    if (config.ext === ".html") {
        return
    }
    await $`cd goboscript && git pull`
    const paths = await Array.fromAsync(
        new Bun.Glob("**/*.md").scan({cwd: "./goboscript/docs"}),
    )
    const outDir = Path.join(config.out, "goboscript")

    for (const path of paths) {
        const absolutePath = Path.join("./goboscript/docs", path)
        await $`md2gemini --write --md-links --ascii-table ${absolutePath}`
        const geminiPath = Path.basename(absolutePath).replace(/\.md$/, ".gmi")
        const document = pipe(await parseDocument(geminiPath))
            .then((doc) => {
                doc.path = absolutePath.replace(/\.md$/, ".gmi")
                return doc
            })
            .then((doc) =>
                transformLinksToAbsolute(doc, {
                    root: "./goboscript/docs",
                    base: config.base,
                    dir: config.dir && Path.posix.join(config.dir, "goboscript"),
                    ext: config.ext,
                }),
            ).close
        const text = renderDocumentToGemtext(document)
        const outPath = Path.join(outDir, path.replace(/\.md$/, ".gmi"))
        if (!(await FS.exists(Path.dirname(outPath)))) {
            await FS.mkdir(Path.dirname(outPath), {recursive: true})
        }
        await FS.writeFile(outPath, text)
        await $`rm ${geminiPath}`
    }
    await FS.writeFile(
        Path.join(outDir, "index.gmi"),
        generateGemtextTOC(
            "goboscript Documentation",
            paths.map((path) => path.replace(/\.md$/, ".gmi")),
            {
                ...config,
                dir: config.dir ? Path.posix.join(config.dir, "goboscript") : undefined,
            },
        ),
    )
}
