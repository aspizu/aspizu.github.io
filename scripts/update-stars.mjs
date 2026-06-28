import {execFileSync} from "node:child_process"
import {readFile, writeFile} from "node:fs/promises"
import {resolve} from "node:path"

const PROJECTS_FILE = resolve("src/content/projects.json")

function getGitHubToken() {
    if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN

    try {
        return execFileSync("gh", ["auth", "token"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        }).trim()
    } catch {
        return null
    }
}

function getGitHubRepo(repo) {
    const match = repo?.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) return null

    return {
        owner: match[1],
        name: match[2].replace(/\.git$/, ""),
    }
}

async function getStarCount(repo, token) {
    const headers = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "aspiz.uk-update-stars",
    }
    if (token) headers.Authorization = `Bearer ${token}`

    const response = await fetch(
        `https://api.github.com/repos/${repo.owner}/${repo.name}`,
        {headers},
    )

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.stargazers_count
}

const projects = JSON.parse(await readFile(PROJECTS_FILE, "utf8"))
const token = getGitHubToken()

for (const project of projects) {
    const repo = getGitHubRepo(project.repo)
    if (!repo) continue

    try {
        project.stars = await getStarCount(repo, token)
        console.log(`✓ ${project.name}: ${project.stars}`)
    } catch (error) {
        console.warn(`! ${project.name}: keeping ${project.stars ?? 0} (${error.message})`)
    }
}

await writeFile(PROJECTS_FILE, `${JSON.stringify(projects, null, 4)}\n`)
console.log(`\nWrote ${PROJECTS_FILE}`)
