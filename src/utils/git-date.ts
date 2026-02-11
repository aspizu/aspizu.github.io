import {$} from "bun"
import * as datefns from "date-fns"

const cache: Record<string, Date> = {}

export async function gitDate(path: string): Promise<Date> {
    if (path in cache) {
        return cache[path]
    }
    const output =
        (await $`git log -1 --date=iso --format=%cd -- ${path}`.text()).trim() ||
        (await $`date -Iseconds -r ${path}`.text()).trim()
    const date = datefns.parseISO(output)
    cache[path] = date
    return date
}
