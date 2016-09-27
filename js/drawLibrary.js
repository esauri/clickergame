/* 
	Erick Sauri 
	Clicker Thing
	IGME - 330
*/
// drawLibrar7.js
// dependencies: none
"use strict";
var game = game || {};

game.drawLibrary = {
   clear : function(ctx, x, y, w, h) {
		//	ctx.clearRect(x, y, w, h);
			ctx.save();
	   		ctx.fillStyle = "#f3f6fa";
			ctx.fillRect(x, y, w, h);
	   		ctx.restore();
	},
	
	rect : function(ctx, x, y, w, h, color) {
			ctx.save();
			ctx.fillStyle = color;
			ctx.fillRect(x, y, w, h);
			ctx.restore();
	},
	
	circle: function(ctx, x, y, r, color){
		ctx.save();
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.6;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	},
	
	text: function(ctx, string, x, y, size, alignment, color){
		ctx.save();
		ctx.textAlign = alignment;
		ctx.font = size + 'px Quicksand';
		ctx.fillStyle = color;
		ctx.fillText(string, x, y);
		ctx.restore();
	},
	
	  drawPolygon: function(ctx, pts, radius, color) {
	  if (radius > 0) {
		pts = this.getRoundedPoints(pts, radius);
	  }
	  var i, pt, len = pts.length;
	  ctx.save();
	  ctx.fillStyle = color;
	  ctx.beginPath();
	  for (i = 0; i < len; i++) {
		pt = pts[i];
		if (i == 0) {          
		  ctx.moveTo(pt[0], pt[1]);
		} else {
		  ctx.lineTo(pt[0], pt[1]);
		}
		if (radius > 0) {
		  ctx.quadraticCurveTo(pt[2], pt[3], pt[4], pt[5]);
		}
	  }
	  ctx.closePath();
	  ctx.fill();
 	  ctx.restore();
	},

	getRoundedPoints : function(pts, radius) {
	  var i1, i2, i3, p1, p2, p3, prevPt, nextPt,
		  len = pts.length,
		  res = new Array(len);
	  for (i2 = 0; i2 < len; i2++) {
		i1 = i2-1;
		i3 = i2+1;
		if (i1 < 0) {
		  i1 = len - 1;
		}
		if (i3 == len) {
		  i3 = 0;
		}
		p1 = pts[i1];
		p2 = pts[i2];
		p3 = pts[i3];
		prevPt = this.getRoundedPoint(p1[0], p1[1], p2[0], p2[1], radius, false);
		nextPt = this.getRoundedPoint(p2[0], p2[1], p3[0], p3[1], radius, true);
		res[i2] = [prevPt[0], prevPt[1], p2[0], p2[1], nextPt[0], nextPt[1]];
	  }
	  return res;
	},

	getRoundedPoint : function(x1, y1, x2, y2, radius, first) {
	  var total = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
		  idx = first ? radius / total : (total - radius) / total;
	  return [x1 + (idx * (x2 - x1)), y1 + (idx * (y2 - y1))];
	},
	
	bgColors:{
		AQUA: "#4aa0d5",
		BLUE: "#5480f1",
		PURPLE: "#373a47"		
	},
	// a generalized gradient function would be nice
	// write one if you want
	getGradient: function(ctx, x, y, w, h){
		var grad = ctx.createLinearGradient(x,y,w,h);
		grad.addColorStop(.2, this.bgColors.AQUA); // top
		grad.addColorStop(.5, this.bgColors.BLUE); // bottom
		grad.addColorStop(1,this.bgColors.PURPLE); // bottom
		return grad;
	},
	backgroundGradient: function(ctx, width, height){
		ctx.save();		
		var grad = this.getGradient(ctx, 0, 0, 0, height);
		
		ctx.fillStyle=grad;
		ctx.globalAlpha = 0.9;
		ctx.fillRect(0,height/5,width,height);
		ctx.restore();
	},
	soldier: function(ctx,image,x,y,width,height){
			var halfW = width/2;
			var halfH = height/4;
			ctx.drawImage(image, // source image
				0,0,120,95,		 // source coords and width,height
				x - halfW, y - halfH, width, height	
				// destination coords and width,height
			);
	},
	
	enemy: function(ctx, image, x, y, width, height){
		var halfW = width/2;
		var halfH = height/2;
		ctx.drawImage(image, 0, 0, 36, 60, x - halfW, y - halfH, width, height);
	},
	splash: function(ctx, image, x, y, width, height){
		var halfW = width/2;
		var halfH = height/2;
		ctx.drawImage(image, 0, 0, 960, 432, 0, 0, width, height);
	}
};