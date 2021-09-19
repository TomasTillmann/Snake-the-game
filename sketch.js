class Game {
	// first time when the food is spawned on the scene
	constructor() {
		this.foodPosition = createVector(
			this.findClosestMultiple(floor(random(CANVAS_WIDTH)), PIXEL_SIZE),
			this.findClosestMultiple(floor(random(CANVAS_HEIGHT)), PIXEL_SIZE)
			);
	}

	foodPosition;

	// handles game states
	// manages game flow
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
		// if snake's head has the same position as food
		if (snake.headBodyPart.position.x === this.foodPosition.x && snake.headBodyPart.position.y === this.foodPosition.y) {
			this.foodPosition = createVector(
					this.findClosestMultiple(floor(random(CANVAS_WIDTH)), PIXEL_SIZE),
					this.findClosestMultiple(floor(random(CANVAS_HEIGHT)), PIXEL_SIZE)
					);
			
			snake.grow();
		}

		// draws food continously,
		// because the scene is refreshed each frame (done in snake.move())
		fill(FOOD_COLOR);
		noStroke();
		rect(this.foodPosition.x, this.foodPosition.y, PIXEL_SIZE, PIXEL_SIZE);
	}

	// returns the closest multiple of a givenNumber
	// used in order to spawn food on PIXEL_SIZE grid
	findClosestMultiple(givenNumber, multipleOf) {
		let closestMultiple;
		let downFloor = ( givenNumber % multipleOf ) * multipleOf;
		let upFloor = downFloor + multipleOf; 

		abs( givenNumber - downFloor ) > abs( givenNumber - upFloor ) ? closestMultiple = upFloor : closestMultiple = downFloor;
		return closestMultiple;
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
		this.tailBodyPart = bodyArr[bodyArr.length-1];
	}

	headBodyPart;
	tailBodyPart;
	bodyArr;

	// changes just the direction of the snake's head
	// rest is done in snake.move()
	changeDirection(newDirection) {
		// it is not allowed to move backwards
		let notAllowed = createVector((-1 * snake.headBodyPart.direction.x), (-1 * snake.headBodyPart.direction.y));
		if (newDirection.x !== notAllowed.x && newDirection.y !== notAllowed.y) { this.headBodyPart.direction = newDirection; };
	}

	grow() {
		// spawns a new tail on a correct position with correct direction
		let newTailBodyPart = new BodyPart(
			createVector(
				this.tailBodyPart.position.x + (-1 * this.tailBodyPart.direction.x * PIXEL_SIZE),
				this.tailBodyPart.position.y + (-1 * this.tailBodyPart.direction.y * PIXEL_SIZE)
			),
			this.tailBodyPart.direction
		);

		this.bodyArr.push(newTailBodyPart);
		this.tailBodyPart = newTailBodyPart;
	}

	move() {
		// move in the specified direction
		for(let i = 0; i < this.bodyArr.length; i++) {
			let bodyPart = this.bodyArr[i];
			bodyPart.position.x >= 0 ? bodyPart.position.x = ( bodyPart.position.x + bodyPart.direction.x * PIXEL_SIZE ) % CANVAS_WIDTH : bodyPart.position.x = CANVAS_WIDTH - PIXEL_SIZE;
			bodyPart.position.y >= 0 ? bodyPart.position.y = ( bodyPart.position.y + bodyPart.direction.y * PIXEL_SIZE ) % CANVAS_HEIGHT : bodyPart.position.y = CANVAS_HEIGHT - PIXEL_SIZE;
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

		// draws the snake
		background(57,42,69);
		noStroke();
		fill(SNAKE_COLOR);
		this.bodyArr.forEach(bodyPart => {
			rect(bodyPart.position.x, bodyPart.position.y, PIXEL_SIZE, PIXEL_SIZE);
		})
	}
}


let game;
let snake;

const gameStates = {DEAD: 0, ALIVE: 1};
let gameState;

// GLOBALS, CAN BE TWEAKED OPTIONALLY
let CANVAS_HEIGHT;
let CANVAS_WIDTH;
let PIXEL_SIZE; 

let CANVAS_COLOR; 
let SNAKE_COLOR;
let FOOD_COLOR;

function setup() {
	CANVAS_HEIGHT = 800;
	CANVAS_WIDTH = 800;
	PIXEL_SIZE = 20;

	CANVAS_COLOR = color(51);
	SNAKE_COLOR = color(255,240,254);
	FOOD_COLOR = color(255,148,46);


	frameRate(10);
	gameState = gameStates.ALIVE;

	createCanvas(CANVAS_HEIGHT, CANVAS_WIDTH);
	background(51);

	game = new Game();
	let snakeBody = [
		new BodyPart(createVector(CANVAS_WIDTH - 5*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		new BodyPart(createVector(CANVAS_WIDTH - 4*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		new BodyPart(createVector(CANVAS_WIDTH - 3*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		new BodyPart(createVector(CANVAS_WIDTH - 2*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
	];
	snake = new Snake(snakeBody);
}

function draw() {
	game.Run();
}

// unfortuntely, has to be run globally -> cannot be put inside a class for example
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