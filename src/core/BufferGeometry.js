import {arrayMax} from "../utils";
import {_Math} from "../math/Math";
import {Uint16BufferAttribute, Uint32BufferAttribute} from './BufferAttribute.js';
import {Matrix4} from "../math/Matrix4";
import {Object3D} from "./Object3D";

let bufferGeometryId = 1; // BufferGeometry uses odd numbers as Id
class BufferGeometry {
    constructor() {
        Object.defineProperty(this, 'id', {value: bufferGeometryId += 2});
        // this.uuid = _Math.generateUUID();

        this.type = 'BufferGeometry';
        this.isBufferGeometry = true;

        this.index = null;
        this.attributes = {};

        this.groups = [];   // 将当前几何体分割成组进行渲染
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

    addAttribute(name, attribute) {
        this.attributes[name] = attribute;
        return this;
    }

    getAttribute(name) {
        return this.attributes[name];
    }

    removeAttribute(name) {
        delete this.attributes[name];
        return this;
    }

    addGroup(start, count, materialIndex) {
        this.groups.push({
            start: start,
            count: count,
            materialIndex: materialIndex !== undefined ? materialIndex : 0
        });
    }

    clearGroups() {
        this.groups = [];
    }

    applyMatrix(matrix) {
        let position = this.attributes.position;
        if (position !== undefined) {
            matrix.applyToBufferAttribute(position);
            position.needsUpdate = true;
        }
        return this;
    }

    rotateX(angle) {
        let m1 = new Matrix4();
        m1.makeRotationX(angle);
        this.applyMatrix(m1);
        return this;
    }

    rotateY(angle) {
        let m1 = new Matrix4();
        m1.makeRotationY(angle);
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

export {BufferGeometry};