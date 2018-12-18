import {Color} from "../math/Color";
import {NoColors, NormalBlending, FrontSide} from "../constants";

class Material {
    constructor() {
        this.isMaterial = true;
        this.color = new Color(0xffffff);
        this.vertexColors = NoColors; // THREE.NoColors=1, THREE.VertexColors=2, THREE.FaceColors=3

        this.blending = NormalBlending;
        this.side = FrontSide;
        this.opacity = 1;
        this.transparent = false;

        this.overdraw = 0; // Overdrawn pixels (typically between 0 and 1) for fixing antialiasing gaps in CanvasRenderer
        this.visible = true;

        this.needsUpdate = true;
    }

    setValues(values) {
        if (values === undefined) return;
        for (let key in values) {
            let newValue = values[key];
            if (newValue === undefined) {
                console.warn("THREE.Material: '" + key + "' parameter is undefined.");
                continue;
            }
            let currentValue = this[key];
            if (currentValue === undefined) {
                console.warn("THREE." + this.type + ": '" + key + "' is not a property of this material.");
                continue;
            }

            if (currentValue && currentValue.isColor) {
                currentValue.set(newValue);
            }
            else if (key === 'overdraw') {
                // ensure overdraw is backwards-compatible with legacy boolean type
                this[key] = Number(newValue);
            }
            else {
                this[key] = newValue;
            }
        }
    }
}

export {Material};