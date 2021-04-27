class Player {
    constructor(x, y, height, width, colour) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.colour = colour;
        this.xv = 0;
        this.yv = 0;
        this.onGround = true;
        this.bottom = null;
        this.top = null;
        this.left = null;
        this.right = null;
        this.doubleJumped = false;
    }

    getBottom() {
        return this.y + this.height;
    }

    getTop() {
        return this.y;
    }
    
    getLeft() {
        return this.x;
    }

    getRight() {
        return this.x + this.width;
    }

    draw() {
        c.beginPath();
        c.rect(this.x, this.y, this.width, this.height);
        c.fillStyle = this.colour;
        c.fill();
        c.stroke();
    }

    update() {
        this.draw();

        if(holdLeft) {
            this.xv = -5;
        }
        if(holdRight) {
            this.xv = 5;
        }

        this.x += this.xv;
        this.y += this.yv;
        this.bottom = this.getBottom();
        this.top = this.getTop();
        this.left = this.getLeft();
        this.right = this.getRight();

        if(this.onGround) {
            this.xv *= 0.8;
        }
        else {
            this.yv += gravity;
        }

        this.onGround = false;
        if(this.x <= 0 || this.x >= canvas.width) {
            this.xv = 0;
            // Will need to set player x position.
        }

        if(this.bottom >= platformY) {
            this.y = platformY - this.height;
            this.yv = 0;
            this.onGround = true;
            this.doubleJumped = false;
        }
    }
}

class Projectile {
    constructor(x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.colour;
        c.fill();
    }

    update() {
        this.draw();
        this.testCollision();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    testCollision = () => {
        if(this.x > player.left && this.x < player.right &&
            this.y > player.top && this.y < player.bottom) {
                console.log("Hit!"); 
                finalScore = score;
                changeGameState();   
            }     
    }
}

class Platform {
    constructor(x, y, height, width, colour) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.colour = colour;
    }

    draw() {
        c.beginPath();
        c.rect(this.x, this.y, this.width, this.height);
        c.fillStyle = this.colour;
        c.fill();
        c.stroke();
    }
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const x = canvas.width / 2;
const y = canvas.height - (canvas.height / 3);
const platformWidth = 1200;
const platformHeight = 400;
const platformX = 0;
const platformY = y + 60;
const gravity = 0.5;
let holdLeft = holdRight = false;

let gameID = null;
let state = "startScreen";
const player = new Player(x, y, 50, 25, 'blue');
const platform = new Platform(platformX, platformY,
    platformHeight, platformWidth, "grey");
const projectiles = [];
let startTime = new Date();
let elapsedTime = null;
let score = null;
let finalScore = null;
const spawnIntervals = [];
let currentLevel = 0;

updateTime = () => {
    elapsedTime = parseInt((new Date() - startTime) / 1000);
}

// Displays the score during gameplay.
drawScore = () => {
    score = parseInt((new Date() - startTime) / 100 * 5);
    c.beginPath();
    c.fillStyle = "black";
    c.font = "16px Roboto";
    c.fillText("Score: " + score, canvas.width - 75, 25);
}

// Displays the final score after getting hit.
drawFinalScore = () => {
    c.beginPath();
    c.textAlign = "center";
    c.fillStyle = "black";

    c.font = "48px Roboto";
    c.fillText("You Scored: " + finalScore, (canvas.width / 2),
    2* (canvas.height / 5));

    c.font = "28px Roboto";
    c.fillText("Press 'Spacebar' to Play Again", (canvas.width / 2),
    2 * (canvas.height / 3))
}

drawStartScreen = () => {
    c.beginPath();
    c.textAlign = "center";
    c.fillStyle = "black";

    c.font = "48px Roboto";
    c.fillText("Dodge the Bullets!", (canvas.width / 2),
    2* (canvas.height / 5));

    c.font = "28px Roboto";
    c.fillText("Press 'Spacebar' to Start", (canvas.width / 2),
    2 * (canvas.height / 3))
}

resetPlayerPos = () => {
    player.x = x;
    player.y = y;
}

resetGame = () => {
    resetPlayerPos();
    score = 0;
    startTime = new Date();
    projectiles.length = 0;
}

// Screen shown after getting hit.
gameOverScreen = () => {
    c.clearRect(0, 0, canvas.width, canvas.height);
    drawFinalScore();
}

// Screen shown after logging in.
startScreen = () => {
    c.clearRect(0, 0, canvas.width, canvas.height);
    drawStartScreen();
}

animate = () => {
    //requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    player.update();
    platform.draw();
    projectiles.forEach(enemy => {
        enemy.update();
    })
    updateTime();
    drawScore();
    spawnProjectiles();
}

spawnProjectiles = () => {    
    if(currentLevel == 0) {
        spawnIntervals.push(spawnLevel1());
        currentLevel = 1;
    }
    
    if(elapsedTime >=10 && elapsedTime < 20) {
        if(currentLevel == 1) {
            clearSpawns();
            spawnIntervals.push(spawnLevel2());
            currentLevel = 2;
        }
    }
    else if(elapsedTime < 30) {
        if(currentLevel == 2) {
            clearSpawns();
            spawnIntervals.push(spawnLevel3());
            currentLevel = 3;
        }
    }
    else if(elapsedTime < 40) {
        if(currentLevel == 3) {
            clearSpawns();
            spawnIntervals.push(spawnLevel4());
            currentLevel = 4;
            console.log("This hit");
        }
    }
}

clearSpawns = () => {
    const spawn = spawnIntervals.pop();
    clearInterval(spawn);
}

spawnLevel1 = () => {
    return setInterval(() => {
        let x = null;
        let y = null;
        let velocity = {x: null, y: 0};
        const radius = 8;
        const colour = "red";

        const spawnSide = Math.floor(Math.random() * 2) + 1;

        if(spawnSide == 1) {
            x = 0;
            velocity.x = 5;
        }
        else {
            x = canvas.width;
            velocity.x = -5;
        }

        y = platform.y - Math.floor(Math.random() * 200);

        projectiles.push(new Projectile(x, y, radius, colour, velocity));
    }, 1000);
}

spawnLevel2 = () => {
    return setInterval(() => {
        let x = null;
        let y = null;
        let velocity = {x: null, y: 0};
        const radius = 8;
        const colour = "red";

        const spawnSide = Math.floor(Math.random() * 2) + 1;

        if(spawnSide == 1) {
            x = 0;
            velocity.x = 6;
        }
        else {
            x = canvas.width;
            velocity.x = -6;
        }

        y = platform.y - Math.floor(Math.random() * 200);

        projectiles.push(new Projectile(x, y, radius, colour, velocity));
    }, 900);
}

spawnLevel3 = () => {
    return setInterval(() => {
        let x = null;
        let y = null;
        let velocity = {x: null, y: 0};
        const radius = 8;
        const colour = "red";

        const spawnSide = Math.floor(Math.random() * 2) + 1;

        if(spawnSide == 1) {
            x = 0;
            velocity.x = 7;
        }
        else {
            x = canvas.width;
            velocity.x = -7;
        }

        y = platform.y - Math.floor(Math.random() * 200);

        projectiles.push(new Projectile(x, y, radius, colour, velocity));
    }, 800);
}

spawnLevel4 = () => {
    return setInterval(() => {
        let x = null;
        let y = null;
        let velocity = {x: null, y: 0};
        const radius = 8;
        const colour = "red";

        const spawnSide = Math.floor(Math.random() * 2) + 1;

        if(spawnSide == 1) {
            x = 0;
            velocity.x = 7;
        }
        else {
            x = canvas.width;
            velocity.x = -7;
        }

        y = platform.y - Math.floor(Math.random() * 200);

        projectiles.push(new Projectile(x, y, radius, colour, velocity));
    }, 650);
}

changeGameState = () => {
    if(state === "startScreen") {
        clearInterval(gameID);
        gameID = setInterval(animate, 1000/60);
        state = "playing";
    }
    else if(state === "playing") {
        clearInterval(gameID);
        gameID = setInterval(gameOverScreen, 1000/60);
        state = "gameEnded";
    }
    else if(state === "gameEnded") {
        clearInterval(gameID);
        resetGame();
        gameID = setInterval(animate, 1000/60);
        state = "playing";
    }
}

/*
gameLoop = () => {
    if(state === "notStarted") {

    }
    if(state === "playing") {
        gameID = setInterval(animate, 1000/60);
    }
    if(state === "gameEnded") {

    }
}
*/

keyDown = (event) => {
    switch(event.keyCode) {
        // Spacebar
        case 32:
            if(state === "startScreen" || state === "gameEnded") {
                changeGameState();
            }
            break;
        // Left arrow key
        case 37:
            holdLeft = true;
            break;
        // Up arrow key
        case 38:
            if(player.onGround) {
                player.yv = -11;
            }
            else {
                if(!player.doubleJumped) {
                    player.yv = -11;
                    player.doubleJumped = true;
                }
            }
            break;
        // Right arrow key
        case 39:
            holdRight = true;
            break;
    }
}

keyUp = (event) => {
    switch(event.keyCode) {
        case 37:
            holdLeft = false;
            break;
        case 38:
            if(player.yv < -3) {
                player.yv = -3;
            }
            break;
        case 39:
            holdRight = false;
            break;
    }
}


window.onload = () => {
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    window.addEventListener('click', (event) => {
        console.log("go");
    })

    gameID = setInterval(startScreen, 1000/60);
}

//animate();