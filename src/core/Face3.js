import {MeshBasicMaterial} from "../materials/MeshBasicMaterial";

/**
 * 三角面片
 */
class Face3 {
    constructor(a, b, c, color = new MeshBasicMaterial()) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.faceColor = color;
    }

    clone() {
        return new this.constructor().copy(this);
    }

    copy(source) {
        this.a = source.a;
        this.b = source.b;
        this.c = source.c;

        this.color.copy(source.color);

        return this;
    }
}

export {Face3};