const hackertexts: {element: HTMLElement; originalText: string}[] = []
for (const text_ of document.querySelectorAll(".hackertext")) {
    const text = text_ as HTMLElement
    const originalText = text.textContent || ""
    hackertexts.push({element: text, originalText})
}

let interval: ReturnType<typeof setInterval> | null = null

let i = 0
const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
function render() {
    for (const {element, originalText} of hackertexts) {
        const length = Math.min(i, originalText.length)
        element.textContent = originalText.slice(0, length)
        for (let i = 0; i < originalText.length - length; i++) {
            const part = chars.charAt(Math.floor(Math.random() * chars.length))
            const node = document.createElement("span")
            node.textContent = part
            const opacity = Math.round(
                100 * (1 - i / Math.max(1, originalText.length - length - 1)),
            )
            node.style.opacity = `${opacity}%`
            element.appendChild(node)
            element.appendChild(document.createElement("wbr"))
        }
    }
    i += 2
    if (
        i >
        hackertexts
            .map((x) => x.originalText.length)
            .reduce((a, b) => Math.max(a, b), 0)
    ) {
        clearInterval(interval!)
    }
}

interval = setInterval(render, 66)
