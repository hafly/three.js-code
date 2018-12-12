import {Object3D} from "../core/Object3D";
import {Color} from "../math/Color";

class Sprite extends Object3D {
    constructor(material) {
        super();
        this.isSprite = true;
        this.material = material;
    }

    clone() {
        return new this.constructor(this.material).copy(this);
    }
}

export {Sprite};