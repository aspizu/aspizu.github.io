const FPS = 120
const WIDTH = 95
const HEIGHT = 95
const PIXEL = 5
const PADDLE = 5
const FONT = `
 ## 
#  #
#  #
#--#
#  #
#  #
 ## 

  # 
### 
  # 
--#-
  # 
  # 
####

 ## 
#  #
#  #
---#
  # 
 #  
####

 ## 
#  #
   #
-##-
   #
#  #
 ## 

#  #
#  #
#  #
####
   #
   #
   #

####
#   
#   
###-
   #
   #
### 

 ## 
#  #
#   
###-
#  #
#  #
 ## 

####
   #
   #
---#
  # 
 #  
#   

 ### 
#   #
#   #
-###-
#   #
#   #
 ### 

 ### 
#   #
#   #
-####
    #
#   #
 ### 
`
    .slice(1, -1)
    .split("\n")

const canvas = document.createElement("canvas")
document.body.appendChild(canvas)
canvas.width = WIDTH * PIXEL
canvas.height = HEIGHT * PIXEL
const ctx = canvas.getContext("2d")!

function drawPixel(x: number, y: number) {
    ctx.fillRect(Math.round(x) * PIXEL, Math.round(y) * PIXEL, PIXEL, PIXEL)
}

function drawChar(cx: number, cy: number, char: string) {
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 4; x++) {
            if (FONT[parseInt(char) * 8 + y][x] === "#") {
                drawPixel(cx + x, cy + y)
            }
        }
    }
}

function drawText(x: number, y: number, str: string) {
    for (const char of str) {
        drawChar(x, y, char)
        x += 5
    }
}

function calculateTextWidth(str: string) {
    return str.length * 5 - 1
}

function drawDashedColumn(x: number) {
    for (let y = 0; y < HEIGHT; y += 2) {
        drawPixel(x, y)
    }
}

function drawColumn(x: number, y1: number, y2: number) {
    for (let y = y1; y < y2; y++) {
        drawPixel(x, y)
    }
}

let leftScore = 0
let rightScore = 0
let leftY = HEIGHT / 2
let rightY = HEIGHT / 2
let keysDown: Set<string> = new Set()
let ballX = WIDTH / 2
let ballY = HEIGHT / 2
let ballVx = 0
let ballVy = 0
reset()

function reset() {
    ballX = 0
    ballY = 0
    ballVx = Math.max(0.25, Math.random() * 0.5)
    ballVy = Math.random() * 0.5
}

function update() {
    if (keysDown.has("w") && leftY > PADDLE) {
        leftY -= 1
    }
    if (keysDown.has("s") && leftY < HEIGHT - 1 - PADDLE) {
        leftY += 1
    }
    if (keysDown.has("ArrowUp") && rightY > PADDLE) {
        rightY -= 1
    }
    if (keysDown.has("ArrowDown") && rightY < HEIGHT - 1 - PADDLE) {
        rightY += 1
    }
    ballX += ballVx
    if (ballX < 0) {
        rightScore++
        reset()
        return
    }
    if (ballX >= WIDTH) {
        leftScore++
        reset()
        return
    }
    ballY += ballVy
    if (ballY < 0) {
        ballY = 0
        ballVy *= -1
    }
    if (ballY >= HEIGHT) {
        ballY = HEIGHT - 1
        ballVy *= -1
    }
    if (Math.floor(ballX) === 4 && leftY - PADDLE <= ballY && ballY < leftY + PADDLE) {
        ballVx *= -1
        ballX = PADDLE
    }
    if (
        Math.floor(ballX) === WIDTH - 1 - 4 &&
        rightY - PADDLE <= ballY &&
        ballY < rightY + PADDLE
    ) {
        ballVx *= -1
        ballX = WIDTH - 1 - 4 - 1
    }
}

function render() {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, WIDTH * PIXEL, HEIGHT * PIXEL)
    ctx.fillStyle = "white"
    drawText(
        WIDTH / 4 - calculateTextWidth(leftScore.toString()) / 2,
        4,
        leftScore.toString(),
    )
    drawText(
        (3 * WIDTH) / 4 - calculateTextWidth(leftScore.toString()) / 2,
        4,
        rightScore.toString(),
    )
    drawDashedColumn(WIDTH / 2)
    drawColumn(4, leftY - PADDLE, leftY + PADDLE)
    drawColumn(WIDTH - 1 - 4, rightY - PADDLE, rightY + PADDLE)
    drawPixel(ballX, ballY)
}

setInterval(() => {
    update()
    render()
}, 1000 / FPS)

addEventListener("keydown", (ev: KeyboardEvent) => {
    keysDown.add(ev.key)
})

addEventListener("keyup", (ev: KeyboardEvent) => {
    keysDown.delete(ev.key)
})

addEventListener("blur", () => {
    keysDown.clear()
})
