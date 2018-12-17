import {Vector3} from "./Vector3";

class Box3 {
    constructor(min = new Vector3(+Infinity, +Infinity, +Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity)) {
        this.isBox3 = true;
        this.min = min;
        this.max = max;
    }

    set(min, max) {
        this.min.copy(min);
        this.max.copy(max);

        return this;
    }

    makeEmpty() {
        this.min.x = this.min.y = this.min.z = +Infinity;
        this.max.x = this.max.y = this.max.z = -Infinity;

        return this;
    }

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
        // using 6 splitting planes to rule out intersections.
        return box.max.x < this.min.x || box.min.x > this.max.x ||
        box.max.y < this.min.y || box.min.y > this.max.y ||
        box.max.z < this.min.z || box.min.z > this.max.z ? false : true;
    }
}

export {Box3};