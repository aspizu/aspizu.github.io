import {execSync} from "child_process"

let cachedToken: string | null = null

/**
 * Get GitHub token from environment or gh command.
 * Token is cached after first retrieval to avoid repeated shell executions.
 */
export function getGitHubToken(): string | null {
    if (cachedToken !== null) {
        return cachedToken
    }

    // Try environment variables first
    cachedToken = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN || null

    // If not found, try gh command
    if (!cachedToken) {
        try {
            cachedToken = execSync("gh auth token", {encoding: "utf-8"}).trim()
        } catch (error) {
            console.warn("Could not get GitHub token from gh command")
            cachedToken = null
        }
    }

    return cachedToken
}
