class Game {
	// first time when the food is spawned on the scene
	constructor(snake) {
		this.foodPosition = createVector(
			this.findClosestMultiple(floor(random(CANVAS_WIDTH)), PIXEL_SIZE),
			this.findClosestMultiple(floor(random(CANVAS_HEIGHT)), PIXEL_SIZE)
			);

		this.snake = snake;
		this.wallSet = [];
	}


	wallSet;
	wallPosition;
	foodPosition;
	snake;

	// manages game flow
	Run() {
		switch (GAME_STATE) {
			case gameStates.ALIVE:
				this.snake.move();
				this.snake.show();
				this.snake.isCollision();
				this.spawnFood();
				this.showWalls();
				break;
			
			case gameStates.EDIT:
				frameRate(60);
				this.showWalls();
				this.addWalls();
				break;

			case gameStates.DEAD:
				// empty, it is sufficient enough not to run any functions in case ALIVE
				break;
		}
	}

	restartScene() {
		let snakeBody = [
			new BodyPart(createVector(CANVAS_WIDTH - 5*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
			new BodyPart(createVector(CANVAS_WIDTH - 4*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
			new BodyPart(createVector(CANVAS_WIDTH - 3*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
			new BodyPart(createVector(CANVAS_WIDTH - 2*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		];

		this.snake = new Snake(snakeBody);
		this.createFoodPosition();
		NEW_DIRECTION = createVector(-1,0);

		GAME_STATE = gameStates.ALIVE;
	}

	createFoodPosition() {
		this.foodPosition = createVector(
			this.findClosestMultiple(floor(random(CANVAS_WIDTH)), PIXEL_SIZE),
			this.findClosestMultiple(floor(random(CANVAS_HEIGHT)), PIXEL_SIZE)
			);
	}

	checkFoodPosition() {
		let notValid = false;
		for (let i = 0; i < GAME.wallSet.length; i++) {
			let wall = GAME.wallSet[i];
			if (this.foodPosition.x === wall.x && this.foodPosition.y === wall.y) {
				notValid = true;
				console.log(`${wall.x}, ${wall.y}`);
				break;
			}
		}
		return notValid;
	}

	spawnFood() {
		// if snake's head has the same position as food
		if (this.snake.headBodyPart.position.x === this.foodPosition.x && this.snake.headBodyPart.position.y === this.foodPosition.y) {
			do {
				this.createFoodPosition();
				console.log("dfsdf");
			}
			while (this.checkFoodPosition());
			
			this.snake.grow();
		}

		fill(FOOD_COLOR);
		noStroke();
		rect(this.foodPosition.x, this.foodPosition.y, PIXEL_SIZE, PIXEL_SIZE);
	}

	addWalls() {
		//let wallPosition = createVector(floor(mouseX), floor(mouseY));
		if (mouseIsPressed) {
			this.wallPosition = createVector(this.findClosestMultiple(mouseX, PIXEL_SIZE), this.findClosestMultiple(mouseY, PIXEL_SIZE));
			// console.log(`MOUSE: ${mouseX} ${mouseY}  WALL: ${wallPosition.x}, ${wallPosition.y}`);
			this.wallSet.push(this.wallPosition);
		}
	}

	showWalls() {
		for (let wall of this.wallSet) {
			fill(200);
			noStroke();
			rect(wall.x, wall.y, PIXEL_SIZE);
		}
	}

	// returns the closest multiple of a givenNumber
	// used in order to spawn food on PIXEL_SIZE grid
	findClosestMultiple(givenNumber, multipleOf) {
		let closestMultiple;
		let downFloor = floor( givenNumber / multipleOf ) * multipleOf;
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
}

class Snake {
	constructor(bodyArr) {
		this.headBodyPart = bodyArr[0];
		this.bodyArr = bodyArr;
	}

	headBodyPart;
	bodyArr;

	// changes just the direction of the snake's head
	// rest is done in snake.move()
	changeDirection(newDirection) {
		// it is not allowed to move backwards
		let notAllowed = createVector((-1 * this.headBodyPart.direction.x), (-1 * this.headBodyPart.direction.y));
		if (newDirection.x !== notAllowed.x && newDirection.y !== notAllowed.y) { this.headBodyPart.direction = newDirection; };
	}

	isCollision() {
		// console.log(`head_x: ${this.headBodyPart.position.x} head_y: ${this.headBodyPart.position.y}`);
		// checks if some of snake's bodyPart has same coordinates as it's head -> collision
		this.bodyArr.slice(1).forEach(bodyPart => {
			// console.log(`x: ${bodyPart.position.x} y: ${bodyPart.position.y}`);
			if ( this.headBodyPart.position.x === bodyPart.position.x && this.headBodyPart.position.y === bodyPart.position.y ) {
				GAME_STATE = gameStates.DEAD;
			}
		});

		// checks whether snake's head and a wall have same coordinates
		GAME.wallSet.forEach(wall => {
			if ( this.headBodyPart.position.x === wall.x && this.headBodyPart.position.y === wall.y ) {
				GAME_STATE = gameStates.DEAD;
			}
		});
	}

	grow() {
		// spawns a new tail on a correct position with correct direction
		let tailBodyPart = this.bodyArr[this.bodyArr.length-1];
		let newTailBodyPart = new BodyPart(
			createVector(
				tailBodyPart.position.x + (-1 * tailBodyPart.direction.x * PIXEL_SIZE),
				tailBodyPart.position.y + (-1 * tailBodyPart.direction.y * PIXEL_SIZE)
			),
			tailBodyPart.direction
		);

		this.bodyArr.push(newTailBodyPart);
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
		// draws the snake
		background(57,42,69);
		noStroke();
		fill(SNAKE_COLOR);
		this.bodyArr.forEach(bodyPart => {
			rect(bodyPart.position.x, bodyPart.position.y, PIXEL_SIZE, PIXEL_SIZE);
		})
	}
}


const gameStates = {DEAD : 0, ALIVE : 1, EDIT : 2};

let GAME;
let GAME_STATE;
// has to be global, because keyPressed() is global
let NEW_DIRECTION;

// GLOBALS, CAN BE TWEAKED OPTIONALLY
let CANVAS_HEIGHT;
let CANVAS_WIDTH;
let PIXEL_SIZE; 

let CANVAS_COLOR; 
let SNAKE_COLOR;
let FOOD_COLOR;


function setup() {
	CANVAS_HEIGHT = 600;
	CANVAS_WIDTH = 600;
	PIXEL_SIZE = 20;

	CANVAS_COLOR = color(51);
	SNAKE_COLOR = color(255,240,254);
	FOOD_COLOR = color(255,148,46);


	frameRate(10);
	GAME_STATE = gameStates.ALIVE;

	createCanvas(CANVAS_HEIGHT, CANVAS_WIDTH);
	background(51);

	let snakeBody = [
		new BodyPart(createVector(CANVAS_WIDTH - 5*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		new BodyPart(createVector(CANVAS_WIDTH - 4*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		new BodyPart(createVector(CANVAS_WIDTH - 3*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
		new BodyPart(createVector(CANVAS_WIDTH - 2*PIXEL_SIZE, CANVAS_HEIGHT / 2), createVector(-1,0)),
	];

	GAME = new Game(new Snake(snakeBody));
	NEW_DIRECTION = createVector(-1,0);
}

function draw() {
	GAME.Run();
}

// unfortuntely, has to be run globally -> cannot be put inside a class for example
function keyPressed() {
	if (keyCode === UP_ARROW) {
		NEW_DIRECTION = createVector(0,-1);
	}

	else if (keyCode === LEFT_ARROW) {
		NEW_DIRECTION = createVector(-1,0);
	}

	else if (keyCode === RIGHT_ARROW) {
		NEW_DIRECTION = createVector(1,0);
	}

	else if (keyCode === DOWN_ARROW) {
		NEW_DIRECTION = createVector(0,1);
	}

	else if (keyCode == ENTER && GAME_STATE === gameStates.DEAD) {
		GAME.restartScene();
	}

	GAME.snake.changeDirection(NEW_DIRECTION);
}
