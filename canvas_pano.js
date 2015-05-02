function CanvasPano(canvas) {
	this._rc = canvas.getContext("2d");
	this._curMatrix = mat4.create();
}

CanvasPano.prototype.resize = function(canvas) {}

CanvasPano.prototype.handleLoadedImage = function(img) {
	return img;
}

CanvasPano.prototype.drawStart = function(pMatrix) {
	var canvas = this._rc.canvas;
	this._rc.clearRect(0,0,canvas.width,canvas.height);
}

CanvasPano.prototype.drawSide = function(pMatrix, mvMatrix, texture) {
	var canvas = this._rc.canvas;
	mat4.identity(this._curMatrix);
	mat4.translate(this._curMatrix, [canvas.width/2, canvas.height/2, 0]);
	mat4.scale(this._curMatrix, [canvas.width/2,canvas.height/2,1]);
	mat4.scale(this._curMatrix, [1, -1, 1]);
	mat4.multiply(this._curMatrix, pMatrix);
	mat4.multiply(this._curMatrix, mvMatrix);
	mat4.scale(this._curMatrix, [-1,1,0.9985]); // антишовный костыль №3 (на рёбрах куба)
	this._drawGrid(texture, 4, this._curMatrix);
}

CanvasPano.prototype.drawEnd = function(pMatrix) {}

CanvasPano.prototype._drawGrid = function(img, max_level, mtx) {
	var p0 = mat4.multiplyVec3(mtx, [-1,-1, 1]);
	var p1 = mat4.multiplyVec3(mtx, [ 1,-1, 1]);
	var p2 = mat4.multiplyVec3(mtx, [ 1, 1, 1]);
	var p3 = mat4.multiplyVec3(mtx, [-1, 1, 1]);
	this._drawSubgrid(img, 0,0,0,max_level, p0,p1,p2,p3, mtx);
}

CanvasPano.prototype._drawSubgrid = function(img, i,j,level,max_level, p0,p1,p2,p3, mtx) {
	//var wraped = p0[0] > p1[0] || p3[0] > p2[0] || p0[1] > p3[1] || p1[1] > p2[1];
	var wraped = p0[2] < 1 || p1[2] < 1 || p2[2] < 1 || p3[2] < 1;
	if (!wraped) {
		var w = this._rc.canvas.width;
		var h = this._rc.canvas.height;
		if (p0[0]<0 && p1[0]<0 && p2[0]<0 && p3[0]<0) return;
		if (p0[1]<0 && p1[1]<0 && p2[1]<0 && p3[1]<0) return;
		if (p0[0]>w && p1[0]>w && p2[0]>w && p3[0]>w) return;
		if (p0[1]>h && p1[1]>h && p2[1]>h && p3[1]>h) return;
	}
	if (level == max_level) {
		if (wraped) return;
		var is = 1/(1<<level);
		this._drawPart(
			img,
			i,j, is,is,
			p0[0],p0[1],p1[0],p1[1],p2[0],p2[1],p3[0],p3[1]);
	} else {
		var xo = -1+i*2, yo = -1+j*2;
		var w = 2/(1<<level), w2 = w/2;
		var p01 = mat4.multiplyVec3(mtx, [xo+w2, yo,    1]);
		var p12 = mat4.multiplyVec3(mtx, [xo+w,  yo+w2, 1]);
		var p23 = mat4.multiplyVec3(mtx, [xo+w2, yo+w,  1]);
		var p30 = mat4.multiplyVec3(mtx, [xo,    yo+w2, 1]);
		var pc  = mat4.multiplyVec3(mtx, [xo+w2, yo+w2, 1]);
		w2 = 0.5/(1<<level);
		this._drawSubgrid(img, i,   j,   level+1,max_level, p0, p01,pc, p30, mtx);
		this._drawSubgrid(img, i+w2,j,   level+1,max_level, p01,p1, p12,pc,  mtx);
		this._drawSubgrid(img, i+w2,j+w2,level+1,max_level, pc, p12,p2, p23, mtx);
		this._drawSubgrid(img, i,   j+w2,level+1,max_level, p30,pc, p23,p3,  mtx);
	}
}


// 0 --- 1
// |     |
// 3 --- 2
CanvasPano.prototype._drawPart = function(img, ix,iy,iw,ih, x0,y0,x1,y1,x2,y2,x3,y3) {
	var rc = this._rc;
	var d = 0.08; // антишовный костыль №1 (расширяет облать обрезки)
	var s = 1+16/1014; // антишовный костыль №2 (растягивает кусочки. добавляет искажений!)
	
	rc.save()
	rc.setTransform(
		x1-x0, y1-y0,
		x2-x1, y2-y1,
		x0, y0);
	rc.scale(s,s);
	rc.beginPath();
	rc.moveTo(0-d*2, 0-d  );
	rc.lineTo(1+d,   0-d  );
	rc.lineTo(1+d,   1+d*2);
	rc.closePath(); //ФФ без этого ИНОГДА не clip'ает
	rc.clip();
	rc.drawImage(
		img,
		ix*img.width, iy*img.height,
		iw*img.width, ih*img.height,
		0, 0,
		1, 1);
	rc.restore();
	
	rc.save()
	rc.setTransform(
		x2-x3, y2-y3,
		x3-x0, y3-y0,
		x0, y0);
	rc.scale(s,s);
	rc.beginPath();
	rc.moveTo(1+d*2, 1+d  );
	rc.lineTo(0-d,   1+d  );
	rc.lineTo(0-d,   0-d*2);
	rc.closePath(); //ФФ без этого ИНОГДА не clip'ает
	rc.clip();
	rc.drawImage(
		img,
		ix*img.width, iy*img.height,
		iw*img.width, ih*img.height,
		0, 0,
		1, 1);
	rc.restore();
}
