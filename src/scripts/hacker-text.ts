const elements = [...document.querySelectorAll<HTMLElement>(".hackertext")]
const originalTexts = elements.map((el) => el.textContent || "")
const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
const maxLength = Math.max(...originalTexts.map((t) => t.length))
let revealed = 0

const interval = setInterval(() => {
    elements.forEach((el, idx) => {
        const revealedText = originalTexts[idx].slice(0, revealed)
        const glitchCount = originalTexts[idx].length - revealed
        if (glitchCount <= 0) return

        const fragment = document.createDocumentFragment()
        fragment.textContent = revealedText

        for (let i = 0; i < glitchCount; i++) {
            const span = document.createElement("span")
            span.textContent = chars[Math.floor(Math.random() * chars.length)]
            span.style.opacity = `${Math.round(100 * (1 - i / (glitchCount - 1)))}%`
            fragment.appendChild(span)
            fragment.appendChild(document.createElement("wbr"))
        }

        el.replaceChildren(fragment)
    })

    revealed += 2
    if (revealed > maxLength) clearInterval(interval)
}, 66)
