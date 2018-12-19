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
}

export {Vector4};