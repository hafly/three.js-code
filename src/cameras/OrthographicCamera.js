import {Camera} from "./Camera";

class OrthographicCamera extends Camera {
    constructor(left, right, top, bottom, near = 0.1, far = 2000) {
        super();
        this.type = 'OrthographicCamera';
        this.zoom = 1;
        this.view = null;

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

        if (this.view !== null && this.view.enabled) {
            let zoomW = this.zoom / (this.view.width / this.view.fullWidth);
            let zoomH = this.zoom / (this.view.height / this.view.fullHeight);
            let scaleW = (this.right - this.left) / this.view.width;
            let scaleH = (this.top - this.bottom) / this.view.height;

            left += scaleW * (this.view.offsetX / zoomW);
            right = left + scaleW * (this.view.width / zoomW);
            top -= scaleH * (this.view.offsetY / zoomH);
            bottom = top - scaleH * (this.view.height / zoomH);
        }

        this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);
    }
}

export {OrthographicCamera};