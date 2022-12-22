class WinTitleBar extends HTMLElement {
  constructor() {
    super()
  }
  define() {
    this.append((()=>{let e=document.createElement("button");e.classList+=" "+'close';e.addEventListener("click",()=>{
        this.win.remove();
      });return e;})())
  }
}

class WinCont extends HTMLElement {
  constructor() {
    super()
  }
}

class WinBox extends HTMLElement {
  constructor() {
    super()
  }

  /**
   * @param {WinMan} titlebar
   * @param {WinTitleBar} winman
   */
  define(titlebar, winman) {
    this.titlebar = titlebar
    this.titlebar.win = this
    this.titlebar.define()
    this.winman = winman
    let mouse_x = 0
    let mouse_y = 0
    let that = this

    function onMouseUp(e) {
      document.onmouseup = null
      document.onmousemove = null
    }

    function onMouseMove(e) {
      const x = mouse_x - e.clientX
      const y = mouse_y - e.clientY
      mouse_x = e.clientX
      mouse_y = e.clientY
      that.style.left = that.offsetLeft - x + 'px'
      that.style.top = that.offsetTop - y + 'px'
    }

    that.titlebar.onmousedown = (e) => {
      e.preventDefault()
      mouse_x = e.clientX
      mouse_y = e.clientY
      document.onmouseup = onMouseUp
      document.onmousemove = onMouseMove
      that.raise()
    }
  }

  raise() {
    this.style['z-index'] = 1
    for (const win of this.winman.wins) {
      if (win != this) {
        win.style['z-index'] = 0
      }
    }
  }

  set x(v) {
    this.style.left = v + 'px'
  }

  set y(v) {
    this.style.top = v + 'px'
  }
}

export class WinMan {
  constructor() {
    this.wins = []
  }

  /**
   * @param {string} title
   */
  newWin(title) {
    const titlebar = (()=>{let e=document.createElement("win-titlebar");e.append((()=>{let e=document.createElement("h1");e.append(title);return e;})());return e;})()
    const win = (()=>{let e=document.createElement("win-box");e.append(titlebar);return e;})()
    win.define(titlebar, this)
    this.wins.push(win)
    document.body.append(win)
    return win
  }
}

customElements.define('win-titlebar', WinTitleBar)
customElements.define('win-cont', WinCont)
customElements.define('win-box', WinBox)
