import {Color} from "../math/Color";
import {Vector3} from "../math/Vector3";

/**
 * 三角面片
 */
class Face3 {
    constructor(a, b, c, normal, vertexColors = [], color, materialIndex = 0) {
        this.a = a; // 顶点 A 的索引
        this.b = b; // 顶点 B 的索引
        this.c = c; // 顶点 C 的索引

        // (可选) 面的法向量 (Vector3) 或顶点法向量队列。
        // 如果参数传入单一矢量，则用该量设置面的法向量 .normal，如果传入的是包含三个矢量的队列， 则用该量设置 .vertexNormals
        this.normal = (normal && normal.isVector3) ? normal : new Vector3();
        this.vertexNormals = Array.isArray(normal) ? normal : []; // 三角面顶点法线向量数组

        // (可选) 面的颜色值 color 或顶点颜色值的队列。
        // 如果参数传入单一矢量，则用该量设置 .color，如果传入的是包含三个矢量的队列， 则用该量设置 .vertexColors
        this.color = (color && color.isColor) ? color : new Color();
        this.vertexColors = Array.isArray(color) ? color : [];

        // (可选) 材质队列中与该面对应的材质的索引
        this.materialIndex = materialIndex;
    }

    clone() {
        return new this.constructor().copy(this);
    }

    copy(source) {
        this.a = source.a;
        this.b = source.b;
        this.c = source.c;

        this.normal.copy(source.normal);
        this.color.copy(source.color);

        this.materialIndex = source.materialIndex;

        for (let i = 0, il = source.vertexNormals.length; i < il; i++) {
            this.vertexNormals[i] = source.vertexNormals[i].clone();
        }

        for (let i = 0, il = source.vertexColors.length; i < il; i++) {
            this.vertexColors[i] = source.vertexColors[i].clone();
        }

        return this;
    }
}

export {Face3};