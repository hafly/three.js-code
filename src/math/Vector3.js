import {_Math} from "./Math";
import {Matrix4} from "./Matrix4";
import {Vector2} from "./Vector2";

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

    // 将当前向量乘以一个4x4的矩阵（= 当前位置 + 矩阵变换位置）
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

export {Vector3};