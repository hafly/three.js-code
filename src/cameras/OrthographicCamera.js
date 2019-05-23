import {Camera} from "./Camera";

/**
 * 正交相机
 */
class OrthographicCamera extends Camera {
    constructor(left, right, top, bottom, near = 0.1, far = 2000) {
        super();
        Object.defineProperty(this, 'isOrthographicCamera', {value: true});

        this.type = 'OrthographicCamera';

        this.zoom = 1;
        this.view = null;   // 视图范围（暂未使用）

        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;

        this.near = near;
        this.far = far;

        this.updateProjectionMatrix();
    }

    updateProjectionMatrix() {
        let dx = (this.right - this.left) / (2 * this.zoom);
        let dy = (this.top - this.bottom) / (2 * this.zoom);
        let cx = (this.right + this.left) / 2;
        let cy = (this.top + this.bottom) / 2;

        let left = cx - dx;
        let right = cx + dx;
        let top = cy + dy;
        let bottom = cy - dy;

        this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);
        this.projectionMatrixInverse.getInverse(this.projectionMatrix);
    }

    copy(source, recursive) {
        super.copy(source, recursive);

        this.left = source.left;
        this.right = source.right;
        this.top = source.top;
        this.bottom = source.bottom;
        this.near = source.near;
        this.far = source.far;

        this.zoom = source.zoom;
        this.view = source.view === null ? null : Object.assign({}, source.view);

        return this;
    }
}

export {OrthographicCamera};