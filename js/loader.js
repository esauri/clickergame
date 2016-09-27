/* 
	Erick Sauri 
	Clicker Thing
	IGME - 330

loader.js
variable 'game' is in global scope - i.e. a property of window.
game is our single global object literal - all other functions and properties of 
the game will be properties of game.
*/
"use strict";

// if game exists use the existing copy
// else create a new object literal
var game = game || {};

// CONSTANTS
game.KEYBOARD = {
	"KEY_LEFT": 37, 
	"KEY_UP": 38, 
	"KEY_RIGHT": 39, 
	"KEY_DOWN": 40,
	"KEY_SPACE": 32
};

game.IMAGES = {
    soldierImage: "images/Bob.png",
    enemyGreenImage: "images/enemyGreen.png",
	enemyYellowImage: "images/enemyYellow.png",
	enemyRedImage: "images/enemyRed.png",
	splashImage: "images/bg.png",
	cloudImages: "images/clouds.png"
 };

// game.keydown array to keep track of which keys are down
// this is called a "key daemon"
// this works because JS has "sparse arrays" - not every language does
game.keydown = [];

window.onload = function(){
	//Soldier modules
	game.soldier.drawLibrary = game.drawLibrary;
	
	//Game Modules
	game.clicker.drawLibrary = game.drawLibrary;
	game.clicker.game = game;
	game.clicker.utilities = game.utilities;
	game.clicker.Enemy = game.Enemy;
	game.clicker.ExplosionSprite = game.ExplosionSprite;
	//Enemy modules
	game.Enemy.drawLibrary = game.drawLibrary;
	game.Enemy.utilities = game.utilities;
	
	//particles
	game.Emitter.utilities = game.utilities;
	// Preload Images and Sound
	game.queue = new createjs.LoadQueue(false);
	game.queue.installPlugin(createjs.Sound);
	game.queue.on("complete", function(){
		game.clicker.init(game.soldier);
	});

	game.queue.loadManifest([
	 	//Images
		{id: "soldierImage", src:"images/Bob.png"},
		{id: "splashImage", src:"images/bg.png"},
		{id: "enemyGreenImage", src:"images/enemyGreen.png"},
		{id: "enemyYellowImage", src:"images/enemyYellow.png"},
		{id: "enemyRedImage", src:"images/enemyRed.png"},  
		{id: "cloudImages", src:"images/clouds.png"},
		
	 	//Sounds
		{id:"pop", src:"sounds/pop.mp3"},
		{id:"shield", src:"sounds/shield.mp3"},
	 	{id:"soundtrack", src:"sounds/soundtrack.mp3"}
	]);

	
	// event listeners
	window.addEventListener("keydown",function(e){
		//console.log("keydown=" + e.keyCode);
		game.keydown[e.keyCode] = true;
	});
		
	window.addEventListener("keyup",function(e){
		//console.log("keyup=" + e.keyCode);
		game.keydown[e.keyCode] = false;
		if(e.keyCode == 83) game.clicker.toggleSoundtrack(); //s
		if(e.keyCode == 13){ //enter
			if(game.clicker.gamelevel != game.clicker.GAME_LEVEL.Main){
				game.clicker.gamelevel = game.clicker.GAME_LEVEL.Main; 
				game.clicker.reset();
			}
		}
		if(e.keyCode == 80) {
			if(game.clicker.gamestate == game.clicker.GAME_STATE.DEFAULT){
				game.clicker.toggleGame();
			}
		} //p
        if(e.keyCode == 73){
			if(game.clicker.gamestate != game.clicker.GAME_STATE.INSTRUCTIONS){
				game.clicker.gamestate = game.clicker.GAME_STATE.INSTRUCTIONS;
				game.clicker.inPlay = false;
			}
			else{
				game.clicker.gamestate = game.clicker.GAME_STATE.DEFAULT;
				game.clicker.inPlay = true;
			}
			//i
		}

	});
	
	window.addEventListener('touchstart', function(e){
		e.preventDefault();
		//do stuff
	}, false);
	window.addEventListener('touchend', function(e){
		e.preventDefault();
		//do stuff
	}, false);
}

window.onblur = function(){
	if(game.clicker.gamestate == game.clicker.GAME_STATE.DEFAULT){
		game.clicker.toggleGame();
	}
};

//window.onfocus is fired when the window returns to the foreground.
window.onfocus = function(){
	game.clicker.resumeGame();
};