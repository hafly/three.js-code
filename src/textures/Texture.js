import {EventDispatcher} from "../core/EventDispatcher";
import {_Math} from "../math/Math";
import {Vector2} from "../math/Vector2";
// import {Matrix3} from "../math/Matrix3";
import {UVMapping} from "../constants";

let textureId = 0;

class Texture extends EventDispatcher {
    constructor(image = undefined) {
        super();
        this.id = textureId++;
        // this.uuid = _Math.generateUUID();
        this.image = image;
        this.mapping = UVMapping;   // 纹理映射

        this.offset = new Vector2(0, 0);
        this.repeat = new Vector2(1, 1);
        this.center = new Vector2(0, 0);
        this.rotation = 0;

        this.matrixAutoUpdate = true;
        // this.matrix = new Matrix3();

        this.version = 0;
        this.onUpdate = null;
    }

    clone() {
        return new this.constructor().copy(this);
    }

    dispose() {
        this.dispatchEvent({type: 'dispose'});
    }

    set needsUpdate(value) {
        if (value === true) this.version++;
    }
}

export {Texture};