/*
	Erick Sauri
	Clicker Thing
	IGME - 330
*/
// solider.js or Bob
// Dependencies:
// Description: singleton object that is a module of game
// properties of the ship and what it needs to know how to do go here

"use strict";

// if game exists use the existing copy
// else create a new object literal
var game = game || {};

// the 'soldier' object literal is now a property of our 'game' global variable
game.soldier = {
	color: "#2c3e50",
	x: 575,
	y: 123,
	width: 120,
	height: 95,
	speed: 250,
	image: undefined,
	drawLibrary: undefined,
	init: function(){
	},

	draw: function(ctx) {
		// we're doing these calculations so we are drawing the soldier from the center x,y
		var halfW = this.width/2;
		var halfH = this.height/2;
		//Change to !this.image when we have our image
		if(!this.image){
			this.drawLibrary.rect(ctx, this.x, this.y, this.width, this.height, this.color);
		} else{
			this.drawLibrary.soldier(ctx,this.image,this.x,this.y,this.width,this.height);
		}
	},

	update: function(dt){
		this.x += this.speed * dt;
		if(this.hitLeftRight(this)){
			this.speed *= -1;
		}
	},

	moveLeft: function(dt){
		this.x -= this.speed * dt;
	},

	moveRight: function(dt){
		this.x += this.speed * dt;
	},

	hitLeftRight: function(obj){
		if(obj.x < obj.width || obj.x > obj.canvasWidth - obj.width){
			return true;
		}
	}
}; // end game.soldier
