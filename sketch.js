class myMath {
	// returns the closest multiple of a givenNumber
	FindClosestMultiple(givenNumber, multipleOf) {
		let closestMultiple;
		let downFloor = floor( givenNumber / multipleOf ) * multipleOf;
		let upFloor = downFloor + multipleOf; 

		abs( givenNumber - downFloor ) > abs( givenNumber - upFloor ) ? closestMultiple = upFloor : closestMultiple = downFloor;
		return closestMultiple;
	}

	GetMirroredVector(vector) {
		let shift;
		let transformMatrix = [];
		let mirroredVectorArr;

		switch(MIRROR_STATE){
			case mirrorStates.NONE:
				return vector;

			case mirrorStates.X:
				shift = this.FindClosestMultiple(CANVAS_HEIGHT / 2, PIXEL_SIZE);
				transformMatrix.push([1,0], [0,-1]);
				break;

			case mirrorStates.Y:
				shift = this.FindClosestMultiple(CANVAS_WIDTH / 2, PIXEL_SIZE);
				transformMatrix.push([-1,0], [0,1]);
				break;
		}

		mirroredVectorArr = this.matrixVectorMultiply2D( transformMatrix, [ vector.x - shift, vector.y - shift ] );
		return createVector( mirroredVectorArr[0] + shift, mirroredVectorArr[1] + shift );
	}

	/* matrices must be a 2D array */
	matrixVectorMultiply2D(m, v) {
		const dimension = 2;
		let m1 = m; let m2 = [[ v[0], v[1] ], [ v[0], v[1] ]];
		let rowSum;
		let resultVector2D = [];

		for (let i = 0; i < dimension; i++) {
			rowSum = 0;
			for (let j = 0; j < dimension; j++) {
				rowSum = rowSum + ( m1[i][j] * m2[j][i] );
			}
			resultVector2D.push(rowSum);
		}

		return resultVector2D;
	}
}

class Game {
	// first time when the food is spawned on the scene
	constructor(snake) {
		this.snake = snake;
		this.wallSet = [];
		this.spawnFood();
	}

	wallSet;
	foodPosition;
	snake;

	// manages game flow
	Run() {
		switch (GAME_STATE) {
			case gameStates.ALIVE:
				this.snake.Move();
				this.snake.Show();
				this.snake.IsCollision();

				this.FoodEaten();
				this.ShowWalls();
				this.ShowFood();

				break;
			
			case gameStates.EDIT:
				this.EditWalls();

				// note that the ordering of Show function is important. It dictates layering.
				this.ShowCentralAxes();
				this.ShowWalls();
				this.ShowGrid(PIXEL_SIZE);
				this.ShowMouseGrid();
				break;

			case gameStates.DEAD:
				this.snake.Show();
				this.ShowFood();
				this.ShowWalls();
				break;
		}
	}

	ShowGrid(pixelSize) {
		for (let x = 0; x < CANVAS_WIDTH; x += pixelSize) {
			for (let y = 0; y < CANVAS_HEIGHT; y += pixelSize) {
				noFill();
				stroke(157,151,186);
				rect(x,y, pixelSize);
			}
		}
	}

	RestartScene() {
		NEW_DIRECTION = createVector(-1,0);
		let snakeBody = [
			new BodyPart(createVector(CANVAS_WIDTH - 5*PIXEL_SIZE, MY_MATH.FindClosestMultiple(CANVAS_HEIGHT / 2, PIXEL_SIZE)), NEW_DIRECTION), 
			new BodyPart(createVector(CANVAS_WIDTH - 4*PIXEL_SIZE, MY_MATH.FindClosestMultiple(CANVAS_HEIGHT / 2, PIXEL_SIZE)), NEW_DIRECTION),
			new BodyPart(createVector(CANVAS_WIDTH - 3*PIXEL_SIZE, MY_MATH.FindClosestMultiple(CANVAS_HEIGHT / 2, PIXEL_SIZE)), NEW_DIRECTION), 
			new BodyPart(createVector(CANVAS_WIDTH - 2*PIXEL_SIZE, MY_MATH.FindClosestMultiple(CANVAS_HEIGHT / 2, PIXEL_SIZE)), NEW_DIRECTION),
		];

		this.snake = new Snake(snakeBody);
		this.spawnFood();

		GAME_STATE = gameStates.ALIVE;
	}

	EditWalls() {
		let mousePositionInGrid = this.getMousePositionInGrid(); 
		let mirroredVector = MY_MATH.GetMirroredVector(mousePositionInGrid);

		if (mouseIsPressed) {
			if (mouseButton === LEFT) {
				let isIn = false;

				// checks if there already is a wall where user's mouse position is 
				this.wallSet.forEach(wall => {
					if ( (mousePositionInGrid.x === wall.x) && (mousePositionInGrid.y === wall.y) ) { isIn = true; return; }
				});

				// if there is a wall, don't draw another one on top of it -> no need to have multiple walls on the same spot
				if ( !(isIn) ) {
					this.wallSet.push(mousePositionInGrid);

					if (MIRROR_STATE !== mirrorStates.NONE) { this.wallSet.push(mirroredVector) }
				}
			}

			if (mouseButton === CENTER) {
				// loops through all the built walls
				for (let i = 0; i < this.wallSet.length; i++) {
					// if user's mouse is on a built wall, deletes it
					if (mousePositionInGrid.x === this.wallSet[i].x && mousePositionInGrid.y === this.wallSet[i].y) { this.wallSet.splice(i,1); break; }
				}

				if (MIRROR_STATE !== mirrorStates.NONE) {
					for (let i = 0; i < this.wallSet.length; i++) {
						// removes the mirrored vector
						if (mirroredVector.x === this.wallSet[i].x && mirroredVector.y === this.wallSet[i].y) { this.wallSet.splice(i,1); break; }
					}
				}
			}
		}
	}

	ShowWalls() {
		for (let wall of this.wallSet) {
			noStroke();
			fill(200);
			rect(wall.x, wall.y, PIXEL_SIZE);
		}
	}

	// shows white rectangle in a PIXEL_SIZE grid, where mouse is positioned
	ShowMouseGrid() {
		noFill();
		stroke(255);
		let mousePositionInGrid = this.getMousePositionInGrid();
		let mirroredMousePositionInGrid = MY_MATH.GetMirroredVector(mousePositionInGrid);

		rect(mousePositionInGrid.x, mousePositionInGrid.y, PIXEL_SIZE);
		rect(mirroredMousePositionInGrid.x, mirroredMousePositionInGrid.y, PIXEL_SIZE);
	}

	ShowFood() {
		fill(FOOD_COLOR);
		noStroke();
		rect(this.foodPosition.x, this.foodPosition.y, PIXEL_SIZE, PIXEL_SIZE);
	}

	ShowCentralAxes() {
		fill(color(57 + 20,42 + 20,69 + 20));
		noStroke();
		for (let x = 0; x < CANVAS_WIDTH; x += PIXEL_SIZE) {
			rect(x, MY_MATH.FindClosestMultiple(CANVAS_HEIGHT / 2, PIXEL_SIZE), PIXEL_SIZE);
		}

		for (let y = 0; y < CANVAS_WIDTH; y += PIXEL_SIZE) {
			rect(MY_MATH.FindClosestMultiple(CANVAS_WIDTH / 2, PIXEL_SIZE), y, PIXEL_SIZE);
		}
	}

	FoodEaten() {
		// if snake's head has the same position as food
		if (this.snake.headBodyPart.position.x === this.foodPosition.x && this.snake.headBodyPart.position.y === this.foodPosition.y) {
			this.spawnFood();
			this.snake.Grow();
		}
	}


	// spawns food in a PIXEL_SIZE grid on an empty space ( where are no walls )
	spawnFood() {
		do {
			this.foodPosition = createVector(
				MY_MATH.FindClosestMultiple(floor(random(CANVAS_WIDTH - PIXEL_SIZE)), PIXEL_SIZE),
				MY_MATH.FindClosestMultiple(floor(random(CANVAS_HEIGHT - PIXEL_SIZE)), PIXEL_SIZE)
			);
		}
		while (this.checkFoodPosition());
	}

	// checks whether this.foodPosition isn't a wall position
	checkFoodPosition() {
		let notValid = false;
		for (let i = 0; i < this.wallSet.length; i++) {
			let wall = this.wallSet[i];
			if (this.foodPosition.x === wall.x && this.foodPosition.y === wall.y) {
				notValid = true;
				break;
			}
		}
		return notValid;
	}

	getMousePositionInGrid() {
		return createVector(MY_MATH.FindClosestMultiple(mouseX - PIXEL_SIZE / 2, PIXEL_SIZE) , MY_MATH.FindClosestMultiple(mouseY - PIXEL_SIZE / 2, PIXEL_SIZE)); 
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
	constructor(bodyArr) {
		this.headBodyPart = bodyArr[0];
		this.bodyArr = bodyArr;
	}

	headBodyPart;
	bodyArr;

	// changes just the direction of the snake's head
	// rest is done in snake.move()
	ChangeDirection(newDirection) {
		// it is not allowed to move backwards
		let notAllowed = createVector((-1 * this.headBodyPart.direction.x), (-1 * this.headBodyPart.direction.y));
		if (newDirection.x !== notAllowed.x && newDirection.y !== notAllowed.y) { this.headBodyPart.direction = newDirection; }
	}

	IsCollision() {
		// checks if some of snake's bodyPart has same coordinates as it's head -> collision
		this.bodyArr.slice(1).forEach(bodyPart => {
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

	Grow() {
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

	Move() {
		// move in the specified direction
		for(let i = 0; i < this.bodyArr.length; i++) {
			let bodyPart = this.bodyArr[i];
			// snake has to teleport to the other side
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

	Show() {
		noStroke();
		fill(SNAKE_COLOR);
		this.bodyArr.forEach(bodyPart => {
			rect(bodyPart.position.x, bodyPart.position.y, PIXEL_SIZE, PIXEL_SIZE);
		})
	}
}


// in game states. Handled in GAME.Run()
const gameStates = {DEAD : 0, ALIVE : 1, EDIT : 2};
const mirrorStates = {X : 0, Y : 1, NONE : 2};

let GAME;
let GAME_STATE;
let MIRROR_STATE;
// has to be global, because keyPressed() is global
let NEW_DIRECTION;

// GLOBALS, CAN BE TWEAKED OPTIONALLY
let CANVAS_HEIGHT;
let CANVAS_WIDTH;
let PIXEL_SIZE; 

let CANVAS_COLOR; 
let SNAKE_COLOR;
let FOOD_COLOR;

let MY_MATH;


function setup() {
	CANVAS_HEIGHT = 700;
	CANVAS_WIDTH = 700;
	PIXEL_SIZE = 20;

	CANVAS_COLOR = color(57,42,69);
	SNAKE_COLOR = color(255,240,254);
	FOOD_COLOR = color(255,148,46);

	GAME_STATE = gameStates.ALIVE;
	MIRROR_STATE = mirrorStates.NONE;

	NEW_DIRECTION = createVector(-1,0);
	MY_MATH = new myMath();


	let snakeBody = [
		new BodyPart(createVector(CANVAS_WIDTH - 5*PIXEL_SIZE, MY_MATH.FindClosestMultiple(CANVAS_HEIGHT / 2, PIXEL_SIZE)), NEW_DIRECTION), 
		new BodyPart(createVector(CANVAS_WIDTH - 4*PIXEL_SIZE, MY_MATH.FindClosestMultiple(CANVAS_HEIGHT / 2, PIXEL_SIZE)), NEW_DIRECTION),
		new BodyPart(createVector(CANVAS_WIDTH - 3*PIXEL_SIZE, MY_MATH.FindClosestMultiple(CANVAS_HEIGHT / 2, PIXEL_SIZE)), NEW_DIRECTION), 
		new BodyPart(createVector(CANVAS_WIDTH - 2*PIXEL_SIZE, MY_MATH.FindClosestMultiple(CANVAS_HEIGHT / 2, PIXEL_SIZE)), NEW_DIRECTION),
	];

	GAME = new Game(new Snake(snakeBody));

	frameRate(10);
	createCanvas(CANVAS_HEIGHT, CANVAS_WIDTH);
}

function draw() {
	// refreshing the background to allow animations ( deletiing what has been drawn in a previous frame )
	background(CANVAS_COLOR);
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

	else if (keyCode == ENTER) {
		GAME.RestartScene();
	}

	GAME.snake.ChangeDirection(NEW_DIRECTION);
}

// BUTTONS INTERACTION
// INIT
const shuffleWalls = document.getElementById('shuffleWalls');
const editMode = document.getElementById('editMode'); 
const playMode = document.getElementById('playMode');
const mirrorShuffle = document.getElementById('mirrorAxesShuffle');

// shuffleWalls.disabled = true;

// EVENT LISTENERS
editMode.onclick = function() {
	GAME_STATE = gameStates.EDIT;
	// shuffleWalls.disabled = false;
	frameRate(144);
}

playMode.onclick = function() {
	// shuffleWalls.disabled = true;
	GAME_STATE = gameStates.ALIVE;
	frameRate(10);
	GAME.RestartScene();
}

mirrorShuffle.onclick = function() {
	switch(MIRROR_STATE) {
		case mirrorStates.X:
			MIRROR_STATE = mirrorStates.Y;
			break;
		case mirrorStates.Y:
			MIRROR_STATE = mirrorStates.NONE;
			break;
		case mirrorStates.NONE:
			MIRROR_STATE = mirrorStates.X;
			break;
	}
}
