import * as Path from "node:path"

export class Pipe<T> {
    constructor(private readonly value: T) {}

    then<U>(fn: (value: T) => U): Pipe<U> {
        return new Pipe(fn(this.value))
    }

    inspect<U>(fn: (value: T) => U): Pipe<U> {
        const value = fn(this.value)
        console.log(value)
        return new Pipe(value)
    }

    get close(): T {
        return this.value
    }
}

export function pipe<T>(value: T) {
    return new Pipe(value)
}

export function bind<T, U extends Function>(object: T, fn: (obj: T) => U): U {
    return fn(object).bind(object)
}
export function isAbsoluteUrl(url: string): boolean {
    try {
        return new URL(url).protocol !== ""
    } catch (e) {
        return false
    }
}

export function windowsToUnixPath(windowsPath: string): string {
    return windowsPath.split(Path.win32.sep).join(Path.posix.sep)
}
