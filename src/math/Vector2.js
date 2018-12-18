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

    fromArray(array, offset) {
        if (offset === undefined) offset = 0;

        this.x = array[offset];
        this.y = array[offset + 1];

        return this;
    }
}

export {Vector2};