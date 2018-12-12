import {Object3D} from "../core/Object3D";

class Mesh extends Object3D {
    constructor(geometry, material) {
        super();
        this.isMesh = true;
        this.geometry = geometry;
        this.material = material;
    }
}

export {Mesh};