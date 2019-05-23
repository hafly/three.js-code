import {Vector2} from "./Vector2";

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

export {Vector4};