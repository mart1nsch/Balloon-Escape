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

        this.move = 4;
        this.endGame = false;

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
    }

    update() {
        if (this.upPressed) this.posY -= this.move;
        if (this.downPressed) this.posY += this.move;
        if (this.leftPressed) this.posX -= this.move;
        if (this.rightPressed) this.posX += this.move;
    }

    rebuild() {
        this.createPlayer();
        this.validPosition();
    }

    validPosition() {
        if (this.posY < 0 || this.posX < 0 || this.posY > window.innerHeight || this.posX > window.innerWidth) this.endGame = true;
    }
}

class Bullet extends Entity {
    constructor(id) {
        super(40, 40);

        this.id = id;
        this.move = 4;
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

        if (((this.posX + this.width) >= playerX && (playerX + playerW) >= (this.posX + this.width)) &&
            ((this.posY + this.height) >= playerY && (playerY + playerH) >= (this.posY + this.height))) {
            this.endGame = true;
        }
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

    getHTML(url) {
        fetch(url).then(response => {
            response.text().then(html => {
                this.containerElement.innerHTML = html;
                if (this.window === `fim-de-jogo`) this.verifyPoints();
            });
        });
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
        this.window = `game`;
        this.points = 0;

        this.createPoints();
        this.createPlayer();
        this.gameLoop();
    }

    createPoints() {
        const pointsElement = document.createElement(`div`);
        pointsElement.classList.add(`points`);
        pointsElement.innerText = this.points;
        this.containerElement.appendChild(pointsElement);
    }

    createPlayer() {
        this.player = new Player(80, 80);
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
        this.getHTML('../assets/html/fim-de-jogo.html');
        this.window = `fim-de-jogo`;
        this.arrayBullet = [];
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
    return Math.floor(Math.random() * (max + min) - min);
}

(function first() {
    const game = new Game();
    game.getHTML('../assets/html/tela-inicial.html');
    game.window = `tela-inicial`;
})();