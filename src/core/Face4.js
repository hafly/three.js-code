import {Color} from "../math/Color";

// 面
class Face4 {
    constructor(a, b, c, d) {
        this.a = a; // 顶点序号
        this.b = b;
        this.c = c;
        this.d = d;

        this.color = new Color(); // 单面颜色
    }

    clone() {
        return new this.constructor().copy(this);
    }

    copy(source) {
        this.a = source.a;
        this.b = source.b;
        this.c = source.c;
        this.d = source.d;

        this.color.copy(source.color);

        return this;
    }
}

export {Face4};