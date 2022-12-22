import { getText, html } from './jixen.js'
import { WinMan } from './wm.js'

const winman = new WinMan()

/**
 * @param {string} url
 */
async function loadPage(url, params = {}) {
  if (url == '' || url == '/' || url == '/index.html') {
    return
  }
  let content
  if (url.startsWith('https://')) {
    content = (()=>{let e=document.createElement("win-cont");e.append((()=>{let e=document.createElement("iframe");e.src=url;return e;})());return e;})()
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

const input = (()=>{let e=document.createElement("input");return e;})()
const button = (()=>{let e=document.createElement("button");e.append('load page');e.addEventListener("click",()=>{
  loadPage(input.value)
});return e;})()
const div = (()=>{let e=document.createElement("div");e.append(input);e.append(button);e.classList+=" "+'row';return e;})()

document.body.append(div)

loadPage('/pages/homepage.html')
