// EVENT LISTENERS
document.getElementById('editMode').onclick = function() {
	GAME_STATE = gameStates.EDIT;
	frameRate(144);
}

document.getElementById('playMode').onclick = function() {
	GAME_STATE = gameStates.ALIVE;
	frameRate(10);
	GAME.RestartScene();
}