import {Matrix4} from "../math/Matrix4";
import {Object3D} from "../core/Object3D";

class Camera extends Object3D {
    constructor() {
        super();
        this.isCamera = true;

        // 投影矩阵
        this.projectionMatrix = new Matrix4();
        // 投影矩阵逆矩阵
        this.projectionMatrixInverse = new Matrix4();

        // matrixWorld逆矩阵
        this.matrixWorldInverse = new Matrix4();
    }

    // 重写父类
    updateMatrixWorld(force) {
        if (this.matrixAutoUpdate) this.updateMatrix();
        if (this.matrixWorldNeedsUpdate || force) {
            if (this.parent === null) {
                this.matrixWorld.copy(this.matrix);
            } else {
                this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
            }
            this.matrixWorldNeedsUpdate = false;
            force = true;
        }

        // update children

        let children = this.children;
        for (let i = 0, l = children.length; i < l; i++) {
            children[i].updateMatrixWorld(force);
        }

        // 更新逆矩阵
        this.matrixWorldInverse.getInverse( this.matrixWorld );
    }
}

export {Camera};