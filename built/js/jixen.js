/**
 * @param {string} url
 */
export async function getText(url) {
  return await (await fetch(url)).text()
}

/**
 * @param {string} url
 */
export async function getJson(url) {
  return await (await fetch(url)).json()
}

/**
 * @param {string} text
 */
export function html(text) {
  const e = document.createElement('div')
  e.innerHTML = text
  return e.children[0]
}
