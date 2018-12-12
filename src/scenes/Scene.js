import {Object3D} from "../core/Object3D";

class Scene extends Object3D {
    constructor() {
        super();
        this.autoUpdate = true;
        this.background = null;
    }
}

export {Scene};