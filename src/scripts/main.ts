type Rect = {x: number; y: number; w: number; h: number}
const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")!
const mouse = {x: 0, y: 0, down: false}
let rects: Rect[] = []
let time = 0

function setup() {
    rects.length = 0
    const s = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height)
    rects.push({x: -s / 2, y: -s / 2, w: s, h: s})
    for (let i = 0; i < 10; i++) {
        rects = randomlySubdivide(rects, 0.5, 0.75, 40)
    }
}

function update() {
    rects = randomlySubdivide(rects, 0.5, 0.75, 40)
    rects = randomlyDelete(rects, 0.01, 200)
}

function render() {
    ctx.resetTransform()
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(Math.PI / 4)
    const dx = 0
    const dy = 0
    for (const rect of rects) {
        ctx.fillStyle = "#000"
        ctx.fillRect(rect.x + dx, rect.y + dy, rect.w, rect.h)
        drawRightTriangle(ctx, rect.x + dx, rect.y + dy, 5, rect.h, "top-left", "#222")
        drawRightTriangle(
            ctx,
            rect.x + dx + rect.w,
            rect.y + dy + rect.h,
            5,
            rect.h,
            "bottom-right",
            "#111",
        )
        ctx.strokeStyle = "gray"
        ctx.strokeRect(rect.x + dx, rect.y + dy, rect.w, rect.h)
    }
}

function subdivideRect(rect: Rect, d: number): [Rect, Rect] {
    if (rect.w > rect.h) {
        const w1 = Math.floor(rect.w * d)
        const w2 = rect.w - w1
        return [
            {x: rect.x, y: rect.y, w: w1, h: rect.h},
            {x: rect.x + w1, y: rect.y, w: w2, h: rect.h},
        ]
    } else {
        const h1 = Math.floor(rect.h * d)
        const h2 = rect.h - h1
        return [
            {x: rect.x, y: rect.y, w: rect.w, h: h1},
            {x: rect.x, y: rect.y + h1, w: rect.w, h: h2},
        ]
    }
}

function randomlySubdivide(rects: Rect[], p: number, d: number, minSize: number) {
    const newRects = []
    for (const rect of rects) {
        const touching = isRectangleCircleColliding(rect, {
            x: mouse.x,
            y: mouse.y,
            radius: 50,
        })
        const size = Math.sqrt(rect.w * rect.w + rect.h * rect.h)
        if (Math.random() < p && size > minSize && touching) {
            const D = 0.5 + (Math.random() - 0.5) * d
            newRects.push(...subdivideRect(rect, D))
        } else {
            newRects.push(rect)
        }
    }
    return newRects
}

function randomlyDelete(rects: Rect[], p: number, maxSize: number) {
    const newRects = []
    for (const rect of rects) {
        const touching = isRectangleCircleColliding(rect, {
            x: mouse.x,
            y: mouse.y,
            radius: 50,
        })
        const size = Math.sqrt(rect.w * rect.w + rect.h * rect.h)
        if (touching && size < maxSize && Math.random() < p) {
        } else {
            newRects.push(rect)
        }
    }
    return newRects
}

function initializeCanvas() {
    document.body.append(canvas)
    canvas.style.position = "fixed"
    canvas.style.inset = "0"
    canvas.style.zIndex = "-1"
    canvas.style.pointerEvents = "none"
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        setup()
    })
}

function initializeMouse() {
    window.addEventListener("mousedown", () => {
        mouse.down = true
    })
    window.addEventListener("mouseup", () => {
        mouse.down = true
    })
    window.addEventListener("focusout", () => {
        mouse.down = false
    })
    window.addEventListener("mousemove", (event) => {
        const rawX = event.clientX - canvas.width / 2
        const rawY = event.clientY - canvas.height / 2

        // Rotate by 45 degrees (π/4 radians)
        const angle = -Math.PI / 4 // 45 degrees in radians
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        mouse.x = rawX * cos - rawY * sin
        mouse.y = rawX * sin + rawY * cos
    })
}

function beginGameloop() {
    const MAX_FPS = 30
    const FRAME_INTERVAL_MS = 1000 / MAX_FPS
    let previousTimeMs = 0

    function gameloop() {
        requestAnimationFrame((currentTimeMs) => {
            const deltaTimeMs = currentTimeMs - previousTimeMs
            if (deltaTimeMs >= FRAME_INTERVAL_MS) {
                update()
                time++
                previousTimeMs = currentTimeMs - (deltaTimeMs % FRAME_INTERVAL_MS)
            }
            render()
            gameloop()
        })
    }

    gameloop()
}

function dist(x1: number, y1: number, x2: number, y2: number) {
    const x = x2 - x1
    const y = y2 - y1
    return Math.sqrt(x * x + y * y)
}
interface Circle {
    x: number // center x coordinate
    y: number // center y coordinate
    radius: number
}
function isRectangleCircleColliding(rect: Rect, circle: Circle): boolean {
    // Find the closest point on the rectangle to the circle's center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w))
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h))

    // Calculate the distance between the circle's center and this closest point
    const distanceX = circle.x - closestX
    const distanceY = circle.y - closestY

    // If the distance is less than the circle's radius, they're colliding
    const distanceSquared = distanceX * distanceX + distanceY * distanceY

    return distanceSquared < circle.radius * circle.radius
}

type TriangleDirection = "top-left" | "top-right" | "bottom-left" | "bottom-right"

function drawRightTriangle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    direction: TriangleDirection = "bottom-left",
    fillColor?: string,
    strokeColor?: string,
) {
    ctx.beginPath()

    switch (direction) {
        case "bottom-left":
            // Right angle at bottom-left
            ctx.moveTo(x, y)
            ctx.lineTo(x, y - height)
            ctx.lineTo(x + width, y)
            break

        case "bottom-right":
            // Right angle at bottom-right
            ctx.moveTo(x, y)
            ctx.lineTo(x - width, y)
            ctx.lineTo(x, y - height)
            break

        case "top-left":
            // Right angle at top-left
            ctx.moveTo(x, y)
            ctx.lineTo(x + width, y)
            ctx.lineTo(x, y + height)
            break

        case "top-right":
            // Right angle at top-right
            ctx.moveTo(x, y)
            ctx.lineTo(x, y + height)
            ctx.lineTo(x - width, y)
            break
    }

    ctx.closePath()

    // Fill if color provided
    if (fillColor) {
        ctx.fillStyle = fillColor
        ctx.fill()
    }

    // Stroke if color provided
    if (strokeColor) {
        ctx.strokeStyle = strokeColor
        ctx.stroke()
    }
}

initializeCanvas()
initializeMouse()
setup()
beginGameloop()
