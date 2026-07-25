const thumbnailNames = [
    "maxresdefault",
    "sddefault",
    "hqdefault",
    "mqdefault",
    "default",
]

const cache = new Map<string, Promise<string>>()

async function findThumbnail(videoId: string) {
    for (const name of thumbnailNames) {
        const url = `https://img.youtube.com/vi/${videoId}/${name}.jpg`
        const response = await fetch(url, {method: "HEAD"})

        if (response.ok) return url
    }

    throw new Error(`No thumbnail found for YouTube video: ${videoId}`)
}

export function getYouTubeThumbnailUrl(videoId: string) {
    if (!cache.has(videoId)) cache.set(videoId, findThumbnail(videoId))
    return cache.get(videoId)!
}
