import {_Math} from "../math/Math";
import {EventDispatcher} from "./EventDispatcher";
import {Euler} from "../math/Euler";
import {Vector3} from "../math/Vector3";
import {Matrix4} from "../math/Matrix4";
import {Quaternion} from "../math/Quaternion";

let object3DId = 0;
// lookAt()的变量（声明全局变量，避免重复实例化）
let m1 = new Matrix4();
let position = new Vector3();
let target = new Vector3();

/**
 * 三维物体，大部分对象的基类，提供了一系列的属性和方法来对三维空间中的物体进行操纵。
 */
class Object3D extends EventDispatcher {
    constructor() {
        super();

        Object.defineProperty(this, 'id', {value: object3DId++});
        Object.defineProperty(this, 'isObject3D', {value: true});

        this.uuid = _Math.generateUUID();

        this.name = '';
        this.type = 'Object3D';

        this.parent = null;
        this.children = [];

        this.position = new Vector3();
        this.rotation = new Euler();
        this.quaternion = new Quaternion();
        this.scale = new Vector3(1, 1, 1);

        this.up = Object3D.DefaultUp.clone();

        this.matrix = new Matrix4();        // 局部变换（相对于父级的变换）
        this.matrixWorld = new Matrix4();   // 全局变换

        // 当这个属性设置了之后，它将计算每一帧的位移、旋转（四元变换）和缩放矩阵，并重新计算matrixWorld属性。默认为true
        this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;

        // 当这个属性设置了之后，它将计算在那一帧中的matrixWorld，并将这个值重置为false。默认为false
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
        // 本地坐标变换一定会更新世界坐标
        this.matrixWorldNeedsUpdate = true;
    }

    // 更新物体及其子级的全局变换（render中调用）
    updateMatrixWorld(force) {
        // 更新局部坐标
        if (this.matrixAutoUpdate){
            this.updateMatrix();
        }

        // 更新世界坐标
        if (this.matrixWorldNeedsUpdate || force) {
            if (this.parent === null) {
                // 父对象（一般是Scene）
                this.matrixWorld.copy(this.matrix);
            }
            else {
                // 子对象
                this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
            }
            this.matrixWorldNeedsUpdate = false;

            force = false;
        }

        // 必须更新子对象
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

        // 获取quaternion
        this.quaternion.setFromRotationMatrix(m1);
    }

    // 遍历对象
    traverse(callback) {
        callback(this);

        let children = this.children;

        for (let i = 0, l = children.length; i < l; i++) {
            children[i].traverse(callback);
        }
    }

    // 遍历可见对象
    traverseVisible(callback) {
        if (this.visible === false) return;

        callback(this);

        let children = this.children;

        for (let i = 0, l = children.length; i < l; i++) {
            children[i].traverseVisible(callback);
        }
    }

    /**
     * 返回一个表示该物体在世界空间中位置的矢量
     * @param target 结果将被复制到这个Vector3中
     * @returns {*} target
     */
    getWorldPosition(target) {
        if (target === undefined) {
            target = new Vector3();
        }

        this.updateMatrixWorld(true);

        return target.setFromMatrixPosition(this.matrixWorld);
    }

    clone(recursive) {
        return new this.constructor().copy(this, recursive);
    }

    copy(source, recursive) {
        if (recursive === undefined) recursive = true;

        this.name = source.name;

        this.up.copy(source.up);

        this.position.copy(source.position);
        this.quaternion.copy(source.quaternion);
        this.scale.copy(source.scale);

        this.matrix.copy(source.matrix);
        this.matrixWorld.copy(source.matrixWorld);

        this.matrixAutoUpdate = source.matrixAutoUpdate;
        this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

        this.visible = source.visible;
        this.renderOrder = source.renderOrder;

        this.userData = JSON.parse(JSON.stringify(source.userData));

        if (recursive === true) {
            for (let i = 0; i < source.children.length; i++) {
                let child = source.children[i];
                this.add(child.clone());
            }
        }

        return this;
    }
}

Object3D.DefaultUp = new Vector3(0, 1, 0);
Object3D.DefaultMatrixAutoUpdate = true;

export {Object3D};