import { getText, html } from './jixen.js'
import { WinMan } from './wm.js'

const winman = new WinMan()

/**
 * @param {string} url
 */
async function loadPage(url, params = {}) {
  if (url.startsWith(location.href)) {
    url = '/' + url.slice(location.href.length)
  }
  if (url == '' || url == '/' || url == '/index.html') {
    return
  }
  let content
  if (url.startsWith('https://')) {
    content = `<win-cont><iframe src={url}></iframe></win-cont>`
  } else {
    content = html('<win-cont>' + (await getText(url)) + '</win-cont>')
  }
  const win = winman.newWin(url)
  for (const link of content.querySelectorAll('a')) {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      loadPage(link.href, {
        x: e.clientX,
        y: e.clientY,
      })
    })
  }
  win.append(content)
  win.raise()
  if (params.x) {
    win.x = params.x
  }
  if (params.y) {
    win.y = params.y
  }
  return win
}

document.title = 'Document Browser'

const input = `<input></input>`
const button = `<button onclick={
  loadPage(input.value)
}>"load page"</button>`
const div = `<div class="row">{input}{button}</div>`

document.body.append(div)

loadPage('/pages/homepage.html')
