import {Matrix4} from "../math/Matrix4";
import {Object3D} from "../core/Object3D";

class Camera extends Object3D {
    constructor() {
        super();
        Object.defineProperty(this, 'isCamera', {value: true});

        this.type = 'Camera';

        this.matrixWorldInverse = new Matrix4();        // 世界矩阵逆矩阵

        this.projectionMatrix = new Matrix4();          // 投影矩阵
        this.projectionMatrixInverse = new Matrix4();   // 投影矩阵逆矩阵
    }

    // 更新对象（重写父类）
    updateMatrixWorld(force) {
        super.updateMatrixWorld(force);

        // 更新相机逆矩阵
        this.matrixWorldInverse.getInverse(this.matrixWorld);
    }
}

export {Camera};