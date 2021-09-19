class Game {
	Run() {
		switch (gameState) {
			case gameStates.ALIVE:
				snake.move();
				snake.show();
				break;

			case gameStates.DEAD:
				// neco neco
				console.log('im dead');
				break;
		}
	}
}

class BodyPart {
	constructor(position, direction) {
		this.position = position;
		this.direction = direction;
	}
	position;
	direction;
}

class Snake {
	constructor(bodyArr, speed) {
		this.headBodyPart = bodyArr[0];
		this.bodyArr = bodyArr;
	}

	headBodyPart;
	bodyArr;

	changeDirection(direction) {
		this.headBodyPart.direction = direction;
	}

	move() {
		// move in the specified direction
		for(let i = 0; i < this.bodyArr.length; i++) {
			let bodyPart = this.bodyArr[i];
			bodyPart.position.x += bodyPart.direction.x * PIXEL_SIZE;
			bodyPart.position.y += bodyPart.direction.y * PIXEL_SIZE;
		}

		for (let i = this.bodyArr.length-1;  i > 0; i--) {
			let bodyPart = this.bodyArr[i];
			let nextBodyPart = this.bodyArr[i-1];
			bodyPart.direction = nextBodyPart.direction;
		}
	}

	show() {
		createCanvas(CANVAS_HEIGHT, CANVAS_WIDTH);
		background(51);
		noStroke();
		fill(SNAKE_COLOR);
		this.bodyArr.forEach(bodyPart => {
			rect(bodyPart.position.x, bodyPart.position.y, PIXEL_SIZE, PIXEL_SIZE);
		})
	}
}


let myDraw;
let game;
let snake;

let CANVAS_HEIGHT;
let CANVAS_WIDTH;
let PIXEL_SIZE; 

let CANVAS_COLOR; 
let PIXEL_BORDERS_COLOR;
let SNAKE_COLOR;

const gameStates = {DEAD: 0, ALIVE: 1};
let gameState;

function setup() {
	frameRate(10);
	CANVAS_HEIGHT = 600;
	CANVAS_WIDTH = 600;
	PIXEL_SIZE = 20;

	CANVAS_COLOR = color(51);
	PIXEL_BORDERS_COLOR = color(156);
	SNAKE_COLOR = color(255,0,40);
	gameState = gameStates.ALIVE;

	createCanvas(CANVAS_HEIGHT, CANVAS_WIDTH);
	background(51);
	game = new Game();
	let snakeBody = [
		new BodyPart(createVector(CANVAS_WIDTH - 5*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		new BodyPart(createVector(CANVAS_WIDTH - 4*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		new BodyPart(createVector(CANVAS_WIDTH - 3*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		new BodyPart(createVector(CANVAS_WIDTH - 2*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		new BodyPart(createVector(CANVAS_WIDTH - PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		new BodyPart(createVector(CANVAS_WIDTH,300), createVector(-1,0)),
	];
	snake = new Snake(snakeBody, 400);
}

function draw() {
	game.Run();
	

}

function keyPressed() {
	if (keyCode === UP_ARROW) {
		snake.changeDirection(createVector(0,-1));
	}

	if (keyCode === LEFT_ARROW) {
		snake.changeDirection(createVector(-1,0));
	}

	if (keyCode === RIGHT_ARROW) {
		snake.changeDirection(createVector(1,0));
	}

	if (keyCode === DOWN_ARROW) {
		snake.changeDirection(createVector(0,1));
	}
}





