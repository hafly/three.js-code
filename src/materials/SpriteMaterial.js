import {Material} from "./Material";
import {Color} from "../math/Color";

class SpriteMaterial extends Material {
    constructor(parameters) {
        super();
        this.isSpriteMaterial = true;
        this.rotation = 0;
        this.color = new Color(0xffffff);
        this.map = null;

        this.setValues(parameters);
    }
}

export {SpriteMaterial};