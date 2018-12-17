import {Geometry} from "../core/Geometry";
import {BufferGeometry} from "../core/BufferGeometry";
import {Vector3} from "../math/Vector3";
import { Float32BufferAttribute } from '../core/BufferAttribute.js';

// 立方体
class BoxGeometry extends Geometry {
    constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
        super();
        this.type = 'BoxGeometry';

        this.parameters = {
            width: width,
            height: height,
            depth: depth,
            widthSegments: widthSegments,
            heightSegments: heightSegments,
            depthSegments: depthSegments
        };

        this.fromBufferGeometry(new BoxBufferGeometry(width, height, depth, widthSegments, heightSegments, depthSegments));
        this.mergeVertices();
    }
}

class BoxBufferGeometry extends BufferGeometry {
    constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
        super();
        this.type = 'BoxBufferGeometry';

        this.parameters = {
            width: width,
            height: height,
            depth: depth,
            widthSegments: widthSegments,
            heightSegments: heightSegments,
            depthSegments: depthSegments
        };

        let scope = this;

        // buffers

        let indices = [];
        let vertices = [];
        let normals = [];
        let uvs = [];

        // helper letiables

        let numberOfVertices = 0;
        let groupStart = 0;

        // build each side of the box geometry

        buildPlane('z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments, 0); // px
        buildPlane('z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments, 1); // nx
        buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2); // py
        buildPlane('x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments, 3); // ny
        buildPlane('x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments, 4); // pz
        buildPlane('x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments, 5); // nz

        // build geometry

        this.setIndex(indices);
        this.addAttribute('position', new Float32BufferAttribute(vertices, 3));
        this.addAttribute('normal', new Float32BufferAttribute(normals, 3));
        this.addAttribute('uv', new Float32BufferAttribute(uvs, 2));

        function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex) {

            let segmentWidth = width / gridX;
            let segmentHeight = height / gridY;

            let widthHalf = width / 2;
            let heightHalf = height / 2;
            let depthHalf = depth / 2;

            let gridX1 = gridX + 1;
            let gridY1 = gridY + 1;

            let vertexCounter = 0;
            let groupCount = 0;

            let ix, iy;

            let vector = new Vector3();

            // generate vertices, normals and uvs
            for (iy = 0; iy < gridY1; iy++) {
                let y = iy * segmentHeight - heightHalf;
                for (ix = 0; ix < gridX1; ix++) {
                    let x = ix * segmentWidth - widthHalf;

                    // set values to correct vector component
                    vector[u] = x * udir;
                    vector[v] = y * vdir;
                    vector[w] = depthHalf;

                    // now apply vector to vertex buffer
                    vertices.push(vector.x, vector.y, vector.z);

                    // set values to correct vector component
                    vector[u] = 0;
                    vector[v] = 0;
                    vector[w] = depth > 0 ? 1 : -1;

                    // now apply vector to normal buffer
                    normals.push(vector.x, vector.y, vector.z);

                    // uvs
                    uvs.push(ix / gridX);
                    uvs.push(1 - (iy / gridY));

                    // counters
                    vertexCounter += 1;
                }
            }

            // indices

            // 1. you need three indices to draw a single face
            // 2. a single segment consists of two faces
            // 3. so we need to generate six (2*3) indices per segment
            for (iy = 0; iy < gridY; iy++) {
                for (ix = 0; ix < gridX; ix++) {
                    let a = numberOfVertices + ix + gridX1 * iy;
                    let b = numberOfVertices + ix + gridX1 * (iy + 1);
                    let c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                    let d = numberOfVertices + (ix + 1) + gridX1 * iy;

                    // faces
                    indices.push(a, b, d);
                    indices.push(b, c, d);

                    // increase counter
                    groupCount += 6;
                }
            }

            // add a group to the geometry. this will ensure multi material support
            scope.addGroup( groupStart, groupCount, materialIndex );

            // calculate new start value for groups
            groupStart += groupCount;

            // update total number of vertices
            numberOfVertices += vertexCounter;
        }
    }
}

export {BoxGeometry};