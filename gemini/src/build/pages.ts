import * as FS from "node:fs/promises"
import * as Path from "node:path"
import type {Config} from "../build"
import type {Document} from "../gemini"
import {
    parseDocument,
    renderDocumentToGemtext,
    transformLinksToAbsolute,
} from "../gemini"
import {pipe} from "../misc"

export async function buildPages(config: Config) {
    const paths = await Array.fromAsync(new Bun.Glob("**/*.gmi").scan({cwd: "./pages"}))
    if (!(await FS.exists(config.out))) {
        await FS.mkdir(config.out, {recursive: true})
    }
    for (const path of paths) {
        const document = await parseDocument(Path.join("./pages", path))
        const text = pipe(document)
            .then((doc: Document) =>
                transformLinksToAbsolute(doc, {
                    base: config.base,
                    root: "./pages",
                    dir: config.dir,
                    ext: config.ext,
                }),
            )
            .then(renderDocumentToGemtext).close
        const outPath = Path.join(config.out, path)
        if (!(await FS.exists(Path.dirname(outPath)))) {
            await FS.mkdir(Path.dirname(outPath), {recursive: true})
        }
        await FS.writeFile(outPath, text)
    }
}
