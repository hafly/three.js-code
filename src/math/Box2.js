import {Vector2} from "./Vector2";

/**
 * 通过两个Vector2(二维向量)min,max创建一个二维矩形边界对象.
 * 用法: let min = new Vector2(0,0),max = new Vector2(1,1); let box = new Box2(min,max);
 */
class Box2 {
    // 初始化二维矩形的起始点
    constructor(min = new Vector2(+Infinity, +Infinity), max = new Vector2(-Infinity, -Infinity)) {
        this.min = min;
        this.max = max;
    }

    clone() {
        return new this.constructor().copy(this);
    }

    copy(box) {
        this.min.copy(box.min);
        this.max.copy(box.max);

        return this;
    }

    set(min, max) {
        this.min.copy(min);
        this.max.copy(max);

        return this;
    }

    /**
     * 设置这个盒子的上下边界，来包含所有设置在points参数中的点
     * @param points 点的集合，由这些点确定的空间将被盒子包围
     * @returns {Box2}
     */
    setFromPoints(points) {
        this.makeEmpty();

        for (let i = 0, il = points.length; i < il; i++) {
            this.expandByPoint(points[i]);
        }

        return this;
    }

    makeEmpty() {
        this.min.x = this.min.y = +Infinity;
        this.max.x = this.max.y = -Infinity;

        return this;
    }

    isEmpty() {
        // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
        return (this.max.x < this.min.x) || (this.max.y < this.min.y);
    }

    // 扩展盒子的边界来包含该点
    expandByPoint(point) {
        this.min.min(point);
        this.max.max(point);

        return this;
    }

    // 在每个维度上扩展参数scalar所指定的距离，如果为负数，则盒子空间将收缩
    expandByScalar(scalar) {
        this.min.addScalar(-scalar);
        this.max.addScalar(scalar);

        return this;
    }

    // 判断点(point)是否位于盒子的边界内或边界上
    containsPoint ( point ) {
        return point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y ? false : true;
    }

    // 判断与盒子box是否相交
    intersectsBox(box) {
        // using 4 splitting planes to rule out intersections
        return box.max.x < this.min.x || box.min.x > this.max.x ||
        box.max.y < this.min.y || box.min.y > this.max.y ? false : true;
    }

    // （交集）返回两者的相交后的盒子，并将相交后的盒子的上限设置为两者的上限中的较小者，将下限设置为两者的下限中的较大者
    intersect(box) {
        this.min.max(box.min);
        this.max.min(box.max);

        return this;
    }

    // （并集）在box参数的上边界和该盒子的上边界之间取较大者，而对两者的下边界取较小者，这样获得一个新的较大的联合盒子
    union(box) {
        this.min.min(box.min);
        this.max.max(box.max);

        return this;
    }
}

Object.defineProperty(Box2.prototype, 'isBox2', {value: true});

export {Box2};