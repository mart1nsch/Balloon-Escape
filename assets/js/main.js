class Entity {
    constructor(width, height, posX = 0, posY = 0) {
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.containerElement = document.querySelector(`.container`);
        this.upPressed = false;
        this.downPressed = false;
        this.leftPressed = false;
        this.rightPressed = false;
        this.element;

        this.keyEntry();
    }

    keyEntry() {
        document.addEventListener(`keydown`, e => {
            if (e.key === `ArrowUp`) {
                this.upPressed = true;
            } else if (e.key === `ArrowDown`) {
                this.downPressed = true;
            } else if (e.key === `ArrowLeft`) {
                this.leftPressed = true;
            } else if (e.key === `ArrowRight`) {
                this.rightPressed = true;
            }
        });

        document.addEventListener(`keyup`, e => {
            if (e.key === `ArrowUp`) {
                this.upPressed = false;
            } else if (e.key === `ArrowDown`) {
                this.downPressed = false;
            } else if (e.key === `ArrowLeft`) {
                this.leftPressed = false;
            } else if (e.key === `ArrowRight`) {
                this.rightPressed = false;
            }
        });
    }
}

class Player extends Entity {
    constructor(width, height) {
        super(width, height, random(0, (window.innerWidth - width)), random(0, (window.innerHeight - height)));

        this.endGame = false;

        this.speedX = 0;
        this.speedY = 0;
        this.aceleration = 0.7;
        this.friction = 0.03;
        this.maxSpeed = 6;
        this.gravity = 0.1;
        this.contadorFace = 0;
        this.img = random(1, 15);
        this.degreeIncreaser = 1.5;
        this.maxDegree = 30;
        this.degrees = 0;
        this.element;

        this.createPlayer();
    }

    createPlayer() {
        const player = document.createElement(`div`);
        player.classList.add(`player`);
        player.style.width = `${this.width}px`;
        player.style.height = `${this.height}px`;
        player.style.top = `${this.posY}px`;
        player.style.left = `${this.posX}px`;
        this.containerElement.appendChild(player);

        this.element = player;

        this.contadorFace++;

        if (this.contadorFace >= 300) {
            this.contadorFace = 0;
            this.img = random(1, 14);
        }

        const imgPlayer = document.createElement(`img`);
        imgPlayer.classList.add(`player-img`);
        imgPlayer.src = `../assets/img/balloon/${this.img}.png`;
        player.appendChild(imgPlayer);
    }

    update() {
        if (this.upPressed) this.speedY -= this.aceleration;
        if (this.downPressed) this.speedY += this.aceleration;
        if (this.leftPressed) this.speedX -= this.aceleration;
        if (this.rightPressed) this.speedX += this.aceleration;

        this.speedX = Math.max(-this.maxSpeed, Math.min(this.speedX, this.maxSpeed));
        this.speedY = Math.max(-this.maxSpeed, Math.min(this.speedY, this.maxSpeed));

        this.speedY += this.gravity;

        if (!this.upPressed && !this.downPressed) this.speedY *= 1 - this.friction;
        if (!this.leftPressed && !this.rightPressed) this.speedX *= 1 - this.friction;

        this.posX += this.speedX;
        this.posY += this.speedY;
    }

    rebuild() {
        this.createPlayer();
        this.validPosition();
        this.calculateRotate();
    }

    calculateRotate() {
        if (this.leftPressed) this.degrees -= this.degreeIncreaser;
        if (this.rightPressed) this.degrees += this.degreeIncreaser;

        this.degrees = Math.max(-this.maxDegree, Math.min(this.degrees, this.maxDegree));

        if (!this.leftPressed && !this.rightPressed) this.degrees *= 1 - this.friction;

        this.element.style.transform = `rotate(${this.degrees}deg)`;
    }

    validPosition() {
        if ((this.posY + this.height) < 0 || (this.posX + this.width) < 0 || this.posY > window.innerHeight || this.posX > window.innerWidth) this.endGame = true;
    }
}

class Bullet extends Entity {
    constructor(id) {
        super(20, 40);

        this.id = id;
        this.move = 6;
        this.posX = random(0, window.innerWidth);
        this.eliminate = false;
        this.endGame = false;

        this.createBullet();
    }

    createBullet() {
        if (this.eliminate) return;
        const bullet = document.createElement(`div`);
        bullet.classList.add(`bullet`);
        bullet.style.width = `${this.width}px`;
        bullet.style.height = `${this.height}px`;
        bullet.style.top = `${this.posY}px`;
        bullet.style.left = `${this.posX}px`;
        this.containerElement.appendChild(bullet);
        this.element = bullet;
    }

    update() {
        this.posY += this.move;
        if (this.posY > window.innerHeight) {
            this.eliminate = true;
            this.element.remove();
        }
    }

    rebuild(playerX, playerY, playerW, playerH) {
        this.update();
        this.createBullet();

        if (((this.posX + this.width) >= playerX && this.posX <= (playerX + playerW)) &&
            ((this.posY + this.height) >= playerY && this.posY <= (playerY + playerH))) {
            this.endGame = true;
        }
    }
}

class Enemy extends Entity {
    constructor() {
        super(40, 60, random(0, (window.innerWidth - 40)), random(0, (window.innerHeight - 60)));

        this.speedX = 0;
        this.speedY = 0;
        this.aceleration = 0.2;
        this.friction = 0.03;
        this.maxSpeed = 2;
        this.degrees = 0;
        this.img;
        this.endGame = false;

        this.createEnemy();
    }

    createEnemy() {
        const enemy = document.createElement(`div`);
        enemy.classList.add(`enemy`);
        enemy.style.width = `${this.width}px`;
        enemy.style.height = `${this.height}px`;
        enemy.style.top = `${this.posY}px`;
        enemy.style.left = `${this.posX}px`;
        this.containerElement.appendChild(enemy);

        if (this.degrees > -90 && this.degrees < 90) this.img = `../assets/img/bird1.png`;
        else this.img = `../assets/img/bird2.png`;

        const imgEnemy = document.createElement(`img`);
        imgEnemy.classList.add(`enemy-img`);
        imgEnemy.src = this.img;
        enemy.appendChild(imgEnemy);
        
        enemy.style.transform = `rotate(${this.degrees}deg)`;
    }

    update(player) {
        let difX = player.posX - this.posX;
        let difY = player.posY - this.posY;
        const distance = Math.sqrt(difX * difX + difY * difY);

        if (distance > 0) {
            difX /= distance;
            difY /= distance;
        }

        this.degrees = Math.atan2(difY, difX) * (180 / Math.PI);

        this.speedX += difX * this.aceleration;
        this.speedY += difY * this.aceleration;

        this.speedX = Math.max(-this.maxSpeed, Math.min(this.speedX, this.maxSpeed));
        this.speedY = Math.max(-this.maxSpeed, Math.min(this.speedY, this.maxSpeed));

        this.speedX *= 1 - this.friction;
        this.speedY *= 1 - this.friction;

        this.posX += this.speedX;
        this.posY += this.speedY;
    }

    rebuild(player) {
        this.update(player);
        this.createEnemy();

        if (((this.posX + this.width) >= player.posX && this.posX <= (player.posX + player.width)) &&
            ((this.posY + this.height) >= player.posY && this.posY <= (player.posY + player.height))) {
            this.endGame = true;
        }
    }
}

class Events {
    constructor() {
        /*
        1 = Rajada de Vento
        2 = Patos migrando
        */
        this.event = random(1, 3);
    }
}

class Game {
    constructor() {
        this.containerElement = document.querySelector(`.container`);
        this.window;
        this.fps = 60;
        this.player;
        this.intervalLoop;
        this.arrayBullet = [];
        this.points = 0;

        this.mouseEvent();
    }

    showWindow(window) {
        const element = document.querySelector(window);
        element.style.display = `flex`;
    }

    mouseEvent() {
        document.addEventListener(`click`, e => {
            const element = e.target;

            e.preventDefault();

            if (this.window === `tela-inicial` || element.classList.contains(`btn-end-game`)) this.startGame();
        });
    }

    startGame() {
        this.containerElement.innerHTML = ``;
        document.querySelector(`.container-end-game`).style.display = `none`;
        this.window = `game`;
        this.points = 0;

        this.createPoints();
        this.createPlayer();
        this.createEnemy();
        this.gameLoop();
    }

    createPoints() {
        const pointsElement = document.createElement(`div`);
        pointsElement.classList.add(`points`);
        pointsElement.innerText = this.points;
        this.containerElement.appendChild(pointsElement);
    }

    createPlayer() {
        this.player = new Player(35, 60);
    }

    createEnemy() {
        this.enemy = new Enemy();
    }

    gameLoop() {
        let contadorSeconds = 0;
        let contador = 0;
        let id = 0;
        let timeCreateBullet = 30;

        this.intervalLoop = setInterval(() => {
            this.containerElement.innerHTML = ``;
            this.player.update();
            this.player.rebuild();

            this.enemy.rebuild(this.player);

            if (this.enemy.endGame) {
                this.endGame();
                clearInterval(this.intervalLoop);
                return;
            }

            this.createPoints();

            if (this.player.endGame) {
                this.endGame();
                clearInterval(this.intervalLoop);
                return;
            }

            this.arrayBullet.forEach(bullet => {
                bullet.rebuild(this.player.posX, this.player.posY, this.player.width, this.player.height);
                if (bullet.endGame) {
                    this.endGame();
                    clearInterval(this.intervalLoop);
                    return;
                }
            });

            if (contador >= timeCreateBullet) {
                const bullet = new Bullet(id);
                this.arrayBullet[id] = bullet;
                contador = 0;
                id++;
            }

            if (contadorSeconds >= 60) {
                this.points++;

                if (this.points > 0 && this.points % 5 === 0 && timeCreateBullet > 3) {
                    timeCreateBullet--;
                }

                contadorSeconds = 0;
            }

            contador++;
            contadorSeconds++;
        }, (1000 / this.fps));
    }

    endGame() {
        this.containerElement.innerHTML = ``;
        this.window = `fim-de-jogo`;
        this.showWindow(`.container-end-game`);
        this.arrayBullet = [];
        this.verifyPoints();
    }

    verifyPoints() {
        let best = localStorage.getItem(`points`);
        best = best ? best : 0;

        if (this.points > best) {
            document.querySelector(`.record-end-game`).style.display = `block`;
            localStorage.setItem(`points`, this.points);
        }
        
        document.querySelector(`.points-end-game`).innerText = this.points;
        document.querySelector(`.best-points-end-game`).innerText = localStorage.getItem(`points`);
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

(function first() {
    const game = new Game();
    game.showWindow(`.tela-inicial`);
    game.window = `tela-inicial`;
})();