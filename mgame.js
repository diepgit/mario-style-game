//Create Player
class Player {
    constructor(game) {
        this.game = game
        this.width = 100
        this.height = 91.3
        this.x = 0
        this.y = this.game.height - this.height
        this.vy = 0
        this.weight = 1
        this.image = document.getElementById("player")
        this.frameX = 0
        this.frameY = 0
        this.maxFrame
        this.fps = 20 //fps = frame per second
        this.frameInterval = 1000/this.fps
        this.frameTimer = 0
        this.speed = 0
        this.maxSpeed = 10
        this.states = [new Sitting(this), new Running(this), new Jumping(this), new Falling(this)]
        this.currentState = this.states[0]
        this.currentState.enter()
    }

    update(input, deltaTime) {
        this.currentState.handleInput(input)

        //Horizontal movement
        this.x += this.speed
        if (input.includes("ArrowRight")) this.speed = this.maxSpeed
        else if (input.includes("ArrowLeft")) this.speed = -this.maxSpeed
        else this.speed = 0

        //Avoid sprite going off the screen horizontally
        if (this.x < 0) this.x = 0
        if (this.x > this.game.width - this.width) this.x = this.game.width - this.width

        //Vertical movement
        //if (input.includes("ArrowUp") && this.onGround()) this.vy -= 30
        this.y += this.vy
        if(!this.onGround()) this.vy += this.weight
        else this.vy = 0

        //Sprite animation
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0
            if (this.frameX < this.maxFrame) this.frameX++
            else this.frameX = 0
        } else {
            this.frameTimer += deltaTime
        }
    }

    draw(context) {
        context.drawImage(this.image, this.frameX*this.width, this.frameY*this.height, 
                    this.width, this.height, this.x, this.y, this.width, this.height)
    }

    onGround() {
        return this.y >= this.game.height - this.height
    }

    setState(state) {
        this.currentState = this.states[state]
        this.currentState.enter()
    }
}

//
//Control Player movement and input
class InputHandler {
    constructor() {
        this.keys = []
        window.addEventListener("keydown", e => {
            
            if ((e.key === "ArrowDown" || 
                 e.key === "ArrowUp" || 
                 e.key === "ArrowLeft" || 
                 e.key === "ArrowRight" || 
                 e.key === "a") && this.keys.indexOf(e.key) === -1) {
                 this.keys.push(e.key)
            }
            //console.log(e.key, this.keys)
        })
        window.addEventListener("keyup", e => {
            if (e.key === "ArrowDown" || 
                e.key === "ArrowUp" || 
                e.key === "ArrowLeft" || 
                e.key === "ArrowRight" || 
                e.key === "a") {
                this.keys.splice(this.keys.indexOf(e.key), 1)
            }
        }) 
    }
}

//
//Manage Player states
const states = {
    SITTING: 0,
    RUNNING: 1,
    JUMPING: 2,
    FALLING: 3
}

class State {
    constructor(state) {
        this.state = state
    }
}

class Sitting extends State {
    constructor(player) {
        super("SITTING")
        this.player = player
    }
    enter(){
        this.player.frameX = 0
        this.player.maxFrame = 4
        this.player.frameY = 5
    }

    handleInput(input){
        if (input.includes("ArrowLeft") || input.includes("ArrowRight")) {
            this.player.setState(states.RUNNING)
        }
    }
}

class Running extends State {
    constructor(player) {
        super("RUNNING")
        this.player = player
    }
    enter(){
        this.player.frameX = 0
        this.player.maxFrame = 8
        this.player.frameY = 3 //4th line on the asset sheet (index counted from 0)
    }

    handleInput(input){
        if (input.includes("ArrowDown")) {
            this.player.setState(states.SITTING)
        } else if (input.includes("ArrowUp")) {
            this.player.setState(states.JUMPING)
        }
    }
}

class Jumping extends State {
    constructor(player) {
        super("JUMPING")
        this.player = player
    }
    enter(){
        if (this.player.onGround()) this.player.vy -= 24
        this.player.frameX = 0
        this.player.maxFrame = 6
        this.player.frameY = 1
    }

    handleInput(input){
        if (this.player.vy > this.player.weight) {
            this.player.setState(states.FALLING)
        }
    }
}

class Falling extends State {
    constructor(player) {
        super("FALLING")
        this.player = player
    }
    enter(){
        this.player.frameX = 0
        this.player.maxFrame = 6
        this.player.frameY = 2
    }

    handleInput(input){
        if (this.player.onGround()) {
            this.player.setState(states.RUNNING)
        }
    }
}


//
//Start
window.addEventListener("load", function() {
    const canvas = document.getElementById("canvas1")
    const ctx = canvas.getContext("2d")
    canvas.width = 500
    canvas.height = 500
    class Game {
        constructor(width,height) {
            this.width = width
            this.height = height
            this.player = new Player(this)
            this.input = new InputHandler()
        }

        update(deltaTime) {
            this.player.update(this.input.keys, deltaTime)
        }

        draw(context) {
            this.player.draw(context)
        }
    }

    const game = new Game(canvas.width, canvas.height)
    console.log(game)
    let lastTime = 0


    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.update(deltaTime)
        game.draw(ctx)
        requestAnimationFrame(animate)
    }
    animate(0)
})

//7:55:07 Create margin/ground