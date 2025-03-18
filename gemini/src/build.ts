import {buildGoboscript} from "./build/goboscript"
import {buildNotionPages} from "./build/notion"
import {buildPages} from "./build/pages"
import {buildPosts} from "./build/posts"

export interface Config {
    out: string
    base: string
    dir?: string
    ext?: string
    gemlog: {
        title: string
        subtitle?: string
        description?: string
    }
}

export async function build(config: Config) {
    return await Promise.all([
        buildPages(config),
        buildPosts(config),
        buildNotionPages(config),
        buildGoboscript(config),
    ])
}
