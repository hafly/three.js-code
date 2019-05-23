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

export {Vector2};