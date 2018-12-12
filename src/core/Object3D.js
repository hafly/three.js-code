import {_Math} from "../math/Math";
import {EventDispatcher} from "./EventDispatcher";
import {Euler} from "../math/Euler";
import {Vector3} from "../math/Vector3";
import {Matrix4} from "../math/Matrix4";
import {Quaternion} from "../math/Quaternion";

let m1 = new Matrix4();
let target = new Vector3();
let position = new Vector3();

let objectId = 0;

/**
 * 3D场景中图形对象的基类
 */
class Object3D extends EventDispatcher {
    constructor() {
        super();
        this.isObject3D = true;
        this.id = objectId++;
        this.uuid = _Math.generateUUID();
        this.parent = null;
        this.children = [];

        this.position = new Vector3();
        this.rotation = new Euler();
        this.quaternion = new Quaternion();
        this.scale = new Vector3(1, 1, 1);

        this.up = Object3D.DefaultUp.clone();

        this.matrix = new Matrix4();
        this.matrixWorld = new Matrix4();

        // 默认true，当设置为true时，自动更新局部矩阵。
        this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
        // 默认false，当设置为true时，自动更新世界矩阵，然后重置该属性为false
        this.matrixWorldNeedsUpdate = false;

        // rotation改变后自动更新quaternion
        this.rotation.onChange(() => {
            this.quaternion.setFromEuler(this.rotation, false);
        });

        // quaternion改变后自动更新rotation
        this.quaternion.onChange(() => {
            this.rotation.setFromQuaternion(this.quaternion, undefined, false);
        });

        this.visible = true;
        this.castShadow = false;
        this.receiveShadow = false;

        this.renderOrder = 0;
        this.userData = {};
    }

    // 更新局部变换。位置、旋转、缩放 触发矩阵变化
    updateMatrix() {
        this.matrix.compose(this.position, this.quaternion, this.scale);
        this.matrixWorldNeedsUpdate = true;
    }

    // 更新对象和子对象变换
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
    }

    add(object) {
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) {
                this.add(arguments[i]);
            }
        }

        if (object === this) {
            console.error("THREE.Object3D.add: object can't be added as a child of itself.", object);
            return this;
        }

        if ((object && object.isObject3D)) {
            if (object.parent !== null) {
                object.parent.remove(object);
            }

            object.parent = this;

            this.children.push(object);

        } else {
            console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", object);
        }

        return this;
    }

    remove(object) {
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) {
                this.remove(arguments[i]);
            }

            return this;
        }

        let index = this.children.indexOf(object);

        if (index !== -1) {
            object.parent = null;

            object.dispatchEvent({type: 'removed'});
            this.children.splice(index, 1);
        }

        return this;

    }

    lookAt(v) {
        target.copy(v);

        position.setFromMatrixPosition(this.matrix);

        if (this.isCamera) {
            m1.lookAt(position, target, this.up);
        } else {
            m1.lookAt(target, position, this.up);
        }

        this.quaternion.setFromRotationMatrix(m1);
    }

    // 遍历对象并回调
    traverse(callback) {
        callback(this);

        let children = this.children;

        for (let i = 0, l = children.length; i < l; i++) {
            children[i].traverse(callback);
        }
    }

    traverseVisible(callback) {
        if (this.visible === false) return;

        callback(this);

        let children = this.children;

        for (let i = 0, l = children.length; i < l; i++) {
            children[i].traverseVisible(callback);
        }
    }
}

Object3D.DefaultUp = new Vector3(0, 1, 0);
Object3D.DefaultMatrixAutoUpdate = true;

export {Object3D};