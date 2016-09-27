/*
	Erick Sauri
	Clicker Thing
	IGME - 330
*/
"use strict";

game.Enemy = function(){

	Enemy.utilities = undefined;
	Enemy.drawLibrary = undefined;
	Enemy.speed = 200;
	Enemy.enemyColors = ["#e74c3c", "#f66b34", "#f2d639", "#2e9f82"];
	Enemy.exhaust = undefined;
	function Enemy(imageGreen, imageYellow, imageRed,canvasWidth,canvasHeight, level) {
		// ivars
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.active = true;

		//Age - as they grow older they get angrier
		this.age = Enemy.utilities.getRandomInt(0,400);

		//Will use this as our time till death counter
		//this.lifetime = 0;
		this.color = Enemy.enemyColors[3];
		//what loot will drop?
		this.loot = Math.random();

		this.width = 36;
		this.height = 60;

		this.imageGreen = imageGreen;
		this.imageYellow = imageYellow;
		this.imageRed = imageRed;
		this.image = this.imageGreen;

		//Particles
		this.exhaust = new game.Emitter();
		this.exhaust.numParticles = 25;
		this.exhaust.red = 243;
		this.exhaust.green = 246;
		this.exhaust.blue = 250;
		this.exhaust.createParticles(emitterPoint(this));
		//============================================
		//Level stuff
		if(level == 0){
			this.age = Enemy.utilities.getRandomInt(0,150);
			this.loot = 1;
		}
		else if(level == 1){
			this.loot = 0.1;
			this.age = Enemy.utilities.getRandomInt(0,200);
		}
		else if(level == 2){
			this.age = Enemy.utilities.getRandomInt(0,350);
		}
		//============================================
		//Checks to see if the enemy is in frenzy mode
		//frenzy mode alters appearance, makes enemy faster and enemy can escape from canvas
		this.frenzied = false;
		this.x = Enemy.utilities.getRandom(this.width, this.canvasWidth - this.width);
		this.y = Enemy.utilities.getRandom(this.height +  (this.canvasHeight / 5), this.canvasHeight - this.height);
		//Get a randon vector
		var randomVector = Enemy.utilities.getRandomUnitVector();
		//set velocity to 200 with the sign of the previous vector to give us direction
		this.xVelocity = 200 * Math.sign(randomVector.x);
		this.yVelocity = 200 * Math.sign(randomVector.y);
		this.amplitude = Enemy.utilities.getRandom(1.5,3.0);
	};

	var e = Enemy.prototype;

	e.draw = function(ctx) {
			var halfW = this.width/2;
			var halfH = this.height/2;
		  	//Change to !this.image when we have our image
			if(!this.image){
				Enemy.drawLibrary.circle(ctx, this.x, this.y, this.width,this.color);
			} else{
				Enemy.drawLibrary.enemy(ctx,this.image,this.x,this.y,this.width,this.height);
				if(this.frenzied){
					ctx.save();
					this.exhaust.updateAndDraw(ctx, emitterPoint(this));
					ctx.restore();
				}
			}
	  };

	e.update = function(dt, inPlay) {
		//if enemy is not enraged
		if(!this.frenzied){
			//Check if top or bottom collision occur
			if(hitTopBottom(this)){
				//Reverse velocity and move
				this.yVelocity *= -1;
				this.y += this.yVelocity * dt;
			}
			if(hitLeftRight(this)){
				//Reverse velocity and move
				this.xVelocity *= -1;
				this.x += this.xVelocity * dt;
			}
			if(this.age > 350){
				this.color = Enemy.enemyColors[2];
				this.image = this.imageYellow;
			}
		}
		//checks to see if the object has passed a certain age to enrage
		enrage(this);
		if(this.frenzied){
			this.image = this.imageRed;
			seek(this);
		}
		this.x += this.xVelocity * dt;
		this.y += this.yVelocity * dt;
		if(inPlay){
			this.age++;
		}
	  };

	e.explode  = function(ctx) {
		this.active = false;
	  };

	// private functiones
	function enrage(obj){
		//Frenzied properties
		if(obj.frenzied){
			//alter appearance
			obj.color = Enemy.enemyColors[0];

		}
		//When the object has lived for a certain period of time
		else if(obj.age > 500){
			//set frenzy to true
			obj.frenzied = true;
		}
	};

	function hitTopBottom(obj){
		if(obj.y < (obj.canvasHeight/4)|| obj.y > obj.canvasHeight - obj.height){
			return true;
		}
	};

	function hitLeftRight(obj){
		if(obj.x < obj.width || obj.x > obj.canvasWidth - obj.width){
			return true;
		}
	};

	function seek(obj){
		//get desired velocity
		var desiredX = 575 - obj.x,
			desiredY = 125 - obj.y;
		//normalize it
		var norm = Math.sqrt(desiredX * desiredX + desiredY * desiredY);
	    if (norm != 0) {
			desiredX = 1 * desiredX / norm;
			desiredY = 1 * desiredY / norm;
	    }
		//multiply desired by speed
		desiredX *= 500;
		desiredY *= 500;
		//steer with desired velocity
		var steerX = desiredX - obj.xVelocity,
			steerY = desiredY - obj.yVelocity;
		obj.xVelocity += Enemy.utilities.valBetween(steerX, -100, 100);
		obj.yVelocity += Enemy.utilities.valBetween(steerY, -500, 500);
	};
	function emitterPoint(obj){
		//2 pixels underneat the enemy
		return{
			x: obj.x,
			y: obj.y + obj.height/2 + 2
		};
	};
	return Enemy;

}();
