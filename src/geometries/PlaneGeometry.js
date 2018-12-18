import {Geometry} from "../core/Geometry";
import {BufferGeometry} from "../core/BufferGeometry";
import {Float32BufferAttribute} from '../core/BufferAttribute.js';

class PlaneGeometry extends Geometry {
    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        super();
        this.type = 'PlaneGeometry';

        this.parameters = {
            width: width,
            height: height,
            widthSegments: widthSegments,
            heightSegments: heightSegments
        };

        this.fromBufferGeometry(new PlaneBufferGeometry(width, height, widthSegments, heightSegments));
        this.mergeVertices();
    }
}

class PlaneBufferGeometry extends BufferGeometry {
    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        super();
        this.type = 'PlaneBufferGeometry';

        this.parameters = {
            width: width,
            height: height,
            widthSegments: widthSegments,
            heightSegments: heightSegments
        };

        let width_half = width / 2;
        let height_half = height / 2;

        let gridX = Math.floor(widthSegments);
        let gridY = Math.floor(heightSegments);

        let gridX1 = gridX + 1;
        let gridY1 = gridY + 1;

        let segment_width = width / gridX;
        let segment_height = height / gridY;

        let ix, iy;

        // buffers
        let indices = [];
        let vertices = [];
        let normals = [];
        let uvs = [];

        // generate vertices, normals and uvs
        for (iy = 0; iy < gridY1; iy++) {
            let y = iy * segment_height - height_half;
            for (ix = 0; ix < gridX1; ix++) {
                let x = ix * segment_width - width_half;

                vertices.push(x, -y, 0);

                normals.push(0, 0, 1);

                uvs.push(ix / gridX);
                uvs.push(1 - (iy / gridY));
            }
        }

        // indices
        for (iy = 0; iy < gridY; iy++) {
            for (ix = 0; ix < gridX; ix++) {
                let a = ix + gridX1 * iy;
                let b = ix + gridX1 * (iy + 1);
                let c = (ix + 1) + gridX1 * (iy + 1);
                let d = (ix + 1) + gridX1 * iy;

                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        // build geometry
        this.setIndex(indices);
        this.addAttribute('position', new Float32BufferAttribute(vertices, 3));
        this.addAttribute('normal', new Float32BufferAttribute(normals, 3));
        this.addAttribute('uv', new Float32BufferAttribute(uvs, 2));
    }
}

export {PlaneGeometry, PlaneBufferGeometry};