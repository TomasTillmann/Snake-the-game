class Game {
	Run() {
		switch (gameState) {
			case gameStates.ALIVE:
				snake.move();
				snake.show();
				this.spawnFood();
				break;

			case gameStates.DEAD:
				console.log('im dead');
				break;
		}
	}

	spawnFood() {

	}
}

// internally used in Snake
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

	changeDirection(newDirection) {
		// changes just the direction of the snake's head
		let notAllowed = createVector((-1 * snake.headBodyPart.direction.x), (-1 * snake.headBodyPart.direction.y));
		if (newDirection.x !== notAllowed.x && newDirection.y !== notAllowed.y) { this.headBodyPart.direction = newDirection; };
	}

	move() {
		// move in the specified direction
		for(let i = 0; i < this.bodyArr.length; i++) {
			let bodyPart = this.bodyArr[i];
			bodyPart.position.x >= 0 ? bodyPart.position.x = ( bodyPart.position.x + bodyPart.direction.x * PIXEL_SIZE ) % CANVAS_WIDTH : bodyPart.position.x = CANVAS_WIDTH;
			bodyPart.position.y >= 0 ? bodyPart.position.y = ( bodyPart.position.y + bodyPart.direction.y * PIXEL_SIZE ) % CANVAS_HEIGHT : bodyPart.position.y = CANVAS_HEIGHT;
		}

		// makes the change of the snake's head propagate further on to body parts each frame
		for (let i = this.bodyArr.length-1;  i > 0; i--) {
			let bodyPart = this.bodyArr[i];
			let nextBodyPart = this.bodyArr[i-1];

			// simply updates the bodyPart's directon to the direction of the bodyPart in front of it
			bodyPart.direction = nextBodyPart.direction;
		}
	}

	show() {
		// in order to delete unwanted bodyParts from the scene
		createCanvas(CANVAS_HEIGHT, CANVAS_WIDTH);
		background(51);
		noStroke();
		fill(SNAKE_COLOR);
		this.bodyArr.forEach(bodyPart => {
			rect(bodyPart.position.x, bodyPart.position.y, PIXEL_SIZE, PIXEL_SIZE);
		})
	}
}


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
	SNAKE_COLOR = color(255,240,254);
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
		newDirection = createVector(0,-1);
	}

	else if (keyCode === LEFT_ARROW) {
		newDirection = createVector(-1,0);
	}

	else if (keyCode === RIGHT_ARROW) {
		newDirection = createVector(1,0);
	}

	else if (keyCode === DOWN_ARROW) {
		newDirection = createVector(0,1);
	}
	snake.changeDirection(newDirection);
}





