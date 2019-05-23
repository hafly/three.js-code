import {_Math} from "../math/Math";
import {Color} from "../math/Color";
import {Vector2} from "../math/Vector2";
import {Vector3} from "../math/Vector3";
import {Matrix3} from "../math/Matrix3";
import {Matrix4} from "../math/Matrix4";
import {Object3D} from "./Object3D";
import {Face3} from "./Face3";

/**
 * 几何体对象。由顶点和三角面构成的几何体对象的基类，保存描述几何体所有必要的数据
 * Geometry 是对 BufferGeometry 的用户友好替代。
 * Geometry 利用 Vector3 或 Color 存储了几何体的相关 attributes（如顶点位置，面信息，颜色等）比起 BufferGeometry 更容易读写，但是运行效率不如有类型的队列。
 * 对于大型工程或正式工程，推荐采用 BufferGeometry，Geometry后期可能会被弃用
 * （部分方法暂未使用，先删除掉）
 */
let geometryId = 0;// Geometry uses even numbers as Id
class Geometry {
    constructor() {
        Object.defineProperty(this, 'id', {value: geometryId += 2});

        this.uuid = _Math.generateUUID();

        this.name = '';
        this.type = 'Geometry';

        this.vertices = []; // 顶点
        this.colors = [];   // 顶点 colors 队列
        this.faces = [];    // 面
        this.faceVertexUvs = [[]];  // 面的 UV 层的队列。每个 UV 层都是一个 UV 的队列，顺序和数量同面中的顶点相对
    }

    // 将一个 BufferGeometry 对象，转换成一个 Geometry 对象
    // Geometry需要需要开辟大量的不连续数组空间（new Vecotr()），所以性能较低
    fromBufferGeometry(geometry) {
        let scope = this;

        // 空BufferGeometry的时候index为null
        let indices = geometry.index !== null ? geometry.index.array : undefined;
        let attributes = geometry.attributes;

        let positions = attributes.position.array;
        let normals = attributes.normal !== undefined ? attributes.normal.array : undefined;
        let colors = attributes.color !== undefined ? attributes.color.array : undefined;
        let uvs = attributes.uv !== undefined ? attributes.uv.array : undefined;

        for (let i = 0, j = 0; i < positions.length; i += 3, j += 2) {
            scope.vertices.push(new Vector3().fromArray(positions, i));

            if (colors !== undefined) {
                scope.colors.push(new Color().fromArray(colors, i));
            }
        }

        // 实例化Face3添加到faces
        function addFace(a, b, c, materialIndex) {
            // 顶点法向量队列
            let vertexNormals = (normals === undefined) ? [] : [
                new Vector3().fromArray(normals, a * 3),
                new Vector3().fromArray(normals, b * 3),
                new Vector3().fromArray(normals, c * 3)
            ];

            // 顶点颜色值队列
            let vertexColors = (colors === undefined) ? [] : [
                scope.colors[a].clone(),
                scope.colors[b].clone(),
                scope.colors[c].clone()
            ];

            let face = new Face3(a, b, c, vertexNormals, vertexColors, materialIndex);

            // 面
            scope.faces.push(face);

            // UV层队列
            if (uvs !== undefined) {
                scope.faceVertexUvs[0].push([
                    new Vector2().fromArray(uvs, a * 2),
                    new Vector2().fromArray(uvs, b * 2),
                    new Vector2().fromArray(uvs, c * 2)
                ]);
            }
        }

        let groups = geometry.groups;

        if (groups.length > 0) {
            for (let i = 0; i < groups.length; i++) {
                let group = groups[i];

                let start = group.start;
                let count = group.count;

                for (let j = start, jl = start + count; j < jl; j += 3) {
                    if (indices !== undefined) {
                        addFace(indices[j], indices[j + 1], indices[j + 2], group.materialIndex);
                    }
                    else {
                        addFace(j, j + 1, j + 2, group.materialIndex);
                    }
                }
            }
        }
        else {
            if (indices !== undefined) {
                for (let i = 0; i < indices.length; i += 3) {
                    addFace(indices[i], indices[i + 1], indices[i + 2]);
                }
            }
            else {
                for (let i = 0; i < positions.length / 3; i += 3) {
                    addFace(i, i + 1, i + 2);
                }
            }
        }
    }

    // 通过 hashmap 检查重复的顶点。重复的顶点将会被移除，面的顶点信息会被更新。
    mergeVertices() {
        let verticesMap = {}; // Hashmap for looking up vertices by position coordinates (and making sure they are unique)
        let unique = [], changes = [];

        let v, key;
        let precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
        let precision = Math.pow(10, precisionPoints);
        let i, il, face;
        let indices, j, jl;

        for (i = 0, il = this.vertices.length; i < il; i++) {
            v = this.vertices[i];
            key = Math.round(v.x * precision) + '_' + Math.round(v.y * precision) + '_' + Math.round(v.z * precision);

            if (verticesMap[key] === undefined) {
                verticesMap[key] = i;
                unique.push(this.vertices[i]);
                changes[i] = unique.length - 1;
            } else {
                //console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
                changes[i] = changes[verticesMap[key]];
            }
        }

        // if faces are completely degenerate after merging vertices, we have to remove them from the geometry.
        let faceIndicesToRemove = [];

        for (i = 0, il = this.faces.length; i < il; i++) {
            face = this.faces[i];

            face.a = changes[face.a];
            face.b = changes[face.b];
            face.c = changes[face.c];

            indices = [face.a, face.b, face.c];

            // if any duplicate vertices are found in a Face3,we have to remove the face as nothing can be saved
            for (let n = 0; n < 3; n++) {
                if (indices[n] === indices[(n + 1) % 3]) {
                    faceIndicesToRemove.push(i);
                    break;
                }
            }
        }

        for (i = faceIndicesToRemove.length - 1; i >= 0; i--) {
            let idx = faceIndicesToRemove[i];
            this.faces.splice(idx, 1);

            for (j = 0, jl = this.faceVertexUvs.length; j < jl; j++) {
                this.faceVertexUvs[j].splice(idx, 1);
            }
        }

        // Use unique set of vertices
        let diff = this.vertices.length - unique.length;
        this.vertices = unique;
        return diff;
    }

    // 用给定矩阵转换几何体的顶点坐标
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
}

Object.defineProperty(Geometry.prototype, 'isGeometry', {value: true});

// 使用闭包声明变量不污染全局
Object.assign(Geometry.prototype, {
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
    }()
});

export {Geometry};