import {Vector3} from "./Vector3";

let x = new Vector3();
let y = new Vector3();
let z = new Vector3();
let zero = new Vector3(0, 0, 0);
let one = new Vector3(1, 1, 1);

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

export {Matrix4};