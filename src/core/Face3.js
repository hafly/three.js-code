import {Color} from "../math/Color";

/**
 * 三角面片
 */
class Face3 {
    // TODO 顶点着色未实现
    constructor(a, b, c, color = new Color(), materialIndex = 0) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.color = color;
        this.materialIndex = materialIndex;
    }

    clone() {
        return new this.constructor().copy(this);
    }

    copy(source) {
        this.a = source.a;
        this.b = source.b;
        this.c = source.c;

        this.color.copy(source.color);
        this.materialIndex = source.materialIndex;

        return this;
    }
}

export {Face3};