import {Vector2} from "./Vector2";

class Box2 {
    constructor(min = new Vector2(+Infinity, +Infinity), max = new Vector2(-Infinity, -Infinity)) {
        this.min = min;
        this.max = max;
    }

    set(min, max) {
        this.min.copy(min);
        this.max.copy(max);

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

    // 应该被盒子包含的点
    expandByPoint(point) {
        this.min.min(point);
        this.max.max(point);

        return this;
    }

    setFromPoints(points) {
        this.makeEmpty();

        for (let i = 0, il = points.length; i < il; i++) {
            this.expandByPoint(points[i]);
        }

        return this;
    }

    intersectsBox(box) {
        // using 4 splitting planes to rule out intersections
        return box.max.x < this.min.x || box.min.x > this.max.x ||
        box.max.y < this.min.y || box.min.y > this.max.y ? false : true;
    }

    // 盒子扩展的距离
    expandByScalar(scalar) {
        this.min.addScalar(-scalar);
        this.max.addScalar(scalar);

        return this;
    }

    intersect(box) {
        this.min.max(box.min);
        this.max.min(box.max);

        return this;
    }

    union(box) {
        this.min.min(box.min);
        this.max.max(box.max);

        return this;
    }
}

export {Box2};