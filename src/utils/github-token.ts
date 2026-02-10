import {$} from "bun"

let cachedToken: string | null = null

/**
 * Get GitHub token from environment or gh command.
 * Token is cached after first retrieval to avoid repeated shell executions.
 */
export async function getGitHubToken(): Promise<string | null> {
    if (cachedToken !== null) {
        return cachedToken
    }

    // Try environment variables first
    cachedToken = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN || null

    // If not found, try gh command
    if (!cachedToken) {
        try {
            cachedToken = (await $`gh auth token`.text()).trim()
        } catch (error) {
            console.warn("Could not get GitHub token from gh command")
            cachedToken = null
        }
    }

    return cachedToken
}
