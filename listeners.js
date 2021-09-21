// EVENT LISTENERS
document.getElementById('editMode').onclick = function() {
	GAME_STATE = gameStates.EDIT;
	background(CANVAS_COLOR);
	frameRate(144);
	GAME.ShowWalls();
}

document.getElementById('playMode').onclick = function() {
	frameRate(10);
	GAME.RestartScene();
	GAME_STATE = gameStates.ALIVE;
}