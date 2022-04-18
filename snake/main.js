let posX = 0
let posY = 0
let gameStarted = false
let moveSpeed = 50
let length = 3
let currentCords = []
let dead = false;
let localCopy = [];
let moveOneStep = false

let imortal = false;

let offsetX = -10
let offsetY = -10

let timeBetweenMoves = 100

const oposites = {
    "left": "right",
    "right": "left",
    "down": "up",
    "up": "down"
}

let intervals = []

let wallBounds = {
    "yUp": 50,
    "yDown": 400,
    "xLeft": 50,
    "xRight": 400
}

let curDirection = "right"

let appleBounds = {
    "boundX": 450,
    "boundY": 450
}

let apples = []

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function generateApple(amount) {
    let i = 0
    let tries = 0
    const maxTries = 10
    while (i < amount) {
        let x = getRandomInt(0, appleBounds.boundX)
        x = Math.round(x / moveSpeed) * moveSpeed
        let y = getRandomInt(0, appleBounds.boundY)
        y = Math.round(y / moveSpeed) * moveSpeed

        let isValid = true
        for (let index = 0; index < currentCords.length; index++) {
            if (currentCords[index][0] == x && currentCords[index][1] == y) {
                isValid = false
                if (tries != maxTries) {
                    tries++
                } else i++
            }
        }

        if (isValid) {
            apples.push([x, y])
            i++
        } else {
            console.log("Failed to spawn apple")
        }
    }
}

function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}

function move(posXMove, posYMove) {
    localCopy = [];

    for (let i = 0; i < currentCords.length; i++)
        localCopy[i] = currentCords[i].slice();

    localCopy.push([currentCords.at(-1)[0] + posXMove, currentCords.at(-1)[1] + posYMove])
    localCopy.slice(0, 2)

    let cause = ""
    for (let index = 0; index < currentCords.length; index++) {
        if (currentCords[index][0] == localCopy.at(-1)[0]) {
            if (currentCords[index][1] == localCopy.at(-1)[1]) {
                dead = true;
                cause = "INVALID MOVE"
            }
        }
    }

    if (currentCords.at(-1)[0] > wallBounds.xRight && curDirection == "right") {
        dead = true;
        cause = "WALL"
    }
    if (currentCords.at(-1)[0] < wallBounds.xLeft && curDirection == "left") {
        dead = true;
        cause = "WALL"
    }
    if (currentCords.at(-1)[1] < wallBounds.yUp && curDirection == "up") {
        dead = true;
        cause = "WALL"
    }
    if (currentCords.at(-1)[1] > wallBounds.yDown && curDirection == "down") {
        dead = true;
        cause = "WALL"
    }

    if (dead) {
        if (imortal) return dead = false;
        console.log("DEATH");
        return console.log("CAUSE: " + cause);
    }

    currentCords.push([currentCords.at(-1)[0] + posXMove, currentCords.at(-1)[1] + posYMove])

    if (apples.length == 0) generateApple(1)

    let onApple = false
    for (let index = 0; index < apples.length; index++) {
        let x = apples[index][0]
        let y = apples[index][1]
        if (x == currentCords.at(-1)[0] && y == currentCords.at(-1)[1]) {
            onApple = true;
            apples.splice(index, 1)
            generateApple(1)
        }

    }

    if (!onApple) currentCords.splice(0, 1)
    draw()
}

let paused = false

function pause() {
    if (paused) {
        paused = false;
    } else {
        paused = true;
    }
}

function alignPlayerPos() {
    for (let index = 0; index < currentCords.length; index++) {
        currentCords[index][0] = Math.round(currentCords[index][0] / moveSpeed) * moveSpeed
        currentCords[index][1] = Math.round(currentCords[index][1] / moveSpeed) * moveSpeed
    }
}

function fixWall() {
    let canvas = document.getElementById("canvas")

    wallBounds.xRight = canvas.width - moveSpeed * 2
    wallBounds.yDown = canvas.height - moveSpeed * 2
    wallBounds.xLeft = moveSpeed
    wallBounds.yUp = moveSpeed

    appleBounds = {
        "boundX": document.getElementById("canvas").width - moveSpeed,
        "boundY": document.getElementById("canvas").height - moveSpeed
    }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function restart() {
    if (!gameStarted) {
        console.log("Game started!")
        gameStarted = true

        highestLength = 0
        let startPosX = -50
        let startPosY = 200

        startPosX = wallBounds.xRight / 2

        let amount = 0

        currentCords = []

        while (amount < length) {
            amount++
            startPosX = startPosX + moveSpeed
            currentCords.push([startPosX, startPosY])
        }

        apples = []
        dead = false;
        generateApple(1)
        draw()
    }
}

let highestLength = 0

function updateText() {
    if (!dead) {
        if (currentCords.length > highestLength) {
            highestLength = currentCords.length
        }
    } 
    let status = apples.length + " apple(s)<br>";

    status += "Current snake length: " + highestLength + "<br>"

    status += "STATUS: <br>"
    if (paused) {
        status += "PAUSED;<br>"
    }
    if (dead) {
        status += "DEAD;<br>"
    }
    if (imortal) {
        status += "IMORTAL;<br>"
    }


    document.getElementById("status").innerHTML = status
}

async function start() {
    fixWall()

    window.addEventListener("keydown", function keypress(event) {
        if (dead) return;
        switch (event.key) {
            case "ArrowDown":
                restart()
                if (curDirection == oposites.down) break;
                curDirection = "down"
                break;
            case "ArrowUp":
                restart()
                if (curDirection == oposites.up) break;
                curDirection = "up"
                break;
            case "ArrowLeft":
                restart()
                if (curDirection == oposites.left) break;
                curDirection = "left"
                break;
            case "ArrowRight":
                restart()
                if (curDirection == oposites.right) break;
                curDirection = "right"
                break;
            default:
                return;
        }
    });

    draw()
    startInterval()
}

function restartInterval() {
    for (let index = 0; index < intervals.length; index++) {
        clearInterval(intervals[index])
    }
    intervals = []
    startInterval()
}

let oldTime = timeBetweenMoves
let oldMove = moveSpeed

function startInterval() {
    intervals.push(setInterval(() => {
        updateText()
        draw()
        if (!paused || moveOneStep) {
            moveOneStep = false
            if (oldTime !== timeBetweenMoves) {
                oldTime = timeBetweenMoves;
                restartInterval()
            }
            if (oldMove !== moveSpeed) {
                oldMove = moveSpeed;
                fixWall()
                alignPlayerPos()
            }

            if (gameStarted) {
                if (dead) {
                    if (currentCords.length != 1) {
                        currentCords.splice(0, 1)
                    } else { gameStarted = false; dead = false }
                    draw()
                    return;
                }
                switch (curDirection) {
                    case "down":
                        move(0, moveSpeed)
                        break;
                    case "up":
                        move(0, -moveSpeed)
                        break;
                    case "left":
                        move(-moveSpeed, 0)
                        break;
                    case "right":
                        move(moveSpeed, 0)
                        break;
                }
            }
        }
    }, timeBetweenMoves));
}

function deleteTail() {
    if (currentCords.length == 1) return;
    currentCords.splice(-1,1)
}

function toggleImortal() {
    if (imortal) {
        imortal = false
    } else {
        imortal = true
    }
}

function draw() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let index = 0; index < currentCords.length; index++) {
        if (index + 1 == currentCords.length) {
            ctx.fillStyle = 'rgb(0, 200, 0)'
            ctx.fillRect(currentCords[index][0], currentCords[index][1], moveSpeed, moveSpeed);
        } else {
            ctx.fillStyle = 'rgb(200, 0, 0)';
            //ctx.fillStyle = random_rgb()
            ctx.fillRect(currentCords[index][0], currentCords[index][1], moveSpeed, moveSpeed);
        }
        if (dead) {
            if (index < 2) {
                if (currentCords[index] == currentCords.at(-1)) continue;
                ctx.fillStyle = 'rgb(200, 200, 200)';
                ctx.fillRect(currentCords[index][0], currentCords[index][1], moveSpeed, moveSpeed);
            }
        }
    }

    for (let index = 0; index < apples.length; index++) {
        ctx.fillStyle = 'rgb(0, 250, 0)';
        ctx.fillRect(apples[index][0], apples[index][1], moveSpeed, moveSpeed);
    }
}

function random_rgb() {
    var o = Math.round,
        r = Math.random,
        s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')';
}