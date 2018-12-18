(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.THREE = {})));
}(this, (function (exports) { 'use strict';

	let lut = [];
	for (let i = 0; i < 256; i++) {
	    lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
	}

	let _Math = {
	    DEG2RAD: Math.PI / 180,
	    RAD2DEG: 180 / Math.PI,
	    generateUUID: function () {
	        let d0 = Math.random() * 0xffffffff | 0;
	        let d1 = Math.random() * 0xffffffff | 0;
	        let d2 = Math.random() * 0xffffffff | 0;
	        let d3 = Math.random() * 0xffffffff | 0;
	        let uuid = lut[ d0 & 0xff ] + lut[ d0 >> 8 & 0xff ] + lut[ d0 >> 16 & 0xff ] + lut[ d0 >> 24 & 0xff ] + '-' +
	            lut[ d1 & 0xff ] + lut[ d1 >> 8 & 0xff ] + '-' + lut[ d1 >> 16 & 0x0f | 0x40 ] + lut[ d1 >> 24 & 0xff ] + '-' +
	            lut[ d2 & 0x3f | 0x80 ] + lut[ d2 >> 8 & 0xff ] + '-' + lut[ d2 >> 16 & 0xff ] + lut[ d2 >> 24 & 0xff ] +
	            lut[ d3 & 0xff ] + lut[ d3 >> 8 & 0xff ] + lut[ d3 >> 16 & 0xff ] + lut[ d3 >> 24 & 0xff ];

	        // .toUpperCase() here flattens concatenated strings to save heap memory space.
	        return uuid.toUpperCase();
	    },

	    //限制最小最大值
	    clamp: function (value, min, max) {
	        return Math.max(min, Math.min(max, value));
	    },

	    //计算m % n的欧几里得模
	    euclideanModulo: function (n, m) {
	        return ((n % m) + m) % m;
	    },

	    //线性插值
	    lerp: function (x, y, t) {
	        return (1 - t) * x + t * y;
	    },

	    //平滑值(返回0-1之间的值，该值表示x在最小值和最大值之间移动的百分比，但当x接近最小值和最大值时，则使其平滑或减慢)
	    smoothstep: function (x, min, max) {
	        if (x <= min) return 0;
	        if (x >= max) return 1;
	        x = (x - min) / (max - min);
	        return x * x * (3 - 2 * x);
	    },
	    smootherstep: function (x, min, max) {
	        if (x <= min) return 0;
	        if (x >= max) return 1;
	        x = (x - min) / (max - min);
	        return x * x * x * (x * (x * 6 - 15) + 10);
	    },

	    randInt: function (low, high) {
	        return low + Math.floor(Math.random() * (high - low + 1));
	    },

	    randFloat: function (low, high) {
	        return low + Math.random() * (high - low);
	    },

	    // Random float from <-range/2, range/2> interval
	    randFloatSpread: function (range) {
	        return range * (0.5 - Math.random());
	    },

	    //角度转弧度
	    degToRad: function (degrees) {
	        return degrees * _Math.DEG2RAD;
	    },

	    //弧度转角度
	    radToDeg: function (radians) {
	        return radians * _Math.RAD2DEG;
	    },

	    //是否是n的2次幂
	    isPowerOfTwo: function (value) {
	        return (value & (value - 1)) === 0 && value !== 0;
	    },

	    ceilPowerOfTwo: function (value) {
	        return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
	    },

	    floorPowerOfTwo: function (value) {
	        return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
	    }
	};

	class Matrix3 {
	    constructor(){
	        this.elements = [
	            1, 0, 0,
	            0, 1, 0,
	            0, 0, 1
	       ];
	    }

	    set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
	        let te = this.elements;

	        te[0] = n11; te[1] = n21; te[2] = n31;
	        te[3] = n12; te[4] = n22; te[5] = n32;
	        te[6] = n13; te[7] = n23; te[8] = n33;

	        return this;
	    }

	    identity() {
	        this.set(
	            1, 0, 0,
	            0, 1, 0,
	            0, 0, 1
	        );
	        return this;
	    }

	    clone() {
	        return new this.constructor().fromArray( this.elements );
	    }

	    copy(m) {
	        let te = this.elements;
	        let me = m.elements;

	        te[0] = me[0]; te[1] = me[1]; te[2] = me[2];
	        te[3] = me[3]; te[4] = me[4]; te[5] = me[5];
	        te[6] = me[6]; te[7] = me[7]; te[8] = me[8];

	        return this;
	    }

	    setFromMatrix4(m) {
	        let me = m.elements;
	        this.set(
	            me[0], me[4], me[8],
	            me[1], me[5], me[9],
	            me[2], me[6], me[10]
	        );
	        return this;
	    }

	    getInverse(matrix, throwOnDegenerate) {
	        if ( matrix && matrix.isMatrix4 ) {

	            console.error( "THREE.Matrix3: .getInverse() no longer takes a Matrix4 argument." );

	        }

	        let me = matrix.elements,
	            te = this.elements,

	            n11 = me[0], n21 = me[1], n31 = me[2],
	            n12 = me[3], n22 = me[4], n32 = me[5],
	            n13 = me[6], n23 = me[7], n33 = me[8],

	            t11 = n33 * n22 - n32 * n23,
	            t12 = n32 * n13 - n33 * n12,
	            t13 = n23 * n12 - n22 * n13,

	            det = n11 * t11 + n21 * t12 + n31 * t13;

	        if ( det === 0 ) {

	            let msg = "THREE.Matrix3: .getInverse() can't invert matrix, determinant is 0";

	            if ( throwOnDegenerate === true ) {

	                throw new Error( msg );

	            } else {

	                console.warn( msg );

	            }

	            return this.identity();

	        }

	        let detInv = 1 / det;

	        te[0] = t11 * detInv;
	        te[1] = ( n31 * n23 - n33 * n21 ) * detInv;
	        te[2] = ( n32 * n21 - n31 * n22 ) * detInv;

	        te[3] = t12 * detInv;
	        te[4] = ( n33 * n11 - n31 * n13 ) * detInv;
	        te[5] = ( n31 * n12 - n32 * n11 ) * detInv;

	        te[6] = t13 * detInv;
	        te[7] = ( n21 * n13 - n23 * n11 ) * detInv;
	        te[8] = ( n22 * n11 - n21 * n12 ) * detInv;

	        return this;

	    }

	    transpose() {
	        let tmp, m = this.elements;

	        tmp = m[1]; m[1] = m[3]; m[3] = tmp;
	        tmp = m[2]; m[2] = m[6]; m[6] = tmp;
	        tmp = m[5]; m[5] = m[7]; m[7] = tmp;

	        return this;
	    }

	    getNormalMatrix(matrix4) {
	        return this.setFromMatrix4(matrix4).getInverse(this).transpose();
	    }
	}

	class Vector3 {
	    constructor(x = 0, y = 0, z = 0) {
	        this.isVector3 = true;
	        this.x = x;
	        this.y = y;
	        this.z = z;
	    }

	    copy(v) {
	        this.x = v.x;
	        this.y = v.y;
	        this.z = v.z;
	        return this;
	    }

	    clone() {
	        return new this.constructor(this.x, this.y, this.z);
	    }

	    set(x, y, z) {
	        this.x = x;
	        this.y = y;
	        this.z = z;
	        return this;
	    }

	    zero() {
	        this.x = 0;
	        this.y = 0;
	        this.z = 0;
	        return this;
	    }

	    /**
	     * 左加向量
	     * @param v
	     * @returns {Vector3}
	     */
	    add(v) {
	        this.x += v.x;
	        this.y += v.y;
	        this.z += v.z;
	        return this;
	    }

	    /**
	     * 左加标量
	     * @param s
	     * @returns {Vector3}
	     */
	    addScalar(s) {
	        this.x += s;
	        this.y += s;
	        this.z += s;
	        return this;
	    }

	    /**
	     * 两向量相加
	     * @param a
	     * @param b
	     * @returns {Vector3}
	     */
	    addVectors(a, b) {
	        this.x = a.x + b.x;
	        this.y = a.y + b.y;
	        this.z = a.z + b.z;
	        return this;
	    }

	    sub(v) {
	        this.x -= v.x;
	        this.y -= v.y;
	        this.z -= v.z;
	        return this;
	    }

	    subScalar(s) {
	        this.x -= s;
	        this.y -= s;
	        this.z -= s;
	        return this;
	    }

	    subVectors(a, b) {
	        this.x = a.x - b.x;
	        this.y = a.y - b.y;
	        this.z = a.z - b.z;
	        return this;
	    }

	    multiply(v) {
	        this.x *= v.x;
	        this.y *= v.y;
	        this.z *= v.z;
	        return this;
	    }

	    multiplyScalar(scalar) {
	        this.x *= scalar;
	        this.y *= scalar;
	        this.z *= scalar;
	        return this;
	    }

	    multiplyVectors(a, b) {
	        this.x = a.x * b.x;
	        this.y = a.y * b.y;
	        this.z = a.z * b.z;

	        return this;
	    }

	    divide(v) {
	        this.x /= v.x;
	        this.y /= v.y;
	        this.z /= v.z;
	        return this;
	    }

	    divideScalar(scalar) {
	        return this.multiplyScalar(1 / scalar);
	    }

	    /**
	     * 标准化向量，长度为1
	     * @returns {*}
	     */
	    normalize() {
	        return this.divideScalar(this.length() || 1);
	    }

	    /**
	     * 反转向量
	     * @returns {Vector2}
	     */
	    negate() {
	        this.x = -this.x;
	        this.y = -this.y;
	        this.z = -this.z;
	        return this;
	    }

	    length() {
	        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	    }

	    lengthSq() {
	        return this.x * this.x + this.y * this.y + this.z * this.z;
	    }

	    // 与向量的角度
	    angleTo(v) {
	        let theta = this.dot(v) / (Math.sqrt(this.lengthSq() * v.lengthSq()));
	        return Math.acos(_Math.clamp(theta, -1, 1));
	    }

	    distanceTo(v) {
	        return Math.sqrt(this.distanceToSquared(v));
	    }

	    distanceToSquared(v) {
	        let dx = this.x - v.x,
	            dy = this.y - v.y,
	            dz = this.z - v.z;
	        return dx * dx + dy * dy + dz * dz;
	    }

	    /**
	     * 点乘
	     * @param v
	     * @returns {number}
	     */
	    dot(v) {
	        return this.x * v.x + this.y * v.y + this.z * v.z;
	    }

	    /**
	     * 叉乘
	     * @param v
	     * @returns {Vector3}
	     */
	    cross(v) {
	        let x = this.x;
	        let y = this.y;
	        let z = this.z;

	        this.x = y * v.z - z * v.y;
	        this.y = z * v.x - x * v.z;
	        this.z = x * v.y - this.y * v.x;
	        return this;
	    }

	    crossVectors(a, b) {
	        let ax = a.x, ay = a.y, az = a.z;
	        let bx = b.x, by = b.y, bz = b.z;

	        this.x = ay * bz - az * by;
	        this.y = az * bx - ax * bz;
	        this.z = ax * by - ay * bx;

	        return this;
	    }

	    /**
	     * 将当前向量乘以一个3x3的矩阵
	     * @param m
	     * @returns {Vector3}
	     */
	    applyMatrix3(m) {
	        let x = this.x, y = this.y, z = this.z;
	        let e = m.elements;

	        this.x = e[0] * x + e[3] * y + e[6] * z;
	        this.y = e[1] * x + e[4] * y + e[7] * z;
	        this.z = e[2] * x + e[5] * y + e[8] * z;

	        return this;
	    }

	    /**
	     * 将当前向量乘以一个4x3的矩阵
	     * @param m
	     * @returns {Vector3}
	     */
	    applyMatrix4(m) {
	        let x = this.x, y = this.y, z = this.z;
	        let e = m.elements;

	        let w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

	        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
	        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
	        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

	        return this;
	    }

	    // 用相机投影该向量
	    project(camera) {
	        return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
	    }

	    // 用相机反投影该向量
	    unproject(camera) {
	        let matrix = new Matrix4();
	        return this.applyMatrix4(matrix.getInverse(camera.projectionMatrix)).applyMatrix4(camera.matrixWorld);
	    }

	    lerp(v, alpha) {
	        this.x += (v.x - this.x) * alpha;
	        this.y += (v.y - this.y) * alpha;
	        this.z += (v.z - this.z) * alpha;

	        return this;
	    }

	    lerpVectors(v1, v2, alpha) {
	        return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
	    }

	    /**
	     * 从矩阵中获取位置向量（原getFromMatrixPosition方法）
	     * @param m
	     * @returns {Vector3}
	     */
	    setFromMatrixPosition(m) {
	        let e = m.elements;

	        this.x = e[12];
	        this.y = e[13];
	        this.z = e[14];

	        return this;
	    }

	    /**
	     * 从矩阵中获取缩放向量
	     * @param m
	     * @returns {Vector3}
	     */
	    setFromMatrixScale(m) {
	        let sx = this.setFromMatrixColumn(m, 0).length();
	        let sy = this.setFromMatrixColumn(m, 1).length();
	        let sz = this.setFromMatrixColumn(m, 2).length();

	        this.x = sx;
	        this.y = sy;
	        this.z = sz;

	        return this;
	    }

	    setFromMatrixColumn(m, index) {
	        return this.fromArray(m.elements, index * 4);
	    }

	    min(v) {
	        this.x = Math.min(this.x, v.x);
	        this.y = Math.min(this.y, v.y);
	        this.z = Math.min(this.z, v.z);

	        return this;
	    }

	    max(v) {
	        this.x = Math.max(this.x, v.x);
	        this.y = Math.max(this.y, v.y);
	        this.z = Math.max(this.z, v.z);

	        return this;
	    }

	    equals(v) {
	        return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
	    }

	    fromArray(array, offset) {

	        if (offset === undefined) offset = 0;

	        this.x = array[offset];
	        this.y = array[offset + 1];
	        this.z = array[offset + 2];

	        return this;

	    }

	    toArray(array, offset) {

	        if (array === undefined) array = [];
	        if (offset === undefined) offset = 0;

	        array[offset] = this.x;
	        array[offset + 1] = this.y;
	        array[offset + 2] = this.z;

	        return array;

	    }
	}

	let x = new Vector3();
	let y = new Vector3();
	let z = new Vector3();
	let zero = new Vector3(0, 0, 0);
	let one = new Vector3(1, 1, 1);
	let v1 = new Vector3();

	class Matrix4$1 {
	    constructor() {
	        this.elements = [
	            1, 0, 0, 0,
	            0, 1, 0, 0,
	            0, 0, 1, 0,
	            0, 0, 0, 1
	        ];
	    }

	    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
	        let te = this.elements;

	        te[0] = n11;te[4] = n12;te[8] =  n13;te[12] = n14;
	        te[1] = n21;te[5] = n22;te[9] =  n23;te[13] = n24;
	        te[2] = n31;te[6] = n32;te[10] = n33;te[14] = n34;
	        te[3] = n41;te[7] = n42;te[11] = n43;te[15] = n44;

	        return this;
	    }

	    identity() {
	        this.set(
	            1, 0, 0, 0,
	            0, 1, 0, 0,
	            0, 0, 1, 0,
	            0, 0, 0, 1
	        );

	        return this;
	    }

	    clone() {
	        return new this.constructor(this.elements);
	    }

	    copy(m) {
	        let te = this.elements;
	        let me = m.elements;

	        te[0] = me[0];  te[1] =  me[1]; te[2] =  me[2]; te[3] =  me[3];
	        te[4] = me[4];  te[5] =  me[5]; te[6] =  me[6]; te[7] =  me[7];
	        te[8] = me[8];  te[9] =  me[9]; te[10] = me[10];te[11] = me[11];
	        te[12] = me[12];te[13] = me[13];te[14] = me[14];te[15] = me[15];

	        return this;
	    }

	    copyPosition(m) {
	        let te = this.elements, me = m.elements;

	        te[12] = me[12];
	        te[13] = me[13];
	        te[14] = me[14];

	        return this;
	    }

	    lookAt(eye, target, up) {
	        let te = this.elements;

	        z.subVectors(eye, target);

	        if (z.lengthSq() === 0) {
	            // eye and target are in the same position
	            z.z = 1;
	        }

	        z.normalize();
	        x.crossVectors(up, z);

	        if (x.lengthSq() === 0) {
	            // up and z are parallel
	            if (Math.abs(up.z) === 1) {
	                z.x += 0.0001;
	            } else {
	                z.z += 0.0001;
	            }

	            z.normalize();
	            x.crossVectors(up, z);
	        }

	        x.normalize();
	        y.crossVectors(z, x);

	        te[0] = x.x;te[4] = y.x;te[8] =  z.x;
	        te[1] = x.y;te[5] = y.y;te[9] =  z.y;
	        te[2] = x.z;te[6] = y.z;te[10] = z.z;

	        return this;
	    }

	    /**
	     * 左乘矩阵
	     * @param m
	     * @returns {*}
	     */
	    multiply(m) {
	        return this.multiplyMatrices(this, m);
	    }

	    /**
	     * 右乘矩阵
	     * @param m
	     * @returns {*}
	     */
	    premultiply(m) {
	        return this.multiplyMatrices(m, this);
	    }

	    multiplyMatrices(a, b) {
	        let ae = a.elements;
	        let be = b.elements;
	        let te = this.elements;

	        let a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
	        let a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
	        let a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
	        let a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

	        let b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
	        let b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
	        let b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
	        let b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

	        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
	        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
	        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
	        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

	        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
	        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
	        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
	        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

	        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
	        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
	        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
	        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

	        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
	        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
	        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
	        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

	        return this;
	    }

	    multiplyScalar(s) {
	        let te = this.elements;

	        te[0] *= s;te[4] *= s;te[8] *= s; te[12] *= s;
	        te[1] *= s;te[5] *= s;te[9] *= s; te[13] *= s;
	        te[2] *= s;te[6] *= s;te[10] *= s;te[14] *= s;
	        te[3] *= s;te[7] *= s;te[11] *= s;te[15] *= s;

	        return this;
	    }

	    applyToBufferAttribute(attribute) {
	        for (let i = 0, l = attribute.count; i < l; i++) {
	            v1.x = attribute.getX(i);
	            v1.y = attribute.getY(i);
	            v1.z = attribute.getZ(i);

	            v1.applyMatrix4(this);

	            attribute.setXYZ(i, v1.x, v1.y, v1.z);
	        }
	        return attribute;
	    }

	    /**
	     * 平移矩阵
	     * @param x
	     * @param y
	     * @param z
	     * @returns {Matrix4}
	     */
	    makeTranslation(x, y, z) {
	        this.set(
	            1, 0, 0, x,
	            0, 1, 0, y,
	            0, 0, 1, z,
	            0, 0, 0, 1
	        );

	        return this;
	    }

	    /**
	     * 绕X轴旋转矩阵
	     * @param theta
	     * @returns {Matrix4}
	     */
	    makeRotationX(theta) {
	        let c = Math.cos(theta), s = Math.sin(theta);

	        this.set(
	            1, 0, 0, 0,
	            0, c, -s, 0,
	            0, s, c, 0,
	            0, 0, 0, 1
	        );

	        return this;
	    }

	    makeRotationY(theta) {
	        let c = Math.cos(theta), s = Math.sin(theta);

	        this.set(
	            c, 0, s, 0,
	            0, 1, 0, 0,
	            -s, 0, c, 0,
	            0, 0, 0, 1
	        );

	        return this;
	    }

	    makeRotationZ(theta) {
	        let c = Math.cos(theta), s = Math.sin(theta);

	        this.set(
	            c, -s, 0, 0,
	            s, c, 0, 0,
	            0, 0, 1, 0,
	            0, 0, 0, 1
	        );

	        return this;
	    }

	    makeRotationAxis(axis, angle) {
	        let c = Math.cos(angle);
	        let s = Math.sin(angle);
	        let t = 1 - c;
	        let x = axis.x, y = axis.y, z = axis.z;
	        let tx = t * x, ty = t * y;

	        this.set(
	            tx * x + c, tx * y - s * z, tx * z + s * y, 0,
	            tx * y + s * z, ty * y + c, ty * z - s * x, 0,
	            tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
	            0, 0, 0, 1
	        );

	        return this;
	    }

	    /**
	     * 缩放矩阵
	     * @param x
	     * @param y
	     * @param z
	     * @returns {Matrix4}
	     */
	    makeScale(x, y, z) {
	        this.set(
	            x, 0, 0, 0,
	            0, y, 0, 0,
	            0, 0, z, 0,
	            0, 0, 0, 1
	        );

	        return this;
	    }

	    /**
	     * 通过四元数对Matrix4应用旋转变换
	     * @param q
	     * @returns {Matrix4}
	     */
	    makeRotationFromQuaternion(q) {
	        return this.compose(zero, q, one);
	    }

	    /**
	     * 处理矩阵位移、旋转、缩放
	     * @param position
	     * @param quaternion
	     * @param scale
	     * @returns {Matrix4}
	     */
	    compose(position, quaternion, scale) {

	        let te = this.elements;

	        let x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
	        let x2 = x + x, y2 = y + y, z2 = z + z;
	        let xx = x * x2, xy = x * y2, xz = x * z2;
	        let yy = y * y2, yz = y * z2, zz = z * z2;
	        let wx = w * x2, wy = w * y2, wz = w * z2;

	        let sx = scale.x, sy = scale.y, sz = scale.z;

	        te[0] = (1 - (yy + zz)) * sx;
	        te[1] = (xy + wz) * sx;
	        te[2] = (xz - wy) * sx;
	        te[3] = 0;

	        te[4] = (xy - wz) * sy;
	        te[5] = (1 - (xx + zz)) * sy;
	        te[6] = (yz + wx) * sy;
	        te[7] = 0;

	        te[8] = (xz + wy) * sz;
	        te[9] = (yz - wx) * sz;
	        te[10] = (1 - (xx + yy)) * sz;
	        te[11] = 0;

	        te[12] = position.x;
	        te[13] = position.y;
	        te[14] = position.z;
	        te[15] = 1;

	        return this;

	    }

	    // 创建一个透视投影矩阵
	    makePerspective(left, right, top, bottom, near, far) {
	        let te = this.elements;
	        let x = 2 * near / (right - left);
	        let y = 2 * near / (top - bottom);

	        let a = (right + left) / (right - left);
	        let b = (top + bottom) / (top - bottom);
	        let c = -(far + near) / (far - near);
	        let d = -2 * far * near / (far - near);

	        te[0] = x;te[4] = 0;te[8] = a;  te[12] = 0;
	        te[1] = 0;te[5] = y;te[9] = b;  te[13] = 0;
	        te[2] = 0;te[6] = 0;te[10] = c; te[14] = d;
	        te[3] = 0;te[7] = 0;te[11] = -1;te[15] = 0;

	        return this;
	    }

	    makeOrthographic(left, right, top, bottom, near, far) {
	        let te = this.elements;
	        let w = 1.0 / (right - left);
	        let h = 1.0 / (top - bottom);
	        let p = 1.0 / (far - near);

	        let x = (right + left) * w;
	        let y = (top + bottom) * h;
	        let z = (far + near) * p;

	        te[0] = 2 * w;te[4] = 0;te[8] = 0;te[12] = -x;
	        te[1] = 0;te[5] = 2 * h;te[9] = 0;te[13] = -y;
	        te[2] = 0;te[6] = 0;te[10] = -2 * p;te[14] = -z;
	        te[3] = 0;te[7] = 0;te[11] = 0;te[15] = 1;
	        return this;
	    }

	    // 获取逆矩阵
	    getInverse(m, throwOnDegenerate) {
	        let te = this.elements,
	            me = m.elements,

	            n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
	            n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
	            n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
	            n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],

	            t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
	            t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
	            t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
	            t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

	        let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

	        if (det === 0) {
	            let msg = "THREE.Matrix4: .getInverse() can't invert matrix, determinant is 0";
	            if (throwOnDegenerate === true) {
	                throw new Error(msg);
	            } else {
	                console.warn(msg);
	            }
	            return this.identity();
	        }

	        let detInv = 1 / det;

	        te[0] = t11 * detInv;
	        te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
	        te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
	        te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

	        te[4] = t12 * detInv;
	        te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
	        te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
	        te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

	        te[8] = t13 * detInv;
	        te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
	        te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
	        te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

	        te[12] = t14 * detInv;
	        te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
	        te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
	        te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

	        return this;
	    }

	    equals(matrix) {
	        let te = this.elements;
	        let me = matrix.elements;

	        for (let i = 0; i < 16; i++) {
	            if (te[i] !== me[i]) return false;
	        }

	        return true;
	    }
	}

	class EventDispatcher {
	    addEventListener(type, listener) {
	        if (this._listeners === undefined) this._listeners = {};

	        let listeners = this._listeners;

	        if (listeners[type] === undefined) {
	            listeners[type] = [];
	        }

	        if (listeners[type].indexOf(listener) === -1) {
	            listeners[type].push(listener);
	        }
	    }

	    hasEventListener(type, listener) {
	        if (this._listeners === undefined) return false;

	        let listeners = this._listeners;

	        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
	    }

	    removeEventListener(type, listener) {
	        if (this._listeners === undefined) return;

	        let listeners = this._listeners;
	        let listenerArray = listeners[type];

	        if (listenerArray !== undefined) {
	            let index = listenerArray.indexOf(listener);

	            if (index !== -1) {
	                listenerArray.splice(index, 1);
	            }

	        }
	    }

	    dispatchEvent(event) {
	        if (this._listeners === undefined) return;

	        let listeners = this._listeners;
	        let listenerArray = listeners[event.type];

	        if (listenerArray !== undefined) {

	            event.target = this;

	            let array = listenerArray.slice(0);

	            for (let i = 0, l = array.length; i < l; i++) {
	                array[i].call(this, event);
	            }
	        }
	    }
	}

	let matrix = new Matrix4$1();

	class Euler {
	    constructor(x = 0, y = 0, z = 0, order = Euler.DefaultOrder) {
	        this.isEuler = true;
	        this._x = x;
	        this._y = y;
	        this._z = z;
	        this._order = order;
	    }

	    get x() {
	        return this._x;
	    }

	    set x(value) {
	        this._x = value;
	        this.onChangeCallback();
	    }

	    get y() {
	        return this._y;
	    }

	    set y(value) {
	        this._y = value;
	        this.onChangeCallback();
	    }

	    get z() {
	        return this._z;
	    }

	    set z(value) {
	        this._z = value;
	        this.onChangeCallback();
	    }

	    set(x, y, z, order) {
	        this._x = x;
	        this._y = y;
	        this._z = z;
	        this._order = order || this._order;
	    }

	    clone() {
	        return new this.constructor(this._x, this._y, this._z, this._order);
	    }

	    copy(euler) {
	        this._x = euler._x;
	        this._y = euler._y;
	        this._z = euler._z;
	        this._order = euler._order;
	        return this;
	    }

	    /**
	     * 通过Matrix4设置Euler
	     * @param m
	     * @param order
	     * @param update
	     * @returns {Euler}
	     */
	    setFromRotationMatrix(m, order, update) {
	        let clamp = _Math.clamp;

	        // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

	        let te = m.elements;
	        let m11 = te[0], m12 = te[4], m13 = te[8];
	        let m21 = te[1], m22 = te[5], m23 = te[9];
	        let m31 = te[2], m32 = te[6], m33 = te[10];

	        order = order || this._order;

	        if (order === 'XYZ') {

	            this._y = Math.asin(clamp(m13, -1, 1));

	            if (Math.abs(m13) < 0.99999) {

	                this._x = Math.atan2(-m23, m33);
	                this._z = Math.atan2(-m12, m11);

	            } else {

	                this._x = Math.atan2(m32, m22);
	                this._z = 0;

	            }

	        } else if (order === 'YXZ') {

	            this._x = Math.asin(-clamp(m23, -1, 1));

	            if (Math.abs(m23) < 0.99999) {

	                this._y = Math.atan2(m13, m33);
	                this._z = Math.atan2(m21, m22);

	            } else {

	                this._y = Math.atan2(-m31, m11);
	                this._z = 0;

	            }

	        } else if (order === 'ZXY') {

	            this._x = Math.asin(clamp(m32, -1, 1));

	            if (Math.abs(m32) < 0.99999) {

	                this._y = Math.atan2(-m31, m33);
	                this._z = Math.atan2(-m12, m22);

	            } else {

	                this._y = 0;
	                this._z = Math.atan2(m21, m11);

	            }

	        } else if (order === 'ZYX') {

	            this._y = Math.asin(-clamp(m31, -1, 1));

	            if (Math.abs(m31) < 0.99999) {

	                this._x = Math.atan2(m32, m33);
	                this._z = Math.atan2(m21, m11);

	            } else {

	                this._x = 0;
	                this._z = Math.atan2(-m12, m22);

	            }

	        } else if (order === 'YZX') {

	            this._z = Math.asin(clamp(m21, -1, 1));

	            if (Math.abs(m21) < 0.99999) {

	                this._x = Math.atan2(-m23, m22);
	                this._y = Math.atan2(-m31, m11);

	            } else {

	                this._x = 0;
	                this._y = Math.atan2(m13, m33);

	            }

	        } else if (order === 'XZY') {

	            this._z = Math.asin(-clamp(m12, -1, 1));

	            if (Math.abs(m12) < 0.99999) {

	                this._x = Math.atan2(m32, m22);
	                this._y = Math.atan2(m13, m11);

	            } else {

	                this._x = Math.atan2(-m23, m33);
	                this._y = 0;

	            }

	        } else {

	            console.warn('THREE.Euler: .setFromRotationMatrix() given unsupported order: ' + order);

	        }

	        this._order = order;

	        if (update !== false) this.onChangeCallback();

	        return this;

	    }

	    /**
	     * 通过Quaternion设置Euler
	     * @param q
	     * @param order
	     * @param update
	     * @returns {Quaternion}
	     */
	    setFromQuaternion(q, order, update) {
	        matrix.makeRotationFromQuaternion(q);
	        return this.setFromRotationMatrix(matrix, order, update);
	    }

	    onChange(callback) {
	        this.onChangeCallback = callback;

	        return this;
	    }

	    onChangeCallback() {
	    }
	}

	Euler.RotationOrders = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'];

	Euler.DefaultOrder = 'XYZ';

	class Quaternion {
	    constructor(x = 0, y = 0, z = 0, w = 1) {
	        this.isQuaternion = true;
	        this._x = x;
	        this._y = y;
	        this._z = z;
	        this._w = w;
	    }

	    get x() {
	        return this._x;
	    }

	    set x(value) {
	        this._x = value;
	        this.onChangeCallback();
	    }

	    get y() {
	        return this._y;
	    }

	    set y(value) {
	        this._y = value;
	        this.onChangeCallback();
	    }

	    get z() {
	        return this._z;
	    }

	    set z(value) {
	        this._z = value;
	        this.onChangeCallback();
	    }

	    get w() {
	        return this._w;
	    }

	    set w(value) {
	        this._w = value;
	        this.onChangeCallback();
	    }

	    set(x, y, z, w) {
	        this._x = x;
	        this._y = y;
	        this._z = z;
	        this._w = w;

	        return this;
	    }

	    clone() {
	        return new this.constructor(this._x, this._y, this._z, this._w);
	    }

	    copy(quaternion) {
	        this._x = quaternion._x;
	        this._y = quaternion._y;
	        this._z = quaternion._z;
	        this._w = quaternion._w;

	        return this;
	    }

	    /**
	     * 从欧拉角设置Quaternion
	     * @param euler
	     * @param update
	     * @returns {Quaternion}
	     */
	    setFromEuler(euler, update) {
	        if (!(euler && euler.isEuler)) {
	            throw new Error('THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.');
	        }

	        let x = euler._x, y = euler._y, z = euler._z, order = euler._order;

	        let cos = Math.cos;
	        let sin = Math.sin;

	        let c1 = cos(x / 2);
	        let c2 = cos(y / 2);
	        let c3 = cos(z / 2);

	        let s1 = sin(x / 2);
	        let s2 = sin(y / 2);
	        let s3 = sin(z / 2);

	        if (order === 'XYZ') {
	            this._x = s1 * c2 * c3 + c1 * s2 * s3;
	            this._y = c1 * s2 * c3 - s1 * c2 * s3;
	            this._z = c1 * c2 * s3 + s1 * s2 * c3;
	            this._w = c1 * c2 * c3 - s1 * s2 * s3;
	        } else if (order === 'YXZ') {
	            this._x = s1 * c2 * c3 + c1 * s2 * s3;
	            this._y = c1 * s2 * c3 - s1 * c2 * s3;
	            this._z = c1 * c2 * s3 - s1 * s2 * c3;
	            this._w = c1 * c2 * c3 + s1 * s2 * s3;
	        } else if (order === 'ZXY') {
	            this._x = s1 * c2 * c3 - c1 * s2 * s3;
	            this._y = c1 * s2 * c3 + s1 * c2 * s3;
	            this._z = c1 * c2 * s3 + s1 * s2 * c3;
	            this._w = c1 * c2 * c3 - s1 * s2 * s3;
	        } else if (order === 'ZYX') {
	            this._x = s1 * c2 * c3 - c1 * s2 * s3;
	            this._y = c1 * s2 * c3 + s1 * c2 * s3;
	            this._z = c1 * c2 * s3 - s1 * s2 * c3;
	            this._w = c1 * c2 * c3 + s1 * s2 * s3;
	        } else if (order === 'YZX') {
	            this._x = s1 * c2 * c3 + c1 * s2 * s3;
	            this._y = c1 * s2 * c3 + s1 * c2 * s3;
	            this._z = c1 * c2 * s3 - s1 * s2 * c3;
	            this._w = c1 * c2 * c3 - s1 * s2 * s3;
	        } else if (order === 'XZY') {
	            this._x = s1 * c2 * c3 - c1 * s2 * s3;
	            this._y = c1 * s2 * c3 - s1 * c2 * s3;
	            this._z = c1 * c2 * s3 + s1 * s2 * c3;
	            this._w = c1 * c2 * c3 + s1 * s2 * s3;
	        }

	        if (update !== false) this.onChangeCallback();

	        return this;

	    }

	    /**
	     * 从轴和角度设置Quaternion
	     * @param axis
	     * @param angle
	     * @returns {Quaternion}
	     */
	    setFromAxisAngle(axis, angle) {
	        let halfAngle = angle / 2, s = Math.sin(halfAngle);

	        this._x = axis._x * s;
	        this._y = axis._y * s;
	        this._z = axis._z * s;
	        this._w = Math.cos(halfAngle);

	        this.onChangeCallback();

	        return this;
	    }

	    /**
	     * 从Matrix4设置Quaternion
	     * @param m
	     * @returns {Quaternion}
	     */
	    setFromRotationMatrix(m) {
	        let te = m.elements,

	            m11 = te[0], m12 = te[4], m13 = te[8],
	            m21 = te[1], m22 = te[5], m23 = te[9],
	            m31 = te[2], m32 = te[6], m33 = te[10],

	            trace = m11 + m22 + m33, s;
	        if (trace > 0) {
	            s = 0.5 / Math.sqrt(trace + 1.0);

	            this._w = 0.25 / s;
	            this._x = (m32 - m23) * s;
	            this._y = (m13 - m31) * s;
	            this._z = (m21 - m12) * s;
	        } else if (m11 > m22 && m11 > m33) {
	            s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

	            this._w = (m32 - m23) / s;
	            this._x = 0.25 * s;
	            this._y = (m12 + m21) / s;
	            this._z = (m13 + m31) / s;
	        } else if (m22 > m33) {
	            s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

	            this._w = (m13 - m31) / s;
	            this._x = (m12 + m21) / s;
	            this._y = 0.25 * s;
	            this._z = (m23 + m32) / s;
	        } else {
	            s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

	            this._w = (m21 - m12) / s;
	            this._x = (m13 + m31) / s;
	            this._y = (m23 + m32) / s;
	            this._z = 0.25 * s;
	        }

	        this.onChangeCallback();

	        return this;
	    }

	    /**
	     * 左乘四元素
	     * @param q
	     * @returns {Quaternion}
	     */
	    multiply(q) {
	        return this.multiplyQuaternions(this, q);
	    }

	    /**
	     * 右乘四元素
	     * @param q
	     * @returns {*}
	     */
	    premultiply(q) {
	        return this.multiplyQuaternions(q, this);
	    }

	    /**
	     * 两个四元素相乘
	     * @param a
	     * @param b
	     * @returns {Quaternion}
	     */
	    multiplyQuaternions(a, b) {
	        let qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
	        let qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

	        this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
	        this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
	        this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
	        this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

	        this.onChangeCallback();

	        return this;
	    }

	    onChange(callback) {
	        this.onChangeCallback = callback;

	        return this;
	    }

	    onChangeCallback() {
	    }
	}

	let m1 = new Matrix4$1();
	let target = new Vector3();
	let position = new Vector3();

	let objectId = 0;

	/**
	 * 3D场景中图形对象的基类
	 */
	class Object3D extends EventDispatcher {
	    constructor() {
	        super();
	        this.isObject3D = true;
	        this.id = objectId++;
	        this.uuid = _Math.generateUUID();
	        this.parent = null;
	        this.children = [];

	        this.position = new Vector3();
	        this.rotation = new Euler();
	        this.quaternion = new Quaternion();
	        this.scale = new Vector3(1, 1, 1);

	        this.up = Object3D.DefaultUp.clone();

	        this.matrix = new Matrix4$1();
	        this.matrixWorld = new Matrix4$1();

	        // 默认true，当设置为true时，自动更新局部矩阵。
	        this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
	        // 默认false，当设置为true时，自动更新世界矩阵，然后重置该属性为false
	        this.matrixWorldNeedsUpdate = false;

	        // rotation改变后自动更新quaternion
	        this.rotation.onChange(() => {
	            this.quaternion.setFromEuler(this.rotation, false);
	        });

	        // quaternion改变后自动更新rotation
	        this.quaternion.onChange(() => {
	            this.rotation.setFromQuaternion(this.quaternion, undefined, false);
	        });

	        this.visible = true;
	        this.castShadow = false;
	        this.receiveShadow = false;

	        this.renderOrder = 0;
	        this.userData = {};
	    }

	    // 更新局部变换。位置、旋转、缩放 触发矩阵变化
	    updateMatrix() {
	        this.matrix.compose(this.position, this.quaternion, this.scale);
	        this.matrixWorldNeedsUpdate = true;
	    }

	    // 更新对象和子对象变换
	    updateMatrixWorld(force) {
	        if (this.matrixAutoUpdate) this.updateMatrix();
	        if (this.matrixWorldNeedsUpdate || force) {
	            if (this.parent === null) {
	                this.matrixWorld.copy(this.matrix);
	            } else {
	                this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
	            }
	            this.matrixWorldNeedsUpdate = false;
	            force = true;
	        }

	        // update children
	        let children = this.children;
	        for (let i = 0, l = children.length; i < l; i++) {
	            children[i].updateMatrixWorld(force);
	        }
	    }

	    add(object) {
	        if (arguments.length > 1) {
	            for (let i = 0; i < arguments.length; i++) {
	                this.add(arguments[i]);
	            }
	        }

	        if (object === this) {
	            console.error("THREE.Object3D.add: object can't be added as a child of itself.", object);
	            return this;
	        }

	        if ((object && object.isObject3D)) {
	            if (object.parent !== null) {
	                object.parent.remove(object);
	            }

	            object.parent = this;

	            this.children.push(object);

	        } else {
	            console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", object);
	        }

	        return this;
	    }

	    remove(object) {
	        if (arguments.length > 1) {
	            for (let i = 0; i < arguments.length; i++) {
	                this.remove(arguments[i]);
	            }

	            return this;
	        }

	        let index = this.children.indexOf(object);

	        if (index !== -1) {
	            object.parent = null;

	            object.dispatchEvent({type: 'removed'});
	            this.children.splice(index, 1);
	        }

	        return this;

	    }

	    lookAt(v) {
	        target.copy(v);

	        position.setFromMatrixPosition(this.matrix);

	        if (this.isCamera) {
	            m1.lookAt(position, target, this.up);
	        } else {
	            m1.lookAt(target, position, this.up);
	        }

	        this.quaternion.setFromRotationMatrix(m1);
	    }

	    // 遍历对象并回调
	    traverse(callback) {
	        callback(this);

	        let children = this.children;

	        for (let i = 0, l = children.length; i < l; i++) {
	            children[i].traverse(callback);
	        }
	    }

	    traverseVisible(callback) {
	        if (this.visible === false) return;

	        callback(this);

	        let children = this.children;

	        for (let i = 0, l = children.length; i < l; i++) {
	            children[i].traverseVisible(callback);
	        }
	    }
	}

	Object3D.DefaultUp = new Vector3(0, 1, 0);
	Object3D.DefaultMatrixAutoUpdate = true;

	const ColorKeywords={'aliceblue':0xF0F8FF,'antiquewhite':0xFAEBD7,'aqua':0x00FFFF,'aquamarine':0x7FFFD4,'azure':0xF0FFFF,'beige':0xF5F5DC,'bisque':0xFFE4C4,'black':0x000000,'blanchedalmond':0xFFEBCD,'blue':0x0000FF,'blueviolet':0x8A2BE2,'brown':0xA52A2A,'burlywood':0xDEB887,'cadetblue':0x5F9EA0,'chartreuse':0x7FFF00,'chocolate':0xD2691E,'coral':0xFF7F50,'cornflowerblue':0x6495ED,'cornsilk':0xFFF8DC,'crimson':0xDC143C,'cyan':0x00FFFF,'darkblue':0x00008B,'darkcyan':0x008B8B,'darkgoldenrod':0xB8860B,'darkgray':0xA9A9A9,'darkgreen':0x006400,'darkgrey':0xA9A9A9,'darkkhaki':0xBDB76B,'darkmagenta':0x8B008B,'darkolivegreen':0x556B2F,'darkorange':0xFF8C00,'darkorchid':0x9932CC,'darkred':0x8B0000,'darksalmon':0xE9967A,'darkseagreen':0x8FBC8F,'darkslateblue':0x483D8B,'darkslategray':0x2F4F4F,'darkslategrey':0x2F4F4F,'darkturquoise':0x00CED1,'darkviolet':0x9400D3,'deeppink':0xFF1493,'deepskyblue':0x00BFFF,'dimgray':0x696969,'dimgrey':0x696969,'dodgerblue':0x1E90FF,'firebrick':0xB22222,'floralwhite':0xFFFAF0,'forestgreen':0x228B22,'fuchsia':0xFF00FF,'gainsboro':0xDCDCDC,'ghostwhite':0xF8F8FF,'gold':0xFFD700,'goldenrod':0xDAA520,'gray':0x808080,'green':0x008000,'greenyellow':0xADFF2F,'grey':0x808080,'honeydew':0xF0FFF0,'hotpink':0xFF69B4,'indianred':0xCD5C5C,'indigo':0x4B0082,'ivory':0xFFFFF0,'khaki':0xF0E68C,'lavender':0xE6E6FA,'lavenderblush':0xFFF0F5,'lawngreen':0x7CFC00,'lemonchiffon':0xFFFACD,'lightblue':0xADD8E6,'lightcoral':0xF08080,'lightcyan':0xE0FFFF,'lightgoldenrodyellow':0xFAFAD2,'lightgray':0xD3D3D3,'lightgreen':0x90EE90,'lightgrey':0xD3D3D3,'lightpink':0xFFB6C1,'lightsalmon':0xFFA07A,'lightseagreen':0x20B2AA,'lightskyblue':0x87CEFA,'lightslategray':0x778899,'lightslategrey':0x778899,'lightsteelblue':0xB0C4DE,'lightyellow':0xFFFFE0,'lime':0x00FF00,'limegreen':0x32CD32,'linen':0xFAF0E6,'magenta':0xFF00FF,'maroon':0x800000,'mediumaquamarine':0x66CDAA,'mediumblue':0x0000CD,'mediumorchid':0xBA55D3,'mediumpurple':0x9370DB,'mediumseagreen':0x3CB371,'mediumslateblue':0x7B68EE,'mediumspringgreen':0x00FA9A,'mediumturquoise':0x48D1CC,'mediumvioletred':0xC71585,'midnightblue':0x191970,'mintcream':0xF5FFFA,'mistyrose':0xFFE4E1,'moccasin':0xFFE4B5,'navajowhite':0xFFDEAD,'navy':0x000080,'oldlace':0xFDF5E6,'olive':0x808000,'olivedrab':0x6B8E23,'orange':0xFFA500,'orangered':0xFF4500,'orchid':0xDA70D6,'palegoldenrod':0xEEE8AA,'palegreen':0x98FB98,'paleturquoise':0xAFEEEE,'palevioletred':0xDB7093,'papayawhip':0xFFEFD5,'peachpuff':0xFFDAB9,'peru':0xCD853F,'pink':0xFFC0CB,'plum':0xDDA0DD,'powderblue':0xB0E0E6,'purple':0x800080,'rebeccapurple':0x663399,'red':0xFF0000,'rosybrown':0xBC8F8F,'royalblue':0x4169E1,'saddlebrown':0x8B4513,'salmon':0xFA8072,'sandybrown':0xF4A460,'seagreen':0x2E8B57,'seashell':0xFFF5EE,'sienna':0xA0522D,'silver':0xC0C0C0,'skyblue':0x87CEEB,'slateblue':0x6A5ACD,'slategray':0x708090,'slategrey':0x708090,'snow':0xFFFAFA,'springgreen':0x00FF7F,'steelblue':0x4682B4,'tan':0xD2B48C,'teal':0x008080,'thistle':0xD8BFD8,'tomato':0xFF6347,'turquoise':0x40E0D0,'violet':0xEE82EE,'wheat':0xF5DEB3,'white':0xFFFFFF,'whitesmoke':0xF5F5F5,'yellow':0xFFFF00,'yellowgreen':0x9ACD32};

	/**
	 * 颜色可以用以下任意一种方式初始化
	 * let color = new THREE.Color();
	 * let color = new THREE.Color(0xff0000);
	 * let color = new THREE.Color("rgb(255, 0, 0)");
	 * let color = new THREE.Color("rgb(100%, 0%, 0%)");
	 * let color = new THREE.Color("skyblue");
	 * let color = new THREE.Color("hsl(0, 100%, 50%)");
	 * let color = new THREE.Color(1, 0, 0);
	 */

	class Color {
	    constructor(r, g, b) {
	        this.isColor = true;
	        this.r = 1;
	        this.g = 1;
	        this.b = 1;
	        if (g === undefined && b === undefined) {
	            return this.set(r);
	        }

	        return this.setRGB(r, g, b);
	    }

	    clone() {
	        return new this.constructor(this.r, this.g, this.b);
	    }

	    copy(color) {
	        this.r = color.r;
	        this.g = color.g;
	        this.b = color.b;
	        return this;
	    }

	    set(value) {
	        if (value && value.isColor) {
	            this.copy(value);
	        } else if (typeof value === 'number') {
	            this.setHex(value);
	        } else if (typeof value === 'string') {
	            this.setStyle(value);
	        }

	        return this;
	    }

	    setHex(hex) {
	        hex = Math.floor(hex);

	        this.r = (hex >> 16 & 255) / 255;
	        this.g = (hex >> 8 & 255) / 255;
	        this.b = (hex & 255) / 255;

	        return this;
	    }

	    setRGB(r, g, b) {
	        this.r = r;
	        this.g = g;
	        this.b = b;

	        return this;
	    }

	    setHSL(h, s, l) {
	        // h,s,l ranges are in 0.0 - 1.0
	        h = _Math.euclideanModulo(h, 1);
	        s = _Math.clamp(s, 0, 1);
	        l = _Math.clamp(l, 0, 1);

	        if (s === 0) {
	            this.r = this.g = this.b = l;
	        } else {
	            let p = l <= 0.5 ? l * (1 + s) : l + s - (l * s);
	            let q = (2 * l) - p;

	            this.r = this._hue2rgb(q, p, h + 1 / 3);
	            this.g = this._hue2rgb(q, p, h);
	            this.b = this._hue2rgb(q, p, h - 1 / 3);

	        }
	        return this;
	    }

	    setStyle(style) {
	        let m;
	        if (m = /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/.exec(style)) {
	            // rgb / hsl
	            let color;
	            let name = m[1];
	            let components = m[2];

	            switch (name) {
	                case 'rgb':
	                case 'rgba':
	                    if (color = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
	                        // rgb(255,0,0) rgba(255,0,0,0.5)
	                        this.r = Math.min(255, parseInt(color[1], 10)) / 255;
	                        this.g = Math.min(255, parseInt(color[2], 10)) / 255;
	                        this.b = Math.min(255, parseInt(color[3], 10)) / 255;
	                        this._handleAlpha(style);
	                        return this;
	                    }
	                    if (color = /^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
	                        // rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)
	                        this.r = Math.min(100, parseInt(color[1], 10)) / 100;
	                        this.g = Math.min(100, parseInt(color[2], 10)) / 100;
	                        this.b = Math.min(100, parseInt(color[3], 10)) / 100;

	                        this._handleAlpha(style);
	                        return this;
	                    }
	                    break;
	                case 'hsl':
	                case 'hsla':
	                    if (color = /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
	                        // hsl(120,50%,50%) hsla(120,50%,50%,0.5)
	                        let h = parseFloat(color[1]) / 360;
	                        let s = parseInt(color[2], 10) / 100;
	                        let l = parseInt(color[3], 10) / 100;

	                        this._handleAlpha(color[5]);

	                        return this.setHSL(h, s, l);
	                    }
	                    break;
	            }
	        } else if (m = /^\#([A-Fa-f0-9]+)$/.exec(style)) {
	            // hex color
	            let hex = m[1];
	            let size = hex.length;

	            if (size === 3) {
	                // #ff0
	                this.r = parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255;
	                this.g = parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255;
	                this.b = parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255;

	                return this;
	            } else if (size === 6) {
	                // #ff0000
	                this.r = parseInt(hex.charAt(0) + hex.charAt(1), 16) / 255;
	                this.g = parseInt(hex.charAt(2) + hex.charAt(3), 16) / 255;
	                this.b = parseInt(hex.charAt(4) + hex.charAt(5), 16) / 255;

	                return this;
	            }
	        }

	        if (style && style.length > 0) {
	            let hex = ColorKeywords[style];
	            if (hex !== undefined) {
	                this.setHex(hex);
	            } else {
	                console.warn('XCANVAS.Color: Unknown color ' + style);
	            }
	        }
	        return this;
	    }

	    getHex() {
	        return (this.r * 255) << 16 ^ (this.g * 255) << 8 ^ (this.b * 255) << 0;
	    }

	    getHexString() {
	        return ('000000' + this.getHex().toString(16)).slice(-6);
	    }

	    getHSL(target) {
	        // h,s,l ranges are in 0.0 - 1.0
	        if (target === undefined) {
	            console.warn('XCANVAS.Color: .getHSL() target is now required');
	            target = {
	                h: 0,
	                s: 0,
	                l: 0
	            };
	        }
	        let r = this.r,
	            g = this.g,
	            b = this.b;
	        let max = Math.max(r, g, b);
	        let min = Math.min(r, g, b);
	        let hue, saturation;
	        let lightness = (min + max) / 2.0;
	        if (min === max) {
	            hue = 0;
	            saturation = 0;
	        } else {
	            let delta = max - min;
	            saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);
	            switch (max) {
	                case r:
	                    hue = (g - b) / delta + (g < b ? 6 : 0);
	                    break;
	                case g:
	                    hue = (b - r) / delta + 2;
	                    break;
	                case b:
	                    hue = (r - g) / delta + 4;
	                    break;
	            }
	            hue /= 6;
	        }
	        target.h = hue;
	        target.s = saturation;
	        target.l = lightness;
	        return target;
	    }

	    getStyle() {
	        return 'rgb(' + this.r * 255 + ',' + this.g * 255 + ',' + this.b * 255 + ')';
	    }

	    add(color) {
	        this.r += color.r;
	        this.g += color.g;
	        this.b += color.b;
	        return this;
	    }

	    sub(color) {
	        this.r = Math.max(0, this.r - color.r);
	        this.g = Math.max(0, this.g - color.g);
	        this.b = Math.max(0, this.b - color.b);
	        return this;
	    }

	    multiply(color) {
	        this.r *= color.r;
	        this.g *= color.g;
	        this.b *= color.b;

	        return this;
	    }

	    equals(c) {
	        return (c.r === this.r) && (c.g === this.g) && (c.b === this.b) && (c.a === this.a);
	    }

	    // 处理透明度
	    _handleAlpha(style) {
	        console.warn('THREE.Color: Alpha component of ' + style + ' will be ignored.');
	    }

	    _hue2rgb(p, q, t) {
	        if (t < 0) t += 1;
	        if (t > 1) t -= 1;
	        if (t < 1 / 6) return p + (q - p) * 6 * t;
	        if (t < 1 / 2) return q;
	        if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
	        return p;
	    }
	}

	/**
	 * 三角面片
	 */
	class Face3 {
	    constructor(a, b, c, color = new Color(), materialIndex = 0) {
	        this.a = a;
	        this.b = b;
	        this.c = c;
	        this.color = color;
	        this.materialIndex = materialIndex;
	    }

	    clone() {
	        return new this.constructor().copy(this);
	    }

	    copy(source) {
	        this.a = source.a;
	        this.b = source.b;
	        this.c = source.c;

	        this.color.copy(source.color);
	        this.materialIndex = source.materialIndex;

	        return this;
	    }
	}

	/**
	 * Geometry 利用 Vector3 或 Color 存储了几何体的相关 attributes（如顶点位置，面信息，颜色等）
	 */

	let geometryId = 0;// Geometry uses even numbers as Id
	class Geometry {
	    constructor() {
	        this.id = geometryId += 2;
	        this.uuid = _Math.generateUUID();
	        this.type = 'Geometry';
	        this.isGeometry = true;

	        this.vertices = []; // 顶点
	        this.faces = [];    // 面
	    }

	    applyMatrix(matrix) {
	        let normalMatrix = new Matrix3().getNormalMatrix(matrix);

	        for (let i = 0; i < this.vertices.length; i++) {
	            let vertex = this.vertices[i];
	            vertex.applyMatrix4(matrix);
	        }

	        for (let i = 0; i < this.faces.length; i++) {
	            let face = this.faces[i];
	            // face.normal.applyMatrix3(normalMatrix).normalize();
	        }

	        return this;
	    }

	    rotateX(angle) {
	        let m1 = new Matrix4$1();
	        m1.makeRotationX(angle);
	        this.applyMatrix(m1);
	        return this;
	    }

	    rotateY(angle) {
	        let m1 = new Matrix4$1();
	        m1.makeRotationY(angle);
	        this.applyMatrix(m1);
	        return this;
	    }

	    rotateZ(angle) {
	        let m1 = new Matrix4$1();
	        m1.makeRotationZ(angle);
	        this.applyMatrix(m1);
	        return this;
	    }

	    translate(x, y, z) {
	        let m1 = new Matrix4$1();
	        m1.makeTranslation(x, y, z);
	        this.applyMatrix(m1);
	        return this;
	    }

	    scale(x, y, z) {
	        let m1 = new Matrix4$1();
	        m1.makeScale(x, y, z);
	        this.applyMatrix(m1);
	        return this;
	    }

	    lookAt(vector) {
	        let obj = new Object3D();
	        obj.lookAt(vector);
	        obj.updateMatrix();
	        this.applyMatrix(obj.matrix);
	    }

	    fromBufferGeometry(geometry) {
	        let scope = this;
	        let indices = geometry.index !== null ? geometry.index.array : undefined;
	        let attributes = geometry.attributes;
	        let positions = attributes.position.array;

	        for (let i = 0, j = 0; i < positions.length; i += 3, j += 2) {
	            scope.vertices.push(new Vector3(positions[i], positions[i + 1], positions[i + 2]));
	        }

	        if (indices !== undefined) {
	            for (let i = 0; i < indices.length; i += 3) {
	                addFace(indices[i], indices[i + 1], indices[i + 2]);
	            }
	        } else {
	            for (let i = 0; i < positions.length / 3; i += 3) {
	                addFace(i, i + 1, i + 2);
	            }
	        }

	        function addFace(a, b, c, materialIndex) {
	            let face = new Face3(a, b, c, materialIndex);
	            scope.faces.push(face);
	        }
	    }

	    mergeVertices() {
	        let verticesMap = {}; // Hashmap for looking up vertices by position coordinates (and making sure they are unique)
	        let unique = [], changes = [];

	        let v, key;
	        let precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
	        let precision = Math.pow(10, precisionPoints);
	        let i, il, face;
	        let indices;

	        for (i = 0, il = this.vertices.length; i < il; i++) {
	            v = this.vertices[i];
	            key = Math.round(v.x * precision) + '_' + Math.round(v.y * precision) + '_' + Math.round(v.z * precision);

	            if (verticesMap[key] === undefined) {
	                verticesMap[key] = i;
	                unique.push(this.vertices[i]);
	                changes[i] = unique.length - 1;
	            } else {
	                //console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
	                changes[i] = changes[verticesMap[key]];
	            }
	        }

	        // if faces are completely degenerate after merging vertices, we
	        // have to remove them from the geometry.
	        let faceIndicesToRemove = [];

	        for (i = 0, il = this.faces.length; i < il; i++) {

	            face = this.faces[i];

	            face.a = changes[face.a];
	            face.b = changes[face.b];
	            face.c = changes[face.c];

	            indices = [face.a, face.b, face.c];

	            // if any duplicate vertices are found in a Face3
	            // we have to remove the face as nothing can be saved
	            for (let n = 0; n < 3; n++) {
	                if (indices[n] === indices[(n + 1) % 3]) {
	                    faceIndicesToRemove.push(i);
	                    break;
	                }
	            }
	        }

	        for (i = faceIndicesToRemove.length - 1; i >= 0; i--) {
	            let idx = faceIndicesToRemove[i];

	            this.faces.splice(idx, 1);
	        }

	        // Use unique set of vertices
	        let diff = this.vertices.length - unique.length;
	        this.vertices = unique;
	        return diff;
	    }
	}

	function arrayMax(array) {
	    if (array.length === 0) return -Infinity;
	    var max = array[0];
	    for (var i = 1, l = array.length; i < l; ++i) {
	        if (array[i] > max) max = array[i];
	    }
	    return max;
	}

	class BufferAttribute {
	    constructor(array, itemSize, normalized = true) {
	        this.isBufferAttribute = true;
	        this.array = array;
	        this.itemSize = itemSize;
	        this.normalized = normalized;

	        this.count = array.length;
	        this.version = 0;
	    }

	    set needsUpdate(value) {
	        if (value === true) this.version++;
	    }

	    getX( index ) {
	        return this.array[ index * this.itemSize ];
	    }

	    getY( index ) {
	        return this.array[ index * this.itemSize + 1 ];
	    }

	    getZ( index ) {
	        return this.array[ index * this.itemSize + 2 ];
	    }

	    setXYZ(index, x, y, z) {
	        index *= this.itemSize;

	        this.array[index + 0] = x;
	        this.array[index + 1] = y;
	        this.array[index + 2] = z;

	        return this;
	    }

	    onUploadCallback() {
	    }
	}
	class Uint16BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Uint16Array(array), itemSize, normalized);
	    }
	}
	class Uint32BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Uint32Array(array), itemSize, normalized);
	    }
	}
	class Float32BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Float32Array(array), itemSize, normalized);
	    }
	}

	let bufferGeometryId = 1; // BufferGeometry uses odd numbers as Id
	class BufferGeometry {
	    constructor() {
	        this.id = bufferGeometryId += 2;
	        this.uuid = _Math.generateUUID();
	        this.type = 'BufferGeometry';
	        this.isBufferGeometry = true;

	        this.index = null;
	        this.attributes = {};

	        this.groups = [];
	    }

	    getIndex() {
	        return this.index;
	    }

	    setIndex(index) {
	        if (Array.isArray(index)) {
	            this.index = new (arrayMax(index) > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute)(index, 1);
	        } else {
	            this.index = index;
	        }
	    }

	    addAttribute(name, attribute) {
	        this.attributes[name] = attribute;
	        return this;
	    }

	    getAttribute(name) {
	        return this.attributes[name];
	    }

	    removeAttribute(name) {
	        delete this.attributes[name];
	        return this;
	    }

	    addGroup(start, count, materialIndex) {
	        this.groups.push({
	            start: start,
	            count: count,
	            materialIndex: materialIndex !== undefined ? materialIndex : 0
	        });
	    }

	    clearGroups() {
	        this.groups = [];
	    }

	    applyMatrix(matrix) {
	        let position = this.attributes.position;
	        if (position !== undefined) {
	            matrix.applyToBufferAttribute(position);
	            position.needsUpdate = true;
	        }
	        return this;
	    }

	    rotateX(angle) {
	        let m1 = new Matrix4$1();
	        m1.makeRotationX(angle);
	        this.applyMatrix(m1);
	        return this;
	    }

	    rotateY(angle) {
	        let m1 = new Matrix4$1();
	        m1.makeRotationY(angle);
	        this.applyMatrix(m1);
	        return this;
	    }

	    rotateZ(angle) {
	        let m1 = new Matrix4$1();
	        m1.makeRotationZ(angle);
	        this.applyMatrix(m1);
	        return this;
	    }

	    translate(x, y, z) {
	        let m1 = new Matrix4$1();
	        m1.makeTranslation(x, y, z);
	        this.applyMatrix(m1);
	        return this;
	    }

	    scale(x, y, z) {
	        let m1 = new Matrix4$1();
	        m1.makeScale(x, y, z);
	        this.applyMatrix(m1);
	        return this;
	    }

	    lookAt(vector) {
	        let obj = new Object3D();
	        obj.lookAt(vector);
	        obj.updateMatrix();
	        this.applyMatrix(obj.matrix);
	    }
	}

	// 立方体
	class BoxGeometry extends Geometry {
	    constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
	        super();
	        this.type = 'BoxGeometry';

	        this.parameters = {
	            width: width,
	            height: height,
	            depth: depth,
	            widthSegments: widthSegments,
	            heightSegments: heightSegments,
	            depthSegments: depthSegments
	        };

	        this.fromBufferGeometry(new BoxBufferGeometry(width, height, depth, widthSegments, heightSegments, depthSegments));
	        this.mergeVertices();
	    }
	}

	class BoxBufferGeometry extends BufferGeometry {
	    constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
	        super();
	        this.type = 'BoxBufferGeometry';

	        this.parameters = {
	            width: width,
	            height: height,
	            depth: depth,
	            widthSegments: widthSegments,
	            heightSegments: heightSegments,
	            depthSegments: depthSegments
	        };

	        let scope = this;

	        // buffers
	        let indices = [];
	        let vertices = [];
	        let normals = [];
	        let uvs = [];

	        // helper letiables
	        let numberOfVertices = 0;
	        let groupStart = 0;

	        // build each side of the box geometry
	        buildPlane('z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments, 0); // px
	        buildPlane('z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments, 1); // nx
	        buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2); // py
	        buildPlane('x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments, 3); // ny
	        buildPlane('x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments, 4); // pz
	        buildPlane('x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments, 5); // nz

	        // build geometry
	        this.setIndex(indices);
	        this.addAttribute('position', new Float32BufferAttribute(vertices, 3));
	        this.addAttribute('normal', new Float32BufferAttribute(normals, 3));
	        this.addAttribute('uv', new Float32BufferAttribute(uvs, 2));

	        function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex) {

	            let segmentWidth = width / gridX;
	            let segmentHeight = height / gridY;

	            let widthHalf = width / 2;
	            let heightHalf = height / 2;
	            let depthHalf = depth / 2;

	            let gridX1 = gridX + 1;
	            let gridY1 = gridY + 1;

	            let vertexCounter = 0;
	            let groupCount = 0;

	            let ix, iy;

	            let vector = new Vector3();

	            // generate vertices, normals and uvs
	            for (iy = 0; iy < gridY1; iy++) {
	                let y = iy * segmentHeight - heightHalf;
	                for (ix = 0; ix < gridX1; ix++) {
	                    let x = ix * segmentWidth - widthHalf;

	                    // set values to correct vector component
	                    vector[u] = x * udir;
	                    vector[v] = y * vdir;
	                    vector[w] = depthHalf;

	                    // now apply vector to vertex buffer
	                    vertices.push(vector.x, vector.y, vector.z);

	                    // set values to correct vector component
	                    vector[u] = 0;
	                    vector[v] = 0;
	                    vector[w] = depth > 0 ? 1 : -1;

	                    // now apply vector to normal buffer
	                    normals.push(vector.x, vector.y, vector.z);

	                    // uvs
	                    uvs.push(ix / gridX);
	                    uvs.push(1 - (iy / gridY));

	                    // counters
	                    vertexCounter += 1;
	                }
	            }

	            // indices

	            // 1. you need three indices to draw a single face
	            // 2. a single segment consists of two faces
	            // 3. so we need to generate six (2*3) indices per segment
	            for (iy = 0; iy < gridY; iy++) {
	                for (ix = 0; ix < gridX; ix++) {
	                    let a = numberOfVertices + ix + gridX1 * iy;
	                    let b = numberOfVertices + ix + gridX1 * (iy + 1);
	                    let c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
	                    let d = numberOfVertices + (ix + 1) + gridX1 * iy;

	                    // faces
	                    indices.push(a, b, d);
	                    indices.push(b, c, d);

	                    // increase counter
	                    groupCount += 6;
	                }
	            }

	            // add a group to the geometry. this will ensure multi material support
	            scope.addGroup(groupStart, groupCount, materialIndex);

	            // calculate new start value for groups
	            groupStart += groupCount;

	            // update total number of vertices
	            numberOfVertices += vertexCounter;
	        }
	    }
	}

	const REVISION = '1';
	// 作色点或面
	let NoColors = 0;
	let FaceColors = 1;
	let VertexColors = 2;
	// canvas混合模式
	let NoBlending = 0;
	let NormalBlending = 1;
	let AdditiveBlending = 2;
	let SubtractiveBlending = 3;
	let MultiplyBlending = 4;
	let CustomBlending = 5;

	class Vector2 {
	    constructor(x = 0, y = 0) {
	        this.isVector2 = true;
	        this.x = x;
	        this.y = y;
	    }

	    copy(v) {
	        this.x = v.x;
	        this.y = v.y;

	        return this;
	    }

	    clone() {
	        return new this.constructor(this.x, this.y);
	    }

	    set(x, y) {
	        this.x = x;
	        this.y = y;

	        return this;
	    }

	    /**
	     * 左加向量
	     * @param v
	     * @returns {Vector3}
	     */
	    add(v) {
	        this.x += v.x;
	        this.y += v.y;
	        return this;
	    }

	    /**
	     * 左加标量
	     * @param s
	     * @returns {Vector3}
	     */
	    addScalar(s) {
	        this.x += s;
	        this.y += s;
	        return this;
	    }

	    /**
	     * 两向量相加
	     * @param a
	     * @param b
	     * @returns {Vector3}
	     */
	    addVectors(a, b) {
	        this.x = a.x + b.x;
	        this.y = a.y + b.y;
	        return this;
	    }

	    sub(v) {
	        this.x -= v.x;
	        this.y -= v.y;
	        return this;
	    }

	    subScalar(s) {
	        this.x -= s;
	        this.y -= s;
	        return this;
	    }

	    subVectors(a, b) {
	        this.x = a.x - b.x;
	        this.y = a.y - b.y;
	        return this;
	    }

	    multiply(v) {
	        this.x *= v.x;
	        this.y *= v.y;
	        return this;
	    }

	    multiplyScalar(scalar) {
	        this.x *= scalar;
	        this.y *= scalar;
	        return this;
	    }

	    divide(v) {
	        this.x /= v.x;
	        this.y /= v.y;
	        return this;
	    }

	    divideScalar(scalar) {
	        return this.multiplyScalar(1 / scalar);
	    }

	    negate() {
	        this.x = -this.x;
	        this.y = -this.y;

	        return this;
	    }

	    dot(v) {
	        return this.x * v.x + this.y * v.y;
	    }

	    cross(v) {
	        return this.x * v.y - this.y * v.x;
	    }

	    lengthSq() {
	        return this.x * this.x + this.y * this.y;
	    }

	    length() {
	        return Math.sqrt(this.x * this.x + this.y * this.y);
	    }

	    lerp(v, alpha) {
	        this.x += (v.x - this.x) * alpha;
	        this.y += (v.y - this.y) * alpha;

	        return this;
	    }

	    lerpVectors(v1, v2, alpha) {
	        return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
	    }

	    min(v) {
	        this.x = Math.min(this.x, v.x);
	        this.y = Math.min(this.y, v.y);

	        return this;
	    }

	    max(v) {
	        this.x = Math.max(this.x, v.x);
	        this.y = Math.max(this.y, v.y);

	        return this;
	    }

	    equals(v) {
	        return ((v.x === this.x) && (v.y === this.y));
	    }
	}

	class Vector4 {
	    constructor(x = 0, y = 0, z = 0, w = 1) {
	        this.isVector4 = true;
	        this.x = x;
	        this.y = y;
	        this.z = z;
	        this.w = w;
	    }

	    clone() {
	        return new this.constructor(this.x, this.y, this.z, this.w);
	    }

	    copy(v) {
	        this.x = v.x;
	        this.y = v.y;
	        this.z = v.z;
	        this.w = (v.w !== undefined) ? v.w : 1;

	        return this;
	    }

	    set(x, y, z, w) {
	        this.x = x;
	        this.y = y;
	        this.z = z;
	        this.w = w;

	        return this;
	    }

	    setScalar(scalar) {
	        this.x = scalar;
	        this.y = scalar;
	        this.z = scalar;
	        this.w = scalar;

	        return this;
	    }

	    add(v) {
	        this.x += v.x;
	        this.y += v.y;
	        this.z += v.z;
	        this.w += v.w;

	        return this;
	    }

	    addScalar(s) {
	        this.x += s;
	        this.y += s;
	        this.z += s;
	        this.w += s;

	        return this;
	    }

	    addVectors(a, b) {
	        this.x = a.x + b.x;
	        this.y = a.y + b.y;
	        this.z = a.z + b.z;
	        this.w = a.w + b.w;

	        return this;
	    }

	    sub(v) {
	        this.x -= v.x;
	        this.y -= v.y;
	        this.z -= v.z;
	        this.w -= v.w;

	        return this;
	    }

	    subScalar(s) {
	        this.x -= s;
	        this.y -= s;
	        this.z -= s;
	        this.w -= s;

	        return this;
	    }

	    subVectors(a, b) {
	        this.x = a.x - b.x;
	        this.y = a.y - b.y;
	        this.z = a.z - b.z;
	        this.w = a.w - b.w;

	        return this;
	    }

	    multiplyScalar(scalar) {
	        if (isFinite(scalar)) {
	            this.x *= scalar;
	            this.y *= scalar;
	            this.z *= scalar;
	            this.w *= scalar;
	        } else {
	            this.x = 0;
	            this.y = 0;
	            this.z = 0;
	            this.w = 0;
	        }
	        return this;
	    }

	    divideScalar(scalar) {
	        return this.multiplyScalar(1 / scalar);
	    }

	    applyMatrix4(m) {
	        let x = this.x, y = this.y, z = this.z, w = this.w;
	        let e = m.elements;

	        this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
	        this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
	        this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
	        this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;

	        return this;
	    }

	    normalize() {
	        return this.divideScalar(this.length());
	    }

	    lengthSq() {
	        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	    }

	    length() {
	        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	    }

	    dot(v) {
	        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	    }

	    equals(v) {
	        return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z) && (v.w === this.w));
	    }
	}

	class Camera extends Object3D {
	    constructor() {
	        super();
	        this.isCamera = true;

	        // 投影矩阵
	        this.projectionMatrix = new Matrix4$1();
	        // 投影矩阵逆矩阵
	        this.projectionMatrixInverse = new Matrix4$1();

	        // matrixWorld逆矩阵
	        this.matrixWorldInverse = new Matrix4$1();
	    }

	    // 重写父类
	    updateMatrixWorld(force) {
	        if (this.matrixAutoUpdate) this.updateMatrix();
	        if (this.matrixWorldNeedsUpdate || force) {
	            if (this.parent === null) {
	                this.matrixWorld.copy(this.matrix);
	            } else {
	                this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
	            }
	            this.matrixWorldNeedsUpdate = false;
	            force = true;
	        }

	        // update children

	        let children = this.children;
	        for (let i = 0, l = children.length; i < l; i++) {
	            children[i].updateMatrixWorld(force);
	        }

	        // 更新逆矩阵
	        this.matrixWorldInverse.getInverse( this.matrixWorld );
	    }
	}

	class PerspectiveCamera extends Camera {
	    constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
	        super();
	        this.type = 'PerspectiveCamera';
	        this.fov = fov;
	        this.zoom = 1;

	        this.near = near;
	        this.far = far;

	        this.aspect = aspect;
	        this.view = null;

	        this.updateProjectionMatrix();
	    }

	    // 更新相机投影矩阵
	    updateProjectionMatrix() {
	        let near = this.near,
	            top = near * Math.tan(_Math.DEG2RAD * 0.5 * this.fov) / this.zoom,
	            height = 2 * top,
	            width = this.aspect * height,
	            left = -width / 2;

	        this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far);
	        this.projectionMatrixInverse.getInverse(this.projectionMatrix);
	    }
	}

	class OrthographicCamera extends Camera {
	    constructor(left, right, top, bottom, near = 0.1, far = 2000) {
	        super();
	        this.type = 'OrthographicCamera';
	        this.zoom = 1;
	        this.view = null;

	        this.left = left;
	        this.right = right;
	        this.top = top;
	        this.bottom = bottom;

	        this.near = near;
	        this.far = far;

	        this.updateProjectionMatrix();
	    }

	    updateProjectionMatrix() {
	        let dx = (this.right - this.left) / (2 * this.zoom);
	        let dy = (this.top - this.bottom) / (2 * this.zoom);
	        let cx = (this.right + this.left) / 2;
	        let cy = (this.top + this.bottom) / 2;

	        let left = cx - dx;
	        let right = cx + dx;
	        let top = cy + dy;
	        let bottom = cy - dy;

	        if (this.view !== null && this.view.enabled) {
	            let zoomW = this.zoom / (this.view.width / this.view.fullWidth);
	            let zoomH = this.zoom / (this.view.height / this.view.fullHeight);
	            let scaleW = (this.right - this.left) / this.view.width;
	            let scaleH = (this.top - this.bottom) / this.view.height;

	            left += scaleW * (this.view.offsetX / zoomW);
	            right = left + scaleW * (this.view.width / zoomW);
	            top -= scaleH * (this.view.offsetY / zoomH);
	            bottom = top - scaleH * (this.view.height / zoomH);
	        }

	        this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);
	    }
	}

	class Scene extends Object3D {
	    constructor() {
	        super();
	        this.autoUpdate = true;
	        this.background = null;
	    }
	}

	let textureId = 0;

	class Texture extends EventDispatcher{
	    constructor(image) {
	        super();
	        this.id = textureId++;
	        this.uuid = _Math.generateUUID();
	        this.image = image;

	        this.offset = new Vector2(0, 0);
	        this.repeat = new Vector2(1, 1);
	        this.center = new Vector2(0, 0);
	        this.rotation = 0;

	        this.matrixAutoUpdate = true;
	        this.matrix = new Matrix3();

	        this.version = 0;
	        this.onUpdate = null;
	    }

	    clone() {
	        return new this.constructor().copy(this);
	    }

	    dispose() {
	        this.dispatchEvent({type: 'dispose'});
	    }

	    set needsUpdate(value) {
	        if (value === true) this.version++;
	    }
	}

	class CanvasTexture extends Texture {
	    constructor(image) {
	        super(image);
	        this.needsUpdate = true;
	    }
	}

	class Material {
	    constructor() {
	        this.isMaterial = true;
	        this.color = new Color(0xffffff);
	        this.vertexColors = THREE.NoColors; // THREE.NoColors=1, THREE.VertexColors=2, THREE.FaceColors=3

	        this.blending = THREE.NormalBlending;
	        this.opacity = 1;
	        this.transparent = false;

	        this.overdraw = 0; // Overdrawn pixels (typically between 0 and 1) for fixing antialiasing gaps in CanvasRenderer
	        this.visible = true;

	        this.needsUpdate = true;
	    }

	    setValues(values) {
	        if (values === undefined) return;
	        for (let key in values) {
	            let newValue = values[key];
	            if (newValue === undefined) {
	                console.warn("THREE.Material: '" + key + "' parameter is undefined.");
	                continue;
	            }
	            let currentValue = this[key];
	            if (currentValue === undefined) {
	                console.warn("THREE." + this.type + ": '" + key + "' is not a property of this material.");
	                continue;
	            }

	            if (currentValue && currentValue.isColor) {
	                currentValue.set(newValue);
	            }
	            else if (key === 'overdraw') {
	                // ensure overdraw is backwards-compatible with legacy boolean type
	                this[key] = Number(newValue);
	            }
	            else {
	                this[key] = newValue;
	            }
	        }
	    }
	}

	class MeshBasicMaterial extends Material {
	    constructor(parameters) {
	        super();
	        this.isMeshBasicMaterial = true;
	        this.type = 'MeshBasicMaterial';

	        this.map = null;

	        this.wireframe = false;
	        this.wireframeLinewidth = 1;
	        this.wireframeLinecap = 'round';
	        this.wireframeLinejoin = 'round';

	        this.setValues(parameters);
	    }
	}

	class SpriteMaterial extends Material {
	    constructor(parameters) {
	        super();
	        this.isSpriteMaterial = true;
	        this.rotation = 0;
	        this.color = new Color(0xffffff);
	        this.map = null;

	        this.setValues(parameters);
	    }
	}

	class SpriteCanvasMaterial extends Material {
	    constructor(parameters) {
	        super();
	        this.isSpriteCanvasMaterial = true;
	        this.color = new THREE.Color(0xffffff);
	        this.program = function () {};

	        this.setValues(parameters);
	    }
	}

	// 面
	class Face4 {
	    constructor(a, b, c, d) {
	        this.a = a; // 顶点序号
	        this.b = b;
	        this.c = c;
	        this.d = d;

	        this.color = new Color(); // 单面颜色
	    }

	    clone() {
	        return new this.constructor().copy(this);
	    }

	    copy(source) {
	        this.a = source.a;
	        this.b = source.b;
	        this.c = source.c;
	        this.d = source.d;

	        this.color.copy(source.color);

	        return this;
	    }
	}

	class Group extends Object3D {
	    constructor() {
	        super();
	        this.isGroup = true;
	    }
	}

	class Mesh extends Object3D {
	    constructor(geometry, material) {
	        super();
	        this.isMesh = true;
	        this.geometry = geometry;
	        this.material = material;
	    }
	}

	class Sprite extends Object3D {
	    constructor(material) {
	        super();
	        this.isSprite = true;
	        this.material = material;
	    }

	    clone() {
	        return new this.constructor(this.material).copy(this);
	    }
	}

	class PlaneGeometry extends Geometry {
	    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
	        super();
	        this.type = 'PlaneGeometry';

	        this.parameters = {
	            width: width,
	            height: height,
	            widthSegments: widthSegments,
	            heightSegments: heightSegments
	        };

	        this.fromBufferGeometry(new PlaneBufferGeometry(width, height, widthSegments, heightSegments));
	        this.mergeVertices();
	    }
	}

	class PlaneBufferGeometry extends BufferGeometry {
	    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
	        super();
	        this.type = 'PlaneBufferGeometry';

	        this.parameters = {
	            width: width,
	            height: height,
	            widthSegments: widthSegments,
	            heightSegments: heightSegments
	        };

	        let width_half = width / 2;
	        let height_half = height / 2;

	        let gridX = Math.floor(widthSegments);
	        let gridY = Math.floor(heightSegments);

	        let gridX1 = gridX + 1;
	        let gridY1 = gridY + 1;

	        let segment_width = width / gridX;
	        let segment_height = height / gridY;

	        let ix, iy;

	        // buffers
	        let indices = [];
	        let vertices = [];
	        let normals = [];
	        let uvs = [];

	        // generate vertices, normals and uvs
	        for (iy = 0; iy < gridY1; iy++) {
	            let y = iy * segment_height - height_half;
	            for (ix = 0; ix < gridX1; ix++) {
	                let x = ix * segment_width - width_half;

	                vertices.push(x, -y, 0);

	                normals.push(0, 0, 1);

	                uvs.push(ix / gridX);
	                uvs.push(1 - (iy / gridY));
	            }
	        }

	        // indices
	        for (iy = 0; iy < gridY; iy++) {
	            for (ix = 0; ix < gridX; ix++) {
	                let a = ix + gridX1 * iy;
	                let b = ix + gridX1 * (iy + 1);
	                let c = (ix + 1) + gridX1 * (iy + 1);
	                let d = (ix + 1) + gridX1 * iy;

	                // faces
	                indices.push(a, b, d);
	                indices.push(b, c, d);
	            }
	        }

	        // build geometry
	        this.setIndex(indices);
	        this.addAttribute('position', new Float32BufferAttribute(vertices, 3));
	        this.addAttribute('normal', new Float32BufferAttribute(normals, 3));
	        this.addAttribute('uv', new Float32BufferAttribute(uvs, 2));
	    }
	}

	class Box3 {
	    constructor(min = new Vector3(+Infinity, +Infinity, +Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity)) {
	        this.isBox3 = true;
	        this.min = min;
	        this.max = max;
	    }

	    set(min, max) {
	        this.min.copy(min);
	        this.max.copy(max);

	        return this;
	    }

	    makeEmpty() {
	        this.min.x = this.min.y = this.min.z = +Infinity;
	        this.max.x = this.max.y = this.max.z = -Infinity;

	        return this;
	    }

	    expandByPoint(point) {
	        this.min.min(point);
	        this.max.max(point);

	        return this;
	    }

	    setFromPoints(points) {
	        this.makeEmpty();

	        for (let i = 0, il = points.length; i < il; i++) {
	            this.expandByPoint(points[i]);
	        }

	        return this;
	    }

	    intersectsBox(box) {
	        // using 6 splitting planes to rule out intersections.
	        return box.max.x < this.min.x || box.min.x > this.max.x ||
	        box.max.y < this.min.y || box.min.y > this.max.y ||
	        box.max.z < this.min.z || box.min.z > this.max.z ? false : true;
	    }
	}

	// 存储对象池
	let _object, _face, _vertex, _sprite,
	    _objectPool = [], _facePool = [], _vertexPool = [], _spritePool = [],
	    _objectCount = 0, _faceCount = 0, _vertexCount = 0, _spriteCount = 0;

	let _vector3 = new Vector3(),
	    _vector4 = new Vector4(),
	    _clipBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)),
	    _boundingBox = new Box3();
	let _points3 = new Array(3);

	let _viewMatrix = new Matrix4$1(),
	    _viewProjectionMatrix = new Matrix4$1();

	let _modelMatrix;

	// 渲染对象
	let _renderData = {objects: [], elements: []};

	class RenderList {
	    constructor() {
	        this.object = null;
	        this.material = null;
	    }

	    setObject(value) {
	        this.object = value;
	        this.material = value.material;
	    }

	    // 检查所有渲染对象和子对象
	    projectObject(object) {
	        let self = this;
	        if (object.visible === false) return;
	        if (object.isMesh) {
	            self.pushObject(object);
	        }
	        else if (object.isSprite) {
	            self.pushObject(object);
	        }

	        let children = object.children;
	        for (let i = 0, l = children.length; i < l; i++) {
	            self.projectObject(children[i]);
	        }
	    }

	    // 添加object
	    pushObject(object) {
	        _object = getNextObjectInPool();
	        _object.id = object.id;
	        _object.object = object;

	        _vector3.setFromMatrixPosition(object.matrixWorld);
	        _vector3.applyMatrix4(_viewProjectionMatrix);
	        _object.z = _vector3.z;
	        _object.renderOrder = object.renderOrder;
	        _renderData.objects.push(_object);
	    }

	    // 投影顶点到屏幕
	    projectVertex(vertex) {
	        let position = vertex.position;
	        let positionWorld = vertex.positionWorld;
	        let positionScreen = vertex.positionScreen;

	        // 三维转二维
	        positionWorld.copy(position).applyMatrix4(_modelMatrix);
	        positionScreen.copy(positionWorld).applyMatrix4(_viewProjectionMatrix);

	        let invW = 1 / positionScreen.w;

	        positionScreen.x *= invW;
	        positionScreen.y *= invW;
	        positionScreen.z *= invW;

	        vertex.visible = positionScreen.x >= -1 && positionScreen.x <= 1 && positionScreen.y >= -1 && positionScreen.y <= 1 && positionScreen.z >= -1 && positionScreen.z <= 1;
	    }

	    // 添加顶点
	    pushVertex(x, y, z) {
	        _vertex = getNextVertexInPool();
	        _vertex.position.set(x, y, z);
	        this.projectVertex(_vertex);
	    }

	    // 添加粒子且投影到屏幕
	    pushPoint(_vector4, object, camera) {
	        let invW = 1 / _vector4.w;
	        _vector4.z *= invW;
	        if (_vector4.z >= -1 && _vector4.z <= 1) {
	            _sprite = getNextSpriteInPool();
	            _sprite.id = object.id;
	            _sprite.renderOrder = object.renderOrder;
	            _sprite.rotation = object.rotation;
	            _sprite.material = object.material;

	            _sprite.x = _vector4.x * invW;
	            _sprite.y = _vector4.y * invW;
	            _sprite.z = _vector4.z;
	            _sprite.scale.x = object.scale.x * Math.abs(_sprite.x - (_vector4.x + camera.projectionMatrix.elements[0]) / (_vector4.w + camera.projectionMatrix.elements[12]));
	            _sprite.scale.y = object.scale.y * Math.abs(_sprite.y - (_vector4.y + camera.projectionMatrix.elements[5]) / (_vector4.w + camera.projectionMatrix.elements[13]));

	            _renderData.elements.push(_sprite);
	        }
	    }

	    // 添加三角面（BufferGeometry支持）
	    pushTriangle(a, b, c) {
	        let object = this.object;
	        let v1 = _vertexPool[a];
	        let v2 = _vertexPool[b];
	        let v3 = _vertexPool[c];

	        if (this.checkTriangleVisibility(v1, v2, v3) === false) return;

	        if (this.checkBackfaceCulling(v1, v2, v3) === true) {

	            _face = getNextFaceInPool();

	            _face.id = object.id;
	            _face.v1.copy(v1);
	            _face.v2.copy(v2);
	            _face.v3.copy(v3);
	            _face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;
	            _face.renderOrder = object.renderOrder;

	            // use first vertex normal as face normal

	            // _face.normalModel.fromArray(normals, a * 3);
	            // _face.normalModel.applyMatrix3(normalMatrix).normalize();

	            // for (let i = 0; i < 3; i++) {
	            //
	            //     let normal = _face.vertexNormalsModel[i];
	            //     normal.fromArray(normals, arguments[i] * 3);
	            //     normal.applyMatrix3(normalMatrix).normalize();
	            //
	            //     let uv = _face.uvs[i];
	            //     uv.fromArray(uvs, arguments[i] * 2);
	            //
	            // }
	            //
	            // _face.vertexNormalsLength = 3;

	            _face.material = object.material;

	            _renderData.elements.push(_face);

	        }
	    }

	    checkTriangleVisibility(v1, v2, v3) {
	        if (v1.visible === true || v2.visible === true || v3.visible === true) return true;

	        _points3[0] = v1.positionScreen;
	        _points3[1] = v2.positionScreen;
	        _points3[2] = v3.positionScreen;

	        return _clipBox.intersectsBox(_boundingBox.setFromPoints(_points3));
	    }

	    checkBackfaceCulling(v1, v2, v3) {
	        return ((v3.positionScreen.x - v1.positionScreen.x) * (v2.positionScreen.y - v1.positionScreen.y) - (v3.positionScreen.y - v1.positionScreen.y) * (v2.positionScreen.x - v1.positionScreen.x)) < 0;
	    }
	}

	let renderList = new RenderList();

	class Projector {
	    projectScene(scene, camera, sortObjects, sortElements) {
	        let self = this;
	        _objectCount = 0;
	        _faceCount = 0;
	        _renderData.elements = [];
	        _renderData.objects = [];

	        _viewMatrix.copy(camera.matrixWorldInverse);
	        _viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, _viewMatrix);
	        renderList.projectObject(scene);

	        if (sortObjects === true) {
	            _renderData.objects.sort(self.painterSort);
	        }

	        let objects = _renderData.objects;
	        for (let o = 0; o < objects.length; o++) {
	            let object = objects[o].object;
	            let geometry = object.geometry;

	            renderList.setObject(object);

	            _vertexCount = 0;
	            _modelMatrix = object.matrixWorld;

	            if (object.isMesh) {
	                // BufferGeometry
	                if (geometry.isBufferGeometry === true) {
	                    let attributes = geometry.attributes;
	                    let groups = geometry.groups;

	                    if (attributes.position === undefined) continue;

	                    let positions = attributes.position.array;

	                    for (let i = 0, l = positions.length; i < l; i += 3) {
	                        renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
	                    }

	                    if (geometry.index !== null) {
	                        let indices = geometry.index.array;

	                        if (groups.length > 0) {
	                            for (let g = 0; g < groups.length; g++) {
	                                let group = groups[g];
	                                for (let i = group.start, l = group.start + group.count; i < l; i += 3) {
	                                    renderList.pushTriangle(indices[i], indices[i + 1], indices[i + 2]);
	                                }
	                            }
	                        }
	                        else {
	                            for (let i = 0, l = indices.length; i < l; i += 3) {
	                                renderList.pushTriangle(indices[i], indices[i + 1], indices[i + 2]);
	                            }
	                        }
	                    }
	                    else {
	                        for (let i = 0, l = positions.length / 3; i < l; i += 3) {
	                            renderList.pushTriangle(i, i + 1, i + 2);
	                        }
	                    }
	                }
	                // Geometry
	                else if (geometry.Geometry) {
	                    let vertices = geometry.vertices;
	                    let faces = geometry.faces;

	                    let material = object.material;
	                    let isMultiMaterial = Array.isArray(material);

	                    // 点
	                    for (let v = 0; v < vertices.length; v++) {
	                        let vertex = vertices[v];
	                        _vector3.copy(vertex);
	                        renderList.pushVertex(_vector3.x, _vector3.y, _vector3.z);
	                    }

	                    // 面
	                    for (let f = 0; f < faces.length; f++) {
	                        material = isMultiMaterial === true ? object.material[face.materialIndex] : object.material;

	                        let face = faces[f];
	                        let v1 = _vertexPool[face.a];
	                        let v2 = _vertexPool[face.b];
	                        let v3 = _vertexPool[face.c];

	                        if (renderList.checkTriangleVisibility(v1, v2, v3) === false) continue;
	                        // 过滤面
	                        if (renderList.checkBackfaceCulling(v1, v2, v3) === false) continue;

	                        _face = getNextFaceInPool();

	                        _face.id = object.id;
	                        _face.color = face.color;
	                        _face.material = material;

	                        _face.v1.copy(v1);
	                        _face.v2.copy(v2);
	                        _face.v3.copy(v3);
	                        _face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;
	                        _face.renderOrder = object.renderOrder;

	                        _renderData.elements.push(_face);
	                    }
	                }
	            }
	            else if (object.isSprite) {
	                _vector4.set(_modelMatrix.elements[12], _modelMatrix.elements[13], _modelMatrix.elements[14], 1);
	                _vector4.applyMatrix4(_viewProjectionMatrix);
	                renderList.pushPoint(_vector4, object, camera);
	            }
	        }

	        if (sortElements === true) {
	            _renderData.elements.sort(self.painterSort);
	        }
	        return _renderData;
	    }

	    painterSort(a, b) {
	        if (a.renderOrder !== b.renderOrder) {
	            return a.renderOrder - b.renderOrder;
	        } else if (a.z !== b.z) {
	            return b.z - a.z;
	        } else if (a.id !== b.id) {
	            return a.id - b.id;
	        } else {
	            return 0;
	        }
	    }
	}

	// Object
	class RenderableObject {
	    constructor() {
	        this.id = 0;
	        this.object = null;
	        this.z = 0;
	        this.renderOrder = 0;
	    }
	}

	// Face3
	class RenderableFace {
	    constructor() {
	        this.id = 0;

	        this.v1 = new RenderableVertex();
	        this.v2 = new RenderableVertex();
	        this.v3 = new RenderableVertex();

	        this.color = new MeshBasicMaterial();
	        this.material = null;

	        this.z = 0;
	        this.renderOrder = 0;
	    }
	}

	// 顶点
	class RenderableVertex {
	    constructor() {
	        this.position = new Vector3();
	        this.positionWorld = new Vector3();
	        this.positionScreen = new Vector4();
	    }

	    copy(vertex) {
	        this.position.copy(vertex.position);
	        this.positionWorld.copy(vertex.positionWorld);
	        this.positionScreen.copy(vertex.positionScreen);
	    }
	}

	// 粒子
	class RenderableSprite {
	    constructor() {
	        this.id = 0;
	        this.object = null;

	        this.x = 0;
	        this.y = 0;
	        this.z = 0;

	        this.rotation = 0;
	        this.scale = new Vector2();

	        this.material = null;
	        this.renderOrder = 0;
	    }
	}

	function getNextObjectInPool() {
	    if (_objectCount === _objectPool.length) {
	        let object = new RenderableObject();
	        _objectPool.push(object);
	        _objectCount++;
	        return object;
	    }
	    return _objectPool[_objectCount++];
	}

	function getNextVertexInPool() {
	    if (_vertexCount === _vertexPool.length) {
	        let vertex = new RenderableVertex();
	        _vertexPool.push(vertex);
	        _vertexCount++;
	        return vertex;

	    }
	    return _vertexPool[_vertexCount++];
	}

	function getNextFaceInPool() {
	    if (_faceCount === _facePool.length) {
	        let face = new RenderableFace();
	        _facePool.push(face);
	        _faceCount++;
	        return face;

	    }
	    return _facePool[_faceCount++];
	}

	function getNextSpriteInPool() {
	    if (_spriteCount === _spritePool.length) {
	        let sprite = new RenderableSprite();
	        _spritePool.push(sprite);
	        _spriteCount++;
	        return sprite;
	    }
	    return _spritePool[_spriteCount++];
	}

	class Renderer {
	    constructor() {
	        this.renderList = [];
	        this.width = 0;
	        this.height = 0;
	        this.widthHalf = 0;
	        this.heightHalf = 0;
	    }
	}

	class Box2 {
	    constructor(min = new Vector2(+Infinity, +Infinity), max = new Vector2(-Infinity, -Infinity)) {
	        this.min = min;
	        this.max = max;
	    }

	    set(min, max) {
	        this.min.copy(min);
	        this.max.copy(max);

	        return this;
	    }

	    makeEmpty() {
	        this.min.x = this.min.y = +Infinity;
	        this.max.x = this.max.y = -Infinity;

	        return this;
	    }

	    isEmpty() {
	        // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
	        return (this.max.x < this.min.x) || (this.max.y < this.min.y);
	    }

	    // 应该被盒子包含的点
	    expandByPoint(point) {
	        this.min.min(point);
	        this.max.max(point);

	        return this;
	    }

	    setFromPoints(points) {
	        this.makeEmpty();

	        for (let i = 0, il = points.length; i < il; i++) {
	            this.expandByPoint(points[i]);
	        }

	        return this;
	    }

	    intersectsBox(box) {
	        // using 4 splitting planes to rule out intersections
	        return box.max.x < this.min.x || box.min.x > this.max.x ||
	        box.max.y < this.min.y || box.min.y > this.max.y ? false : true;
	    }

	    // 盒子扩展的距离
	    expandByScalar(scalar) {
	        this.min.addScalar(-scalar);
	        this.max.addScalar(scalar);

	        return this;
	    }

	    intersect(box) {
	        this.min.max(box.min);
	        this.max.min(box.max);

	        return this;
	    }

	    union(box) {
	        this.min.min(box.min);
	        this.max.max(box.max);

	        return this;
	    }
	}

	let _patterns = {};
	let _v1, _v2, _v3,
	    _v1x, _v1y, _v2x, _v2y, _v3x, _v3y;
	let _clipBox$1 = new Box2(),
	    _clearBox = new Box2(), // 清空画布2d盒子模型（不需要全屏清除，只清除绘制部分）
	    _elemBox = new Box2();
	let _color = new Color();

	class CanvasRenderer extends Renderer {
	    constructor() {
	        super();
	        this.domElement = document.createElement("canvas");
	        this.domElement.style.position = "absolute";
	        this.context = this.domElement.getContext("2d");

	        this.canvasWidth = 0;
	        this.canvasHeight = 0;
	        this.canvasWidthHalf = 0;
	        this.canvasHeightHalf = 0;

	        this.pixelRatio = 1;

	        this.autoClear = true;
	        this.sortObjects = true;
	        this.sortElements = true;
	    }

	    setPixelRatio(value) {
	        this.pixelRatio = value;
	    }

	    setSize(width, height) {
	        this.domElement.width = width;
	        this.domElement.height = height;

	        this.canvasWidth = width;
	        this.canvasHeight = height;

	        this.canvasWidthHalf = Math.floor(this.canvasWidth / 2);
	        this.canvasHeightHalf = Math.floor(this.canvasHeight / 2);

	        _clipBox$1.min.set(-this.canvasWidthHalf, -this.canvasHeightHalf);
	        _clipBox$1.max.set(this.canvasWidthHalf, this.canvasHeightHalf);

	        _clearBox.min.set(-this.canvasWidthHalf, -this.canvasHeightHalf);
	        _clearBox.max.set(this.canvasWidthHalf, this.canvasHeightHalf);
	    }

	    render(scene, camera) {
	        if (scene.autoUpdate === true) scene.updateMatrixWorld();
	        if (camera.parent === null) camera.updateMatrixWorld();

	        let background = scene.background;
	        if (background && background.isColor) {
	            this.setOpacity(1);
	            this.setBlending(THREE.NormalBlending);
	            this.setFillStyle(background.getStyle());
	            this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

	        } else if (this.autoClear === true) {
	            this.clear();
	        }

	        // 通过缩放翻转画布上下方向
	        this.context.setTransform(1, 0, 0, -1, 0, this.canvasHeight);
	        // 以画布中心为原点
	        this.context.translate(this.canvasWidthHalf, this.canvasHeightHalf);

	        let projector = new Projector();
	        let _renderData = projector.projectScene(scene, camera, this.sortObjects, this.sortElements);

	        for (let i = 0; i < _renderData.elements.length; i++) {
	            let element = _renderData.elements[i];
	            let material = element.material;

	            _elemBox.makeEmpty();

	            if (element instanceof RenderableFace) {
	                _v1 = element.v1;
	                _v2 = element.v2;
	                _v3 = element.v3;

	                _v1.positionScreen.x *= this.canvasWidthHalf, _v1.positionScreen.y *= this.canvasHeightHalf;
	                _v2.positionScreen.x *= this.canvasWidthHalf, _v2.positionScreen.y *= this.canvasHeightHalf;
	                _v3.positionScreen.x *= this.canvasWidthHalf, _v3.positionScreen.y *= this.canvasHeightHalf;

	                if (material.overdraw > 0) {
	                    this.expand(_v1.positionScreen, _v2.positionScreen, material.overdraw);
	                    this.expand(_v2.positionScreen, _v3.positionScreen, material.overdraw);
	                    this.expand(_v3.positionScreen, _v1.positionScreen, material.overdraw);
	                }

	                _elemBox.setFromPoints([_v1.positionScreen, _v2.positionScreen, _v3.positionScreen]);

	                if (_clipBox$1.intersectsBox(_elemBox) === true) {
	                    this.renderFace3(_v1, _v2, _v3, element, element.material);
	                }
	            }
	            else if (element instanceof RenderableSprite) {
	                this.renderSprite(element, element.material);
	            }

	            _clearBox.union(_elemBox);
	        }

	        this.context.setTransform(1, 0, 0, 1, 0, 0);
	    }

	    clear() {
	        if (_clearBox.isEmpty() === false) {
	            _clearBox.intersect(_clipBox$1).expandByScalar(2);

	            _clearBox.min.x = _clearBox.min.x + this.canvasWidthHalf;
	            _clearBox.min.y = -_clearBox.min.y + this.canvasHeightHalf;		// higher y value !
	            _clearBox.max.x = _clearBox.max.x + this.canvasWidthHalf;
	            _clearBox.max.y = -_clearBox.max.y + this.canvasHeightHalf;		// lower y value !
	            this.context.clearRect(_clearBox.min.x | 0, _clearBox.max.y | 0, (_clearBox.max.x - _clearBox.min.x) | 0, (_clearBox.min.y - _clearBox.max.y) | 0);

	            _clearBox.makeEmpty();
	        }
	    }

	    renderFace3(v1, v2, v3, element, material) {
	        this.setOpacity(material.opacity);
	        this.setBlending(material.blending);

	        _v1x = v1.positionScreen.x, _v1y = v1.positionScreen.y;
	        _v2x = v2.positionScreen.x, _v2y = v2.positionScreen.y;
	        _v3x = v3.positionScreen.x, _v3y = v3.positionScreen.y;

	        this.drawTriangle(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y);
	        if (material.isMeshBasicMaterial) {
	            if (material.map != null) {
	                console.log("暂未实现");
	            }
	            else {
	                _color.copy(material.color);
	                if (material.vertexColors === THREE.FaceColors) {
	                    _color.multiply(element.color);
	                }

	                material.wireframe === true
	                    ? this.strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin)
	                    : this.fillPath(_color);
	            }
	        }
	    }

	    drawTriangle(x0, y0, x1, y1, x2, y2) {
	        this.context.beginPath();
	        this.context.moveTo(x0, y0);
	        this.context.lineTo(x1, y1);
	        this.context.lineTo(x2, y2);
	        this.context.closePath();
	    }

	    strokePath(color, linewidth, linecap, linejoin) {
	        this.setLineWidth(linewidth);
	        this.setLineCap(linecap);
	        this.setLineJoin(linejoin);
	        this.setStrokeStyle(color.getStyle());
	        this.context.stroke();

	        _elemBox.expandByScalar(linewidth * 2);
	    }

	    fillPath(color) {
	        this.setFillStyle(color.getStyle());
	        this.context.fill();
	    }

	    renderSprite(element, material) {
	        this.setOpacity(material.opacity);
	        this.setBlending(material.blending);
	        let _context = this.context;
	        element.x *= this.canvasWidthHalf;
	        element.y *= this.canvasHeightHalf;
	        let scaleX = element.scale.x * this.canvasWidthHalf;
	        let scaleY = element.scale.y * this.canvasHeightHalf;

	        let dist = Math.sqrt(scaleX * scaleX + scaleY * scaleY); // allow for rotated sprite
	        _elemBox.min.set(element.x - dist, element.y - dist);
	        _elemBox.max.set(element.x + dist, element.y + dist);

	        if (material.isSpriteMaterial) {
	            let texture = material.map;
	            if (texture !== null) {
	                let pattern = _patterns[texture.id];
	                if (pattern === undefined || pattern.version !== texture.version) {
	                    pattern = this.textureToPattern(texture);
	                    _patterns[texture.id] = pattern;
	                }
	                if (pattern.canvas !== undefined) {
	                    this.setFillStyle(pattern.canvas);
	                    let bitmap = texture.image;

	                    let ox = bitmap.width * texture.offset.x;
	                    let oy = bitmap.height * texture.offset.y;

	                    let sx = bitmap.width * texture.repeat.x;
	                    let sy = bitmap.height * texture.repeat.y;

	                    let cx = scaleX / sx;
	                    let cy = scaleY / sy;

	                    _context.save();
	                    _context.translate(element.x, element.y);
	                    if (material.rotation !== 0) _context.rotate(material.rotation);
	                    _context.translate(-scaleX / 2, -scaleY / 2);
	                    _context.scale(cx, cy);
	                    _context.translate(-ox, -oy);
	                    _context.fillRect(ox, oy, sx, sy);
	                    _context.restore();
	                }
	            }
	            else {
	                this.setFillStyle(material.color.getStyle());

	                _context.save();
	                _context.translate(element.x, element.y);
	                if (material.rotation !== 0) _context.rotate(material.rotation);
	                _context.scale(scaleX, -scaleY);
	                _context.fillRect(-0.5, -0.5, 1, 1);
	                _context.restore();
	            }
	        }
	        else if (material.isSpriteCanvasMaterial) {
	            this.setStrokeStyle(material.color.getStyle());
	            this.setFillStyle(material.color.getStyle());

	            _context.save();
	            _context.translate(element.x, element.y);
	            if (material.rotation !== 0) _context.rotate(material.rotation);
	            _context.scale(scaleX, scaleY);
	            material.program(_context);
	            _context.restore();
	        }
	    }

	    textureToPattern(texture) {
	        if (texture.version === 0) {
	            return {
	                canvas: undefined,
	                version: texture.version
	            };
	        }
	        let image = texture.image;
	        if (image.complete === false) {
	            return {
	                canvas: undefined,
	                version: 0
	            };
	        }
	        let canvas = document.createElement('canvas');
	        canvas.width = image.width * (1);
	        canvas.height = image.height * (1);
	        let context = canvas.getContext('2d');
	        context.setTransform(1, 0, 0, -1, 0, image.height);
	        context.drawImage(image, 0, 0);
	        // if (mirrorX === true) {
	        //     context.setTransform(-1, 0, 0, -1, image.width, image.height);
	        //     context.drawImage(image, -image.width, 0);
	        // }
	        // if (mirrorY === true) {
	        //     context.setTransform(1, 0, 0, 1, 0, 0);
	        //     context.drawImage(image, 0, image.height);
	        // }
	        // if (mirrorX === true && mirrorY === true) {
	        //     context.setTransform(-1, 0, 0, 1, image.width, 0);
	        //     context.drawImage(image, -image.width, image.height);
	        // }
	        let repeat = 'no-repeat';
	        // if (repeatX === true && repeatY === true) {
	        //     repeat = 'repeat';
	        // } else if (repeatX === true) {
	        //     repeat = 'repeat-x';
	        // } else if (repeatY === true) {
	        //     repeat = 'repeat-y';
	        // }
	        let pattern = this.context.createPattern(canvas, repeat);
	        if (texture.onUpdate) texture.onUpdate(texture);
	        return {
	            canvas: pattern,
	            version: texture.version
	        };
	    }

	    // Hide anti-alias gaps
	    expand(v1, v2, pixels) {
	        let x = v2.x - v1.x, y = v2.y - v1.y,
	            det = x * x + y * y, idet;

	        if (det === 0) return;
	        idet = pixels / Math.sqrt(det);

	        x *= idet;
	        y *= idet;

	        v2.x += x;
	        v2.y += y;
	        v1.x -= x;
	        v1.y -= y;
	    }

	    setOpacity(value) {
	        this.context.globalAlpha = value;
	    }

	    // canvas混合模式
	    setBlending(value) {
	        if (value === THREE.NormalBlending) {
	            this.context.globalCompositeOperation = 'source-over';
	        } else if (value === THREE.AdditiveBlending) {
	            this.context.globalCompositeOperation = 'lighter';
	        } else if (value === THREE.SubtractiveBlending) {
	            this.context.globalCompositeOperation = 'darker';
	        } else if (value === THREE.MultiplyBlending) {
	            this.context.globalCompositeOperation = 'multiply';
	        }
	    }

	    setFillStyle(value) {
	        this.context.fillStyle = value;
	    }

	    setStrokeStyle(value) {
	        this.context.strokeStyle = value;
	    }

	    setLineWidth(value) {
	        this.context.lineWidth = value;
	    }

	    // "butt", "round", "square"
	    setLineCap(value) {
	        this.context.lineCap = value;
	    }

	    // "butt", "round", "square"
	    setLineJoin(value) {
	        this.context.lineJoin = value;
	    }

	    setLineDash(value) {
	        this.context.setLineDash = value;
	    }
	}

	exports.Math = _Math;
	exports.Object3D = Object3D;
	exports.Euler = Euler;
	exports.Quaternion = Quaternion;
	exports.Vector2 = Vector2;
	exports.Vector3 = Vector3;
	exports.Vector4 = Vector4;
	exports.Matrix3 = Matrix3;
	exports.Matrix4 = Matrix4$1;
	exports.Color = Color;
	exports.PerspectiveCamera = PerspectiveCamera;
	exports.OrthographicCamera = OrthographicCamera;
	exports.Scene = Scene;
	exports.Texture = Texture;
	exports.CanvasTexture = CanvasTexture;
	exports.MeshBasicMaterial = MeshBasicMaterial;
	exports.SpriteMaterial = SpriteMaterial;
	exports.SpriteCanvasMaterial = SpriteCanvasMaterial;
	exports.Face3 = Face3;
	exports.Face4 = Face4;
	exports.Group = Group;
	exports.Mesh = Mesh;
	exports.Sprite = Sprite;
	exports.BoxGeometry = BoxGeometry;
	exports.BoxBufferGeometry = BoxBufferGeometry;
	exports.PlaneGeometry = PlaneGeometry;
	exports.PlaneBufferGeometry = PlaneBufferGeometry;
	exports.RenderableObject = RenderableObject;
	exports.RenderableFace = RenderableFace;
	exports.Projector = Projector;
	exports.CanvasRenderer = CanvasRenderer;
	exports.REVISION = REVISION;
	exports.NoColors = NoColors;
	exports.FaceColors = FaceColors;
	exports.VertexColors = VertexColors;
	exports.NoBlending = NoBlending;
	exports.NormalBlending = NormalBlending;
	exports.AdditiveBlending = AdditiveBlending;
	exports.SubtractiveBlending = SubtractiveBlending;
	exports.MultiplyBlending = MultiplyBlending;
	exports.CustomBlending = CustomBlending;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
