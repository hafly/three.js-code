import {Material} from "./Material";
import {Color} from "../math/Color";

class LineBasicMaterial extends Material {
    constructor(parameters) {
        super();
        this.isLineBasicMaterial = true;
        this.type = 'LineBasicMaterial';

        this.color = new Color(0xffffff);

        this.linewidth = 1;
        this.linecap = 'round';
        this.linejoin = 'round';

        this.setValues(parameters);
    }
}

export {LineBasicMaterial};