import {_Math} from "../math/Math";
import {Vector2} from "../math/Vector2";
import {Matrix3} from "../math/Matrix3";
import {Matrix4} from "../math/Matrix4";
import {Vector3} from "../math/Vector3";
import {Object3D} from "./Object3D";
import {Face3} from "./Face3";

/**
 * Geometry 是对 BufferGeometry 的用户友好替代。
 * Geometry 利用 Vector3 或 Color 存储了几何体的相关 attributes（如顶点位置，面信息，颜色等）比起 BufferGeometry 更容易读写，但是运行效率不如有类型的队列。
 * 对于大型工程或正式工程，推荐采用 BufferGeometry
 */
let geometryId = 0;// Geometry uses even numbers as Id
class Geometry {
    constructor() {
        this.id = geometryId += 2;
        this.uuid = _Math.generateUUID();
        this.type = 'Geometry';
        this.isGeometry = true;

        this.vertices = []; // 顶点
        this.colors=[];     // 顶点 colors 队列
        this.faces = [];    // 面
        this.faceVertexUvs = [[]];  // 面的 UV 层的队列
    }

    applyMatrix(matrix) {
        let normalMatrix = new Matrix3().getNormalMatrix(matrix);

        for (let i = 0; i < this.vertices.length; i++) {
            let vertex = this.vertices[i];
            vertex.applyMatrix4(matrix);
        }

        for (let i = 0; i < this.faces.length; i++) {
            let face = this.faces[i];
            // face.normal.applyMatrix3(normalMatrix).normalize();
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

    fromBufferGeometry(geometry) {
        let scope = this;
        let indices = geometry.index !== null ? geometry.index.array : undefined;
        let attributes = geometry.attributes;

        let positions = attributes.position.array;
        let uvs = attributes.uv !== undefined ? attributes.uv.array : undefined;

        let tempUVs = [];

        for (let i = 0, j = 0; i < positions.length; i += 3, j += 2) {
            scope.vertices.push(new Vector3(positions[i], positions[i + 1], positions[i + 2]));

            if (uvs !== undefined) {
                tempUVs.push(new Vector2(uvs[j], uvs[j + 1]));
            }
        }

        if (indices !== undefined) {
            for (let i = 0; i < indices.length; i += 3) {
                addFace(indices[i], indices[i + 1], indices[i + 2]);
            }
        } else {
            for (let i = 0; i < positions.length / 3; i += 3) {
                addFace(i, i + 1, i + 2);
            }
        }

        function addFace(a, b, c, materialIndex) {
            let face = new Face3(a, b, c, materialIndex);
            scope.faces.push(face);

            if (uvs !== undefined) {
                scope.faceVertexUvs[0].push([tempUVs[a].clone(), tempUVs[b].clone(), tempUVs[c].clone()]);
            }
        }
    }

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

        // if faces are completely degenerate after merging vertices, we
        // have to remove them from the geometry.
        let faceIndicesToRemove = [];

        for (i = 0, il = this.faces.length; i < il; i++) {

            face = this.faces[i];

            face.a = changes[face.a];
            face.b = changes[face.b];
            face.c = changes[face.c];

            indices = [face.a, face.b, face.c];

            // if any duplicate vertices are found in a Face3
            // we have to remove the face as nothing can be saved
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
        }

        // Use unique set of vertices
        let diff = this.vertices.length - unique.length;
        this.vertices = unique;
        return diff;
    }
}

export {Geometry};