// from https://code.google.com/p/glmatrix/source/browse/glMatrix.js

// Fallback for systems that don't support WebGL
if(typeof Float32Array != 'undefined') {
        glMatrixArrayType = Float32Array;
} else {
        glMatrixArrayType = Array;
}

/*
 * mat4 - 4x4 Matrix
 */
var mat4 = {};

/*
 * mat4.create
 * Creates a new instance of a mat4 using the default array type
 * Any javascript array containing at least 16 numeric elements can serve as a mat4
 *
 * Params:
 * mat - Optional, mat4 containing values to initialize with
 *
 * Returns:
 * New mat4
 */
mat4.create = function(mat) {
        var dest = new glMatrixArrayType(16);
        
        if(mat) {
                dest[0] = mat[0];
                dest[1] = mat[1];
                dest[2] = mat[2];
                dest[3] = mat[3];
                dest[4] = mat[4];
                dest[5] = mat[5];
                dest[6] = mat[6];
                dest[7] = mat[7];
                dest[8] = mat[8];
                dest[9] = mat[9];
                dest[10] = mat[10];
                dest[11] = mat[11];
                dest[12] = mat[12];
                dest[13] = mat[13];
                dest[14] = mat[14];
                dest[15] = mat[15];
        }
        
        return dest;
};

/*
 * mat4.identity
 * Sets a mat4 to an identity matrix
 *
 * Params:
 * dest - mat4 to set
 *
 * Returns:
 * dest
 */
mat4.identity = function(dest) {
        dest[0] = 1;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = 1;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 0;
        dest[9] = 0;
        dest[10] = 1;
        dest[11] = 0;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;
        return dest;
};

/*
 * mat4.multiply
 * Performs a matrix multiplication
 *
 * Params:
 * mat - mat4, first operand
 * mat2 - mat4, second operand
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.multiply = function(mat, mat2, dest) {
        if(!dest) { dest = mat }
        
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
        var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
        var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
        var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
        
        var b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3];
        var b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7];
        var b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11];
        var b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];
        
        dest[0] = b00*a00 + b01*a10 + b02*a20 + b03*a30;
        dest[1] = b00*a01 + b01*a11 + b02*a21 + b03*a31;
        dest[2] = b00*a02 + b01*a12 + b02*a22 + b03*a32;
        dest[3] = b00*a03 + b01*a13 + b02*a23 + b03*a33;
        dest[4] = b10*a00 + b11*a10 + b12*a20 + b13*a30;
        dest[5] = b10*a01 + b11*a11 + b12*a21 + b13*a31;
        dest[6] = b10*a02 + b11*a12 + b12*a22 + b13*a32;
        dest[7] = b10*a03 + b11*a13 + b12*a23 + b13*a33;
        dest[8] = b20*a00 + b21*a10 + b22*a20 + b23*a30;
        dest[9] = b20*a01 + b21*a11 + b22*a21 + b23*a31;
        dest[10] = b20*a02 + b21*a12 + b22*a22 + b23*a32;
        dest[11] = b20*a03 + b21*a13 + b22*a23 + b23*a33;
        dest[12] = b30*a00 + b31*a10 + b32*a20 + b33*a30;
        dest[13] = b30*a01 + b31*a11 + b32*a21 + b33*a31;
        dest[14] = b30*a02 + b31*a12 + b32*a22 + b33*a32;
        dest[15] = b30*a03 + b31*a13 + b32*a23 + b33*a33;
        
        return dest;
};

/*
 * mat4.multiplyVec3
 * Transforms a vec3 with the given matrix
 * 4th vector component is implicitly '1'
 *
 * Params:
 * mat - mat4 to transform the vector with
 * vec - vec3 to transform
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
mat4.multiplyVec3 = function(mat, vec, dest) {
        if(!dest) { dest = vec }
        
        var x = vec[0], y = vec[1], z = vec[2];
        
        dest[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
        dest[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
        dest[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];
        var w   = mat[3]*x + mat[7]*y + mat[11]*z + mat[15]; //these two lines...
        dest[0] /= w; dest[1] /= w; dest[2] /= w;            //...were added to original file
        
        return dest;
};

/*
 * mat4.frustum
 * Generates a frustum matrix with the given bounds
 *
 * Params:
 * left, right - scalar, left and right bounds of the frustum
 * bottom, top - scalar, bottom and top bounds of the frustum
 * near, far - scalar, near and far bounds of the frustum
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.frustum = function(left, right, bottom, top, near, far, dest) {
        if(!dest) { dest = mat4.create(); }
        var rl = (right - left);
        var tb = (top - bottom);
        var fn = (far - near);
        dest[0] = (near*2) / rl;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        
        dest[4] = 0;
        dest[5] = (near*2) / tb;
        dest[6] = 0;
        dest[7] = 0;
        
        dest[8] = (right + left) / rl;
        dest[9] = (top + bottom) / tb;
        dest[10] = -(far + near) / fn;
        dest[11] = -1;
        
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = -(far*near*2) / fn;
        dest[15] = 0;
        return dest;
};

/*
 * mat4.perspective
 * Generates a perspective projection matrix with the given bounds
 *
 * Params:
 * fovy - scalar, vertical field of view
 * aspect - scalar, aspect ratio. typically viewport width/height
 * near, far - scalar, near and far bounds of the frustum
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.perspective = function(fovy, aspect, near, far, dest) {
        var top = near*Math.tan(fovy*Math.PI / 360.0);
        var right = top*aspect;
        return mat4.frustum(-right, right, -top, top, near, far, dest);
};

/*
 * mat4.rotateX
 * Rotates a matrix by the given angle around the X axis
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotateX = function(mat, angle, dest) {
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        
        // Cache the matrix values (makes for huge speed increases!)
        var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
        var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];

        if(!dest) { 
                dest = mat 
        } else if(mat != dest) { // If the source and destination differ, copy the unchanged rows
                dest[0] = mat[0];
                dest[1] = mat[1];
                dest[2] = mat[2];
                dest[3] = mat[3];
                
                dest[12] = mat[12];
                dest[13] = mat[13];
                dest[14] = mat[14];
                dest[15] = mat[15];
        }
        
        // Perform axis-specific matrix multiplication
        dest[4] = a10*c + a20*s;
        dest[5] = a11*c + a21*s;
        dest[6] = a12*c + a22*s;
        dest[7] = a13*c + a23*s;
        
        dest[8] = a10*-s + a20*c;
        dest[9] = a11*-s + a21*c;
        dest[10] = a12*-s + a22*c;
        dest[11] = a13*-s + a23*c;
        return dest;
};

/*
 * mat4.rotateY
 * Rotates a matrix by the given angle around the Y axis
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotateY = function(mat, angle, dest) {
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
        var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
        
        if(!dest) { 
                dest = mat 
        } else if(mat != dest) { // If the source and destination differ, copy the unchanged rows
                dest[4] = mat[4];
                dest[5] = mat[5];
                dest[6] = mat[6];
                dest[7] = mat[7];
                
                dest[12] = mat[12];
                dest[13] = mat[13];
                dest[14] = mat[14];
                dest[15] = mat[15];
        }
        
        // Perform axis-specific matrix multiplication
        dest[0] = a00*c + a20*-s;
        dest[1] = a01*c + a21*-s;
        dest[2] = a02*c + a22*-s;
        dest[3] = a03*c + a23*-s;
        
        dest[8] = a00*s + a20*c;
        dest[9] = a01*s + a21*c;
        dest[10] = a02*s + a22*c;
        dest[11] = a03*s + a23*c;
        return dest;
};

/*
 * mat4.scale
 * Scales a matrix by the given vector
 *
 * Params:
 * mat - mat4 to scale
 * vec - vec3 specifying the scale for each axis
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.scale = function(mat, vec, dest) {
        var x = vec[0], y = vec[1], z = vec[2];
        
        if(!dest || mat == dest) {
                mat[0] *= x;
                mat[1] *= x;
                mat[2] *= x;
                mat[3] *= x;
                mat[4] *= y;
                mat[5] *= y;
                mat[6] *= y;
                mat[7] *= y;
                mat[8] *= z;
                mat[9] *= z;
                mat[10] *= z;
                mat[11] *= z;
                return mat;
        }
        
        dest[0] = mat[0]*x;
        dest[1] = mat[1]*x;
        dest[2] = mat[2]*x;
        dest[3] = mat[3]*x;
        dest[4] = mat[4]*y;
        dest[5] = mat[5]*y;
        dest[6] = mat[6]*y;
        dest[7] = mat[7]*y;
        dest[8] = mat[8]*z;
        dest[9] = mat[9]*z;
        dest[10] = mat[10]*z;
        dest[11] = mat[11]*z;
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
        return dest;
};

/*
 * mat4.translate
 * Translates a matrix by the given vector
 *
 * Params:
 * mat - mat4 to translate
 * vec - vec3 specifying the translation
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.translate = function(mat, vec, dest) {
        var x = vec[0], y = vec[1], z = vec[2];
        
        if(!dest || mat == dest) {
                mat[12] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
                mat[13] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
                mat[14] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];
                mat[15] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15];
                return mat;
        }
        
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
        var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
        var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
        
        dest[0] = a00;
        dest[1] = a01;
        dest[2] = a02;
        dest[3] = a03;
        dest[4] = a10;
        dest[5] = a11;
        dest[6] = a12;
        dest[7] = a13;
        dest[8] = a20;
        dest[9] = a21;
        dest[10] = a22;
        dest[11] = a23;
        
        dest[12] = a00*x + a10*y + a20*z + mat[12];
        dest[13] = a01*x + a11*y + a21*z + mat[13];
        dest[14] = a02*x + a12*y + a22*z + mat[14];
        dest[15] = a03*x + a13*y + a23*z + mat[15];
        return dest;
};
