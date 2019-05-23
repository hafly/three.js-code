import {Vector3} from "./Vector3";

/**
 * 用来在三维空间内创建一个立方体边界对象
 */
class Box3 {
    constructor(min = new Vector3(+Infinity, +Infinity, +Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity)) {
        this.min = min;
        this.max = max;
    }

    set(min, max) {
        this.min.copy(min);
        this.max.copy(max);

        return this;
    }

    setFromBufferAttribute(attribute) {
        let minX = +Infinity;
        let minY = +Infinity;
        let minZ = +Infinity;

        let maxX = -Infinity;
        let maxY = -Infinity;
        let maxZ = -Infinity;

        for (let i = 0, l = attribute.count; i < l; i++) {

            let x = attribute.getX(i);
            let y = attribute.getY(i);
            let z = attribute.getZ(i);

            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;

            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;

        }

        this.min.set(minX, minY, minZ);
        this.max.set(maxX, maxY, maxZ);

        return this;
    }

    /**
     * 设置这个盒子的上下边界，来包含所有设置在points参数中的点
     * @param points 点的集合，由这些点确定的空间将被盒子包围
     * @returns {Box3}
     */
    setFromPoints(points) {
        this.makeEmpty();
        for (let i = 0, il = points.length; i < il; i++) {
            this.expandByPoint(points[i]);
        }

        return this;
    }

    clone() {
        return new this.constructor().copy(this);
    }

    copy(box) {
        this.min.copy(box.min);
        this.max.copy(box.max);

        return this;
    }

    makeEmpty() {
        this.min.x = this.min.y = this.min.z = +Infinity;
        this.max.x = this.max.y = this.max.z = -Infinity;

        return this;
    }

    isEmpty() {
        // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
        return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
    }

    // 扩展盒子的边界来包含该点
    expandByPoint(point) {
        this.min.min(point);
        this.max.max(point);

        return this;
    }

    // 按 scalar 的值展开盒子的每个维度。如果是负数，盒子的尺寸会缩小。
    expandByScalar(scalar) {
        this.min.addScalar(-scalar);
        this.max.addScalar(scalar);

        return this;
    }

    // 判断点(point)是否位于盒子的边界内或边界上
    containsPoint(point) {
        return point.x < this.min.x || point.x > this.max.x ||
        point.y < this.min.y || point.y > this.max.y ||
        point.z < this.min.z || point.z > this.max.z ? false : true;
    }

    // 判断与盒子box是否相交
    intersectsBox(box) {
        // using 6 splitting planes to rule out intersections.
        return box.max.x < this.min.x || box.min.x > this.max.x ||
        box.max.y < this.min.y || box.min.y > this.max.y ||
        box.max.z < this.min.z || box.min.z > this.max.z ? false : true;
    }

    // （交集）返回两者的相交后的盒子，并将相交后的盒子的上限设置为两者的上限中的较小者，将下限设置为两者的下限中的较大者
    intersect(box) {
        this.min.max(box.min);
        this.max.min(box.max);

        // ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersects to erroneously return valid values.
        if (this.isEmpty()) this.makeEmpty();

        return this;
    }

    // （并集）在box参数的上边界和该盒子的上边界之间取较大者，而对两者的下边界取较小者，这样获得一个新的较大的联合盒子
    union(box) {
        this.min.min(box.min);
        this.max.max(box.max);

        return this;
    }
}

Object.defineProperty(Box3.prototype, 'isBox3', {value: true});

export {Box3};