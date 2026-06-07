import {readdirSync, writeFileSync} from "fs"
import {execSync} from "child_process"
import {join, resolve} from "path"

const BLOG_DIR = resolve("src/content/blogs")
const DATES_FILE = resolve("src/content/dates.json")

const files = readdirSync(BLOG_DIR).filter(
    (f) => f.endsWith(".md") || f.endsWith(".mdx"),
)

const dates = {}

for (const file of files) {
    const filePath = join(BLOG_DIR, file)
    const id = file.replace(/\.(md|mdx)$/, "")

    let dateStr
    try {
        dateStr = execSync(
            `git log -1 --date=iso-strict --format=%cd -- "${filePath}"`,
            {encoding: "utf-8"},
        ).trim()
    } catch {}

    if (!dateStr) {
        dateStr = execSync(`date -Iseconds -r "${filePath}"`, {
            encoding: "utf-8",
        }).trim()
    }

    dates[id] = dateStr
    console.log(`✓ ${file} → ${dateStr}`)
}

writeFileSync(DATES_FILE, JSON.stringify(dates, null, 4) + "\n")
console.log(`\nWrote ${DATES_FILE}`)
