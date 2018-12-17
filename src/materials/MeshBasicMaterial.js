import {Material} from "./Material";

class MeshBasicMaterial extends Material {
    constructor(parameters) {
        super();
        this.isMeshBasicMaterial = true;
        this.type = 'MeshBasicMaterial';

        this.map = null;

        this.wireframe = false;
        this.wireframeLinewidth = 1;
        this.wireframeLinecap = 'round';
        this.wireframeLinejoin = 'round';

        this.setValues(parameters);
    }
}

export {MeshBasicMaterial};