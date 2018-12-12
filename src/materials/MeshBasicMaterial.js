import {Material} from "./Material";

class MeshBasicMaterial extends Material {
    constructor(parameters) {
        super();
        this.isMeshBasicMaterial = true;
        this.setValues(parameters);
    }
}

export {MeshBasicMaterial};