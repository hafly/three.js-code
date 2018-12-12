import {Matrix3} from "../math/Matrix3";
import {Matrix4} from "../math/Matrix4";
import {Object3D} from "./Object3D";

/**
 * Geometry 利用 Vector3 或 Color 存储了几何体的相关 attributes（如顶点位置，面信息，颜色等）
 */
class Geometry {
    constructor() {
        this.vertices = []; // 顶点
        this.faces = [];    // 面

        this.isGeometry = true;
    }

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

    rotateX(angle) {
        let m1 = new Matrix4();
        m1.makeRotationY(angle);
        this.applyMatrix(m1);
        return this;
    }

    rotateY(angle) {
        let m1 = new Matrix4();
        m1.makeRotationX(angle);
        this.applyMatrix(m1);
        return this;
    }

    rotateZ(angle) {
        let m1 = new Matrix4();
        m1.makeRotationZ(angle);
        this.applyMatrix(m1);
        return this;
    }

    translate(x, y, z) {
        let m1 = new Matrix4();
        m1.makeTranslation(x, y, z);
        this.applyMatrix(m1);
        return this;
    }

    scale(x, y, z) {
        let m1 = new Matrix4();
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

export {Geometry};