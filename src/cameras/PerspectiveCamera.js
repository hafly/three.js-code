import {_Math} from "../math/Math";
import {Camera} from "./Camera";

class PerspectiveCamera extends Camera {
    constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
        super();
        this.type = 'PerspectiveCamera';
        this.fov = fov;
        this.zoom = 1;

        this.near = near;
        this.far = far;

        this.aspect = aspect;
        this.view = null;

        this.updateProjectionMatrix();
    }

    // 更新相机投影矩阵
    updateProjectionMatrix() {
        let near = this.near,
            top = near * Math.tan(_Math.DEG2RAD * 0.5 * this.fov) / this.zoom,
            height = 2 * top,
            width = this.aspect * height,
            left = -width / 2;

        this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far);
        this.projectionMatrixInverse.getInverse(this.projectionMatrix);
    }
}

export {PerspectiveCamera};