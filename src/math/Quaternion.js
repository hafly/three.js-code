// import {Vector3} from "./Vector3";

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

Object.assign(Quaternion.prototype, {
    isQuaternion: true
});

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

export {Quaternion};