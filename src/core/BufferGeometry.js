import {arrayMax} from "../utils";
import {_Math} from "../math/Math";
import {Uint16BufferAttribute, Uint32BufferAttribute} from './BufferAttribute.js';
import {Matrix3} from "../math/Matrix3";
import {Matrix4} from "../math/Matrix4";
import {Object3D} from "./Object3D";

/**
 * 缓存几何体
 * BufferGeometry类用来和BufferAttribute配合使用，将所有的数据包括顶点位置,法线,面,颜色,uv和其它的自定义属性存在缓冲区
 * 需要访问这些属性,需要从属性缓冲区中读原始数据。
 * （部分方法暂未使用，先删除掉）
 */
let bufferGeometryId = 1; // BufferGeometry uses odd numbers as Id
class BufferGeometry {
    constructor() {
        Object.defineProperty(this, 'id', {value: bufferGeometryId += 2});

        this.uuid = _Math.generateUUID();

        this.name = '';
        this.type = 'BufferGeometry';

        this.index = null;      // 三角面索引
        this.attributes = {};   // 通过 hashmap 存储该几何体相关的属性，通常有 position,normal,uv

        // 将当前几何体分割成组进行渲染，每个部分都会在单独的 WebGL 的 draw call 中进行绘制。
        // 该方法可以让当前的 bufferGeometry 可以使用一个材质队列进行描述
        this.groups = [];
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

    // 给BufferGeometry对象添加属性信息
    addAttribute(name, attribute) {
        this.attributes[name] = attribute;
        return this;
    }

    // 获取BufferGeometry对象属性信息
    getAttribute(name) {
        return this.attributes[name];
    }

    // 移除BufferGeometry对象属性信息
    removeAttribute(name) {
        delete this.attributes[name];
        return this;
    }

    // 为当前几何体增加一个 group
    addGroup(start, count, materialIndex) {
        this.groups.push({
            start: start,
            count: count,
            materialIndex: materialIndex !== undefined ? materialIndex : 0
        });
    }

    // 清除组
    clearGroups() {
        this.groups = [];
    }

    // 用给定矩阵转换几何体的顶点坐标
    applyMatrix(matrix) {
        let position = this.attributes.position;
        if (position !== undefined) {
            matrix.applyToBufferAttribute(position);
            position.needsUpdate = true;
        }

        let normal = this.attributes.normal;
        if (normal !== undefined) {
            let normalMatrix = new Matrix3().getNormalMatrix(matrix);
            normalMatrix.applyToBufferAttribute(normal);
            normal.needsUpdate = true;
        }

        return this;
    }
}

Object.defineProperty(BufferGeometry.prototype, 'isBufferGeometry', {value: true});

// 使用闭包声明变量不污染全局
Object.assign(BufferGeometry.prototype, {
    rotateX: function () {
        let m1 = new Matrix4();
        return function rotateX(angle) {
            m1.makeRotationX(angle);
            this.applyMatrix(m1);
            return this;
        };
    }(),

    rotateY: function () {
        let m1 = new Matrix4();
        return function rotateY(angle) {
            m1.makeRotationY(angle);
            this.applyMatrix(m1);
            return this;
        };
    }(),

    rotateZ: function () {
        let m1 = new Matrix4();
        return function rotateZ(angle) {
            m1.makeRotationZ(angle);
            this.applyMatrix(m1);
            return this;
        };
    }(),

    translate: function () {
        let m1 = new Matrix4();
        return function translate(x, y, z) {
            m1.makeTranslation(x, y, z);
            this.applyMatrix(m1);
            return this;
        };
    }(),

    scale: function () {
        let m1 = new Matrix4();
        return function scale(x, y, z) {
            m1.makeScale(x, y, z);
            this.applyMatrix(m1);
            return this;
        };
    }(),

    lookAt: function () {
        let obj = new Object3D();
        return function lookAt(vector) {
            obj.lookAt(vector);
            obj.updateMatrix();
            this.applyMatrix(obj.matrix);
        };
    }(),
});

export {BufferGeometry};