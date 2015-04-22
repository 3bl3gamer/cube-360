function WebGLPano(canvas) {
	this.vertexPosBuffer = null;
	this.texCoordBuffer = null;
	this.indexBuffer = null;
	this.shaderProgram = null;
	
	var gl = canvas.getContext("webgl") ||
	         canvas.getContext("experimental-webgl");
	if (!gl) throw new Error("Could not initialise WebGL, sorry :-(");
	this.gl = gl;
	
	this._initShaders();
	this._initBuffers();
	this._bindBuffers();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
}

WebGLPano.shader = {};
WebGLPano.shader.fs = "\
	precision mediump float;\
	varying vec2 vTextureCoord;\
	uniform sampler2D uSampler;\
	\
	void main(void) {\
		gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\
	}",
WebGLPano.shader.vs = "\
	attribute vec3 aVertexPosition;\
	attribute vec2 aTextureCoord;\
	uniform mat4 uMVMatrix;\
	uniform mat4 uPMatrix;\
	varying vec2 vTextureCoord;\
	\
	void main(void) {\
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\
		vTextureCoord = aTextureCoord;\
	}";

WebGLPano.prototype.resize = function(canvas) {
	var gl = this.gl;
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
}

WebGLPano.prototype.handleLoadedImage = function(img) {
	var gl = this.gl;
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);//RGBA
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);//NEAREST
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return tex;
}

WebGLPano.prototype.drawStart = function(pMatrix) {
	var gl = this.gl;
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, pMatrix);
}

WebGLPano.prototype.drawSide = function(pMatrix, mvMatrix, texture) {
	var gl = this.gl;
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(this.shaderProgram.samplerUniform, 0);
	
	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, mvMatrix);
	gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

WebGLPano.prototype.drawEnd = function(pMatrix) {
	
}


WebGLPano.prototype._buildShader = function(gl, shaderText, type) {
	// type: gl.FRAGMENT_SHADER or gl.VERTEX_SHADER
	var shader = gl.createShader(type);
	
	gl.shaderSource(shader, shaderText);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error("Shader compile error:\n" + gl.getShaderInfoLog(shader));
	}
	
	return shader;
}

WebGLPano.prototype._buildShaderProgram = function(gl, fsText, vsText) {
	var fragmentShader = this._buildShader(gl, fsText, gl.FRAGMENT_SHADER);
	var vertexShader = this._buildShader(gl, vsText, gl.VERTEX_SHADER);
	
	var prog = gl.createProgram();
	gl.attachShader(prog, vertexShader);
	gl.attachShader(prog, fragmentShader);
	gl.linkProgram(prog);
	
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		var err = gl.getProgramInfoLog(prog);
		gl.deleteProgram(prog);
		throw new Error("Shader linking error:\n" + err);
	}
	return prog;
}

WebGLPano.prototype._initShaders = function() {
	var gl = this.gl;
	var prog = this._buildShaderProgram(gl, WebGLPano.shader.fs, WebGLPano.shader.vs);
	
	gl.useProgram(prog);
	
	prog.vertexPosAttribute = gl.getAttribLocation(prog, "aVertexPosition");
	gl.enableVertexAttribArray(prog.vertexPosAttribute);

	prog.texCoordAttribute = gl.getAttribLocation(prog, "aTextureCoord");
	gl.enableVertexAttribArray(prog.texCoordAttribute);

	prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");
	prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");
	prog.samplerUniform = gl.getUniformLocation(prog, "uSampler");
	
	this.shaderProgram = prog;
}

WebGLPano.prototype._initBuffers = function() {
	var gl = this.gl;
	
	this.vertexPosBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
	var vertices = [
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		-1.0,  1.0, -1.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vertexPosBuffer.itemSize = 3;
	this.vertexPosBuffer.numItems = 4;

	this.texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
	var texCoords = [
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	this.texCoordBuffer.itemSize = 2;
	this.texCoordBuffer.numItems = 4;

	this.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	var indexes = [
		0, 1, 2,
		0, 2, 3,
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
	this.indexBuffer.itemSize = 1;
	this.indexBuffer.numItems = 6;
}

WebGLPano.prototype._bindBuffers = function() {
	var gl = this.gl;
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
	gl.vertexAttribPointer(this.shaderProgram.vertexPosAttribute, this.vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
	gl.vertexAttribPointer(this.shaderProgram.texCoordAttribute, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
}


