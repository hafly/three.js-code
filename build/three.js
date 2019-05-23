(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.THREE = {}));
}(this, function (exports) { 'use strict';

	const REVISION = '1';
	// 材质附着面
	let FrontSide = 0;   // 正面
	let BackSide = 1;    // 背面
	let DoubleSide = 2;  // 双面
	// 作色方式
	let FlatShading = 1;     // GL_FLAT恒定着色
	let SmoothShading = 2;   // GL_SMOOTH平滑着色
	// 作色点或面
	let NoColors = 0;    // 顶点没有颜色
	let FaceColors = 1;  // 顶点使用面的颜色
	let VertexColors = 2;// 顶点使用顶点的颜色
	// 材质混合模式
	let NoBlending = 0;          // 没有混合
	let NormalBlending = 1;      // 普通混合
	let AdditiveBlending = 2;    // 相加混合
	let SubtractiveBlending = 3; // 相减混合
	let MultiplyBlending = 4;    // 相乘混合
	let CustomBlending = 5;      // 自定义混合
	// 纹理映射
	let UVMapping = 300;
	// Pixel formats像素颜色格式
	let RGBFormat = 1022;
	let RGBAFormat = 1023;

	let _Math = {
	    DEG2RAD: Math.PI / 180,
	    RAD2DEG: 180 / Math.PI,

	    // 生成一个36位的uuid通用唯一识别码
	    generateUUID: (function () {
	        let lut = [];
	        for (let i = 0; i < 256; i++) {
	            lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
	        }

	        return function generateUUID() {
	            let d0 = Math.random() * 0xffffffff | 0;
	            let d1 = Math.random() * 0xffffffff | 0;
	            let d2 = Math.random() * 0xffffffff | 0;
	            let d3 = Math.random() * 0xffffffff | 0;
	            let uuid = lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
	                lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
	                lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
	                lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
	            // .toUpperCase() here flattens concatenated strings to save heap memory space.
	            return uuid.toUpperCase();
	        };
	    })(),

	    // 限制最小最大值
	    clamp: function (value, min, max) {
	        return Math.max(min, Math.min(max, value));
	    },

	    // 计算m % n的欧几里得模
	    euclideanModulo: function (n, m) {
	        return ((n % m) + m) % m;
	    },

	    // 线性插值
	    lerp: function (x, y, t) {
	        return (1 - t) * x + t * y;
	    },

	    // 和lerp类似，在最小和最大值之间的插值，并在限制处渐入渐出。三次平滑插值
	    // 返回0-1之间的值，该值表示x在最小值和最大值之间移动的百分比，但当x接近最小值和最大值时，则使其平滑或减慢
	    smoothstep: function (x, min, max) {
	        if (x <= min) return 0;
	        if (x >= max) return 1;
	        x = (x - min) / (max - min);
	        return x * x * (3 - 2 * x);
	    },
	    // 五次平滑插值
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

	    // 角度转弧度
	    degToRad: function (degrees) {
	        return degrees * _Math.DEG2RAD;
	    },

	    // 弧度转角度
	    radToDeg: function (radians) {
	        return radians * _Math.RAD2DEG;
	    },

	    // 是否是2的幂
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

	/**
	 * 三维向量
	 * （部分没有意义且未使用的方法注释了）
	 */
	class Vector3 {
	    constructor(x = 0, y = 0, z = 0) {
	        this.x = x;
	        this.y = y;
	        this.z = z;
	    }

	    set(x, y, z) {
	        this.x = x;
	        this.y = y;
	        this.z = z;
	        return this;
	    }

	    setX(x) {
	        this.x = x;
	        return this;
	    }

	    setY(y) {
	        this.y = y;
	        return this;
	    }

	    setZ(z) {
	        this.z = z;
	        return this;
	    }

	    clone() {
	        return new this.constructor(this.x, this.y, this.z);
	    }

	    copy(v) {
	        this.x = v.x;
	        this.y = v.y;
	        this.z = v.z;
	        return this;
	    }

	    // 向量加法
	    add(v) {
	        this.x += v.x;
	        this.y += v.y;
	        this.z += v.z;
	        return this;
	    }

	    addVectors(a, b) {
	        this.x = a.x + b.x;
	        this.y = a.y + b.y;
	        this.z = a.z + b.z;
	        return this;
	    }

	    // 与标量s相加（没有几何意义，只用到Box3扩展边界）
	    addScalar(s) {
	        this.x += s;
	        this.y += s;
	        this.z += s;
	        return this;
	    }

	    // 向量减法
	    sub(v) {
	        this.x -= v.x;
	        this.y -= v.y;
	        this.z -= v.z;
	        return this;
	    }

	    subVectors(a, b) {
	        this.x = a.x - b.x;
	        this.y = a.y - b.y;
	        this.z = a.z - b.z;
	        return this;
	    }

	    // 与标量s相减（没有几何意义）
	    // subScalar(s) {
	    //     this.x -= s;
	    //     this.y -= s;
	    //     this.z -= s;
	    //     return this;
	    // }

	    // 向量乘法（没有几何意义）
	    // multiply(v) {
	    //     this.x *= v.x;
	    //     this.y *= v.y;
	    //     this.z *= v.z;
	    //     return this;
	    // }

	    // multiplyVectors(a, b) {
	    //     this.x = a.x * b.x;
	    //     this.y = a.y * b.y;
	    //     this.z = a.z * b.z;
	    //
	    //     return this;
	    // }

	    // 乘以标量（放大向量）
	    multiplyScalar(scalar) {
	        this.x *= scalar;
	        this.y *= scalar;
	        this.z *= scalar;
	        return this;
	    }

	    // 向量除法（没有几何意义）
	    // divide(v) {
	    //     this.x /= v.x;
	    //     this.y /= v.y;
	    //     this.z /= v.z;
	    //     return this;
	    // }

	    // 除以标量（缩小向量）
	    divideScalar(scalar) {
	        return this.multiplyScalar(1 / scalar);
	    }

	    // 标准化向量，长度为1
	    normalize() {
	        return this.divideScalar(this.length() || 1);
	    }

	    // 反转向量
	    negate() {
	        this.x = -this.x;
	        this.y = -this.y;
	        this.z = -this.z;
	        return this;
	    }

	    // 向量的模（长度）
	    length() {
	        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	    }

	    lengthSq() {
	        return this.x * this.x + this.y * this.y + this.z * this.z;
	    }

	    // 到向量v的距离
	    distanceTo(v) {
	        return Math.sqrt(this.distanceToSquared(v));
	    }

	    distanceToSquared(v) {
	        let dx = this.x - v.x,
	            dy = this.y - v.y,
	            dz = this.z - v.z;
	        return dx * dx + dy * dy + dz * dz;
	    }

	    // 与向量v的角度
	    angleTo(v) {
	        let theta = this.dot(v) / (Math.sqrt(this.lengthSq() * v.lengthSq()));
	        return Math.acos(_Math.clamp(theta, -1, 1));
	    }

	    // 点乘
	    dot(v) {
	        return this.x * v.x + this.y * v.y + this.z * v.z;
	    }

	    // 叉乘
	    cross(v) {
	        let x = this.x;
	        let y = this.y;
	        let z = this.z;

	        this.x = y * v.z - z * v.y;
	        this.y = z * v.x - x * v.z;
	        this.z = x * v.y - y * v.x;
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

	    // 将该向量乘以三阶矩阵m
	    applyMatrix3(m) {
	        let x = this.x, y = this.y, z = this.z;
	        let e = m.elements;

	        this.x = e[0] * x + e[3] * y + e[6] * z;
	        this.y = e[1] * x + e[4] * y + e[7] * z;
	        this.z = e[2] * x + e[5] * y + e[8] * z;

	        return this;
	    }

	    // 将当前向量乘以一个4x4的矩阵，第四个维度隐式地为1（= 当前位置 + 矩阵变换位置）
	    applyMatrix4(m) {
	        let x = this.x, y = this.y, z = this.z;
	        let e = m.elements;

	        let w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

	        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
	        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
	        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

	        return this;
	    }

	    // 用相机投影该向量（暂未使用）
	    project(camera) {
	        return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
	    }

	    // 用相机反投影该向量（暂未使用）
	    unproject(camera) {
	        let matrix = new Matrix4();
	        return this.applyMatrix4(matrix.getInverse(camera.projectionMatrix)).applyMatrix4(camera.matrixWorld);
	    }

	    // 投影该向量到另一个向量上。
	    projectOnVector(vector) {
	        let scalar = vector.dot(this) / vector.lengthSq();
	        return this.copy(vector).multiplyScalar(scalar);
	    }

	    // 线性插值
	    lerp(v, alpha) {
	        this.x += (v.x - this.x) * alpha;
	        this.y += (v.y - this.y) * alpha;
	        this.z += (v.z - this.z) * alpha;

	        return this;
	    }

	    lerpVectors(v1, v2, alpha) {
	        return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
	    }

	    // 从矩阵中获取位置向量（原getFromMatrixPosition方法）
	    setFromMatrixPosition(m) {
	        let e = m.elements;

	        this.x = e[12];
	        this.y = e[13];
	        this.z = e[14];

	        return this;
	    }

	    // 从矩阵中获取缩放向量
	    setFromMatrixScale(m) {
	        let sx = this.setFromMatrixColumn(m, 0).length();
	        let sy = this.setFromMatrixColumn(m, 1).length();
	        let sz = this.setFromMatrixColumn(m, 2).length();

	        this.x = sx;
	        this.y = sy;
	        this.z = sz;

	        return this;
	    }

	    /**
	     * 将矩阵指定的列中的元素的向量值赋值给给当前的向量
	     * @param m
	     * @param index 列数,列的下标
	     * @returns {*}
	     */
	    setFromMatrixColumn(m, index) {
	        return this.fromArray(m.elements, index * 4);
	    }

	    // 与向量v比较返回(x,y,z)值最小的三维向量
	    min(v) {
	        this.x = Math.min(this.x, v.x);
	        this.y = Math.min(this.y, v.y);
	        this.z = Math.min(this.z, v.z);

	        return this;
	    }

	    // 与向量v比较返回(x,y,z)值最大的三维向量
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

	    fromBufferAttribute(attribute, index) {
	        this.x = attribute.getX(index);
	        this.y = attribute.getY(index);
	        this.z = attribute.getZ(index);

	        return this;
	    }
	}

	Object.defineProperty(Vector3.prototype, 'isVector3', {value: true});

	let x = new Vector3();  // lookAt变量
	let y = new Vector3();
	let z = new Vector3();
	let zero = new Vector3(0, 0, 0);    // makeRotationFromQuaternion变量
	let one = new Vector3(1, 1, 1);     // makeRotationFromQuaternion变量
	let v1 = new Vector3(); // applyToBufferAttribute变量，attribute里的position

	let vector = new Vector3();
	let matrix = undefined;

	/**
	 * 4*4矩阵原理可以参考这篇文章：http://blog.vr-seesee.com/detail/185
	 * 矩阵是用于表示变换而不是坐标，4*4矩阵的核心是变换：平移、旋转、缩放
	 * 矩阵3个特性：
	 * 1.变换；
	 * 2.矩阵乘以对应的3D点坐标，就可以获取变换后的点坐标；
	 * 3.矩阵相乘结果为新的矩阵变换。
	 * three.js里的矩阵：
	 * 1.投影矩阵projectionMatrix
	 * 2.视图矩阵CameraMatrixWorldInverse（camera.matrixWorldInverse） 或 viewMatrix
	 * 3.模型矩阵ObjectWorldMatrix（object.matrixWorld） 或 modelMatrix
	 * 三维投影矩阵计算公式：let m = ProjectMatrix * CameraMatrixWorldInverse* ObjectMatrixWorld
	 */
	class Matrix4 {
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

	        te[0] = n11, te[4] = n12, te[8] = n13, te[12] = n14;
	        te[1] = n21, te[5] = n22, te[9] = n23, te[13] = n24;
	        te[2] = n31, te[6] = n32, te[10] = n33, te[14] = n34;
	        te[3] = n41, te[7] = n42, te[11] = n43, te[15] = n44;

	        return this;
	    }

	    // 重置为单位矩阵
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

	        te[0] = me[0];
	        te[1] = me[1];
	        te[2] = me[2];
	        te[3] = me[3];
	        te[4] = me[4];
	        te[5] = me[5];
	        te[6] = me[6];
	        te[7] = me[7];
	        te[8] = me[8];
	        te[9] = me[9];
	        te[10] = me[10];
	        te[11] = me[11];
	        te[12] = me[12];
	        te[13] = me[13];
	        te[14] = me[14];
	        te[15] = me[15];

	        return this;
	    }

	    // 矩阵乘法（矩阵相乘结果为新的矩阵变换）
	    multiply(m) {
	        return this.multiplyMatrices(this, m);
	    }

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

	    // 矩阵乘以标量s（缩放矩阵）
	    multiplyScalar(s) {
	        let te = this.elements;

	        te[0] *= s;
	        te[4] *= s;
	        te[8] *= s;
	        te[12] *= s;
	        te[1] *= s;
	        te[5] *= s;
	        te[9] *= s;
	        te[13] *= s;
	        te[2] *= s;
	        te[6] *= s;
	        te[10] *= s;
	        te[14] *= s;
	        te[3] *= s;
	        te[7] *= s;
	        te[11] *= s;
	        te[15] *= s;

	        return this;
	    }

	    // 复制参数m(4x4矩阵)的平移分量
	    copyPosition(m) {
	        let te = this.elements, me = m.elements;

	        te[12] = me[12];
	        te[13] = me[13];
	        te[14] = me[14];

	        return this;
	    }

	    // 用这个矩阵乘以缓存属性attribute里position向量
	    applyToBufferAttribute(attribute) {
	        for (let i = 0, l = attribute.count; i < l; i++) {
	            v1.x = attribute.getX(i);
	            v1.y = attribute.getY(i);
	            v1.z = attribute.getZ(i);

	            // v1经过矩阵变换后的位置
	            v1.applyMatrix4(this);

	            attribute.setXYZ(i, v1.x, v1.y, v1.z);
	        }
	        return attribute;
	    }

	    // 平移
	    makeTranslation(x, y, z) {
	        this.set(
	            1, 0, 0, x,
	            0, 1, 0, y,
	            0, 0, 1, z,
	            0, 0, 0, 1
	        );

	        return this;
	    }

	    // 绕x轴旋转theta弧度
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

	    // 围绕轴 axis 旋转量为 theta弧度（旋转轴需要归一化）
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

	    // 将传入的欧拉角转换为该矩阵的旋转分量(左上角的3x3矩阵)。 矩阵的其余部分被设为单位矩阵（未使用）
	    makeRotationFromEuler(euler) {
	        if (!(euler && euler.isEuler)) {
	            console.error('THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.');
	        }

	        let te = this.elements;

	        let x = euler.x, y = euler.y, z = euler.z;
	        let a = Math.cos(x), b = Math.sin(x);
	        let c = Math.cos(y), d = Math.sin(y);
	        let e = Math.cos(z), f = Math.sin(z);

	        if (euler.order === 'XYZ') {
	            let ae = a * e, af = a * f, be = b * e, bf = b * f;

	            te[0] = c * e;
	            te[4] = -c * f;
	            te[8] = d;

	            te[1] = af + be * d;
	            te[5] = ae - bf * d;
	            te[9] = -b * c;

	            te[2] = bf - ae * d;
	            te[6] = be + af * d;
	            te[10] = a * c;
	        } else if (euler.order === 'YXZ') {
	            let ce = c * e, cf = c * f, de = d * e, df = d * f;

	            te[0] = ce + df * b;
	            te[4] = de * b - cf;
	            te[8] = a * d;

	            te[1] = a * f;
	            te[5] = a * e;
	            te[9] = -b;

	            te[2] = cf * b - de;
	            te[6] = df + ce * b;
	            te[10] = a * c;
	        } else if (euler.order === 'ZXY') {
	            let ce = c * e, cf = c * f, de = d * e, df = d * f;

	            te[0] = ce - df * b;
	            te[4] = -a * f;
	            te[8] = de + cf * b;

	            te[1] = cf + de * b;
	            te[5] = a * e;
	            te[9] = df - ce * b;

	            te[2] = -a * d;
	            te[6] = b;
	            te[10] = a * c;
	        } else if (euler.order === 'ZYX') {
	            let ae = a * e, af = a * f, be = b * e, bf = b * f;

	            te[0] = c * e;
	            te[4] = be * d - af;
	            te[8] = ae * d + bf;

	            te[1] = c * f;
	            te[5] = bf * d + ae;
	            te[9] = af * d - be;

	            te[2] = -d;
	            te[6] = b * c;
	            te[10] = a * c;
	        } else if (euler.order === 'YZX') {
	            let ac = a * c, ad = a * d, bc = b * c, bd = b * d;

	            te[0] = c * e;
	            te[4] = bd - ac * f;
	            te[8] = bc * f + ad;

	            te[1] = f;
	            te[5] = a * e;
	            te[9] = -b * e;

	            te[2] = -d * e;
	            te[6] = ad * f + bc;
	            te[10] = ac - bd * f;
	        } else if (euler.order === 'XZY') {
	            let ac = a * c, ad = a * d, bc = b * c, bd = b * d;

	            te[0] = c * e;
	            te[4] = -f;
	            te[8] = d * e;

	            te[1] = ac * f + bd;
	            te[5] = a * e;
	            te[9] = ad * f - bc;

	            te[2] = bc * f - ad;
	            te[6] = b * e;
	            te[10] = bd * f + ac;
	        }

	        // bottom row
	        te[3] = 0;
	        te[7] = 0;
	        te[11] = 0;

	        // last column
	        te[12] = 0;
	        te[13] = 0;
	        te[14] = 0;
	        te[15] = 1;

	        return this;
	    }

	    // 将这个矩阵的旋转分量设置为四元数q指定的旋转，矩阵的其余部分被设为单位矩阵（用于通过Quaternion设置Euler）
	    makeRotationFromQuaternion(q) {
	        return this.compose(zero, q, one);
	    }

	    // 缩放
	    makeScale(x, y, z) {
	        this.set(
	            x, 0, 0, 0,
	            0, y, 0, 0,
	            0, 0, z, 0,
	            0, 0, 0, 1
	        );

	        return this;
	    }

	    // 由位置position，四元数quaternion 和 缩放scale 组合变换的矩阵
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

	    // 将矩阵分解到给定的平移position ,旋转 quaternion，缩放scale分量中。
	    decompose(position, quaternion, scale) {
	        if (matrix == undefined) matrix = new Matrix4();

	        let te = this.elements;

	        let sx = vector.set(te[0], te[1], te[2]).length();
	        let sy = vector.set(te[4], te[5], te[6]).length();
	        let sz = vector.set(te[8], te[9], te[10]).length();

	        // if determine is negative, we need to invert one scale
	        let det = this.determinant();
	        if (det < 0) sx = -sx;

	        position.x = te[12];
	        position.y = te[13];
	        position.z = te[14];

	        // scale the rotation part
	        matrix.copy(this);

	        let invSX = 1 / sx;
	        let invSY = 1 / sy;
	        let invSZ = 1 / sz;

	        matrix.elements[0] *= invSX;
	        matrix.elements[1] *= invSX;
	        matrix.elements[2] *= invSX;

	        matrix.elements[4] *= invSY;
	        matrix.elements[5] *= invSY;
	        matrix.elements[6] *= invSY;

	        matrix.elements[8] *= invSZ;
	        matrix.elements[9] *= invSZ;
	        matrix.elements[10] *= invSZ;

	        quaternion.setFromRotationMatrix(matrix);

	        scale.x = sx;
	        scale.y = sy;
	        scale.z = sz;

	        return this;
	    }

	    // 构造一个旋转矩阵从eye 指向 target
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

	        te[0] = x.x, te[4] = y.x, te[8] = z.x;
	        te[1] = x.y, te[5] = y.y, te[9] = z.y;
	        te[2] = x.z, te[6] = y.z, te[10] = z.z;

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

	        te[0] = x, te[4] = 0, te[8] = a, te[12] = 0;
	        te[1] = 0, te[5] = y, te[9] = b, te[13] = 0;
	        te[2] = 0, te[6] = 0, te[10] = c, te[14] = d;
	        te[3] = 0, te[7] = 0, te[11] = -1, te[15] = 0;

	        return this;
	    }

	    // 创建一个正交投影矩阵
	    makeOrthographic(left, right, top, bottom, near, far) {
	        let te = this.elements;
	        let w = 1.0 / (right - left);
	        let h = 1.0 / (top - bottom);
	        let p = 1.0 / (far - near);

	        let x = (right + left) * w;
	        let y = (top + bottom) * h;
	        let z = (far + near) * p;

	        te[0] = 2 * w, te[4] = 0, te[8] = 0, te[12] = -x;
	        te[1] = 0, te[5] = 2 * h, te[9] = 0, te[13] = -y;
	        te[2] = 0, te[6] = 0, te[10] = -2 * p, te[14] = -z;
	        te[3] = 0, te[7] = 0, te[11] = 0, te[15] = 1;
	        return this;
	    }

	    // 行列式
	    determinant() {
	        let te = this.elements;

	        let n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
	        let n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
	        let n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
	        let n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

	        //( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

	        return (
	            n41 * (
	                +n14 * n23 * n32
	                - n13 * n24 * n32
	                - n14 * n22 * n33
	                + n12 * n24 * n33
	                + n13 * n22 * n34
	                - n12 * n23 * n34
	            ) +
	            n42 * (
	                +n11 * n23 * n34
	                - n11 * n24 * n33
	                + n14 * n21 * n33
	                - n13 * n21 * n34
	                + n13 * n24 * n31
	                - n14 * n23 * n31
	            ) +
	            n43 * (
	                +n11 * n24 * n32
	                - n11 * n22 * n34
	                - n14 * n21 * n32
	                + n12 * n21 * n34
	                + n14 * n22 * n31
	                - n12 * n24 * n31
	            ) +
	            n44 * (
	                -n13 * n22 * n31
	                - n11 * n23 * n32
	                + n11 * n22 * n33
	                + n13 * n21 * n32
	                - n12 * n21 * n33
	                + n12 * n23 * n31
	            )
	        );
	    }

	    /**
	     * 求逆矩阵（矩阵的倒数，用来实现矩阵的除法。矩阵不存在直接相除的概念，需要借助逆矩阵）
	     * X * A = B，我们要求X矩阵的值。X = B * A的逆矩阵
	     * @param m 取逆的矩阵
	     * @param throwOnDegenerate
	     * @returns {this}
	     */
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

	    // 转置矩阵
	    transpose() {
	        let te = this.elements;
	        let tmp;

	        tmp = te[1], te[1] = te[4], te[4] = tmp;
	        tmp = te[2], te[2] = te[8], te[8] = tmp;
	        tmp = te[6], te[6] = te[9], te[9] = tmp;

	        tmp = te[3], te[3] = te[12], te[12] = tmp;
	        tmp = te[7], te[7] = te[13], te[13] = tmp;
	        tmp = te[11], te[11] = te[14], te[14] = tmp;

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

	    fromArray(array, offset) {
	        if (offset === undefined) offset = 0;

	        for (let i = 0; i < 16; i++) {
	            this.elements[i] = array[i + offset];
	        }

	        return this;
	    }

	    toArray(array, offset) {
	        if (array === undefined) array = [];
	        if (offset === undefined) offset = 0;

	        let te = this.elements;

	        array[offset] = te[0];
	        array[offset + 1] = te[1];
	        array[offset + 2] = te[2];
	        array[offset + 3] = te[3];

	        array[offset + 4] = te[4];
	        array[offset + 5] = te[5];
	        array[offset + 6] = te[6];
	        array[offset + 7] = te[7];

	        array[offset + 8] = te[8];
	        array[offset + 9] = te[9];
	        array[offset + 10] = te[10];
	        array[offset + 11] = te[11];

	        array[offset + 12] = te[12];
	        array[offset + 13] = te[13];
	        array[offset + 14] = te[14];
	        array[offset + 15] = te[15];

	        return array;
	    }
	}

	Object.defineProperty(Matrix4.prototype, 'isMatrix4', {value: true});

	let v1$1 = new Vector3();
	/**
	 * 3x3矩阵
	 * 3x3矩阵可含有旋转、缩放、倾斜，但没有平移。
	 */
	class Matrix3 {
	    constructor() {
	        this.elements = [
	            1, 0, 0,
	            0, 1, 0,
	            0, 0, 1
	        ];
	    }

	    set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
	        let te = this.elements;

	        te[0] = n11, te[1] = n21, te[2] = n31;
	        te[3] = n12, te[4] = n22, te[5] = n32;
	        te[6] = n13, te[7] = n23, te[8] = n33;

	        return this;
	    }

	    // 重置为单位矩阵
	    identity() {
	        this.set(
	            1, 0, 0,
	            0, 1, 0,
	            0, 0, 1
	        );
	        return this;
	    }

	    clone() {
	        return new this.constructor().fromArray(this.elements);
	    }

	    copy(m) {
	        let te = this.elements;
	        let me = m.elements;

	        te[0] = me[0], te[1] = me[1], te[2] = me[2];
	        te[3] = me[3], te[4] = me[4], te[5] = me[5];
	        te[6] = me[6], te[7] = me[7], te[8] = me[8];

	        return this;
	    }

	    // 从Matrix4中设置
	    setFromMatrix4(m) {
	        let me = m.elements;
	        this.set(
	            me[0], me[4], me[8],
	            me[1], me[5], me[9],
	            me[2], me[6], me[10]
	        );
	        return this;
	    }

	    /**
	     * 用这个矩阵乘以缓存属性attribute里的所有3d向量
	     * @param attribute 三维向量缓存属性
	     * @returns {attribute}
	     */
	    applyToBufferAttribute(attribute) {
	        for (let i = 0, l = attribute.count; i < l; i++) {
	            v1$1.x = attribute.getX(i);
	            v1$1.y = attribute.getY(i);
	            v1$1.z = attribute.getZ(i);

	            v1$1.applyMatrix3(this);
	            attribute.setXYZ(i, v1$1.x, v1$1.y, v1$1.z);
	        }
	        return attribute;
	    }

	    // 矩阵乘法
	    multiply(m) {
	        return this.multiplyMatrices(this, m);
	    }

	    premultiply(m) {
	        return this.multiplyMatrices(m, this);
	    }

	    multiplyMatrices(a, b) {
	        let ae = a.elements;
	        let be = b.elements;
	        let te = this.elements;

	        let a11 = ae[0], a12 = ae[3], a13 = ae[6];
	        let a21 = ae[1], a22 = ae[4], a23 = ae[7];
	        let a31 = ae[2], a32 = ae[5], a33 = ae[8];

	        let b11 = be[0], b12 = be[3], b13 = be[6];
	        let b21 = be[1], b22 = be[4], b23 = be[7];
	        let b31 = be[2], b32 = be[5], b33 = be[8];

	        te[0] = a11 * b11 + a12 * b21 + a13 * b31;
	        te[3] = a11 * b12 + a12 * b22 + a13 * b32;
	        te[6] = a11 * b13 + a12 * b23 + a13 * b33;

	        te[1] = a21 * b11 + a22 * b21 + a23 * b31;
	        te[4] = a21 * b12 + a22 * b22 + a23 * b32;
	        te[7] = a21 * b13 + a22 * b23 + a23 * b33;

	        te[2] = a31 * b11 + a32 * b21 + a33 * b31;
	        te[5] = a31 * b12 + a32 * b22 + a33 * b32;
	        te[8] = a31 * b13 + a32 * b23 + a33 * b33;

	        return this;
	    }

	    // 矩阵乘以标量s（缩放矩阵）
	    multiplyScalar(s) {
	        let te = this.elements;

	        te[0] *= s;
	        te[3] *= s;
	        te[6] *= s;
	        te[1] *= s;
	        te[4] *= s;
	        te[7] *= s;
	        te[2] *= s;
	        te[5] *= s;
	        te[8] *= s;

	        return this;
	    }

	    // 行列式
	    determinant() {
	        let te = this.elements;

	        let a = te[0], b = te[1], c = te[2],
	            d = te[3], e = te[4], f = te[5],
	            g = te[6], h = te[7], i = te[8];

	        return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
	    }

	    // 求逆矩阵
	    getInverse(matrix, throwOnDegenerate) {
	        if (matrix && matrix.isMatrix4) {
	            console.error("THREE.Matrix3: .getInverse() no longer takes a Matrix4 argument.");
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

	        if (det === 0) {
	            let msg = "THREE.Matrix3: .getInverse() can't invert matrix, determinant is 0";

	            if (throwOnDegenerate === true) {
	                throw new Error(msg);
	            }
	            else {
	                console.warn(msg);
	            }

	            return this.identity();
	        }

	        let detInv = 1 / det;

	        te[0] = t11 * detInv;
	        te[1] = (n31 * n23 - n33 * n21) * detInv;
	        te[2] = (n32 * n21 - n31 * n22) * detInv;

	        te[3] = t12 * detInv;
	        te[4] = (n33 * n11 - n31 * n13) * detInv;
	        te[5] = (n31 * n12 - n32 * n11) * detInv;

	        te[6] = t13 * detInv;
	        te[7] = (n21 * n13 - n23 * n11) * detInv;
	        te[8] = (n22 * n11 - n21 * n12) * detInv;

	        return this;
	    }

	    // 转置矩阵
	    transpose() {
	        let tmp, m = this.elements;

	        tmp = m[1], m[1] = m[3], m[3] = tmp;
	        tmp = m[2], m[2] = m[6], m[6] = tmp;
	        tmp = m[5], m[5] = m[7], m[7] = tmp;

	        return this;
	    }

	    // 正规矩阵（矩阵m的逆矩阵的转置）
	    getNormalMatrix(matrix4) {
	        return this.setFromMatrix4(matrix4).getInverse(this).transpose();
	    }

	    equals(matrix) {
	        let te = this.elements;
	        let me = matrix.elements;

	        for (let i = 0; i < 9; i++) {
	            if (te[i] !== me[i]) return false;
	        }

	        return true;
	    }

	    fromArray(array, offset) {
	        if (offset === undefined) offset = 0;

	        for (let i = 0; i < 9; i++) {
	            this.elements[i] = array[i + offset];
	        }

	        return this;
	    }

	    toArray(array, offset) {
	        if (array === undefined) array = [];
	        if (offset === undefined) offset = 0;

	        let te = this.elements;

	        array[offset] = te[0];
	        array[offset + 1] = te[1];
	        array[offset + 2] = te[2];

	        array[offset + 3] = te[3];
	        array[offset + 4] = te[4];
	        array[offset + 5] = te[5];

	        array[offset + 6] = te[6];
	        array[offset + 7] = te[7];
	        array[offset + 8] = te[8];

	        return array;
	    }
	}

	Object.defineProperty(Matrix3.prototype, 'isMatrix3', {value: true});

	/**
	 * 四元数
	 */
	class Quaternion {
	    constructor(x = 0, y = 0, z = 0, w = 1) {
	        this._x = x;
	        this._y = y;
	        this._z = z;
	        this._w = w;
	    }

	    set(x, y, z, w) {
	        this._x = x;
	        this._y = y;
	        this._z = z;
	        this._w = w;

	        this.onChangeCallback();

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

	        this.onChangeCallback();

	        return this;
	    }

	    /**
	     * 从欧拉角设置Quaternion
	     * @param euler
	     * @param update {Boolean} 是否调用onChangeCallback()方法
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

	    // 四元素乘法
	    multiply(q) {
	        return this.multiplyQuaternions(this, q);
	    }

	    premultiply(q) {
	        return this.multiplyQuaternions(q, this);
	    }

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

	    // 线性插值
	    slerp(qb, t) {
	        if (t === 0) return this;
	        if (t === 1) return this.copy(qb);

	        let x = this._x, y = this._y, z = this._z, w = this._w;

	        // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

	        let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

	        if (cosHalfTheta < 0) {
	            this._w = -qb._w;
	            this._x = -qb._x;
	            this._y = -qb._y;
	            this._z = -qb._z;

	            cosHalfTheta = -cosHalfTheta;
	        }
	        else {
	            this.copy(qb);
	        }

	        if (cosHalfTheta >= 1.0) {
	            this._w = w;
	            this._x = x;
	            this._y = y;
	            this._z = z;

	            return this;
	        }

	        let sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

	        if (sqrSinHalfTheta <= Number.EPSILON) {
	            let s = 1 - t;
	            this._w = s * w + t * this._w;
	            this._x = s * x + t * this._x;
	            this._y = s * y + t * this._y;
	            this._z = s * z + t * this._z;

	            return this.normalize();
	        }

	        let sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
	        let halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
	        let ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
	            ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

	        this._w = (w * ratioA + this._w * ratioB);
	        this._x = (x * ratioA + this._x * ratioB);
	        this._y = (y * ratioA + this._y * ratioB);
	        this._z = (z * ratioA + this._z * ratioB);

	        this.onChangeCallback();

	        return this;
	    }

	    equals(quaternion) {
	        return (quaternion._x === this._x) && (quaternion._y === this._y) && (quaternion._z === this._z) && (quaternion._w === this._w);
	    }

	    fromArray(array, offset) {
	        if (offset === undefined) offset = 0;

	        this._x = array[offset];
	        this._y = array[offset + 1];
	        this._z = array[offset + 2];
	        this._w = array[offset + 3];

	        this.onChangeCallback();

	        return this;
	    }

	    toArray(array, offset) {
	        if (array === undefined) array = [];
	        if (offset === undefined) offset = 0;

	        array[offset] = this._x;
	        array[offset + 1] = this._y;
	        array[offset + 2] = this._z;
	        array[offset + 3] = this._w;

	        return array;
	    }

	    onChange(callback) {
	        this.onChangeCallback = callback;

	        return this;
	    }

	    onChangeCallback() {
	    }
	}

	Object.defineProperty(Quaternion.prototype, 'isQuaternion', {value: true});

	// 定义内部属性。对xyzw值的改变会自动触发 onChangeCallback() 方法
	Object.defineProperties(Quaternion.prototype, {
	    x: {
	        get: function () {
	            return this._x;
	        },

	        set: function (value) {
	            this._x = value;
	            this.onChangeCallback();
	        }
	    },
	    y: {
	        get: function () {
	            return this._y;
	        },

	        set: function (value) {
	            this._y = value;
	            this.onChangeCallback();
	        }
	    },
	    z: {
	        get: function () {
	            return this._z;
	        },

	        set: function (value) {
	            this._z = value;
	            this.onChangeCallback();
	        }
	    },
	    w: {
	        get: function () {
	            return this._w;
	        },

	        set: function (value) {
	            this._w = value;
	            this.onChangeCallback();
	        }
	    },
	});

	let matrix$1 = new Matrix4();

	/**
	 * 欧拉角
	 */
	class Euler {
	    constructor(x = 0, y = 0, z = 0, order = Euler.DefaultOrder) {
	        this._x = x;
	        this._y = y;
	        this._z = z;
	        this._order = order;
	    }

	    set(x, y, z, order) {
	        this._x = x;
	        this._y = y;
	        this._z = z;
	        this._order = order || this._order;

	        this.onChangeCallback();

	        return this;
	    }

	    clone() {
	        return new this.constructor(this._x, this._y, this._z, this._order);
	    }

	    copy(euler) {
	        this._x = euler._x;
	        this._y = euler._y;
	        this._z = euler._z;
	        this._order = euler._order;

	        this.onChangeCallback();

	        return this;
	    }

	    /**
	     * 通过Matrix4设置Euler
	     * @param m Matrix3
	     * @param order 旋转顺序
	     * @param update 是否调用onChangeCallback()方法
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
	            }
	            else {
	                this._x = Math.atan2(m32, m22);
	                this._z = 0;
	            }
	        }
	        else if (order === 'YXZ') {
	            this._x = Math.asin(-clamp(m23, -1, 1));

	            if (Math.abs(m23) < 0.99999) {
	                this._y = Math.atan2(m13, m33);
	                this._z = Math.atan2(m21, m22);
	            }
	            else {
	                this._y = Math.atan2(-m31, m11);
	                this._z = 0;
	            }
	        }
	        else if (order === 'ZXY') {
	            this._x = Math.asin(clamp(m32, -1, 1));

	            if (Math.abs(m32) < 0.99999) {
	                this._y = Math.atan2(-m31, m33);
	                this._z = Math.atan2(-m12, m22);
	            }
	            else {
	                this._y = 0;
	                this._z = Math.atan2(m21, m11);
	            }

	        }
	        else if (order === 'ZYX') {
	            this._y = Math.asin(-clamp(m31, -1, 1));

	            if (Math.abs(m31) < 0.99999) {
	                this._x = Math.atan2(m32, m33);
	                this._z = Math.atan2(m21, m11);
	            }
	            else {
	                this._x = 0;
	                this._z = Math.atan2(-m12, m22);
	            }
	        }
	        else if (order === 'YZX') {
	            this._z = Math.asin(clamp(m21, -1, 1));

	            if (Math.abs(m21) < 0.99999) {
	                this._x = Math.atan2(-m23, m22);
	                this._y = Math.atan2(-m31, m11);
	            }
	            else {
	                this._x = 0;
	                this._y = Math.atan2(m13, m33);
	            }
	        }
	        else if (order === 'XZY') {
	            this._z = Math.asin(-clamp(m12, -1, 1));

	            if (Math.abs(m12) < 0.99999) {
	                this._x = Math.atan2(m32, m22);
	                this._y = Math.atan2(m13, m11);
	            }
	            else {
	                this._x = Math.atan2(-m23, m33);
	                this._y = 0;
	            }
	        }
	        else {
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
	        matrix$1.makeRotationFromQuaternion(q);
	        return this.setFromRotationMatrix(matrix$1, order, update);
	    }

	    equals(euler) {
	        return (euler._x === this._x) && (euler._y === this._y) && (euler._z === this._z) && (euler._order === this._order);
	    }

	    fromArray(array) {
	        this._x = array[0];
	        this._y = array[1];
	        this._z = array[2];
	        if (array[3] !== undefined) this._order = array[3];

	        this.onChangeCallback();

	        return this;
	    }

	    toArray(array, offset) {
	        if (array === undefined) array = [];
	        if (offset === undefined) offset = 0;

	        array[offset] = this._x;
	        array[offset + 1] = this._y;
	        array[offset + 2] = this._z;
	        array[offset + 3] = this._order;

	        return array;
	    }

	    onChange(callback) {
	        this.onChangeCallback = callback;

	        return this;
	    }

	    onChangeCallback() {
	    }
	}

	Object.defineProperty(Euler.prototype, 'isEuler', {value: true});

	// 定义内部属性。对xyz值的改变会自动触发 onChangeCallback() 方法
	Object.defineProperties(Euler.prototype, {
	    x: {
	        get() {
	            return this._x;
	        },

	        set(value) {
	            this._x = value;
	            this.onChangeCallback();
	        }
	    },

	    y: {
	        get() {
	            return this._y;
	        },

	        set(value) {
	            this._y = value;
	            this.onChangeCallback();
	        }
	    },

	    z: {
	        get() {
	            return this._z;
	        },

	        set(value) {
	            this._z = value;
	            this.onChangeCallback();
	        }
	    },

	    order: {
	        get() {
	            return this._order;
	        },

	        set(value) {
	            this._order = value;
	            this.onChangeCallback();
	        }
	    }
	});

	Euler.RotationOrders = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'];

	Euler.DefaultOrder = 'XYZ';

	/**
	 * 缓存属性
	 * 用来存储于bufferGeometry相关联的属性数据，例如顶点位置向量，面片索引，法向量，颜色值，UV坐标以及任何自定义 attribute
	 */
	class BufferAttribute {
	    constructor(array, itemSize, normalized = true) {
	        if (Array.isArray(array)) {
	            throw new TypeError('THREE.BufferAttribute: array should be a Typed Array.');
	        }

	        this.name='';   // 该 attribute 实例的别名

	        this.array = array; // 缓存数据
	        this.itemSize = itemSize; // 队列中与顶点相关的数据值的大小。举例，如果 attribute 存储的是三元组（例如顶点空间坐标、法向量或颜色值）则itemSize的值应该是3

	        this.count = array.length;
	        this.version = 0;   // 版本号，当 needsUpdate 被设置为 true 时，该值会自增
	    }

	    set needsUpdate(value) {
	        if (value === true) this.version++;
	    }

	    getX(index) {
	        return this.array[index * this.itemSize];
	    }

	    getY(index) {
	        return this.array[index * this.itemSize + 1];
	    }

	    getZ(index) {
	        return this.array[index * this.itemSize + 2];
	    }

	    getW(index) {
	        return this.array[index * this.itemSize + 3];
	    }

	    setXYZ(index, x, y, z) {
	        index *= this.itemSize;

	        this.array[index + 0] = x;
	        this.array[index + 1] = y;
	        this.array[index + 2] = z;

	        return this;
	    }

	    setXYZW(index, x, y, z, w) {
	        index *= this.itemSize;

	        this.array[index + 0] = x;
	        this.array[index + 1] = y;
	        this.array[index + 2] = z;
	        this.array[index + 3] = w;

	        return this;
	    }
	}

	Object.defineProperty(BufferAttribute.prototype, 'isBufferAttribute', {value: true});

	class Int8BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Int8Array(array), itemSize, normalized);
	    }
	}

	class Uint8BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Uint8Array(array), itemSize, normalized);
	    }
	}

	class Int16BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Int16Array(array), itemSize, normalized);
	    }
	}

	class Uint16BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Uint16Array(array), itemSize, normalized);
	    }
	}

	class Int32BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Int32Array(array), itemSize, normalized);
	    }
	}

	class Uint32BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Uint32Array(array), itemSize, normalized);
	    }
	}

	class Int64BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Int64Array(array), itemSize, normalized);
	    }
	}

	class Float32BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Float32Array(array), itemSize, normalized);
	    }
	}

	class Float64BufferAttribute extends BufferAttribute {
	    constructor(array, itemSize, normalized) {
	        super(new Float64Array(array), itemSize, normalized);
	    }
	}

	let object3DId = 0;
	// lookAt()的变量（声明全局变量，避免重复实例化）
	let m1 = new Matrix4(); // 一个旋转矩阵，从position执行target
	let position = new Vector3();
	let target = new Vector3();

	/**
	 * 三维物体，大部分对象的基类，提供了一系列的属性和方法来对三维空间中的物体进行操纵。
	 * （其它旋转平移缩放，应用其它矩阵的方法暂时未添加）
	 */
	class Object3D extends EventDispatcher {
	    constructor() {
	        super();

	        Object.defineProperty(this, 'id', {value: object3DId++});

	        this.uuid = _Math.generateUUID();

	        this.name = '';
	        this.type = 'Object3D';

	        this.parent = null;
	        this.children = [];

	        this.position = new Vector3();
	        this.rotation = new Euler();
	        this.quaternion = new Quaternion();
	        this.scale = new Vector3(1, 1, 1);

	        this.up = Object3D.DefaultUp.clone();

	        this.matrix = new Matrix4();        // 局部变换（相对于父级的变换）
	        this.matrixWorld = new Matrix4();   // 全局变换

	        // 当这个属性设置了之后，它将计算每一帧的位移、旋转（四元变换）和缩放矩阵，并重新计算matrixWorld属性。默认为true
	        this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;

	        // 当这个属性设置了之后，它将计算在那一帧中的matrixWorld，并将这个值重置为false。默认为false
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
	        // 本地坐标变换一定会更新世界坐标
	        this.matrixWorldNeedsUpdate = true;
	    }

	    // 更新物体及其子级的全局变换（render中调用）
	    updateMatrixWorld(force) {
	        // 更新局部坐标
	        if (this.matrixAutoUpdate){
	            this.updateMatrix();
	        }

	        // 更新世界坐标
	        if (this.matrixWorldNeedsUpdate || force) {
	            if (this.parent === null) {
	                // 父对象（一般是Scene）
	                this.matrixWorld.copy(this.matrix);
	            }
	            else {
	                // 子对象
	                this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
	            }
	            this.matrixWorldNeedsUpdate = false;

	            force = false;
	        }

	        // 必须更新子对象
	        let children = this.children;
	        for (let i = 0, l = children.length; i < l; i++) {
	            children[i].updateMatrixWorld(force);
	        }
	    }

	    // 添加子对象
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

	    // 移除子对象
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

	        // 获取quaternion
	        this.quaternion.setFromRotationMatrix(m1);
	    }

	    // 遍历对象
	    traverse(callback) {
	        callback(this);

	        let children = this.children;

	        for (let i = 0, l = children.length; i < l; i++) {
	            children[i].traverse(callback);
	        }
	    }

	    // 遍历可见对象
	    traverseVisible(callback) {
	        if (this.visible === false) return;

	        callback(this);

	        let children = this.children;

	        for (let i = 0, l = children.length; i < l; i++) {
	            children[i].traverseVisible(callback);
	        }
	    }

	    /**
	     * 返回一个表示该物体在世界空间中位置的矢量
	     * @param target 结果将被复制到这个Vector3中
	     * @returns {*} target
	     */
	    getWorldPosition(target) {
	        if (target === undefined) {
	            target = new Vector3();
	        }

	        this.updateMatrixWorld(true);

	        return target.setFromMatrixPosition(this.matrixWorld);
	    }

	    clone(recursive) {
	        return new this.constructor().copy(this, recursive);
	    }

	    copy(source, recursive) {
	        if (recursive === undefined) recursive = true;

	        this.name = source.name;

	        this.up.copy(source.up);

	        this.position.copy(source.position);
	        this.quaternion.copy(source.quaternion);
	        this.scale.copy(source.scale);

	        this.matrix.copy(source.matrix);
	        this.matrixWorld.copy(source.matrixWorld);

	        this.matrixAutoUpdate = source.matrixAutoUpdate;
	        this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

	        this.visible = source.visible;
	        this.renderOrder = source.renderOrder;

	        this.userData = JSON.parse(JSON.stringify(source.userData));

	        if (recursive === true) {
	            for (let i = 0; i < source.children.length; i++) {
	                let child = source.children[i];
	                this.add(child.clone());
	            }
	        }

	        return this;
	    }
	}

	Object.defineProperty(Object3D.prototype, 'isObject3D', {value: true});

	Object3D.DefaultUp = new Vector3(0, 1, 0);
	Object3D.DefaultMatrixAutoUpdate = true;

	const ColorKeywords = {'aliceblue':0xF0F8FF,'antiquewhite':0xFAEBD7,'aqua':0x00FFFF,'aquamarine':0x7FFFD4,'azure':0xF0FFFF,'beige':0xF5F5DC,'bisque':0xFFE4C4,'black':0x000000,'blanchedalmond':0xFFEBCD,'blue':0x0000FF,'blueviolet':0x8A2BE2,'brown':0xA52A2A,'burlywood':0xDEB887,'cadetblue':0x5F9EA0,'chartreuse':0x7FFF00,'chocolate':0xD2691E,'coral':0xFF7F50,'cornflowerblue':0x6495ED,'cornsilk':0xFFF8DC,'crimson':0xDC143C,'cyan':0x00FFFF,'darkblue':0x00008B,'darkcyan':0x008B8B,'darkgoldenrod':0xB8860B,'darkgray':0xA9A9A9,'darkgreen':0x006400,'darkgrey':0xA9A9A9,'darkkhaki':0xBDB76B,'darkmagenta':0x8B008B,'darkolivegreen':0x556B2F,'darkorange':0xFF8C00,'darkorchid':0x9932CC,'darkred':0x8B0000,'darksalmon':0xE9967A,'darkseagreen':0x8FBC8F,'darkslateblue':0x483D8B,'darkslategray':0x2F4F4F,'darkslategrey':0x2F4F4F,'darkturquoise':0x00CED1,'darkviolet':0x9400D3,'deeppink':0xFF1493,'deepskyblue':0x00BFFF,'dimgray':0x696969,'dimgrey':0x696969,'dodgerblue':0x1E90FF,'firebrick':0xB22222,'floralwhite':0xFFFAF0,'forestgreen':0x228B22,'fuchsia':0xFF00FF,'gainsboro':0xDCDCDC,'ghostwhite':0xF8F8FF,'gold':0xFFD700,'goldenrod':0xDAA520,'gray':0x808080,'green':0x008000,'greenyellow':0xADFF2F,'grey':0x808080,'honeydew':0xF0FFF0,'hotpink':0xFF69B4,'indianred':0xCD5C5C,'indigo':0x4B0082,'ivory':0xFFFFF0,'khaki':0xF0E68C,'lavender':0xE6E6FA,'lavenderblush':0xFFF0F5,'lawngreen':0x7CFC00,'lemonchiffon':0xFFFACD,'lightblue':0xADD8E6,'lightcoral':0xF08080,'lightcyan':0xE0FFFF,'lightgoldenrodyellow':0xFAFAD2,'lightgray':0xD3D3D3,'lightgreen':0x90EE90,'lightgrey':0xD3D3D3,'lightpink':0xFFB6C1,'lightsalmon':0xFFA07A,'lightseagreen':0x20B2AA,'lightskyblue':0x87CEFA,'lightslategray':0x778899,'lightslategrey':0x778899,'lightsteelblue':0xB0C4DE,'lightyellow':0xFFFFE0,'lime':0x00FF00,'limegreen':0x32CD32,'linen':0xFAF0E6,'magenta':0xFF00FF,'maroon':0x800000,'mediumaquamarine':0x66CDAA,'mediumblue':0x0000CD,'mediumorchid':0xBA55D3,'mediumpurple':0x9370DB,'mediumseagreen':0x3CB371,'mediumslateblue':0x7B68EE,'mediumspringgreen':0x00FA9A,'mediumturquoise':0x48D1CC,'mediumvioletred':0xC71585,'midnightblue':0x191970,'mintcream':0xF5FFFA,'mistyrose':0xFFE4E1,'moccasin':0xFFE4B5,'navajowhite':0xFFDEAD,'navy':0x000080,'oldlace':0xFDF5E6,'olive':0x808000,'olivedrab':0x6B8E23,'orange':0xFFA500,'orangered':0xFF4500,'orchid':0xDA70D6,'palegoldenrod':0xEEE8AA,'palegreen':0x98FB98,'paleturquoise':0xAFEEEE,'palevioletred':0xDB7093,'papayawhip':0xFFEFD5,'peachpuff':0xFFDAB9,'peru':0xCD853F,'pink':0xFFC0CB,'plum':0xDDA0DD,'powderblue':0xB0E0E6,'purple':0x800080,'rebeccapurple':0x663399,'red':0xFF0000,'rosybrown':0xBC8F8F,'royalblue':0x4169E1,'saddlebrown':0x8B4513,'salmon':0xFA8072,'sandybrown':0xF4A460,'seagreen':0x2E8B57,'seashell':0xFFF5EE,'sienna':0xA0522D,'silver':0xC0C0C0,'skyblue':0x87CEEB,'slateblue':0x6A5ACD,'slategray':0x708090,'slategrey':0x708090,'snow':0xFFFAFA,'springgreen':0x00FF7F,'steelblue':0x4682B4,'tan':0xD2B48C,'teal':0x008080,'thistle':0xD8BFD8,'tomato':0xFF6347,'turquoise':0x40E0D0,'violet':0xEE82EE,'wheat':0xF5DEB3,'white':0xFFFFFF,'whitesmoke':0xF5F5F5,'yellow':0xFFFF00,'yellowgreen':0x9ACD32};

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

	    // 设置16进制颜色值
	    setHex(hex) {
	        hex = Math.floor(hex);

	        this.r = (hex >> 16 & 255) / 255;   // 将左边两位16进制数值变换成rgb颜色值对应的red
	        this.g = (hex >> 8 & 255) / 255;    // 将中间两位16进制数值变换成rgb颜色值对应的green，并赋值给属性Color.g
	        this.b = (hex & 255) / 255;         // 将右边两位16进制数值变换成rgb颜色值对应的blue，并赋值给属性Color.b

	        return this;
	    }

	    // 设置rgb颜色值
	    setRGB(r, g, b) {
	        this.r = r;
	        this.g = g;
	        this.b = b;

	        return this;
	    }

	    /**
	     * HSL和HSV颜色是一种将RGB色彩模型中的点在圆柱坐标系中的表示法。
	     * @param h 色相（H）是色彩的基本属性，就是平常所说的颜色名称，如红色、绿色、蓝色等将360度的一个圆环平分成3分，0(360),120,240，取值范围是0-360，本库将区间设置为0.0-1.0
	     * @param s 饱和度（S）是指色彩的纯度，越高色彩越纯，低则逐渐变灰，取0-100%的数值，输入时为0.0-1.0
	     * @param l 度（V），亮度（L），取0-100%，输入时为0.0-1.0
	     * @returns {Color}
	     */
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

	    /**
	     * rgb(255,0,0) 数值型
	     * rgb(100%,0%,0%)  百分比型
	     * #ff0000  6位16进制型
	     * #f00     3位16进制型
	     * red      颜色名
	     */
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
	        return 'rgb(' + ((this.r * 255) | 0) + ',' + ((this.g * 255) | 0) + ',' + ((this.b * 255) | 0) + ')';
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

	    fromArray(array, offset) {
	        if (offset === undefined) offset = 0;

	        this.r = array[offset];
	        this.g = array[offset + 1];
	        this.b = array[offset + 2];

	        return this;
	    }

	    toArray(array, offset) {
	        if (array === undefined) array = [];
	        if (offset === undefined) offset = 0;

	        array[offset] = this.r;
	        array[offset + 1] = this.g;
	        array[offset + 2] = this.b;

	        return array;
	    }

	    toJSON() {
	        return this.getHex();
	    }

	    // 处理透明度
	    _handleAlpha(style) {
	        console.warn('THREE.Color: Alpha component of ' + style + ' will be ignored.');
	    }

	    // 将hsl颜色转换成rgb颜色值,根据第三个参数计算rgb的值
	    _hue2rgb(p, q, t) {
	        if (t < 0) t += 1;
	        if (t > 1) t -= 1;
	        if (t < 1 / 6) return p + (q - p) * 6 * t;
	        if (t < 1 / 2) return q;
	        if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
	        return p;
	    }
	}

	Object.defineProperty(Color.prototype, 'isColor', {value: true});

	/**
	 * 二维向量
	 * （部分没有意义且未使用的方法注释了）
	 */
	class Vector2 {
	    constructor(x = 0, y = 0) {
	        this.x = x;
	        this.y = y;
	    }

	    set(x, y) {
	        this.x = x;
	        this.y = y;

	        return this;
	    }

	    setX(x) {
	        this.x = x;
	        return this;
	    }

	    setY(y) {
	        this.y = y;
	        return this;
	    }

	    clone() {
	        return new this.constructor(this.x, this.y);
	    }

	    copy(v) {
	        this.x = v.x;
	        this.y = v.y;

	        return this;
	    }

	    // 向量加法：AB+BC=AC
	    add(v) {
	        this.x += v.x;
	        this.y += v.y;
	        return this;
	    }

	    addVectors(a, b) {
	        this.x = a.x + b.x;
	        this.y = a.y + b.y;
	        return this;
	    }

	    // 与标量s相加（没有几何意义，只用到Box2扩展边界）
	    addScalar(s) {
	        this.x += s;
	        this.y += s;
	        return this;
	    }

	    // 向量减法
	    sub(v) {
	        this.x -= v.x;
	        this.y -= v.y;
	        return this;
	    }

	    subVectors(a, b) {
	        this.x = a.x - b.x;
	        this.y = a.y - b.y;
	        return this;
	    }

	    // 与标量s相减（没有几何意义）
	    // subScalar(s) {
	    //     this.x -= s;
	    //     this.y -= s;
	    //     return this;
	    // }

	    // 向量乘法（没有几何意义）
	    // multiply(v) {
	    //     this.x *= v.x;
	    //     this.y *= v.y;
	    //     return this;
	    // }

	    // 乘以标量（放大向量）
	    multiplyScalar(scalar) {
	        this.x *= scalar;
	        this.y *= scalar;
	        return this;
	    }

	    // 向量除法（没有几何意义）
	    // divide(v) {
	    //     this.x /= v.x;
	    //     this.y /= v.y;
	    //     return this;
	    // }

	    // 除以标量（缩小向量）
	    divideScalar(scalar) {
	        return this.multiplyScalar(1 / scalar);
	    }

	    // 标准化向量，长度为1
	    normalize() {
	        return this.divideScalar(this.length() || 1);
	    }

	    // 反转向量
	    negate() {
	        this.x = -this.x;
	        this.y = -this.y;

	        return this;
	    }

	    // 点乘
	    dot(v) {
	        return this.x * v.x + this.y * v.y;
	    }

	    // 叉乘
	    cross(v) {
	        return this.x * v.y - this.y * v.x;
	    }

	    // 向量的模（长度）
	    length() {
	        return Math.sqrt(this.x * this.x + this.y * this.y);
	    }

	    lengthSq() {
	        return this.x * this.x + this.y * this.y;
	    }

	    // 到向量v的距离
	    distanceTo(v) {
	        return Math.sqrt(this.distanceToSquared(v));
	    }

	    distanceToSquared(v) {
	        let dx = this.x - v.x, dy = this.y - v.y;
	        return dx * dx + dy * dy;
	    }

	    /**
	     * 与向量v的线性插值
	     * @param v
	     * @param alpha 百分比权值(0.0-1.0)
	     * @returns {Vector2}
	     */
	    lerp(v, alpha) {
	        this.x += (v.x - this.x) * alpha;
	        this.y += (v.y - this.y) * alpha;

	        return this;
	    }

	    lerpVectors(v1, v2, alpha) {
	        return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
	    }

	    // 将该向量乘以三阶矩阵m
	    applyMatrix3(m) {
	        let x = this.x, y = this.y;
	        let e = m.elements;

	        this.x = e[0] * x + e[3] * y + e[6];
	        this.y = e[1] * x + e[4] * y + e[7];

	        return this;
	    }

	    // 与向量v比较返回(x,y)值最小的二维向量
	    min(v) {
	        this.x = Math.min(this.x, v.x);
	        this.y = Math.min(this.y, v.y);

	        return this;
	    }

	    // 与向量v比较返回(x,y)值最大的二维向量
	    max(v) {
	        this.x = Math.max(this.x, v.x);
	        this.y = Math.max(this.y, v.y);

	        return this;
	    }

	    equals(v) {
	        return ((v.x === this.x) && (v.y === this.y));
	    }

	    fromArray(array, offset) {
	        if (offset === undefined) offset = 0;

	        this.x = array[offset];
	        this.y = array[offset + 1];

	        return this;
	    }

	    toArray(array, offset) {
	        if (array === undefined) array = [];
	        if (offset === undefined) offset = 0;

	        array[offset] = this.x;
	        array[offset + 1] = this.y;

	        return array;
	    }

	    fromBufferAttribute(attribute, index) {
	        this.x = attribute.getX(index);
	        this.y = attribute.getY(index);

	        return this;
	    }
	}

	Object.defineProperty(Vector2.prototype, 'isVector2', {value: true});

	/**
	 * 四维向量
	 */
	class Vector4 {
	    constructor(x = 0, y = 0, z = 0, w = 1) {
	        this.x = x;
	        this.y = y;
	        this.z = z;
	        this.w = w;
	    }

	    set(x, y, z, w) {
	        this.x = x;
	        this.y = y;
	        this.z = z;
	        this.w = w;

	        return this;
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

	    // 将当前向量乘以一个4x4的矩阵（= 当前位置 + 矩阵变换位置）
	    applyMatrix4(m) {
	        let x = this.x, y = this.y, z = this.z, w = this.w;
	        let e = m.elements;

	        this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
	        this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
	        this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
	        this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;

	        return this;
	    }

	    // 线性插值
	    lerp(v, alpha) {
	        this.x += (v.x - this.x) * alpha;
	        this.y += (v.y - this.y) * alpha;
	        this.z += (v.z - this.z) * alpha;
	        this.w += (v.w - this.w) * alpha;

	        return this;
	    }

	    equals(v) {
	        return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z) && (v.w === this.w));
	    }

	    fromArray(array, offset) {
	        if (offset === undefined) offset = 0;

	        this.x = array[offset];
	        this.y = array[offset + 1];
	        this.z = array[offset + 2];
	        this.w = array[offset + 3];

	        return this;
	    }

	    toArray(array, offset) {
	        if (array === undefined) array = [];
	        if (offset === undefined) offset = 0;

	        array[offset] = this.x;
	        array[offset + 1] = this.y;
	        array[offset + 2] = this.z;
	        array[offset + 3] = this.w;

	        return array;
	    }

	    fromBufferAttribute(attribute, index) {
	        this.x = attribute.getX(index);
	        this.y = attribute.getY(index);
	        this.z = attribute.getZ(index);
	        this.w = attribute.getW(index);

	        return this;
	    }
	}

	Object.defineProperty(Vector4.prototype, 'isVector4', {value: true});

	/**
	 * 用来在三维空间内创建一个立方体边界对象
	 */
	class Box3 {
	    constructor(min = new Vector3(+Infinity, +Infinity, +Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity)) {
	        this.min = min;
	        this.max = max;
	    }

	    set(min, max) {
	        this.min.copy(min);
	        this.max.copy(max);

	        return this;
	    }

	    setFromBufferAttribute(attribute) {
	        let minX = +Infinity;
	        let minY = +Infinity;
	        let minZ = +Infinity;

	        let maxX = -Infinity;
	        let maxY = -Infinity;
	        let maxZ = -Infinity;

	        for (let i = 0, l = attribute.count; i < l; i++) {

	            let x = attribute.getX(i);
	            let y = attribute.getY(i);
	            let z = attribute.getZ(i);

	            if (x < minX) minX = x;
	            if (y < minY) minY = y;
	            if (z < minZ) minZ = z;

	            if (x > maxX) maxX = x;
	            if (y > maxY) maxY = y;
	            if (z > maxZ) maxZ = z;

	        }

	        this.min.set(minX, minY, minZ);
	        this.max.set(maxX, maxY, maxZ);

	        return this;
	    }

	    /**
	     * 设置这个盒子的上下边界，来包含所有设置在points参数中的点
	     * @param points 点的集合，由这些点确定的空间将被盒子包围
	     * @returns {Box3}
	     */
	    setFromPoints(points) {
	        this.makeEmpty();
	        for (let i = 0, il = points.length; i < il; i++) {
	            this.expandByPoint(points[i]);
	        }

	        return this;
	    }

	    clone() {
	        return new this.constructor().copy(this);
	    }

	    copy(box) {
	        this.min.copy(box.min);
	        this.max.copy(box.max);

	        return this;
	    }

	    makeEmpty() {
	        this.min.x = this.min.y = this.min.z = +Infinity;
	        this.max.x = this.max.y = this.max.z = -Infinity;

	        return this;
	    }

	    isEmpty() {
	        // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
	        return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
	    }

	    // 扩展盒子的边界来包含该点
	    expandByPoint(point) {
	        this.min.min(point);
	        this.max.max(point);

	        return this;
	    }

	    // 按 scalar 的值展开盒子的每个维度。如果是负数，盒子的尺寸会缩小。
	    expandByScalar(scalar) {
	        this.min.addScalar(-scalar);
	        this.max.addScalar(scalar);

	        return this;
	    }

	    // 判断点(point)是否位于盒子的边界内或边界上
	    containsPoint(point) {
	        return point.x < this.min.x || point.x > this.max.x ||
	        point.y < this.min.y || point.y > this.max.y ||
	        point.z < this.min.z || point.z > this.max.z ? false : true;
	    }

	    // 判断与盒子box是否相交
	    intersectsBox(box) {
	        // using 6 splitting planes to rule out intersections.
	        return box.max.x < this.min.x || box.min.x > this.max.x ||
	        box.max.y < this.min.y || box.min.y > this.max.y ||
	        box.max.z < this.min.z || box.min.z > this.max.z ? false : true;
	    }

	    // （交集）返回两者的相交后的盒子，并将相交后的盒子的上限设置为两者的上限中的较小者，将下限设置为两者的下限中的较大者
	    intersect(box) {
	        this.min.max(box.min);
	        this.max.min(box.max);

	        // ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersects to erroneously return valid values.
	        if (this.isEmpty()) this.makeEmpty();

	        return this;
	    }

	    // （并集）在box参数的上边界和该盒子的上边界之间取较大者，而对两者的下边界取较小者，这样获得一个新的较大的联合盒子
	    union(box) {
	        this.min.min(box.min);
	        this.max.max(box.max);

	        return this;
	    }
	}

	Object.defineProperty(Box3.prototype, 'isBox3', {value: true});

	/**
	 * 通过两个Vector2(二维向量)min,max创建一个二维矩形边界对象.
	 * 用法: let min = new Vector2(0,0),max = new Vector2(1,1); let box = new Box2(min,max);
	 */
	class Box2 {
	    // 初始化二维矩形的起始点
	    constructor(min = new Vector2(+Infinity, +Infinity), max = new Vector2(-Infinity, -Infinity)) {
	        this.min = min;
	        this.max = max;
	    }

	    clone() {
	        return new this.constructor().copy(this);
	    }

	    copy(box) {
	        this.min.copy(box.min);
	        this.max.copy(box.max);

	        return this;
	    }

	    set(min, max) {
	        this.min.copy(min);
	        this.max.copy(max);

	        return this;
	    }

	    /**
	     * 设置这个盒子的上下边界，来包含所有设置在points参数中的点
	     * @param points 点的集合，由这些点确定的空间将被盒子包围
	     * @returns {Box2}
	     */
	    setFromPoints(points) {
	        this.makeEmpty();

	        for (let i = 0, il = points.length; i < il; i++) {
	            this.expandByPoint(points[i]);
	        }

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

	    // 扩展盒子的边界来包含该点
	    expandByPoint(point) {
	        this.min.min(point);
	        this.max.max(point);

	        return this;
	    }

	    // 在每个维度上扩展参数scalar所指定的距离，如果为负数，则盒子空间将收缩
	    expandByScalar(scalar) {
	        this.min.addScalar(-scalar);
	        this.max.addScalar(scalar);

	        return this;
	    }

	    // 判断点(point)是否位于盒子的边界内或边界上
	    containsPoint ( point ) {
	        return point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y ? false : true;
	    }

	    // 判断与盒子box是否相交
	    intersectsBox(box) {
	        // using 4 splitting planes to rule out intersections
	        return box.max.x < this.min.x || box.min.x > this.max.x ||
	        box.max.y < this.min.y || box.min.y > this.max.y ? false : true;
	    }

	    // （交集）返回两者的相交后的盒子，并将相交后的盒子的上限设置为两者的上限中的较小者，将下限设置为两者的下限中的较大者
	    intersect(box) {
	        this.min.max(box.min);
	        this.max.min(box.max);

	        return this;
	    }

	    // （并集）在box参数的上边界和该盒子的上边界之间取较大者，而对两者的下边界取较小者，这样获得一个新的较大的联合盒子
	    union(box) {
	        this.min.min(box.min);
	        this.max.max(box.max);

	        return this;
	    }
	}

	Object.defineProperty(Box2.prototype, 'isBox2', {value: true});

	/**
	 * 相机基类
	 */
	class Camera extends Object3D {
	    constructor() {
	        super();
	        Object.defineProperty(this, 'isCamera', {value: true});

	        this.type = 'Camera';

	        this.matrixWorldInverse = new Matrix4();        // 世界矩阵逆矩阵

	        this.projectionMatrix = new Matrix4();          // 投影矩阵
	        this.projectionMatrixInverse = new Matrix4();   // 投影矩阵逆矩阵
	    }

	    // 更新对象（重写父类）
	    updateMatrixWorld(force) {
	        super.updateMatrixWorld(force);

	        // 更新相机逆矩阵
	        this.matrixWorldInverse.getInverse(this.matrixWorld);
	    }

	    copy(source, recursive) {
	        super.copy(source, recursive);

	        this.matrixWorldInverse.copy(source.matrixWorldInverse);

	        this.projectionMatrix.copy(source.projectionMatrix);
	        this.projectionMatrixInverse.copy(source.projectionMatrixInverse);

	        return this;
	    }

	    clone() {
	        return new this.constructor().copy(this);
	    }
	}

	/**
	 * 透视投影相机
	 */
	class PerspectiveCamera extends Camera {
	    constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
	        super();
	        Object.defineProperty(this, 'isPerspectiveCamera', {value: true});

	        this.type = 'PerspectiveCamera';

	        this.fov = fov;
	        this.zoom = 1;

	        this.near = near;
	        this.far = far;

	        this.aspect = aspect;   // 摄像机视锥体长宽比
	        this.view = null;       // 视图范围，通过setViewOffset()来设置（暂未使用）

	        this.updateProjectionMatrix();
	    }

	    // 更新相机投影矩阵（在任何参数被改变以后必须被调用）
	    updateProjectionMatrix() {
	        let near = this.near,
	            top = near * Math.tan(_Math.DEG2RAD * 0.5 * this.fov) / this.zoom,
	            height = 2 * top,
	            width = this.aspect * height,
	            left = -width / 2;

	        // 创建透视投影矩阵
	        this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far);
	        // 更新投影矩阵逆矩阵
	        this.projectionMatrixInverse.getInverse(this.projectionMatrix);
	    }

	    copy(source, recursive) {
	        super.copy(source, recursive);

	        this.fov = source.fov;
	        this.zoom = source.zoom;

	        this.near = source.near;
	        this.far = source.far;
	        this.focus = source.focus;

	        this.aspect = source.aspect;
	        this.view = source.view === null ? null : Object.assign({}, source.view);

	        this.filmGauge = source.filmGauge;
	        this.filmOffset = source.filmOffset;

	        return this;
	    }
	}

	/**
	 * 正交相机
	 */
	class OrthographicCamera extends Camera {
	    constructor(left, right, top, bottom, near = 0.1, far = 2000) {
	        super();
	        Object.defineProperty(this, 'isOrthographicCamera', {value: true});

	        this.type = 'OrthographicCamera';

	        this.zoom = 1;
	        this.view = null;   // 视图范围（暂未使用）

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

	        this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);
	        this.projectionMatrixInverse.getInverse(this.projectionMatrix);
	    }

	    copy(source, recursive) {
	        super.copy(source, recursive);

	        this.left = source.left;
	        this.right = source.right;
	        this.top = source.top;
	        this.bottom = source.bottom;
	        this.near = source.near;
	        this.far = source.far;

	        this.zoom = source.zoom;
	        this.view = source.view === null ? null : Object.assign({}, source.view);

	        return this;
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

	class Texture extends EventDispatcher {
	    constructor(image = undefined) {
	        super();
	        this.id = textureId++;
	        // this.uuid = _Math.generateUUID();
	        this.image = image;
	        this.mapping = UVMapping;   // 纹理映射

	        this.offset = new Vector2(0, 0);
	        this.repeat = new Vector2(1, 1);
	        this.center = new Vector2(0, 0);
	        this.rotation = 0;

	        this.matrixAutoUpdate = true;
	        // this.matrix = new Matrix3();

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
	        this.vertexColors = NoColors; // THREE.NoColors=1, THREE.VertexColors=2, THREE.FaceColors=3

	        this.blending = NormalBlending;
	        this.side = FrontSide;
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

	        this.map = null;    // 颜色贴图

	        this.wireframe = false; // 渲染为线框
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
	        this.color = new Color(0xffffff);
	        this.program = function () {};

	        this.setValues(parameters);
	    }
	}

	class LineBasicMaterial extends Material {
	    constructor(parameters) {
	        super();
	        this.isLineBasicMaterial = true;
	        this.type = 'LineBasicMaterial';

	        this.color = new Color(0xffffff);

	        this.linewidth = 1;
	        this.linecap = 'round';
	        this.linejoin = 'round';

	        this.setValues(parameters);
	    }
	}

	/**
	 * 三角面片
	 */
	class Face3 {
	    constructor(a, b, c, normal, vertexColors = [], color, materialIndex = 0) {
	        this.a = a; // 顶点 A 的索引
	        this.b = b; // 顶点 B 的索引
	        this.c = c; // 顶点 C 的索引

	        // (可选) 面的法向量 (Vector3) 或顶点法向量队列。
	        // 如果参数传入单一矢量，则用该量设置面的法向量 .normal，如果传入的是包含三个矢量的队列， 则用该量设置 .vertexNormals
	        this.normal = (normal && normal.isVector3) ? normal : new Vector3();
	        this.vertexNormals = Array.isArray(normal) ? normal : []; // 三角面顶点法线向量数组

	        // (可选) 面的颜色值 color 或顶点颜色值的队列。
	        // 如果参数传入单一矢量，则用该量设置 .color，如果传入的是包含三个矢量的队列， 则用该量设置 .vertexColors
	        this.color = (color && color.isColor) ? color : new Color();
	        this.vertexColors = Array.isArray(color) ? color : [];

	        // (可选) 材质队列中与该面对应的材质的索引
	        this.materialIndex = materialIndex;
	    }

	    clone() {
	        return new this.constructor().copy(this);
	    }

	    copy(source) {
	        this.a = source.a;
	        this.b = source.b;
	        this.c = source.c;

	        this.normal.copy(source.normal);
	        this.color.copy(source.color);

	        this.materialIndex = source.materialIndex;

	        for (let i = 0, il = source.vertexNormals.length; i < il; i++) {
	            this.vertexNormals[i] = source.vertexNormals[i].clone();
	        }

	        for (let i = 0, il = source.vertexColors.length; i < il; i++) {
	            this.vertexColors[i] = source.vertexColors[i].clone();
	        }

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

	function arrayMax(array) {
	    if (array.length === 0) return -Infinity;
	    let max = array[0];
	    for (let i = 1, l = array.length; i < l; ++i) {
	        if (array[i] > max) max = array[i];
	    }
	    return max;
	}

	/**
	 * 缓存几何体
	 * BufferGeometry类用来和BufferAttribute配合使用，将所有的数据包括顶点位置,法线,面,颜色,uv和其它的自定义属性存在缓冲区
	 * 需要访问这些属性,需要从属性缓冲区中读原始数据。
	 * （部分方法暂未使用，先删除掉）
	 */
	let bufferGeometryId = 1; // BufferGeometry uses odd numbers as Id
	class BufferGeometry {
	    constructor() {
	        Object.defineProperty(this, 'id', {value: bufferGeometryId += 2});

	        this.uuid = _Math.generateUUID();

	        this.name = '';
	        this.type = 'BufferGeometry';

	        this.index = null;      // 三角面索引
	        this.attributes = {};   // 通过 hashmap 存储该几何体相关的属性，通常有 position,normal,uv

	        // 将当前几何体分割成组进行渲染，每个部分都会在单独的 WebGL 的 draw call 中进行绘制。
	        // 该方法可以让当前的 bufferGeometry 可以使用一个材质队列进行描述
	        this.groups = [];
	    }

	    getIndex() {
	        return this.index;
	    }

	    // 设置顶点索引
	    setIndex(index) {
	        if (Array.isArray(index)) {
	            this.index = new (arrayMax(index) > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute)(index, 1);
	        } else {
	            this.index = index;
	        }
	    }

	    // 给BufferGeometry对象添加属性信息
	    addAttribute(name, attribute) {
	        this.attributes[name] = attribute;
	        return this;
	    }

	    // 获取BufferGeometry对象属性信息
	    getAttribute(name) {
	        return this.attributes[name];
	    }

	    // 移除BufferGeometry对象属性信息
	    removeAttribute(name) {
	        delete this.attributes[name];
	        return this;
	    }

	    // 为当前几何体增加一个 group
	    addGroup(start, count, materialIndex) {
	        this.groups.push({
	            start: start,
	            count: count,
	            materialIndex: materialIndex !== undefined ? materialIndex : 0
	        });
	    }

	    // 清除组
	    clearGroups() {
	        this.groups = [];
	    }

	    // 用给定矩阵转换几何体的顶点坐标
	    applyMatrix(matrix) {
	        let position = this.attributes.position;
	        if (position !== undefined) {
	            matrix.applyToBufferAttribute(position);
	            position.needsUpdate = true;
	        }

	        let normal = this.attributes.normal;
	        if (normal !== undefined) {
	            let normalMatrix = new Matrix3().getNormalMatrix(matrix);
	            normalMatrix.applyToBufferAttribute(normal);
	            normal.needsUpdate = true;
	        }

	        return this;
	    }
	}

	Object.defineProperty(BufferGeometry.prototype, 'isBufferGeometry', {value: true});

	// 使用闭包声明变量不污染全局
	Object.assign(BufferGeometry.prototype, {
	    rotateX: function () {
	        let m1 = new Matrix4();
	        return function rotateX(angle) {
	            m1.makeRotationX(angle);
	            this.applyMatrix(m1);
	            return this;
	        };
	    }(),

	    rotateY: function () {
	        let m1 = new Matrix4();
	        return function rotateY(angle) {
	            m1.makeRotationY(angle);
	            this.applyMatrix(m1);
	            return this;
	        };
	    }(),

	    rotateZ: function () {
	        let m1 = new Matrix4();
	        return function rotateZ(angle) {
	            m1.makeRotationZ(angle);
	            this.applyMatrix(m1);
	            return this;
	        };
	    }(),

	    translate: function () {
	        let m1 = new Matrix4();
	        return function translate(x, y, z) {
	            m1.makeTranslation(x, y, z);
	            this.applyMatrix(m1);
	            return this;
	        };
	    }(),

	    scale: function () {
	        let m1 = new Matrix4();
	        return function scale(x, y, z) {
	            m1.makeScale(x, y, z);
	            this.applyMatrix(m1);
	            return this;
	        };
	    }(),

	    lookAt: function () {
	        let obj = new Object3D();
	        return function lookAt(vector) {
	            obj.lookAt(vector);
	            obj.updateMatrix();
	            this.applyMatrix(obj.matrix);
	        };
	    }(),
	});

	class Line extends Object3D {
	    constructor(geometry = new BufferGeometry(), material = new LineBasicMaterial({color: 0x000000})) {
	        super();
	        this.isLine = true;
	        this.type = 'Line';
	        this.geometry = geometry;
	        this.material = material;
	    }

	    clone() {
	        return new this.constructor(this.geometry, this.material).copy(this);
	    }
	}

	/**
	 * 几何体对象。由顶点和三角面构成的几何体对象的基类，保存描述几何体所有必要的数据
	 * Geometry 是对 BufferGeometry 的用户友好替代。
	 * Geometry 利用 Vector3 或 Color 存储了几何体的相关 attributes（如顶点位置，面信息，颜色等）比起 BufferGeometry 更容易读写，但是运行效率不如有类型的队列。
	 * 对于大型工程或正式工程，推荐采用 BufferGeometry，Geometry后期可能会被弃用
	 * （部分方法暂未使用，先删除掉）
	 */
	let geometryId = 0;// Geometry uses even numbers as Id
	class Geometry {
	    constructor() {
	        Object.defineProperty(this, 'id', {value: geometryId += 2});

	        this.uuid = _Math.generateUUID();

	        this.name = '';
	        this.type = 'Geometry';

	        this.vertices = []; // 顶点
	        this.colors = [];   // 顶点 colors 队列
	        this.faces = [];    // 面
	        this.faceVertexUvs = [[]];  // 面的 UV 层的队列。每个 UV 层都是一个 UV 的队列，顺序和数量同面中的顶点相对
	    }

	    // 将一个 BufferGeometry 对象，转换成一个 Geometry 对象
	    // Geometry需要需要开辟大量的不连续数组空间（new Vecotr()），所以性能较低
	    fromBufferGeometry(geometry) {
	        let scope = this;

	        // 空BufferGeometry的时候index为null
	        let indices = geometry.index !== null ? geometry.index.array : undefined;
	        let attributes = geometry.attributes;

	        let positions = attributes.position.array;
	        let normals = attributes.normal !== undefined ? attributes.normal.array : undefined;
	        let colors = attributes.color !== undefined ? attributes.color.array : undefined;
	        let uvs = attributes.uv !== undefined ? attributes.uv.array : undefined;

	        for (let i = 0, j = 0; i < positions.length; i += 3, j += 2) {
	            scope.vertices.push(new Vector3().fromArray(positions, i));

	            if (colors !== undefined) {
	                scope.colors.push(new Color().fromArray(colors, i));
	            }
	        }

	        // 实例化Face3添加到faces
	        function addFace(a, b, c, materialIndex) {
	            // 顶点法向量队列
	            let vertexNormals = (normals === undefined) ? [] : [
	                new Vector3().fromArray(normals, a * 3),
	                new Vector3().fromArray(normals, b * 3),
	                new Vector3().fromArray(normals, c * 3)
	            ];

	            // 顶点颜色值队列
	            let vertexColors = (colors === undefined) ? [] : [
	                scope.colors[a].clone(),
	                scope.colors[b].clone(),
	                scope.colors[c].clone()
	            ];

	            let face = new Face3(a, b, c, vertexNormals, vertexColors, materialIndex);

	            // 面
	            scope.faces.push(face);

	            // UV层队列
	            if (uvs !== undefined) {
	                scope.faceVertexUvs[0].push([
	                    new Vector2().fromArray(uvs, a * 2),
	                    new Vector2().fromArray(uvs, b * 2),
	                    new Vector2().fromArray(uvs, c * 2)
	                ]);
	            }
	        }

	        let groups = geometry.groups;

	        if (groups.length > 0) {
	            for (let i = 0; i < groups.length; i++) {
	                let group = groups[i];

	                let start = group.start;
	                let count = group.count;

	                for (let j = start, jl = start + count; j < jl; j += 3) {
	                    if (indices !== undefined) {
	                        addFace(indices[j], indices[j + 1], indices[j + 2], group.materialIndex);
	                    }
	                    else {
	                        addFace(j, j + 1, j + 2, group.materialIndex);
	                    }
	                }
	            }
	        }
	        else {
	            if (indices !== undefined) {
	                for (let i = 0; i < indices.length; i += 3) {
	                    addFace(indices[i], indices[i + 1], indices[i + 2]);
	                }
	            }
	            else {
	                for (let i = 0; i < positions.length / 3; i += 3) {
	                    addFace(i, i + 1, i + 2);
	                }
	            }
	        }
	    }

	    // 通过 hashmap 检查重复的顶点。重复的顶点将会被移除，面的顶点信息会被更新。
	    mergeVertices() {
	        let verticesMap = {}; // Hashmap for looking up vertices by position coordinates (and making sure they are unique)
	        let unique = [], changes = [];

	        let v, key;
	        let precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
	        let precision = Math.pow(10, precisionPoints);
	        let i, il, face;
	        let indices, j, jl;

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

	        // if faces are completely degenerate after merging vertices, we have to remove them from the geometry.
	        let faceIndicesToRemove = [];

	        for (i = 0, il = this.faces.length; i < il; i++) {
	            face = this.faces[i];

	            face.a = changes[face.a];
	            face.b = changes[face.b];
	            face.c = changes[face.c];

	            indices = [face.a, face.b, face.c];

	            // if any duplicate vertices are found in a Face3,we have to remove the face as nothing can be saved
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

	            for (j = 0, jl = this.faceVertexUvs.length; j < jl; j++) {
	                this.faceVertexUvs[j].splice(idx, 1);
	            }
	        }

	        // Use unique set of vertices
	        let diff = this.vertices.length - unique.length;
	        this.vertices = unique;
	        return diff;
	    }

	    // 用给定矩阵转换几何体的顶点坐标
	    applyMatrix(matrix) {
	        let normalMatrix = new Matrix3().getNormalMatrix(matrix);

	        for (let i = 0; i < this.vertices.length; i++) {
	            let vertex = this.vertices[i];
	            vertex.applyMatrix4(matrix);
	        }

	        for (let i = 0; i < this.faces.length; i++) {
	            let face = this.faces[i];
	            face.normal.applyMatrix3(normalMatrix).normalize();
	        }

	        return this;
	    }
	}

	Object.defineProperty(Geometry.prototype, 'isGeometry', {value: true});

	// 使用闭包声明变量不污染全局
	Object.assign(Geometry.prototype, {
	    rotateX: function () {
	        let m1 = new Matrix4();
	        return function rotateX(angle) {
	            m1.makeRotationX(angle);
	            this.applyMatrix(m1);
	            return this;
	        };
	    }(),

	    rotateY: function () {
	        let m1 = new Matrix4();
	        return function rotateY(angle) {
	            m1.makeRotationY(angle);
	            this.applyMatrix(m1);
	            return this;
	        };
	    }(),

	    rotateZ: function () {
	        let m1 = new Matrix4();
	        return function rotateZ(angle) {
	            m1.makeRotationZ(angle);
	            this.applyMatrix(m1);
	            return this;
	        };
	    }(),

	    translate: function () {
	        let m1 = new Matrix4();
	        return function translate(x, y, z) {
	            m1.makeTranslation(x, y, z);
	            this.applyMatrix(m1);
	            return this;
	        };
	    }(),

	    scale: function () {
	        let m1 = new Matrix4();
	        return function scale(x, y, z) {
	            m1.makeScale(x, y, z);
	            this.applyMatrix(m1);
	            return this;
	        };
	    }(),

	    lookAt: function () {
	        let obj = new Object3D();
	        return function lookAt(vector) {
	            obj.lookAt(vector);
	            obj.updateMatrix();
	            this.applyMatrix(obj.matrix);
	        };
	    }()
	});

	// 立方体
	class BoxGeometry extends Geometry {
	    constructor(width, height, depth, widthSegments, heightSegments, depthSegments) {
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

	class PlaneGeometry extends Geometry {
	    constructor(width, height, widthSegments, heightSegments) {
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

	class SphereGeometry extends Geometry {
	    constructor(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength) {
	        super();
	        this.type = 'SphereGeometry';

	        this.parameters = {
	            radius: radius,
	            widthSegments: widthSegments,
	            heightSegments: heightSegments,
	            phiStart: phiStart,
	            phiLength: phiLength,
	            thetaStart: thetaStart,
	            thetaLength: thetaLength
	        };

	        this.fromBufferGeometry(new SphereBufferGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength));
	        this.mergeVertices();
	    }
	}

	class SphereBufferGeometry extends BufferGeometry {
	    constructor(radius = 1, widthSegments, heightSegments, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
	        super();
	        this.type = 'SphereBufferGeometry';

	        widthSegments = Math.max(3, Math.floor(widthSegments) || 8);
	        heightSegments = Math.max(2, Math.floor(heightSegments) || 6);

	        this.parameters = {
	            radius: radius,
	            widthSegments: widthSegments,
	            heightSegments: heightSegments,
	            phiStart: phiStart,
	            phiLength: phiLength,
	            thetaStart: thetaStart,
	            thetaLength: thetaLength
	        };

	        let thetaEnd = thetaStart + thetaLength;

	        let ix, iy;

	        let index = 0;
	        let grid = [];

	        let vertex = new Vector3();
	        let normal = new Vector3();

	        // buffers

	        let indices = [];
	        let vertices = [];
	        let normals = [];
	        let uvs = [];

	        // generate vertices, normals and uvs
	        for (iy = 0; iy <= heightSegments; iy++) {
	            let verticesRow = [];
	            let v = iy / heightSegments;

	            for (ix = 0; ix <= widthSegments; ix++) {
	                let u = ix / widthSegments;

	                // vertex
	                vertex.x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
	                vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
	                vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

	                vertices.push(vertex.x, vertex.y, vertex.z);

	                // normal
	                normal.set(vertex.x, vertex.y, vertex.z).normalize();
	                normals.push(normal.x, normal.y, normal.z);

	                // uv
	                uvs.push(u, 1 - v);

	                verticesRow.push(index++);
	            }

	            grid.push(verticesRow);
	        }

	        // indices
	        for (iy = 0; iy < heightSegments; iy++) {
	            for (ix = 0; ix < widthSegments; ix++) {
	                let a = grid[iy][ix + 1];
	                let b = grid[iy][ix];
	                let c = grid[iy + 1][ix];
	                let d = grid[iy + 1][ix + 1];

	                if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
	                if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
	            }
	        }

	        // build geometry
	        this.setIndex(indices);
	        this.addAttribute('position', new Float32BufferAttribute(vertices, 3));
	        this.addAttribute('normal', new Float32BufferAttribute(normals, 3));
	        this.addAttribute('uv', new Float32BufferAttribute(uvs, 2));
	    }
	}

	class CylinderGeometry extends Geometry {
	    constructor(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength) {
	        super();
	        this.type = 'CylinderGeometry';

	        this.parameters = {
	            radiusTop: radiusTop,
	            radiusBottom: radiusBottom,
	            height: height,
	            radialSegments: radialSegments,
	            heightSegments: heightSegments,
	            openEnded: openEnded,
	            thetaStart: thetaStart,
	            thetaLength: thetaLength
	        };

	        this.fromBufferGeometry(new CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength));
	        this.mergeVertices();
	    }
	}

	class CylinderBufferGeometry extends BufferGeometry {
	    constructor(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2) {
	        super();
	        this.type = 'CylinderBufferGeometry';

	        this.parameters = {
	            radiusTop: radiusTop,
	            radiusBottom: radiusBottom,
	            height: height,
	            radialSegments: radialSegments,
	            heightSegments: heightSegments,
	            openEnded: openEnded,
	            thetaStart: thetaStart,
	            thetaLength: thetaLength
	        };

	        let scope = this;
	        // buffers

	        let indices = [];
	        let vertices = [];
	        let normals = [];
	        let uvs = [];

	        // helper variables

	        let index = 0;
	        let indexArray = [];
	        let halfHeight = height / 2;
	        let groupStart = 0;

	        // generate geometry

	        generateTorso();

	        if (openEnded === false) {

	            if (radiusTop > 0) generateCap(true);
	            if (radiusBottom > 0) generateCap(false);

	        }

	        // build geometry

	        this.setIndex(indices);
	        this.addAttribute('position', new Float32BufferAttribute(vertices, 3));
	        this.addAttribute('normal', new Float32BufferAttribute(normals, 3));
	        this.addAttribute('uv', new Float32BufferAttribute(uvs, 2));

	        function generateTorso() {

	            let x, y;
	            let normal = new Vector3();
	            let vertex = new Vector3();

	            let groupCount = 0;

	            // this will be used to calculate the normal
	            let slope = (radiusBottom - radiusTop) / height;

	            // generate vertices, normals and uvs

	            for (y = 0; y <= heightSegments; y++) {

	                let indexRow = [];

	                let v = y / heightSegments;

	                // calculate the radius of the current row

	                let radius = v * (radiusBottom - radiusTop) + radiusTop;

	                for (x = 0; x <= radialSegments; x++) {

	                    let u = x / radialSegments;

	                    let theta = u * thetaLength + thetaStart;

	                    let sinTheta = Math.sin(theta);
	                    let cosTheta = Math.cos(theta);

	                    // vertex

	                    vertex.x = radius * sinTheta;
	                    vertex.y = -v * height + halfHeight;
	                    vertex.z = radius * cosTheta;
	                    vertices.push(vertex.x, vertex.y, vertex.z);

	                    // normal

	                    normal.set(sinTheta, slope, cosTheta).normalize();
	                    normals.push(normal.x, normal.y, normal.z);

	                    // uv

	                    uvs.push(u, 1 - v);

	                    // save index of vertex in respective row

	                    indexRow.push(index++);

	                }

	                // now save vertices of the row in our index array

	                indexArray.push(indexRow);

	            }

	            // generate indices

	            for (x = 0; x < radialSegments; x++) {

	                for (y = 0; y < heightSegments; y++) {

	                    // we use the index array to access the correct indices

	                    let a = indexArray[y][x];
	                    let b = indexArray[y + 1][x];
	                    let c = indexArray[y + 1][x + 1];
	                    let d = indexArray[y][x + 1];

	                    // faces

	                    indices.push(a, b, d);
	                    indices.push(b, c, d);

	                    // update group counter

	                    groupCount += 6;

	                }

	            }

	            // add a group to the geometry. this will ensure multi material support

	            scope.addGroup(groupStart, groupCount, 0);

	            // calculate new start value for groups

	            groupStart += groupCount;

	        }

	        function generateCap(top) {

	            let x, centerIndexStart, centerIndexEnd;

	            let uv = new Vector2();
	            let vertex = new Vector3();

	            let groupCount = 0;

	            let radius = (top === true) ? radiusTop : radiusBottom;
	            let sign = (top === true) ? 1 : -1;

	            // save the index of the first center vertex
	            centerIndexStart = index;

	            // first we generate the center vertex data of the cap.
	            // because the geometry needs one set of uvs per face,
	            // we must generate a center vertex per face/segment

	            for (x = 1; x <= radialSegments; x++) {

	                // vertex

	                vertices.push(0, halfHeight * sign, 0);

	                // normal

	                normals.push(0, sign, 0);

	                // uv

	                uvs.push(0.5, 0.5);

	                // increase index

	                index++;

	            }

	            // save the index of the last center vertex

	            centerIndexEnd = index;

	            // now we generate the surrounding vertices, normals and uvs

	            for (x = 0; x <= radialSegments; x++) {

	                let u = x / radialSegments;
	                let theta = u * thetaLength + thetaStart;

	                let cosTheta = Math.cos(theta);
	                let sinTheta = Math.sin(theta);

	                // vertex

	                vertex.x = radius * sinTheta;
	                vertex.y = halfHeight * sign;
	                vertex.z = radius * cosTheta;
	                vertices.push(vertex.x, vertex.y, vertex.z);

	                // normal

	                normals.push(0, sign, 0);

	                // uv

	                uv.x = (cosTheta * 0.5) + 0.5;
	                uv.y = (sinTheta * 0.5 * sign) + 0.5;
	                uvs.push(uv.x, uv.y);

	                // increase index

	                index++;

	            }

	            // generate indices

	            for (x = 0; x < radialSegments; x++) {

	                let c = centerIndexStart + x;
	                let i = centerIndexEnd + x;

	                if (top === true) {

	                    // face top

	                    indices.push(i, i + 1, c);

	                } else {

	                    // face bottom

	                    indices.push(i + 1, i, c);

	                }

	                groupCount += 3;

	            }

	            // add a group to the geometry. this will ensure multi material support

	            scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);

	            // calculate new start value for groups

	            groupStart += groupCount;

	        }
	    }
	}

	class ConeGeometry extends CylinderGeometry {
	    constructor(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength) {
	        super(0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
	        this.type = 'ConeGeometry';

	        this.parameters = {
	            radius: radius,
	            height: height,
	            radialSegments: radialSegments,
	            heightSegments: heightSegments,
	            openEnded: openEnded,
	            thetaStart: thetaStart,
	            thetaLength: thetaLength
	        };
	    }
	}

	class ConeBufferGeometry extends CylinderBufferGeometry {
	    constructor(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength) {
	        super(0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
	        this.type = 'ConeBufferGeometry';

	        this.parameters = {
	            radius: radius,
	            height: height,
	            radialSegments: radialSegments,
	            heightSegments: heightSegments,
	            openEnded: openEnded,
	            thetaStart: thetaStart,
	            thetaLength: thetaLength
	        };
	    }
	}

	// 存储对象池
	let _object, _face, _vertex, _sprite, _line,
	    _objectPool = [], _facePool = [], _vertexPool = [], _spritePool = [], _linePool = [],
	    _objectCount = 0, _faceCount = 0, _vertexCount = 0, _spriteCount = 0, _lineCount = 0;

	let _vector3 = new Vector3(),
	    _vector4 = new Vector4(),
	    _clipBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)), // 修剪盒子（设定清除画布的范围）
	    _boundingBox = new Box3();  // 包围盒子

	let _points3 = new Array(3);

	let _viewMatrix = new Matrix4(),            // 相机逆矩阵
	    _viewProjectionMatrix = new Matrix4();  // 视图矩阵

	let _modelMatrix,                               // 模型矩阵
	    _modelViewProjectionMatrix = new Matrix4();

	// 裁剪点
	let _clippedVertex1PositionScreen = new Vector4(),
	    _clippedVertex2PositionScreen = new Vector4();

	// 渲染对象
	let _renderData = {objects: [], elements: []};

	class RenderList {
	    constructor() {
	        this.object = null;
	        this.material = null;

	        this.colors = [];   // 顶点 colors 队列
	        this.uvs = [];      // 面的 UV 层的队列
	    }

	    // 设置对象（BufferGeometry支持）
	    setObject(value) {
	        this.object = value;
	        this.material = value.material;

	        this.colors.length = 0;
	        this.uvs.length = 0;
	    }

	    // 检查所有渲染对象和子对象
	    projectObject(object) {
	        let self = this;
	        if (object.visible === false) return;
	        if (object.isMesh || object.isLine) {
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
	        let material = this.material;
	        let v1 = _vertexPool[a];
	        let v2 = _vertexPool[b];
	        let v3 = _vertexPool[c];

	        if (checkTriangleVisibility(v1, v2, v3) === false) return;

	        if (material.side === DoubleSide || checkBackfaceCulling(v1, v2, v3) === true) {
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

	            for (let i = 0; i < 3; i++) {

	                // let normal = _face.vertexNormalsModel[i];
	                // normal.fromArray(normals, arguments[i] * 3);
	                // normal.applyMatrix3(normalMatrix).normalize();

	                let uv = _face.uvs[i];
	                uv.fromArray(this.uvs, arguments[i] * 2);

	            }

	            // _face.vertexNormalsLength = 3;

	            _face.material = object.material;

	            _renderData.elements.push(_face);
	        }
	    }

	    pushLine(a, b) {
	        let object = this.object;
	        let v1 = _vertexPool[a];
	        let v2 = _vertexPool[b];

	        // Clip
	        v1.positionScreen.copy(v1.position).applyMatrix4(_modelViewProjectionMatrix);
	        v2.positionScreen.copy(v2.position).applyMatrix4(_modelViewProjectionMatrix);

	        if (clipLine(v1.positionScreen, v2.positionScreen) === true) {
	            // Perform the perspective divide
	            v1.positionScreen.multiplyScalar(1 / v1.positionScreen.w);
	            v2.positionScreen.multiplyScalar(1 / v2.positionScreen.w);

	            _line = getNextLineInPool();
	            _line.id = object.id;
	            _line.v1.copy(v1);
	            _line.v2.copy(v2);
	            _line.z = Math.max(v1.positionScreen.z, v2.positionScreen.z);
	            _line.renderOrder = object.renderOrder;

	            _line.material = object.material;

	            if (object.material.vertexColors === VertexColors) {
	                _line.vertexColors[0].fromArray(colors, a * 3);
	                _line.vertexColors[1].fromArray(colors, b * 3);
	            }

	            _renderData.elements.push(_line);
	        }
	    }

	    // 添加 uv 点
	    pushUv(x, y) {
	        this.uvs.push(x, y);
	    }

	    pushColor(r, g, b) {
	        this.colors.push(r, g, b);
	    }
	}

	let renderList = new RenderList();

	class Projector {
	    projectScene(scene, camera, sortObjects, sortElements) {
	        _objectCount = 0;
	        _faceCount = 0;
	        _spriteCount = 0;
	        _lineCount = 0;

	        _renderData.elements = [];
	        _renderData.objects = [];

	        _viewMatrix.copy(camera.matrixWorldInverse); // 相机逆矩阵

	        // 相机投影矩阵 = 视图矩阵 * 相机矩阵（camera.projectionMatrix = _viewProjectionMatrix * camera.matrixWorld）
	        // 当屏幕大小固定时，camera.projectionMatrix不变！camera.matrixWorld的变化影响视图矩阵_viewProjectionMatrix
	        _viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, _viewMatrix);

	        renderList.projectObject(scene);

	        if (sortObjects === true) {
	            _renderData.objects.sort(this.painterSort);
	        }

	        let objects = _renderData.objects;
	        for (let o = 0; o < objects.length; o++) {
	            let object = objects[o].object;
	            let geometry = object.geometry;

	            renderList.setObject(object);

	            _vertexCount = 0;
	            _modelMatrix = object.matrixWorld;

	            if (object.isMesh === true) {
	                if (geometry.isBufferGeometry === true) {
	                    let attributes = geometry.attributes;
	                    let groups = geometry.groups;

	                    if (attributes.position === undefined) continue;

	                    let positions = attributes.position.array;

	                    for (let i = 0, l = positions.length; i < l; i += 3) {
	                        renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
	                    }

	                    if (attributes.uv !== undefined) {
	                        let uvs = attributes.uv.array;
	                        for (let i = 0, l = uvs.length; i < l; i += 2) {
	                            renderList.pushUv(uvs[i], uvs[i + 1]);
	                        }
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
	                else if (geometry.isGeometry === true) {
	                    let vertices = geometry.vertices;
	                    let faces = geometry.faces;
	                    let faceVertexUvs = geometry.faceVertexUvs[0];

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

	                        if (checkTriangleVisibility(v1, v2, v3) === false) continue;
	                        // 过滤面
	                        let visible = checkBackfaceCulling(v1, v2, v3);
	                        if (material.side !== DoubleSide) {
	                            if (material.side === FrontSide && visible === false) continue;
	                            if (material.side === BackSide && visible === true) continue;
	                        }

	                        _face = getNextFaceInPool();

	                        _face.v1.copy(v1);
	                        _face.v2.copy(v2);
	                        _face.v3.copy(v3);

	                        let vertexUvs = faceVertexUvs[f];
	                        if (vertexUvs !== undefined) {
	                            for (let u = 0; u < 3; u++) {
	                                _face.uvs[u].copy(vertexUvs[u]);
	                            }
	                        }

	                        _face.id = object.id;
	                        _face.color = face.color;
	                        _face.material = material;

	                        _face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;
	                        _face.renderOrder = object.renderOrder;

	                        _renderData.elements.push(_face);
	                    }
	                }
	            }
	            else if (object.isSprite === true) {
	                _vector4.set(_modelMatrix.elements[12], _modelMatrix.elements[13], _modelMatrix.elements[14], 1);
	                _vector4.applyMatrix4(_viewProjectionMatrix);
	                renderList.pushPoint(_vector4, object, camera);
	            }
	            else if (object.isLine === true) {
	                _modelViewProjectionMatrix.multiplyMatrices(_viewProjectionMatrix, _modelMatrix);

	                if (geometry.isBufferGeometry === true) {
	                    let attributes = geometry.attributes;
	                    if (attributes.position !== undefined) {
	                        let positions = attributes.position.array;
	                        for (let i = 0, l = positions.length; i < l; i += 3) {
	                            renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
	                        }

	                        if (attributes.color !== undefined) {
	                            let colors = attributes.color.array;
	                            for (let i = 0, l = colors.length; i < l; i += 3) {
	                                renderList.pushColor(colors[i], colors[i + 1], colors[i + 2]);
	                            }
	                        }

	                        if (geometry.index !== null) {
	                            let indices = geometry.index.array;
	                            for (let i = 0, l = indices.length; i < l; i += 2) {
	                                renderList.pushLine(indices[i], indices[i + 1]);
	                            }
	                        }
	                    }
	                }
	                else if (geometry.isGeometry === true) {
	                    let vertices = object.geometry.vertices;

	                    if (vertices.length === 0) continue;

	                    let v1 = getNextVertexInPool();
	                    v1.positionScreen.copy(vertices[0]).applyMatrix4(_modelViewProjectionMatrix);

	                    let step = 1;

	                    for (let v = 1, vl = vertices.length; v < vl; v++) {
	                        v1 = getNextVertexInPool();
	                        v1.positionScreen.copy(vertices[v]).applyMatrix4(_modelViewProjectionMatrix);

	                        if ((v + 1) % step > 0) continue;

	                        let v2 = _vertexPool[_vertexCount - 2];

	                        _clippedVertex1PositionScreen.copy(v1.positionScreen);
	                        _clippedVertex2PositionScreen.copy(v2.positionScreen);

	                        if (clipLine(_clippedVertex1PositionScreen, _clippedVertex2PositionScreen) === true) {
	                            // Perform the perspective divide
	                            _clippedVertex1PositionScreen.multiplyScalar(1 / _clippedVertex1PositionScreen.w);
	                            _clippedVertex2PositionScreen.multiplyScalar(1 / _clippedVertex2PositionScreen.w);

	                            _line = getNextLineInPool();

	                            _line.id = object.id;
	                            _line.v1.positionScreen.copy(_clippedVertex1PositionScreen);
	                            _line.v2.positionScreen.copy(_clippedVertex2PositionScreen);

	                            _line.z = Math.max(_clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z);
	                            _line.renderOrder = object.renderOrder;

	                            _line.material = object.material;

	                            if (object.material.vertexColors === VertexColors) {
	                                _line.vertexColors[0].copy(object.geometry.colors[v]);
	                                _line.vertexColors[1].copy(object.geometry.colors[v - 1]);
	                            }

	                            _renderData.elements.push(_line);
	                        }
	                    }
	                }
	            }
	        }

	        if (sortElements === true) {
	            _renderData.elements.sort(this.painterSort);
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

	function checkTriangleVisibility(v1, v2, v3) {
	    if (v1.visible === true || v2.visible === true || v3.visible === true) return true;

	    _points3[0] = v1.positionScreen;
	    _points3[1] = v2.positionScreen;
	    _points3[2] = v3.positionScreen;

	    return _clipBox.intersectsBox(_boundingBox.setFromPoints(_points3));
	}

	function checkBackfaceCulling(v1, v2, v3) {
	    return ((v3.positionScreen.x - v1.positionScreen.x) * (v2.positionScreen.y - v1.positionScreen.y) - (v3.positionScreen.y - v1.positionScreen.y) * (v2.positionScreen.x - v1.positionScreen.x)) < 0;
	}

	// 裁剪线
	function clipLine(s1, s2) {
	    let alpha1 = 0, alpha2 = 1,
	        // Calculate the boundary coordinate of each vertex for the near and far clip planes,
	        // Z = -1 and Z = +1, respectively.
	        bc1near = s1.z + s1.w,
	        bc2near = s2.z + s2.w,
	        bc1far = -s1.z + s1.w,
	        bc2far = -s2.z + s2.w;

	    if (bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0) {
	        // Both vertices lie entirely within all clip planes.
	        return true;
	    }
	    else if ((bc1near < 0 && bc2near < 0) || (bc1far < 0 && bc2far < 0)) {
	        // Both vertices lie entirely outside one of the clip planes.
	        return false;
	    }
	    else {
	        // The line segment spans at least one clip plane.
	        if (bc1near < 0) {
	            // v1 lies outside the near plane, v2 inside
	            alpha1 = Math.max(alpha1, bc1near / (bc1near - bc2near));
	        }
	        else if (bc2near < 0) {
	            // v2 lies outside the near plane, v1 inside
	            alpha2 = Math.min(alpha2, bc1near / (bc1near - bc2near));
	        }

	        if (bc1far < 0) {
	            // v1 lies outside the far plane, v2 inside
	            alpha1 = Math.max(alpha1, bc1far / (bc1far - bc2far));
	        }
	        else if (bc2far < 0) {
	            // v2 lies outside the far plane, v2 inside
	            alpha2 = Math.min(alpha2, bc1far / (bc1far - bc2far));
	        }

	        if (alpha2 < alpha1) {
	            // The line segment spans two boundaries, but is outside both of them.
	            // (This can't happen when we're only clipping against just near/far but good
	            //  to leave the check here for future usage if other clip planes are added.)
	            return false;
	        }
	        else {
	            // Update the s1 and s2 vertices to match the clipped line segment.
	            s1.lerp(s2, alpha1);
	            s2.lerp(s1, 1 - alpha2);
	            return true;
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
	        this.uvs = [new Vector2(), new Vector2(), new Vector2()];

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

	// 线
	class RenderableLine {
	    constructor() {
	        this.id = 0;

	        this.v1 = new RenderableVertex();
	        this.v2 = new RenderableVertex();

	        this.vertexColors = [new Color(), new Color()];
	        this.material = null;

	        this.z = 0;
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

	function getNextLineInPool() {
	    if (_lineCount === _linePool.length) {
	        let line = new RenderableLine();
	        _linePool.push(line);
	        _lineCount++;
	        return line;
	    }
	    return _linePool[_lineCount++];
	}

	class Renderer {
	    constructor() {
	        this.renderList = [];
	        this.width = 0;
	        this.height = 0;
	    }
	}

	let _canvas, _context;
	let _canvasWidth, _canvasHeight,
	    _canvasWidthHalf, _canvasHeightHalf;

	let _patterns = {}, _uvs;
	let _v1, _v2, _v3,
	    _v1x, _v1y, _v2x, _v2y, _v3x, _v3y;
	let _clipBox$1 = new Box2(),  // 裁剪盒子，默认设为canvas大小
	    _clearBox = new Box2(), // 清空画布2d盒子模型（不需要全屏清除，只清除绘制部分）
	    _elemBox = new Box2();
	let _color = new Color();

	let _clearColor, _clearAlpha;

	class CanvasRenderer extends Renderer {
	    constructor(parameters = {}) {
	        super();
	        this.domElement = _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement('canvas');
	        _canvas.style.position = "absolute";
	        _context = _canvas.getContext("2d");

	        _clearColor = new Color(0x000000);
	        _clearAlpha = parameters.alpha === true ? 0 : 1;

	        this.width = _canvasWidth = 0;
	        this.height = _canvasHeight = 0;
	        _canvasWidthHalf = 0;
	        _canvasHeightHalf = 0;

	        this.pixelRatio = 1;

	        this.autoClear = true;
	        this.sortObjects = true;
	        this.sortElements = true;
	    }

	    setPixelRatio(value) {
	        this.pixelRatio = value;
	    }

	    setSize(width, height) {
	        _canvas.width = width;
	        _canvas.height = height;

	        _canvasWidth = width;
	        _canvasHeight = height;

	        _canvasWidthHalf = Math.floor(_canvasWidth / 2);
	        _canvasHeightHalf = Math.floor(_canvasHeight / 2);

	        _clipBox$1.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
	        _clipBox$1.max.set(_canvasWidthHalf, _canvasHeightHalf);

	        _clearBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
	        _clearBox.max.set(_canvasWidthHalf, _canvasHeightHalf);
	    }

	    render(scene, camera) {
	        if (scene.autoUpdate === true) scene.updateMatrixWorld();
	        if (camera.parent === null) camera.updateMatrixWorld(); // 相机不加入到scene的情况，单独更新

	        let background = scene.background;
	        if (background && background.isColor) {
	            this.setOpacity(1);
	            this.setBlending(NormalBlending);
	            this.setFillStyle(background.getStyle());
	            _context.fillRect(0, 0, _canvasWidth, _canvasHeight);

	        } else if (this.autoClear === true) {
	            this.clear();
	        }

	        // 通过缩放翻转画布上下方向
	        _context.setTransform(1, 0, 0, -1, 0, _canvasHeight);
	        // 以画布中心为原点
	        _context.translate(_canvasWidthHalf, _canvasHeightHalf);

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

	                _v1.positionScreen.x *= _canvasWidthHalf, _v1.positionScreen.y *= _canvasHeightHalf;
	                _v2.positionScreen.x *= _canvasWidthHalf, _v2.positionScreen.y *= _canvasHeightHalf;
	                _v3.positionScreen.x *= _canvasWidthHalf, _v3.positionScreen.y *= _canvasHeightHalf;

	                if (material.overdraw > 0) {
	                    this.expand(_v1.positionScreen, _v2.positionScreen, material.overdraw);
	                    this.expand(_v2.positionScreen, _v3.positionScreen, material.overdraw);
	                    this.expand(_v3.positionScreen, _v1.positionScreen, material.overdraw);
	                }

	                _elemBox.setFromPoints([_v1.positionScreen, _v2.positionScreen, _v3.positionScreen]);

	                if (_clipBox$1.intersectsBox(_elemBox) === true) {
	                    this.renderFace3(_v1, _v2, _v3, 0, 1, 2, element, element.material);
	                }
	            }
	            else if (element instanceof RenderableLine) {
	                _v1 = element.v1, _v2 = element.v2;

	                _v1.positionScreen.x *= _canvasWidthHalf, _v1.positionScreen.y *= _canvasHeightHalf;
	                _v2.positionScreen.x *= _canvasWidthHalf, _v2.positionScreen.y *= _canvasHeightHalf;

	                _elemBox.setFromPoints([_v1.positionScreen, _v2.positionScreen]);

	                if (_clipBox$1.intersectsBox(_elemBox) === true) {
	                    this.renderLine(_v1, _v2, element, material);
	                }
	            }
	            else if (element instanceof RenderableSprite) {
	                this.renderSprite(element, element.material);
	            }

	            _clearBox.union(_elemBox);
	        }

	        _context.setTransform(1, 0, 0, 1, 0, 0);
	    }

	    setClearColor(color, alpha = 1) {
	        _clearColor.set(color);
	        _clearAlpha = alpha;

	        _clearBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
	        _clearBox.max.set(_canvasWidthHalf, _canvasHeightHalf);
	    }

	    clear() {
	        if (_clearBox.isEmpty() === false) {
	            _clearBox.intersect(_clipBox$1).expandByScalar(4);

	            _clearBox.min.x = _clearBox.min.x + _canvasWidthHalf;
	            _clearBox.min.y = -_clearBox.min.y + _canvasHeightHalf;		// higher y value !
	            _clearBox.max.x = _clearBox.max.x + _canvasWidthHalf;
	            _clearBox.max.y = -_clearBox.max.y + _canvasHeightHalf;		// lower y value !


	            if (_clearAlpha < 1) {
	                _context.clearRect(_clearBox.min.x | 0, _clearBox.max.y | 0, (_clearBox.max.x - _clearBox.min.x) | 0, (_clearBox.min.y - _clearBox.max.y) | 0);
	            }

	            if (_clearAlpha > 0) {
	                this.setOpacity(1);
	                this.setBlending(NormalBlending);
	                this.setFillStyle('rgba(' + Math.floor(_clearColor.r * 255) + ',' + Math.floor(_clearColor.g * 255) + ',' + Math.floor(_clearColor.b * 255) + ',' + _clearAlpha + ')');

	                _context.fillRect(_clearBox.min.x | 0, _clearBox.max.y | 0, (_clearBox.max.x - _clearBox.min.x) | 0, (_clearBox.min.y - _clearBox.max.y) | 0);
	            }

	            _clearBox.makeEmpty();
	        }
	    }

	    drawTriangle(x0, y0, x1, y1, x2, y2) {
	        _context.beginPath();
	        _context.moveTo(x0, y0);
	        _context.lineTo(x1, y1);
	        _context.lineTo(x2, y2);
	        _context.closePath();
	    }

	    strokePath(color, linewidth, linecap, linejoin) {
	        this.setLineWidth(linewidth);
	        this.setLineCap(linecap);
	        this.setLineJoin(linejoin);
	        this.setStrokeStyle(color.getStyle());
	        _context.stroke();

	        _elemBox.expandByScalar(linewidth * 2);
	    }

	    fillPath(color) {
	        this.setFillStyle(color.getStyle());
	        _context.fill();
	    }

	    renderFace3(v1, v2, v3, uv1, uv2, uv3, element, material) {
	        this.setOpacity(material.opacity);
	        this.setBlending(material.blending);

	        _v1x = v1.positionScreen.x, _v1y = v1.positionScreen.y;
	        _v2x = v2.positionScreen.x, _v2y = v2.positionScreen.y;
	        _v3x = v3.positionScreen.x, _v3y = v3.positionScreen.y;

	        this.drawTriangle(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y);
	        if (material.isMeshBasicMaterial) {
	            if (material.map !== null) {
	                // uv贴图
	                if (material.map.mapping === THREE.UVMapping) {
	                    _uvs = element.uvs;
	                    this.patternPath(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uvs[uv1].x, _uvs[uv1].y, _uvs[uv2].x, _uvs[uv2].y, _uvs[uv3].x, _uvs[uv3].y, material.map);
	                }
	            }
	            else {
	                _color.copy(material.color);
	                if (material.vertexColors === FaceColors) {
	                    _color.multiply(element.color);
	                }

	                material.wireframe === true
	                    ? this.strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin)
	                    : this.fillPath(_color);
	            }
	        }
	    }

	    renderSprite(element, material) {
	        this.setOpacity(material.opacity);
	        this.setBlending(material.blending);
	        element.x *= _canvasWidthHalf;
	        element.y *= _canvasHeightHalf;
	        let scaleX = element.scale.x * _canvasWidthHalf;
	        let scaleY = element.scale.y * _canvasHeightHalf;

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

	    renderLine(v1, v2, element, material) {
	        this.setOpacity(material.opacity);
	        this.setBlending(material.blending);

	        _context.beginPath();
	        _context.moveTo(v1.positionScreen.x, v1.positionScreen.y);
	        _context.lineTo(v2.positionScreen.x, v2.positionScreen.y);

	        if (material.isLineBasicMaterial) {
	            this.setLineWidth(material.linewidth);
	            this.setLineCap(material.linecap);
	            this.setLineJoin(material.linejoin);
	            if (material.vertexColors !== VertexColors) {
	                this.setStrokeStyle(material.color.getStyle());
	            }
	            else {
	                let colorStyle1 = element.vertexColors[0].getStyle();
	                let colorStyle2 = element.vertexColors[1].getStyle();

	                if (colorStyle1 === colorStyle2) {
	                    this.setStrokeStyle(colorStyle1);
	                }
	                else {
	                    let grad;
	                    // 线性渐变
	                    try {
	                        grad = _context.createLinearGradient(
	                            v1.positionScreen.x,
	                            v1.positionScreen.y,
	                            v2.positionScreen.x,
	                            v2.positionScreen.y
	                        );
	                        grad.addColorStop(0, colorStyle1);
	                        grad.addColorStop(1, colorStyle2);
	                    } catch (exception) {
	                        grad = colorStyle1;
	                    }
	                    this.setStrokeStyle(grad);
	                }
	            }

	            _context.stroke();
	            _elemBox.expandByScalar(material.linewidth * 2);
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
	        let pattern = _context.createPattern(canvas, repeat);
	        if (texture.onUpdate) texture.onUpdate(texture);
	        return {
	            canvas: pattern,
	            version: texture.version
	        };
	    }

	    patternPath(x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, texture) {
	        let pattern = _patterns[texture.id];

	        if (pattern === undefined || pattern.version !== texture.version) {
	            pattern = this.textureToPattern(texture);
	            _patterns[texture.id] = pattern;
	        }

	        if (pattern.canvas !== undefined) {
	            this.setFillStyle(pattern.canvas);
	        } else {
	            this.setFillStyle('rgba( 0, 0, 0, 1)');
	            _context.fill();
	            return;
	        }

	        // http://extremelysatisfactorytotalitarianism.com/blog/?p=2120
	        let a, b, c, d, e, f, det, idet,
	            offsetX = texture.offset.x / texture.repeat.x,
	            offsetY = texture.offset.y / texture.repeat.y,
	            width = texture.image.width * texture.repeat.x,
	            height = texture.image.height * texture.repeat.y;

	        u0 = (u0 + offsetX) * width;
	        v0 = (v0 + offsetY) * height;

	        u1 = (u1 + offsetX) * width;
	        v1 = (v1 + offsetY) * height;

	        u2 = (u2 + offsetX) * width;
	        v2 = (v2 + offsetY) * height;

	        x1 -= x0;
	        y1 -= y0;
	        x2 -= x0;
	        y2 -= y0;

	        u1 -= u0;
	        v1 -= v0;
	        u2 -= u0;
	        v2 -= v0;

	        det = u1 * v2 - u2 * v1;

	        if (det === 0) return;

	        idet = 1 / det;

	        a = (v2 * x1 - v1 * x2) * idet;
	        b = (v2 * y1 - v1 * y2) * idet;
	        c = (u1 * x2 - u2 * x1) * idet;
	        d = (u1 * y2 - u2 * y1) * idet;

	        e = x0 - a * u0 - c * v0;
	        f = y0 - b * u0 - d * v0;

	        _context.save();
	        _context.transform(a, b, c, d, e, f);
	        _context.fill();
	        _context.restore();
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
	        _context.globalAlpha = value;
	    }

	    // canvas混合模式
	    setBlending(value) {
	        if (value === NormalBlending) {
	            _context.globalCompositeOperation = 'source-over';
	        } else if (value === AdditiveBlending) {
	            _context.globalCompositeOperation = 'lighter';
	        } else if (value === SubtractiveBlending) {
	            _context.globalCompositeOperation = 'darker';
	        } else if (value === MultiplyBlending) {
	            _context.globalCompositeOperation = 'multiply';
	        }
	    }

	    setFillStyle(value) {
	        _context.fillStyle = value;
	    }

	    setStrokeStyle(value) {
	        _context.strokeStyle = value;
	    }

	    setLineWidth(value) {
	        _context.lineWidth = value;
	    }

	    // "butt", "round", "square"
	    setLineCap(value) {
	        _context.lineCap = value;
	    }

	    // "butt", "round", "square"
	    setLineJoin(value) {
	        _context.lineJoin = value;
	    }

	    setLineDash(value) {
	        _context.setLineDash = value;
	    }
	}

	class ImageLoader {
	    load(url, onLoad) {
	        let image = new Image();
	        image.addEventListener('load', function () {
	            if (onLoad !== undefined) {
	                onLoad(this);
	            }
	        }, false);
	        image.src = url;
	        return image;
	    }
	}

	class TextureLoader {
	    load(url, onLoad) {
	        let texture = new Texture();

	        let loader = new ImageLoader();
	        loader.load(url, function (image) {
	            texture.image = image;
	            texture.needsUpdate = true;
	            // JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
	            let isJPEG = url.search(/\.(jpg|jpeg)$/) > 0 || url.search(/^data\:image\/jpeg/) === 0;
	            texture.format = isJPEG ? RGBFormat : RGBAFormat;

	            if (onLoad !== undefined) {
	                onLoad(texture);
	            }
	        });

	        return texture;
	    }
	}

	exports.Math = _Math;
	exports.Object3D = Object3D;
	exports.Color = Color;
	exports.Euler = Euler;
	exports.Quaternion = Quaternion;
	exports.Vector2 = Vector2;
	exports.Vector3 = Vector3;
	exports.Vector4 = Vector4;
	exports.Matrix3 = Matrix3;
	exports.Matrix4 = Matrix4;
	exports.Box3 = Box3;
	exports.Box2 = Box2;
	exports.PerspectiveCamera = PerspectiveCamera;
	exports.OrthographicCamera = OrthographicCamera;
	exports.Scene = Scene;
	exports.Texture = Texture;
	exports.CanvasTexture = CanvasTexture;
	exports.MeshBasicMaterial = MeshBasicMaterial;
	exports.SpriteMaterial = SpriteMaterial;
	exports.SpriteCanvasMaterial = SpriteCanvasMaterial;
	exports.LineBasicMaterial = LineBasicMaterial;
	exports.Face3 = Face3;
	exports.Group = Group;
	exports.Mesh = Mesh;
	exports.Sprite = Sprite;
	exports.Line = Line;
	exports.BufferGeometry = BufferGeometry;
	exports.Geometry = Geometry;
	exports.BoxGeometry = BoxGeometry;
	exports.BoxBufferGeometry = BoxBufferGeometry;
	exports.PlaneGeometry = PlaneGeometry;
	exports.PlaneBufferGeometry = PlaneBufferGeometry;
	exports.SphereGeometry = SphereGeometry;
	exports.SphereBufferGeometry = SphereBufferGeometry;
	exports.CylinderGeometry = CylinderGeometry;
	exports.CylinderBufferGeometry = CylinderBufferGeometry;
	exports.ConeGeometry = ConeGeometry;
	exports.ConeBufferGeometry = ConeBufferGeometry;
	exports.RenderableObject = RenderableObject;
	exports.RenderableFace = RenderableFace;
	exports.Projector = Projector;
	exports.CanvasRenderer = CanvasRenderer;
	exports.TextureLoader = TextureLoader;
	exports.REVISION = REVISION;
	exports.FrontSide = FrontSide;
	exports.BackSide = BackSide;
	exports.DoubleSide = DoubleSide;
	exports.FlatShading = FlatShading;
	exports.SmoothShading = SmoothShading;
	exports.NoColors = NoColors;
	exports.FaceColors = FaceColors;
	exports.VertexColors = VertexColors;
	exports.NoBlending = NoBlending;
	exports.NormalBlending = NormalBlending;
	exports.AdditiveBlending = AdditiveBlending;
	exports.SubtractiveBlending = SubtractiveBlending;
	exports.MultiplyBlending = MultiplyBlending;
	exports.CustomBlending = CustomBlending;
	exports.UVMapping = UVMapping;
	exports.RGBFormat = RGBFormat;
	exports.RGBAFormat = RGBAFormat;
	exports.BufferAttribute = BufferAttribute;
	exports.Int8BufferAttribute = Int8BufferAttribute;
	exports.Uint8BufferAttribute = Uint8BufferAttribute;
	exports.Int16BufferAttribute = Int16BufferAttribute;
	exports.Uint16BufferAttribute = Uint16BufferAttribute;
	exports.Int32BufferAttribute = Int32BufferAttribute;
	exports.Uint32BufferAttribute = Uint32BufferAttribute;
	exports.Int64BufferAttribute = Int64BufferAttribute;
	exports.Float32BufferAttribute = Float32BufferAttribute;
	exports.Float64BufferAttribute = Float64BufferAttribute;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
