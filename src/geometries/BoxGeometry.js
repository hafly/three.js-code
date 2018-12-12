import {Geometry} from "../core/Geometry";
import {Vector3} from "../math/Vector3";
import {Face4} from "../core/Face4";

// 立方体
//    v3----- v0
//   /|      /|
//  v7------v4|
//  | |     | |
//  | |v2---|-|v1
//  |/      |/
//  v6------v5
class BoxGeometry extends Geometry{
    constructor(width, height, depth) {
        super();

        let width_half = width / 2;
        let height_half = height / 2;
        let depth_half = depth / 2;

        this._v(width_half, height_half, -depth_half);  // v0
        this._v(width_half, -height_half, -depth_half);  // v1
        this._v(-width_half, -height_half, -depth_half);  // v2
        this._v(-width_half, height_half, -depth_half);  // v3
        this._v(width_half, height_half, depth_half);  // v4
        this._v(width_half, -height_half, depth_half);  // v5
        this._v(-width_half, -height_half, depth_half);  // v6
        this._v(-width_half, height_half, depth_half);  // v7

        // 对应顶点序号
        this._f4(0, 1, 2, 3); // back
        this._f4(4, 7, 6, 5); // front
        this._f4(0, 4, 5, 1); // left
        this._f4(1, 5, 6, 2); // bottom
        this._f4(2, 6, 7, 3); // right
        this._f4(4, 0, 3, 7); // top
    }

    _v(x, y, z) {
        this.vertices.push(new Vector3(x, y, z));
    }

    _f4(a, b, c, d) {
        this.faces.push(new Face4(a, b, c, d));
    }
}
export {BoxGeometry};