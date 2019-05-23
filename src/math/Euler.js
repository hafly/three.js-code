import {_Math} from "./Math";
import {Matrix4} from "./Matrix4";
import {Quaternion} from "./Quaternion";

let matrix = new Matrix4();

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
        matrix.makeRotationFromQuaternion(q);
        return this.setFromRotationMatrix(matrix, order, update);
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

export {Euler};