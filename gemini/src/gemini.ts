import * as Path from "node:path"
import {isAbsoluteUrl, pipe, windowsToUnixPath} from "./misc"

export interface Document {
    path: string
    title?: string
    frontmatter: Frontmatter
    elements: Element[]
}

export type Frontmatter = Record<string, string>

export type Element = Text | Link | Heading | List | Blockquote | Preformatted

export interface Text {
    kind: "text"
    text: string
}

export interface Link {
    kind: "link"
    url: string
    text: string
}

export interface Heading {
    kind: "heading"
    level: 1 | 2 | 3
    text: string
}

export interface List {
    kind: "list"
    text: string
}

export interface Blockquote {
    kind: "blockquote"
    text: string
}

export interface Preformatted {
    kind: "preformatted"
    alt: string
    text: string
}

enum Mode {
    Frontmatter,
    Normal,
    Preformatted,
}

export async function parseDocument(path: string): Promise<Document> {
    let mode: Mode = Mode.Normal
    const text = await Bun.file(path).text()
    const lines = text.split(/\r?\n/)
    const elements: Element[] = []
    const frontmatter: Frontmatter = {}
    let alt = ""
    let buffer = ""
    if (lines[0].startsWith("---")) {
        mode = Mode.Frontmatter
        lines.shift()
    }
    let title: string | undefined
    for (const line of lines) {
        switch (mode) {
            case Mode.Frontmatter:
                if (line.startsWith("---")) {
                    mode = Mode.Normal
                    break
                }
                const [key, value] = /(.*?):\s*(.*)$/.exec(line)?.slice(1) ?? ["", ""]
                if (key === "") break
                frontmatter[key] = value
                break
            case Mode.Normal:
                if (line.startsWith("###")) {
                    elements.push({
                        kind: "heading",
                        level: 3,
                        text: line.slice("###".length),
                    })
                    break
                }
                if (line.startsWith("##")) {
                    elements.push({
                        kind: "heading",
                        level: 2,
                        text: line.slice("##".length),
                    })
                    break
                }
                if (line.startsWith("#")) {
                    if (!title) {
                        title = line.slice("#".length).trimStart()
                    }
                    elements.push({
                        kind: "heading",
                        level: 1,
                        text: line.slice("#".length),
                    })
                    break
                }
                if (line.startsWith(">")) {
                    elements.push({
                        kind: "blockquote",
                        text: line.slice(">".length),
                    })
                    break
                }
                if (line.startsWith("* ")) {
                    elements.push({
                        kind: "list",
                        text: line.slice("* ".length),
                    })
                    break
                }
                if (line.startsWith("=>")) {
                    const [url, text] = /=>\s*(.*?)\s+(.*)$/.exec(line)?.slice(1) ?? [
                        "",
                        "",
                    ]
                    elements.push({
                        kind: "link",
                        url,
                        text,
                    })
                    break
                }
                if (line.startsWith("```")) {
                    mode = Mode.Preformatted
                    alt = line.slice("```".length)
                    buffer = ""
                    break
                }
                elements.push({
                    kind: "text",
                    text: line,
                })
                break
            case Mode.Preformatted:
                if (line.startsWith("```")) {
                    elements.push({
                        kind: "preformatted",
                        alt,
                        text: buffer,
                    })
                    mode = Mode.Normal
                    break
                }
                buffer += line + "\n"
                break
            default:
                mode satisfies never
        }
    }
    return {path, title, frontmatter, elements}
}

export function renderDocumentToGemtext(doc: Document): string {
    return doc.elements
        .map((element) => {
            switch (element.kind) {
                case "text":
                    return element.text
                case "link":
                    return `=> ${element.url} ${element.text}`
                case "heading":
                    return "#".repeat(element.level) + element.text
                case "list":
                    return "* " + element.text
                case "blockquote":
                    return "> " + element.text
                case "preformatted":
                    return `\`\`\`${element.alt}\n${element.text}\n\`\`\``
                default:
                    return element satisfies never
            }
        })
        .join("\n")
}

export function renderDocumentToMarkdown(
    doc: Document,
    {renderImageLinksAsImages = false} = {},
): string {
    return doc.elements
        .map((element) => {
            switch (element.kind) {
                case "text":
                    return element.text
                case "link":
                    if (
                        renderImageLinksAsImages &&
                        /\.(png|jpg|jpeg|gif|webp)$/.test(element.url)
                    ) {
                        return `![${element.text}](${element.url})`
                    }
                    return `[${element.text}](${element.url})`
                case "heading":
                    return "#".repeat(element.level) + " " + element.text
                case "list":
                    return "* " + element.text
                case "blockquote":
                    return "> " + element.text
                case "preformatted":
                    return `\`\`\`\n${element.text}\n\`\`\``
                default:
                    return element satisfies never
            }
        })
        .join("\n\n")
}

export function transformLinksToAbsolute(
    doc: Document,
    {
        base,
        root,
        dir = "",
        ext = ".gmi",
    }: {base: string; root: string; dir?: string; ext?: string},
): Document {
    return {
        ...doc,
        elements: doc.elements.map((element) => {
            if (element.kind === "link") {
                if (isAbsoluteUrl(element.url)) {
                    return element
                }
                if (element.url.endsWith(".gmi")) {
                    element.url = element.url.slice(0, -".gmi".length) + ext
                }
                return {
                    ...element,
                    url: pipe(Path.posix.relative(root, windowsToUnixPath(doc.path)))
                        .then(Path.posix.dirname)
                        .then(($) => Path.posix.join($, element.url))
                        .then(($) => Path.posix.join(dir, $))
                        .then(($) => (base === "" ? $ : new URL($, base).href)).close,
                }
            }
            return element
        }),
    }
}
