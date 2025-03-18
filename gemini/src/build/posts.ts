import * as FS from "node:fs/promises"
import * as Path from "node:path"
import type {Config} from "../build"
import {
    parseDocument,
    renderDocumentToGemtext,
    transformLinksToAbsolute,
    type Document,
} from "../gemini"
import {pipe, windowsToUnixPath} from "../misc"

export async function buildPosts(config: Config) {
    const paths = await Array.fromAsync(new Bun.Glob("*.gmi").scan({cwd: "./posts"}))
    if (!(await FS.exists(Path.join(config.out, "posts")))) {
        await FS.mkdir(Path.join(config.out, "posts"), {recursive: true})
    }
    const posts: Document[] = []
    for (const path of paths) {
        const document = await parseDocument(Path.join("./posts", path))
        posts.push(document)
        const text = pipe(document)
            .then((doc: Document) =>
                transformLinksToAbsolute(doc, {
                    base: config.base,
                    root: "./posts",
                    dir: config.dir,
                    ext: config.ext,
                }),
            )
            .then(renderDocumentToGemtext).close
        const outPath = Path.join(config.out, "posts", path)
        if (!(await FS.exists(Path.dirname(outPath)))) {
            await FS.mkdir(Path.dirname(outPath), {recursive: true})
        }
        await FS.writeFile(outPath, text)
    }
    const postsList = posts
        .map(
            (post) =>
                `=> ${config.base}${config.dir ? `/${config.dir}` : ""}/${windowsToUnixPath(post.path).replace(/\.gmi$/, config.ext ?? ".gmi")} ${post.frontmatter?.date} - ${post.title}\n`,
        )
        .join("")
    await FS.writeFile(
        Path.join(config.out, "posts/index.gmi"),
        `# ${config.gemlog.title}\n${config.gemlog.subtitle ? `\n## ${config.gemlog.subtitle}\n` : ""}${config.gemlog.description ? `\n${config.gemlog.description}\n` : ""}\n\n### Posts\n${postsList}`,
    )
}
