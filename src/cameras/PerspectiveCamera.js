import {_Math} from "../math/Math";
import {Camera} from "./Camera";

/**
 * 透视投影相机
 */
class PerspectiveCamera extends Camera {
    constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
        super();
        Object.defineProperty(this, 'isPerspectiveCamera', {value: true});

        this.type = 'PerspectiveCamera';

        this.fov = fov;
        this.zoom = 1;

        this.near = near;
        this.far = far;

        this.aspect = aspect;   // 摄像机视锥体长宽比
        this.view = null;       // 视图范围，通过setViewOffset()来设置（暂未使用）

        this.updateProjectionMatrix();
    }

    // 更新相机投影矩阵（在任何参数被改变以后必须被调用）
    updateProjectionMatrix() {
        let near = this.near,
            top = near * Math.tan(_Math.DEG2RAD * 0.5 * this.fov) / this.zoom,
            height = 2 * top,
            width = this.aspect * height,
            left = -width / 2;

        // 创建透视投影矩阵
        this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far);
        // 更新投影矩阵逆矩阵
        this.projectionMatrixInverse.getInverse(this.projectionMatrix);
    }

    copy(source, recursive) {
        super.copy(source, recursive);

        this.fov = source.fov;
        this.zoom = source.zoom;

        this.near = source.near;
        this.far = source.far;
        this.focus = source.focus;

        this.aspect = source.aspect;
        this.view = source.view === null ? null : Object.assign({}, source.view);

        this.filmGauge = source.filmGauge;
        this.filmOffset = source.filmOffset;

        return this;
    }
}

export {PerspectiveCamera};