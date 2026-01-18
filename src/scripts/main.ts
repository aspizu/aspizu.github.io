interface ForestFireConfig {
    width?: number
    height?: number
    cellSize?: number
    forestDensity?: number
    burnProbability?: number
    fps?: number
    initialIgnitions?: number
    blurAmount?: number
}

enum CellState {
    NONFLAMMABLE = 0,
    UNBURNED = 1,
    BURNING = 2,
    BURNED_OUT = 3,
    GROWING = 4,
    GROWTH_FIRE = 5,
}

class ForestFireCA {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private cols: number
    private rows: number
    private world: CellState[]
    private cellSize: number
    private forestDensity: number
    private burnProbability: number
    private fps: number
    private blurAmount: number
    private intervalId: number | null = null

    constructor(config: ForestFireConfig = {}) {
        // Apply defaults
        const {
            width = window.innerWidth,
            height = window.innerHeight,
            cellSize = 5,
            forestDensity = 0.7,
            burnProbability = 0.6,
            fps = 5,
            initialIgnitions = 3,
            blurAmount = 2,
        } = config

        this.cellSize = cellSize
        this.forestDensity = forestDensity
        this.burnProbability = burnProbability
        this.fps = fps
        this.blurAmount = blurAmount

        // Setup canvas
        this.canvas = document.createElement("canvas")
        this.ctx = this.canvas.getContext("2d")!
        this.canvas.width = width
        this.canvas.height = height
        this.canvas.style.position = "fixed"
        this.canvas.style.inset = "0"
        this.canvas.style.display = "block"
        this.canvas.style.zIndex = "-10"
        this.canvas.style.filter = `blur(${blurAmount}px)`
        document.body.appendChild(this.canvas)

        // Calculate grid dimensions
        this.cols = Math.floor(width / cellSize)
        this.rows = Math.floor(height / cellSize)
        this.world = []

        // Initialize world
        this.initialize(initialIgnitions)

        // Handle resize
        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth
            this.canvas.height = window.innerHeight
            this.cols = Math.floor(this.canvas.width / this.cellSize)
            this.rows = Math.floor(this.canvas.height / this.cellSize)
            this.initialize(initialIgnitions)
        })

        // Start simulation
        this.start()
    }

    private initialize(initialIgnitions: number): void {
        this.world = []

        // Create world with forest and nonflammable cells
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const state =
                    Math.random() < this.forestDensity ?
                        CellState.UNBURNED
                    :   CellState.NONFLAMMABLE
                this.world.push(state)
            }
        }

        // Add initial ignition points
        for (let i = 0; i < initialIgnitions; i++) {
            const idx = Math.floor(Math.random() * this.world.length)
            if (this.world[idx] === CellState.UNBURNED) {
                this.world[idx] = CellState.BURNING
            }
        }
    }

    private getIndex(x: number, y: number): number {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return -1
        return x + y * this.cols
    }

    private hasNeighborState(x: number, y: number, state: CellState): boolean {
        const neighbors = [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1],
            [x - 1, y - 1],
            [x + 1, y - 1],
            [x - 1, y + 1],
            [x + 1, y + 1],
        ]

        for (const [nx, ny] of neighbors) {
            const idx = this.getIndex(nx, ny)
            if (idx !== -1 && this.world[idx] === state) {
                return true
            }
        }
        return false
    }

    private update(): void {
        const newWorld = [...this.world]

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const idx = this.getIndex(x, y)
                const state = this.world[idx]

                // Rule 1: Burning -> Burned-out
                if (state === CellState.BURNING) {
                    newWorld[idx] = CellState.BURNED_OUT
                }
                // Rule 2: Growth fire -> Growing
                else if (state === CellState.GROWTH_FIRE) {
                    newWorld[idx] = CellState.GROWING
                }
                // Rule 3: Nonflammable stays nonflammable
                else if (state === CellState.NONFLAMMABLE) {
                    newWorld[idx] = CellState.NONFLAMMABLE
                }
                // Rule 4: Burned-out -> Growing (tree regrowth)
                else if (state === CellState.BURNED_OUT) {
                    if (Math.random() < 0.02) {
                        // 2% chance to start growing
                        newWorld[idx] = CellState.GROWING
                    }
                }
                // Rule 5: Growing -> Unburned (mature tree)
                else if (state === CellState.GROWING) {
                    if (Math.random() < 0.1) {
                        // 10% chance to mature
                        newWorld[idx] = CellState.UNBURNED
                    }
                }
                // Rule 6: Unburned with burning neighbor might catch fire
                else if (state === CellState.UNBURNED) {
                    if (this.hasNeighborState(x, y, CellState.BURNING)) {
                        const randomThreshold = Math.random()
                        if (this.burnProbability >= randomThreshold) {
                            newWorld[idx] = CellState.BURNING
                        }
                    }
                }
                // Rule 7: Growing with growth fire neighbor might catch growth fire
                else if (state === CellState.GROWING) {
                    if (this.hasNeighborState(x, y, CellState.GROWTH_FIRE)) {
                        if (Math.random() < 0.8) {
                            // High probability for growth fire spread
                            newWorld[idx] = CellState.GROWTH_FIRE
                        }
                    }
                }
                // Rule 8: Unburned with growth fire neighbor might catch growth fire
                else if (state === CellState.UNBURNED) {
                    if (this.hasNeighborState(x, y, CellState.GROWTH_FIRE)) {
                        if (Math.random() < 0.3) {
                            // Lower probability for mature trees
                            newWorld[idx] = CellState.GROWTH_FIRE
                        }
                    }
                }
            }
        }

        // Randomly spawn growth fires
        for (let i = 0; i < 3; i++) {
            const idx = Math.floor(Math.random() * this.world.length)
            if (this.world[idx] === CellState.GROWING && Math.random() < 0.01) {
                newWorld[idx] = CellState.GROWTH_FIRE
            }
        }

        // Randomly spawn regular fires
        for (let i = 0; i < 2; i++) {
            const idx = Math.floor(Math.random() * this.world.length)
            if (this.world[idx] === CellState.UNBURNED && Math.random() < 0.005) {
                newWorld[idx] = CellState.BURNING
            }
        }

        this.world = newWorld
    }

    private render(): void {
        this.ctx.fillStyle = "#000"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        const centerX = this.cols / 2
        const centerY = this.rows / 2
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const idx = this.getIndex(x, y)
                const state = this.world[idx]

                // Calculate distance from center and normalize brightness
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
                const brightness = 1 - (distance / maxDistance) * 0.7 // Keep some darkness at edges

                let baseColor = ""
                switch (state) {
                    case CellState.UNBURNED:
                        baseColor = "#808080" // Gray
                        break
                    case CellState.BURNING:
                        baseColor = "#FFFFFF" // White
                        break
                    case CellState.BURNED_OUT:
                        baseColor = "#404040" // Dark gray
                        break
                    case CellState.NONFLAMMABLE:
                        baseColor = "#202020" // Very dark gray
                        break
                    case CellState.GROWING:
                        baseColor = "#606060" // Medium gray - growing trees
                        break
                    case CellState.GROWTH_FIRE:
                        baseColor = "#E0E0E0" // Light gray - growth fires
                        break
                }

                // Parse hex color and apply brightness
                const r = parseInt(baseColor.slice(1, 3), 16)
                const g = parseInt(baseColor.slice(3, 5), 16)
                const b = parseInt(baseColor.slice(5, 7), 16)

                const adjustedR = Math.min(255, Math.floor(r * brightness))
                const adjustedG = Math.min(255, Math.floor(g * brightness))
                const adjustedB = Math.min(255, Math.floor(b * brightness))

                this.ctx.fillStyle = `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`

                this.ctx.fillRect(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize,
                    this.cellSize,
                )
            }
        }
    }

    private step(): void {
        this.update()
        this.render()
    }

    public start(): void {
        if (this.intervalId !== null) return
        this.intervalId = window.setInterval(() => this.step(), 1000 / this.fps)
    }

    public stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    public reset(initialIgnitions: number = 3): void {
        this.initialize(initialIgnitions)
    }

    public setConfig(config: Partial<ForestFireConfig>): void {
        if (config.forestDensity !== undefined) {
            this.forestDensity = config.forestDensity
        }
        if (config.burnProbability !== undefined) {
            this.burnProbability = config.burnProbability
        }
        if (config.fps !== undefined) {
            this.fps = config.fps
            if (this.intervalId !== null) {
                this.stop()
                this.start()
            }
        }
        if (config.cellSize !== undefined) {
            this.cellSize = config.cellSize
            this.cols = Math.floor(this.canvas.width / this.cellSize)
            this.rows = Math.floor(this.canvas.height / this.cellSize)
            this.reset()
        }
        if (config.blurAmount !== undefined) {
            this.blurAmount = config.blurAmount
            this.canvas.style.filter = `blur(${this.blurAmount}px)`
        }
    }
}

// Bootstrap the simulation
const simulation = new ForestFireCA({
    cellSize: 10,
    forestDensity: 0.7,
    burnProbability: 0.7,
    fps: 30,
    initialIgnitions: 10,
    blurAmount: 20,
})
