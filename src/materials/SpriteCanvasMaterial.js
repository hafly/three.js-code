import {Material} from "./Material";

class SpriteCanvasMaterial extends Material {
    constructor(parameters) {
        super();
        this.isSpriteCanvasMaterial = true;
        this.color = new THREE.Color(0xffffff);
        this.program = function () {};

        this.setValues(parameters);
    }
}

export {SpriteCanvasMaterial};