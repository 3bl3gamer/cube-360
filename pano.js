// Just in case
if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = function(func){ setTimeout(func, 16) }
}

function Pano(canvas, cfg) {
	// CONFIG
	cfg = cfg || {};
	cfg.fovMax = cfg.fovMax || Infinity;
	cfg.fovMin = cfg.fovMin || -Infinity;
	
	// INIT
	var engine = null;
	try {
		if (location.hash == "#no-webgl") throw new Error("OK, without WebGL.");
		engine = new WebGLPano(canvas);
	} catch(e) {
		alert(e.message);
		engine = new CanvasPano(canvas);
	}
	
	var pMatrix = mat4.create();
	var mvMatrices = new function() {
		var i = mat4.identity(mat4.create());
		this.north = i;
		this.south = mat4.rotateY(mat4.create(i),  Math.PI);
		this.west =  mat4.rotateY(mat4.create(i),  Math.PI/2);
		this.east =  mat4.rotateY(mat4.create(i), -Math.PI/2);
		this.top =   mat4.rotateX(mat4.create(i),  Math.PI/2);
		this.bottom =mat4.rotateX(mat4.create(i), -Math.PI/2);
	}
	
	// LOADING
	var images = {};
	var textures = {};
	function setImagesSrc(srcs, onOk, onErr) {
		var n = 0;
		function oneLoaded() {
			n--;
			if (n == 0 && onOk) onOk();
		}
		for (var side in mvMatrices) {
			if (!srcs[side]) continue;
			
			var img = new Image();
			img.src = srcs[side];
			img.onload = (function(side){
				textures[side] = engine.handleLoadedImage(this);
				console.log("["+side+"] done.")
				reqestRedraw();
				oneLoaded();
			}).bind(img, side);
			img.onerror = onErr;
			
			images[side] = img;
			n++;
		}
	}
	
	// DRAWIND
	var fov = 75;
	var xRot = 0;
	var yRot = 0;
	function drawScene() {
		mat4.perspective(fov, canvas.width / canvas.height, 0.1, 1000.0, pMatrix);
		mat4.rotateX(pMatrix, xRot);
		mat4.rotateY(pMatrix, yRot);
		
		engine.drawStart(pMatrix);
		for (var side in mvMatrices) {
			if (!textures[side]) continue;
			engine.drawSide(pMatrix, mvMatrices[side], textures[side]);
		}
		engine.drawEnd(pMatrix);
	}
	var requested = false;
	function redraw() {
		drawScene();
		requested = false;
		smoothIfNecessary();
	}
	function reqestRedraw() {
		if (requested) return;
		requested = true;
		requestAnimationFrame(redraw, canvas);
	}
	
	
	// TRANSFORMING
	function resize() {
		canvas.width  = canvas.offsetWidth  * devicePixelRatio;
		canvas.height = canvas.offsetHeight * devicePixelRatio;
		engine.resize(canvas);
	}
	
	function move(dx, dy) {
		yRot += -dx/10000*fov;
		xRot += -dy/10000*fov;
		reqestRedraw();
	}
	
	function zoom(d) {
		fov = Math.max(cfg.fovMin, Math.min(fov/d, cfg.fovMax));
		reqestRedraw();
	}
	
	function distBetween(x1,y1,x2,y2) {
		return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
	}
	
	
	// MOVEMENT SMOOTHING
	// "proxy" between CONTROLS and TRANSFORMING
	var smooth_dz=1;
	function smoothIfNecessary() {
		if (smooth_dz>0.99 && smooth_dz<1.01) return;
		var nz = 1+(smooth_dz-1)*0.5;
		zoom(smooth_dz/nz);
		smooth_dz = nz;
	}
	function smoothZoom(d) {
		smooth_dz *= d;
		smoothIfNecessary();
	}
	
	
	// CONTROLS
	var p = {};
	var grabbed = false;
	var grab_x, grab_y;
	p.singleDown = function(x, y, is_switching) {
		grabbed = true;
		grab_x = x; grab_y = y;
		return true;
	}
	p.singleMove = function(x, y) {
		if (!grabbed) return false;
		move(x-grab_x, y-grab_y);
		grab_x = x; grab_y = y;
		return true;
	}
	p.singleUp = function(is_switching) {
		var was_down = grabbed;
		grabbed = false;
		return was_down;
	}
	p.wheelRot = function(dx, dy, dz) {
		smoothZoom(Math.pow(2, -dy/250));
		return true;
	}
	
	var grab_len;
	p.doubleDown = function(x1, y1, x2, y2) {
		grabbed = true;
		grab_x = (x1+x2)/2; grab_y = (y1+y2)/2;
		grab_len = distBetween(x1, y1, x2, y2);
		return true;
	}
	p.doubleMove = function(x1, y1, x2, y2) {
		if (!grabbed) return false;
		var cx=(x1+x2)/2, cy=(y1+y2)/2;
		var len = distBetween(x1, y1, x2, y2);
		move(cx-grab_x, cy-grab_y);
		zoom(len/grab_len);
		grab_x = cx; grab_y = cy;
		grab_len = len;
		return true;
	}
	p.doubleUp = function() {
		var was_down = grabbed;
		grabbed = false;
		return was_down;
	}
	
	p.startElem = canvas;
	p.stopElem = document;
	control.add(p);
	
	
	// PUBLIC
	this.resize = resize;
	this.setImagesSrc = setImagesSrc;
	this.reqestRedraw = reqestRedraw;
}
