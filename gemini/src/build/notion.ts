import {Client} from "@notionhq/client"
import type {PageObjectResponse} from "@notionhq/client/build/src/api-endpoints"
import assert from "assert"
import * as FS from "node:fs/promises"
import * as Path from "node:path"
import type {Config} from "../build"

export async function buildNotionPages(config: Config) {
    const notion = new Client({
        auth: process.env.NOTION_TOKEN,
    })
    const projectIdeas = await notion.databases.query({
        database_id: "1b64601328b1804db43fe1da87606830",
    })
    const text = projectIdeas.results
        .map((_page) => {
            const page = _page as PageObjectResponse
            assert(page.properties.Idea.type === "title")
            assert(page.properties.Scope.type === "multi_select")
            const scopes = page.properties.Scope.multi_select
                .map((scope) => scope.name)
                .join(", ")
            return `### ${page.properties.Idea.title[0].plain_text}\n> ${scopes}\n`
        })
        .join("\n")
    await FS.writeFile(
        Path.join(config.out, "project-ideas.gmi"),
        `# Project Ideas\n\n${text}`,
    )
}
