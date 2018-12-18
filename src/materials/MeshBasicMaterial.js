import {Material} from "./Material";

class MeshBasicMaterial extends Material {
    constructor(parameters) {
        super();
        this.isMeshBasicMaterial = true;
        this.type = 'MeshBasicMaterial';

        this.map = null;    // 颜色贴图

        this.wireframe = false; // 渲染为线框
        this.wireframeLinewidth = 1;
        this.wireframeLinecap = 'round';
        this.wireframeLinejoin = 'round';

        this.setValues(parameters);
    }
}

export {MeshBasicMaterial};