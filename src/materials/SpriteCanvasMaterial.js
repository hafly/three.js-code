import {Material} from "./Material";
import {Color} from "../math/Color";

class SpriteCanvasMaterial extends Material {
    constructor(parameters) {
        super();
        this.isSpriteCanvasMaterial = true;
        this.color = new Color(0xffffff);
        this.program = function () {};

        this.setValues(parameters);
    }
}

export {SpriteCanvasMaterial};