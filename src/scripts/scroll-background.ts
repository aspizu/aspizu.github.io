function setBgColor() {
    const maxScroll = document.body.scrollHeight - window.innerHeight
    const gradientHeight = 128

    // Calculate how far into the gradient zone we are
    const distanceFromBottom = maxScroll - window.scrollY
    const scrollPercent = Math.max(
        0,
        Math.min(1, 1 - distanceFromBottom / gradientHeight),
    )

    // Interpolate from black (0,0,0) to red (141,48,48)
    const r = Math.round(141 * scrollPercent)
    const g = Math.round(48 * scrollPercent)
    const b = Math.round(48 * scrollPercent)

    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
}
window.addEventListener("scroll", setBgColor)
