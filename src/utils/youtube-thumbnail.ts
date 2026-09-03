const thumbnailNames = [
  "maxresdefault",
  "sddefault",
  "hqdefault",
  "mqdefault",
  "default",
]

const cache = new Map<string, Promise<string>>()

async function findThumbnail(videoId: string, index = 0): Promise<string> {
  const name = thumbnailNames[index]

  if (!name) {
    throw new Error(`No thumbnail found for YouTube video: ${videoId}`)
  }

  const url = `https://img.youtube.com/vi/${videoId}/${name}.jpg`

  if ((await fetch(url, {method: "HEAD"})).ok) return url

  return findThumbnail(videoId, index + 1)
}

export function getYouTubeThumbnailUrl(videoId: string) {
  if (!cache.has(videoId)) cache.set(videoId, findThumbnail(videoId))
  return cache.get(videoId)!
}
