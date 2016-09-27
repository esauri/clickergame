/*
	Erick Sauri
	Clicker Thing
	IGME - 330
*/
// clicker.js
// Dependencies:
// Description: singleton object
// This object will be our main "controller" class and will contain references
// to most of the other objects in the game.

"use strict";

// if game exists use the existing copy
// else create a new object literal
var game = game || {};

game.clicker = {
    WIDTH : 1170,
    HEIGHT: 720,
	AREA_HEIGHT: this.HEIGHT/3,
	ENEMY_PROBABILITY_PER_SECOND : 1.0,
    canvas: undefined,
    ctx: undefined,
    soldier: undefined,
    drawLibrary: undefined,
    game: undefined,
    utilities: undefined,
	enemies: [],
	enemyImage: undefined,
	health: 0,
	dt: 1/60,
	//how many have we killed
	score: 0,
	highScore: 0,
	shields: 0,
	enemiesNeededToAdvance: 0,
	advancePercent: 0.66,
	//explosion sprites
	explosions: [],
	cloudImages: undefined,
	splashImage: undefined,

	soundtrack: undefined,
	soundtrackPaused: false,

    //for enemies
    numberOfEnemies: 0,
    numberOfEnemies_Start: 5,
    numberOfEnemies_End: 20,
	enemiesMade: 0,
    inPlay: false,
	enemyGreen: undefined,
	enemyYellow: undefined,
	enemyRed: undefined,

	//pause
	paused: false,
	animationID: 0,
	instruction: false,
	//game state
	gamestate: undefined,

	GAME_STATE:{
		BEGIN: 0,
		INSTRUCTIONS: 1,
		DEFAULT: 2,
		OVER: 3
	},
    gamelevel: undefined,
	GAME_LEVEL:{
        Intro: 0, //intro level no loot
        Health: 1, //intro to health loot
        Shield: 2, //intro to shield loot
        Main: 3  //normal level
    },
	repeatLevel: false,
	//Function Constructors
	Enemy: undefined,
	Soldier: undefined,
	ExplosionSprite: undefined,
	//time passed current and total
	time: 0,
	maxTime: 0,
	//User Interface
	primaryButton:{
		x: undefined,
		y: undefined,
		width: undefined,
		height: undefined
	},
	secondaryButton:{
		x: undefined,
		y: undefined,
		width: undefined,
		height: undefined
	},
    // methods
	init : function(soldier) {
			// declare properties
			this.canvas = document.querySelector('canvas');
			this.canvas.width = this.WIDTH;
			this.canvas.height = this.HEIGHT;
			this.ctx = this.canvas.getContext('2d');


			//Setup User Interface
			this.primaryButton.x = this.secondaryButton.x = 0;
			this.secondaryButton.y = this.HEIGHT - this.HEIGHT/5
			this.primaryButton.y =  this.secondaryButton.y- this.HEIGHT/5;
			this.primaryButton.width = this.secondaryButton.width = this.WIDTH;
			this.primaryButton.height = this.secondaryButton.height = this.HEIGHT/5;
			//Prepare enemy image
			var image = new Image();
			image.src = this.game.IMAGES['enemyGreenImage'];
			this.enemyGreen = image;
			var image = new Image();
			image.src = this.game.IMAGES['enemyYellowImage'];
			this.enemyYellow = image;
			var image = new Image();
			image.src = this.game.IMAGES['enemyRedImage'];
			this.enemyRed = image;

			//Cloud images
			var image = new Image();
			image.src = this.game.IMAGES['cloudImages'];
			this.cloudImages = image;

			//splash
			//Explosion images
			var image = new Image();
			image.src = this.game.IMAGES['splashImage'];
			this.splashImage = image;
			// set up player soldier
			this.soldier = soldier;

			// create an image object
			var image = new Image();

			// get the soldier PNG  - it was already loaded for us
			image.src =  this.game.IMAGES['soldierImage'];

			// set .image property of soldier
			this.soldier.image = image;

			this.soldier.init();

			//click event
			this.canvas.onmousedown = this.doMousedown.bind(this);
			//change game state to begin
            this.gamestate = this.GAME_STATE.BEGIN;
            //make game level equal to Intro
            this.gamelevel = this.GAME_LEVEL.Intro;
            //set the number or enemies that will appear
            this.numberOfEnemies = this.numberOfEnemies_Start;
            //reset
			this.reset();
			//play sound at 20% volume and loop forever
			this.soundtrack = createjs.Sound.play("soundtrack",{loop:-1, volume:0.2});

			this.update();
	},

	reset: function(){
		//reset stuff
		this.health = 100;
		this.time = 0;
		this.shields = this.score = this.enemies.length = this.explosions.length = this.enemiesMade = 0;
		this.soldier.x = this.WIDTH/2;
		this.soldier.y = this.HEIGHT/5 - this.soldier.height/2;
        this.numberOfEnemies += 5;
		this.inPlay = false;
		this.enemiesNeededToAdvance = Math.floor(this.numberOfEnemies * this.advancePercent);
		if(this.gamelevel == this.GAME_LEVEL.Health){
			this.health = 85;
		}
	},
	update: function(){
		// LOOP
		this.animationID = requestAnimationFrame(this.update.bind(this));

		//if paused
		if(this.paused){
			this.pauseScreen();
			return;
		}
		if(this.gamestate == this.GAME_STATE.BEGIN){
			this.inPlay = false;
			this.splashScreen();
			return;
		}
		//if gamestate is instructions
		if(this.gamestate == this.GAME_STATE.INSTRUCTIONS){
			//show instruction screen
			this.instructionScreen();
		}
		if(this.score > this.highScore){
				this.highScore = this.score;
		}
		if(this.time > this.maxTime){
				this.maxTime = this.time;
		}
        if(this.gamestate == this.GAME_STATE.OVER){
			this.inPlay = false;
			this.gameOverScreen();
			cancelAnimationFrame(this.animationID);
			return;
		}
		else if(this.gamestate == this.GAME_STATE.DEFAULT){
			//get deltaTime
			var deltaTime = this.calculateDeltaTime();
			// UPDATE
			this.moveSprites(deltaTime);
			//check for click
			this.checkForCollisions();

			//check for health
			if(this.health <= 0){
				this.health = 0;
				this.gamestate = this.GAME_STATE.OVER;
				return;
			}
			if(this.shields <= 0){
				this.shields = 0;
			}

			//If we are in the first level
			if(this.gamelevel == this.GAME_LEVEL.Intro){
				//remove shields
				//this.shields = 0;
				//check if max number of enemies have been created and destroyed
				if(this.enemiesMade >= this.numberOfEnemies && this.enemies.length < 1){
					if(this.score > this.enemiesNeededToAdvance){
						//move on to the next level
						this.gamelevel = this.GAME_LEVEL.Health;
					}
					else{
						this.repeatLevel = true;
						this.numberOfEnemies -= 5;
					}
					//reset everything
					this.reset();
				}
			}
			//if we are in the second level
			if(this.gamelevel == this.GAME_LEVEL.Health){
				//check if max number of enemies have been created and destroyed
				if(this.enemiesMade >= this.numberOfEnemies && this.enemies.length < 1){
					if(this.score > this.enemiesNeededToAdvance){
						//move on to the next level
						this.gamelevel = this.GAME_LEVEL.Shield;
					}
					else{
						this.repeatLevel = true;
						this.numberOfEnemies -= 5;
					}
					//reset everything
					this.reset();
				}
			}
			//if we are in the third level
			if(this.gamelevel == this.GAME_LEVEL.Shield){
				//draw HUD for this
				//check if max number of enemies have been created and destroyed
				if(this.enemiesMade >= this.numberOfEnemies && this.enemies.length < 1){
					if(this.score > this.enemiesNeededToAdvance){
						//move on to the next level
						this.gamelevel = this.GAME_LEVEL.Main;
					}
					else{
						this.repeatLevel = true;
						this.numberOfEnemies -= 5;
					}
					//reset everything
					this.reset();
				}
			}
			//DRAW
			this.draw();
			if(this.inPlay){
				this.time++;
			}
		}

	},

	draw: function(){
		// DRAW
		// clear screen
		this.drawLibrary.clear(this.ctx,0,0,this.WIDTH,this.HEIGHT);
		this.soldier.draw(this.ctx);

		// i) draw background for the clickable area
		this.drawLibrary.backgroundGradient(this.ctx,this.WIDTH,this.HEIGHT);
		// ii) draw sprites
		//draw enemies
		 for(var i = 0; i < this.enemies.length; i++){
			 this.enemies[i].draw(this.ctx);
		 }
		//draw explosions
		this.explosions.forEach(function(explosion){
			explosion.draw(this.ctx);
		}, this);
		this.drawHUD();
	},

	moveSprites: function(dt){
		var paddingX = this.soldier.width/2;
		this.soldier.x = this.utilities.clamp(this.soldier.x, paddingX, this.WIDTH-paddingX);
		var paddingY = this.soldier.height/2;
		this.soldier.y = this.utilities.clamp(this.soldier.y, paddingY, this.HEIGHT-paddingY);
		//this.soldier.update(dt);
		//enemy update
		for(var i = 0; i < this.enemies.length; i++){
			this.enemies[i].update(dt, this.inPlay);
		}

		//enemy filter returns a new array with only active enemies
		this.enemies = this.enemies.filter(function(enemy){
			return enemy.active;
		});

        //Make enemies
        this.makeEnemies();
		//Explosions
		this.explosions.forEach(function(explosion){
			explosion.update(this.dt);
		}, this);
		this.explosions = this.explosions.filter(function(explosion){
			return explosion.active;
		});
	},

	//makes enemies every
    makeEnemies: function(){
        if(this.inPlay){
			 //if in Intro
		if(this.gamelevel == this.GAME_LEVEL.Intro){
			if(this.enemiesMade < this.numberOfEnemies){
				if(Math.random() < this.ENEMY_PROBABILITY_PER_SECOND/90){
                	this.enemies.push(new game.Enemy(this.enemyGreen, this.enemyYellow, this.enemyRed, this.WIDTH, this.HEIGHT, 0));
					this.enemiesMade++;
            	}
			}
        }
		 //if in Health Intro level
		if(this.gamelevel == this.GAME_LEVEL.Health){
          if(this.enemiesMade < this.numberOfEnemies){
				if(Math.random() < this.ENEMY_PROBABILITY_PER_SECOND/80){
                	this.enemies.push(new game.Enemy(this.enemyGreen, this.enemyYellow, this.enemyRed, this.WIDTH, this.HEIGHT, 1));
					this.enemiesMade++;
            	}
		  }
        }
        //if in Shield Intro level
		if(this.gamelevel == this.GAME_LEVEL.Shield){
          if(this.enemiesMade < this.numberOfEnemies){
				if(Math.random() < this.ENEMY_PROBABILITY_PER_SECOND/70){
                	this.enemies.push(new game.Enemy(this.enemyGreen, this.enemyYellow, this.enemyRed, this.WIDTH, this.HEIGHT, 2));
					this.enemiesMade++;
            	}
			}
        }
        //if in Main Level
		if(this.gamelevel == this.GAME_LEVEL.Main){
			var enemyTime;
			//make them appear faster as time goes on

			if(this.time/60 > 90){
				enemyTime = 30;
			}
			else if(this.time/60> 60){
				enemyTime = 40;
			}
			else if(this.time/60 > 30){
				enemyTime = 50;
			}
			else{
				enemyTime = 60;
			}
            if(Math.random() < this.ENEMY_PROBABILITY_PER_SECOND/enemyTime){
                this.enemies.push(new game.Enemy(this.enemyGreen, this.enemyYellow, this.enemyRed, this.WIDTH, this.HEIGHT, 3));
            }
        }
		}
    },
	checkEnemyClicked: function(mouse){
		//check every enemy to see who we clicked
		var clicker = this;
		this.enemies.forEach(function(enemy){
			if(clicker.collides(enemy, mouse, false)){
				var rand = clicker.utilities.getRandom(0.3, 0.6);
				//get loot
				if(enemy.loot < 0.25 && clicker.health < 100){
					clicker.health++;
				}
				else if(enemy.loot < 0.6){
					clicker.shields+= rand;
				}
				enemy.explode(clicker.ctx);
				clicker.createExplosion(enemy.x, enemy.y, -enemy.xVelocity/4, -enemy.yVelocity/4);
				clicker.score++;
			}
		});
	},
	checkForCollisions: function(mouse){
		//'this' becomes undefined in a foreach loop so let us preserve it
		var clicker = this;
		this.enemies.forEach(function(enemy){
			if(clicker.collides(enemy, clicker.soldier, false)){
				enemy.explode(clicker.ctx);
				clicker.createExplosion(enemy.x, enemy.y, -enemy.xVelocity/4, -enemy.yVelocity/4);
				var damage = clicker.utilities.getRandomInt(1, 5);
				if(clicker.shields >= 1){
					clicker.shields -= damage;
					createjs.Sound.play("shield",{volume: 0.4});
				}
				else{
					clicker.health-= damage;
				}
			}
		});
	},

	//Takes in two objects and returns if they collide
	collides: function(a, b, corner){
		//Since we are drawing from the center shift the x and y to corners
		var ax = a.x - a.width/2,
		    ay = a.y - a.height/2,
		    bx = b.x - b.width/2,
		    by = b.y - b.height/2;

		if(corner){
			ax = a.x;
			ay = a.y;
			bx = b.x,
			by = b.y;
		}
		return  ax < bx + b.width &&
				ax + a.width > bx &&
			    ay < by + b.height &&
				ay + a.height > by;
	},

	//do mouse down
	doMousedown: function(e){
		//get mouse location
		var mouse = this.utilities.getMouse(e);
		//unpause on click
		if(this.paused){
			//resume the game
			this.resumeGame();
			return;
		}
		//if we are in start screen play the game
		if(this.gamestate == this.GAME_STATE.BEGIN){

			if(this.collides(mouse, this.primaryButton, true)){
				this.gamestate = this.GAME_STATE.DEFAULT;
			}
			else if(this.collides(this.secondaryButton, mouse, true)){
				//change to instructions
				this.gamestate = this.GAME_STATE.INSTRUCTIONS;
			}
			return;
		}
		//if it is in instruction screen
		if(this.gamestate == this.GAME_STATE.INSTRUCTIONS){
			//set to default screen
			this.gamestate = this.GAME_STATE.DEFAULT;
			return;
		}
  		//if game is over restart a new game
		if(this.gamestate == this.GAME_STATE.OVER){
			this.gamestate = this.GAME_STATE.DEFAULT;
			this.reset();
			this.update();
		}
		if(this.repeatLevel){
			this.repeatLevel = false;
		}
		if(this.inPlay){
			this.checkEnemyClicked(mouse);
			//this.checkForCollisions(mouse);
		}
		if(this.gamestate == this.GAME_STATE.DEFAULT && !this.paused){
			this.inPlay = true;
		}
	},

	//create explosion
	createExplosion: function(x, y, xVelocity, yVelocity){
		//Play sound
		createjs.Sound.play("pop",{volume: 0.6});
		// ExplosionSprite(image, width, height, frameWidth, frameHeight, frameDelay)
		var explosion = new game.ExplosionSprite(this.cloudImages,128,128,74,60,1/15);
		explosion.x = x;
		explosion.y = y;
		explosion.xVelocity = xVelocity;
		explosion.yVelocity = yVelocity;
		this.explosions.push(explosion);
	},

	//sound
	resumeSoundtrack: function(){
		this.soundtrack._resume();
	},
	pauseSoundtrack: function(){
		this.soundtrack._pause();
	},
	toggleSoundtrack: function(){
		this.soundtrackPaused = !this.soundtrackPaused;
		if(this.soundtrackPaused){
			this.pauseSoundtrack();
		}
		else{
			this.resumeSoundtrack();
		}
	},

	//draw display text
	drawHUD: function(){
		var grad = this.drawLibrary.getGradient(this.ctx, this.WIDTH,this.HEIGHT,0,0);
		///////////////////////////////////////////////////////////////////////////////////
		//Default HUD
		////////////////////////////////////////////////////////////////////////////////////
		this.ctx.save();
		//draw score
		this.drawLibrary.text(this.ctx, 'Time: ' + parseInt(this.time/60) + 's', this.WIDTH/2 - 50, 40, 24, "#231f20");
		this.drawLibrary.text(this.ctx, 'Score: ' + this.score, this.WIDTH - 150, 40, 24, "#231f20");

		//var barWidth = -(this.WIDTH - 770);
		var barWidth = 400;
		var healthPercent = this.health/100;
		barWidth *= healthPercent;
		//healthbar
		this.drawLibrary.rect(this.ctx, 20, 10, 400, 40, "#e74c3c");
		this.drawLibrary.rect(this.ctx, 20, 10, barWidth, 40, grad);

        if(this.shields >= 1){
            //shields text
		  this.drawLibrary.text(this.ctx, 'Shields: ' + parseInt(this.shields), 25, 80,24, "left", grad);
        }
		//health text
		this.drawLibrary.text(this.ctx, 'Health: ' + this.health +"%", 25, 40, 24,"left","#f3f6fa");
		if(this.gamestate == this.GAME_STATE.DEFAULT){
		////////////////////////////////////////////////////////////////////////////////////
		//Intro HUD
		////////////////////////////////////////////////////////////////////////////////////
		if(this.gamelevel == this.GAME_LEVEL.Intro && !this.inPlay && !this.repeatLevel){
			//Draw rounded rectangle background
			this.drawLibrary.drawPolygon(this.ctx, [[50,   50],[this.WIDTH - 50,  50],[this.WIDTH - 50, this.HEIGHT - 50],[50, this.HEIGHT - 50]], 10, "rgba(31,36, 29,0.65)");
			this.drawLibrary.text(this.ctx, "Help! Bob is in danger.", this. WIDTH/2, this.HEIGHT/3, 42, "center", "#f3f6fa");
			this.drawLibrary.text(this.ctx, "Click on the enemies before they enrage and attack Bob.", this. WIDTH/2, this.HEIGHT/2, 28, "center", "#7FBE41");
			this.drawLibrary.text(this.ctx, "Let's see if you can eliminate " + this.enemiesNeededToAdvance + " enemies.", this. WIDTH/2, this.HEIGHT - this.HEIGHT/3, 28, "center", "#f3f6fa");
		}

		////////////////////////////////////////////////////////////////////////////////////
		//Health HUD
		////////////////////////////////////////////////////////////////////////////////////
		if(this.gamelevel == this.GAME_LEVEL.Health && !this.inPlay && !this.repeatLevel){
			this.drawLibrary.drawPolygon(this.ctx, [[50,   50],[this.WIDTH - 50,  50],[this.WIDTH - 50, this.HEIGHT - 50],[50, this.HEIGHT - 50]], 10, "rgba(31,36, 29,0.65)");
			this.drawLibrary.text(this.ctx, "Good Job!", this. WIDTH/2, this.HEIGHT/3, 42, "center", "#f3f6fa");
			this.drawLibrary.text(this.ctx, "Eliminating enemies can replenish Bob's health.", this. WIDTH/2, this.HEIGHT/2, 36, "center", "#7FBE41");
			this.drawLibrary.text(this.ctx, "Let's try that by eliminating at least " + this.enemiesNeededToAdvance + " enemies.", this. WIDTH/2, this.HEIGHT - this.HEIGHT/3, 28, "center", "#f3f6fa");
		}
		////////////////////////////////////////////////////////////////////////////////////
		//Shield HUD
		////////////////////////////////////////////////////////////////////////////////////
		if(this.gamelevel == this.GAME_LEVEL.Shield && !this.inPlay && !this.repeatLevel){
			this.drawLibrary.drawPolygon(this.ctx, [[50,   50],[this.WIDTH - 50,  50],[this.WIDTH - 50, this.HEIGHT - 50],[50, this.HEIGHT - 50]], 10, "rgba(31,36, 29,0.65)");
			this.drawLibrary.text(this.ctx, "You're getting the hang of this.", this. WIDTH/2, this.HEIGHT/3, 42, "center", "#f3f6fa");
			this.drawLibrary.text(this.ctx, "Enemies also drop shields which make Bob immune.", this. WIDTH/2, this.HEIGHT/2, 36, "center", "#7FBE41");
			this.drawLibrary.text(this.ctx, "Collect some shields by defeating " + this.enemiesNeededToAdvance + " enemies.", this. WIDTH/2, this.HEIGHT - this.HEIGHT/3, 28, "center", "#f3f6fa");
		}
		////////////////////////////////////////////////////////////////////////////////////
		//Main HUD
		////////////////////////////////////////////////////////////////////////////////////
		if(this.gamelevel == this.GAME_LEVEL.Main && !this.inPlay && !this.repeatLevel){
			this.drawLibrary.drawPolygon(this.ctx, [[50,   50],[this.WIDTH - 50,  50],[this.WIDTH - 50, this.HEIGHT - 50],[50, this.HEIGHT - 50]], 10, "rgba(31,36, 29,0.65)");
			this.drawLibrary.text(this.ctx, "Awesome!", this. WIDTH/2, this.HEIGHT/3, 60, "center", "#f3f6fa");
			this.drawLibrary.text(this.ctx, "Now you're on your own.", this. WIDTH/2, this.HEIGHT/2, 36, "center", "#7FBE41");
			this.drawLibrary.text(this.ctx, "Good Luck!", this. WIDTH/2, this.HEIGHT - this.HEIGHT/3, 36, "center", "#f3f6fa");
		}
		////////////////////////////////////////////////////////////////////////////////////
		//Repeat HUD
		////////////////////////////////////////////////////////////////////////////////////
		if(this.repeatLevel && !this.inPlay){
			this.drawLibrary.drawPolygon(this.ctx, [[50,   50],[this.WIDTH - 50,  50],[this.WIDTH - 50, this.HEIGHT - 50],[50, this.HEIGHT - 50]], 10, "rgba(31,36, 29,0.65)");
			this.drawLibrary.text(this.ctx, "Oh no! Let's try that again.", this. WIDTH/2, this.HEIGHT/3, 60, "center", "#f3f6fa");
			this.drawLibrary.text(this.ctx, "Try defeating " + this.enemiesNeededToAdvance + " enemies or more this time", this. WIDTH/2, this.HEIGHT/2, 36, "center", "#7FBE41");
			this.drawLibrary.text(this.ctx, "Good Luck!", this. WIDTH/2, this.HEIGHT - this.HEIGHT/3, 36, "center", "#f3f6fa");
		}
		}
		this.ctx.restore();
	},

	//draw splash screen
	splashScreen: function(){
		var grad = this.drawLibrary.getGradient(this.ctx, 0, this.HEIGHT/3, this.WIDTH, this.HEIGHT);
		var titleSize = 72,
			textSize = 60,
			padding = textSize/2;
		this.ctx.save();
		this.drawLibrary.rect(this.ctx, 0,0, this.WIDTH, this.HEIGHT, "#f3f6fa");
		this.drawLibrary.splash(this.ctx, this.splashImage, 0, 0, this.WIDTH, 432);
		//Title
		this.drawLibrary.text(this.ctx, "Clicker Thing", this.WIDTH/2 , this.HEIGHT/6, titleSize,"center", "#f3f6fa");
		//Primary Button
		this.drawLibrary.text(this.ctx, "by Erick Sauri", this.WIDTH/2 , this.HEIGHT/6 + 40, 24,"center", "#f3f6fa");

		this.drawLibrary.rect(this.ctx, this.primaryButton.x, this.primaryButton.y, this.primaryButton.width, this.primaryButton.height,"#7FBD42");
		this.drawLibrary.text(this.ctx, "Play", this.WIDTH/2 , this.primaryButton.y + textSize + padding, textSize,"center", "#f3f6fa");
		//Secondary Button
		this.drawLibrary.rect(this.ctx, this.secondaryButton.x, this.secondaryButton.y, this.secondaryButton.width, this.secondaryButton.height, "#e74c3c");
		this.drawLibrary.text(this.ctx, "How To Play", this.WIDTH/2 , this.secondaryButton.y + textSize + padding, textSize,"center", "#f3f6fa");
		this.ctx.restore();
	},
	//draw game over screen
	gameOverScreen: function(){
		var grad = this.drawLibrary.getGradient(this.ctx, 0, this.HEIGHT/3, this.WIDTH, this.HEIGHT);
		this.drawLibrary.drawPolygon(this.ctx, [[50,   50],[this.WIDTH - 50,  50],[this.WIDTH - 50, this.HEIGHT - 50],[50, this.HEIGHT - 50]], 10, "rgba(31,36, 29,0.65)");
		this.ctx.textBaseline = "middle";
		this.drawLibrary.text(this.ctx, "GAME OVER", this.WIDTH/2, this.HEIGHT/4, 100,"center", "#e74c3c");
		this.drawLibrary.text(this.ctx, "You have failed Bob", this.WIDTH/2, this.HEIGHT/2 - 50, 36, "center", "#f3f6fa");
		this.drawLibrary.text(this.ctx, "His family is now in mourning", this.WIDTH/2, this.HEIGHT/2, 36, "center", "#f3f6fa");
		this.drawLibrary.text(this.ctx, "Click to start a new game", this.WIDTH/2, this.HEIGHT/2 + 50,36, "center", "#f3f6fa");
		this.drawLibrary.text(this.ctx, "Your Final Score is " + this.score + " and your Highest Score was " + this.highScore, this.WIDTH/2, this.HEIGHT/2 + 100,28, "center", "#e74c3c");
		this.drawLibrary.text(this.ctx, "Bob survived a total of " + parseInt( this.time/60) +" seconds, the maximum time survied is " + parseInt(this.maxTime/60) +" seconds" , this.WIDTH/2, this.HEIGHT/2 + 150,24, "center", "#e74c3c");
	},
	//draw pause screen
	pauseScreen: function(){
		//Nice gradient for color
		var grad = this.drawLibrary.getGradient(this.ctx, this.WIDTH/2 - 125, this.HEIGHT/2 - 200, 100, 400);
		//White background
		this.drawLibrary.clear(this.ctx,0,0,this.WIDTH,this.HEIGHT);

		//Left and right Bar
		this.drawLibrary.rect(this.ctx, this.WIDTH/2 - 150, this.HEIGHT/2 - 220, 100, 400, grad);
		this.drawLibrary.rect(this.ctx, this.WIDTH/2 + 50, this.HEIGHT/2 - 220, 100, 400, grad);
		this.ctx.save();
		//pause text
		this.drawLibrary.text(this.ctx, 'Paused', this.WIDTH/2, this.HEIGHT/8, 72,"center",grad);
		//this.drawLibrary.text(this.ctx, "Press 'P' or click the screen to resume game.", this.WIDTH/2, this.HEIGHT/5, 36,"center",grad);
		this.drawLibrary.rect(this.ctx, this.secondaryButton.x, this.secondaryButton.y, this.secondaryButton.width, this.secondaryButton.height, "#7FBD42");
		this.drawLibrary.text(this.ctx, "Press 'P' or click the screen to resume game.", this.WIDTH/2 , this.secondaryButton.y + 86, 42,"center", "#f3f6fa");
		this.ctx.restore();
	},

    //instruction screen
    instructionScreen: function(){
        //Nice gradient for color
		var grad = this.drawLibrary.getGradient(this.ctx, 0, 0, this.WIDTH, this.HEIGHT);
		this.drawLibrary.clear(this.ctx, 0, 0, this.WIDTH, this.HEIGHT);
		this.drawLibrary.backgroundGradient(this.ctx,this.WIDTH,this.HEIGHT);
		this.drawHUD();
		this.drawLibrary.drawPolygon(this.ctx, [[50,   50],[this.WIDTH - 50,  50],[this.WIDTH - 50, this.HEIGHT - 50],[50, this.HEIGHT - 50]], 10, "rgba(31,36, 29,0.65)");
		this.drawLibrary.text(this.ctx, "How to Play", this.WIDTH/2, 200, 60,"center", "#f3f6fa");
		this.drawLibrary.text(this.ctx, "Click on enemies before they enrage.", this. WIDTH/2, this.HEIGHT/3 + 50, 24, "center", "#f3f6fa");
		this.drawLibrary.text(this.ctx, "Yellow enemies are close to enraging.", this. WIDTH/2, this.HEIGHT/3 + 125, 24, "center", "#f3f6fa");
		this.drawLibrary.text(this.ctx, "Red enemies are enraged and will attack Bob.", this. WIDTH/2, this.HEIGHT/3 + 200, 24, "center", "#f3f6fa");
		this.drawLibrary.text(this.ctx, "Defeating enemies can replenish health or grant protection.", this. WIDTH/2, this.HEIGHT/3 + 275, 24, "center", "#f3f6fa");
		this.drawLibrary.text(this.ctx, "Hit enter to skip tutorial", this. WIDTH/2, this.HEIGHT/3 + 350, 36, "center", "#e74c3c");

    },
	//pause game
	pauseGame: function(){
		//set pause to true
		this.paused = true;
		//stop animation loop
		cancelAnimationFrame(this.animationID);
		//can update once to draw pause screen
		this.update();
		//stop playing audio
		this.pauseSoundtrack();
	},

	//resume game
	resumeGame: function(){
		//stop animation frame in case it is running
		cancelAnimationFrame(this.animationID);
		//set pause to false
		this.paused = false;
		//restart loop
		this.update();
		//play audio again
		this.resumeSoundtrack();
	},
	toggleGame: function(){
		//set paused to its opposite
		this.paused = !this.paused;
		if(this.paused){
			this.pauseGame();
		}
		else{
			this.resumeGame();
		}
	},

	calculateDeltaTime: function(){
		// what's with (+ new Date) below?
		// + calls Date.valueOf(), which converts it from an object to a
		// primitive (number of milliseconds since January 1, 1970 local time)
		var now,fps;
		now = (+new Date);
		fps = 1000 / (now - this.lastTime);
		fps = this.utilities.clamp(fps, 12, 60);
		this.lastTime = now;
		return 1/fps;
	}
}; // end game.clicker
