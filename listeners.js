// EVENT LISTENERS
document.getElementById('editMode').onclick = function() {
	GAME_STATE = gameStates.EDIT;
}

document.getElementById('playMode').onclick = function() {
	frameRate(10);
	GAME.restartScene();
	GAME_STATE = gameStates.ALIVE;
}