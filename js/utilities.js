/* 
	Erick Sauri 
	Clicker Thing
	IGME - 330
*/
// utilities.js

"use strict";
var game = game || {};

game.utilities = function(){

	/*
	Function Name: clamp(val, min, max)
	Return Value: returns a value that is constrained between min and max (inclusive) 
	*/
	function clamp(val, min, max){
		return Math.max(min, Math.min(max, val));
	}
	
	
	/*
		Function Name: getRandom(min, max)
		Return Value: a floating point random number between min and max
	*/
	function getRandom(min, max) {
	  return Math.random() * (max - min) + min;
	}
	
	
	/*
		Function Name: getRandomInt(min, max)
		Return Value: a random integer between min and max
	*/
	function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	/*
		Function Name: getRandomUnitVector
		Return Value: a random number for x and y
	*/
	function getRandomUnitVector(){
		var x = getRandom(-1,1);
		var y = getRandom(-1,1);
		var length = Math.sqrt(x*x + y*y);
		if(length == 0){ // very unlikely
			x=1; // point right
			y=0;
			length = 1;
		} else{
			x /= length;
			y /= length;
		}

		return {x:x, y:y};
	}
	function valBetween(val, min, max) {
    	if (val > min) {
        	if (val < max) {
				return val;
			} 
			else return max;
    	} 
		else return min;
	}
	
	/*
		Function Name: pointsInsideCircle(x,y,I)
		Return Value: distance squared
	*/
	function pointsInsideCircle(x, y, I){
		var dx = x - I.x,
			dy = y - I.y;
		 //distance squared
		 return dx * dx + dy * dy <= I.width * I.height;
 	}
	// Function Name: getMouse(e)
	// returns mouse position in local coordinate system of element
	function getMouse(e){
		var mouse = {}
		mouse.x = e.pageX - e.target.offsetLeft;
		mouse.y = e.pageY - e.target.offsetTop;
		mouse.width = 1;
		mouse.height = 1;
		return mouse;
	}
	
	// the "public interface" of this module
	return{
		clamp : clamp,
		getRandom : getRandom,
		getRandomInt : getRandomInt,
		getRandomUnitVector: getRandomUnitVector,
		pointsInsideCircle: pointsInsideCircle,
		getMouse : getMouse,
		valBetween: valBetween
	};
}(); 
