import {Object3D} from "../core/Object3D";
import {BufferGeometry} from "../core/BufferGeometry";
import {LineBasicMaterial} from "../materials/LineBasicMaterial";

class Line extends Object3D {
    constructor(geometry = new BufferGeometry(), material = new LineBasicMaterial({color: 0x000000})) {
        super();
        this.isLine = true;
        this.type = 'Line';
        this.geometry = geometry;
        this.material = material;
    }

    clone() {
        return new this.constructor(this.geometry, this.material).copy(this);
    }
}

export {Line};