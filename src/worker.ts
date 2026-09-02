const redirects: Readonly<Record<string, string>> = {
  "/goboscript": "https://github.com/aspizu/goboscript",
  "/goboscript/docs": "/goboscript/docs/install.html",
  "/goboscript.ide": "/goboscript/ide",
  "/tshu": "https://github.com/aspizu/tshu",
  "/tshu/docs": "/tshu/docs/reference/command",
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    const pathname =
      url.pathname.length > 1 && url.pathname.endsWith("/")
        ? url.pathname.slice(0, -1)
        : url.pathname
    const destination = redirects[pathname]

    if (destination === undefined) {
      return env.ASSETS.fetch(request)
    }

    const redirectUrl = new URL(destination, url.origin)
    redirectUrl.search = url.search

    return Response.redirect(redirectUrl.toString(), 308)
  },
} satisfies ExportedHandler<Env>
