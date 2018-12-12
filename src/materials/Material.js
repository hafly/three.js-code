import {Color} from "../math/Color";

class Material {
    constructor() {
        this.isMaterial = true;
        this.color = new Color(0xffffff);
        this.vertexColors = THREE.NoColors; // THREE.NoColors, THREE.VertexColors, THREE.FaceColors

        this.blending = THREE.NormalBlending;
        this.opacity = 1;
        this.transparent = false;
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