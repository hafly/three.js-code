import {Geometry} from "../core/Geometry";
import {BufferGeometry} from "../core/BufferGeometry";
import {Float32BufferAttribute} from '../core/BufferAttribute.js';
import {Vector2} from "../math/Vector2";
import {Vector3} from "../math/Vector3";

class CylinderGeometry extends Geometry {
    constructor(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength) {
        super();
        this.type = 'CylinderGeometry';

        this.parameters = {
            radiusTop: radiusTop,
            radiusBottom: radiusBottom,
            height: height,
            radialSegments: radialSegments,
            heightSegments: heightSegments,
            openEnded: openEnded,
            thetaStart: thetaStart,
            thetaLength: thetaLength
        };

        this.fromBufferGeometry(new CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength));
        this.mergeVertices();
    }
}

class CylinderBufferGeometry extends BufferGeometry {
    constructor(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2) {
        super();
        this.type = 'CylinderBufferGeometry';

        this.parameters = {
            radiusTop: radiusTop,
            radiusBottom: radiusBottom,
            height: height,
            radialSegments: radialSegments,
            heightSegments: heightSegments,
            openEnded: openEnded,
            thetaStart: thetaStart,
            thetaLength: thetaLength
        };

        let scope = this;
        // buffers

        let indices = [];
        let vertices = [];
        let normals = [];
        let uvs = [];

        // helper variables

        let index = 0;
        let indexArray = [];
        let halfHeight = height / 2;
        let groupStart = 0;

        // generate geometry

        generateTorso();

        if (openEnded === false) {

            if (radiusTop > 0) generateCap(true);
            if (radiusBottom > 0) generateCap(false);

        }

        // build geometry

        this.setIndex(indices);
        this.addAttribute('position', new Float32BufferAttribute(vertices, 3));
        this.addAttribute('normal', new Float32BufferAttribute(normals, 3));
        this.addAttribute('uv', new Float32BufferAttribute(uvs, 2));

        function generateTorso() {

            let x, y;
            let normal = new Vector3();
            let vertex = new Vector3();

            let groupCount = 0;

            // this will be used to calculate the normal
            let slope = (radiusBottom - radiusTop) / height;

            // generate vertices, normals and uvs

            for (y = 0; y <= heightSegments; y++) {

                let indexRow = [];

                let v = y / heightSegments;

                // calculate the radius of the current row

                let radius = v * (radiusBottom - radiusTop) + radiusTop;

                for (x = 0; x <= radialSegments; x++) {

                    let u = x / radialSegments;

                    let theta = u * thetaLength + thetaStart;

                    let sinTheta = Math.sin(theta);
                    let cosTheta = Math.cos(theta);

                    // vertex

                    vertex.x = radius * sinTheta;
                    vertex.y = -v * height + halfHeight;
                    vertex.z = radius * cosTheta;
                    vertices.push(vertex.x, vertex.y, vertex.z);

                    // normal

                    normal.set(sinTheta, slope, cosTheta).normalize();
                    normals.push(normal.x, normal.y, normal.z);

                    // uv

                    uvs.push(u, 1 - v);

                    // save index of vertex in respective row

                    indexRow.push(index++);

                }

                // now save vertices of the row in our index array

                indexArray.push(indexRow);

            }

            // generate indices

            for (x = 0; x < radialSegments; x++) {

                for (y = 0; y < heightSegments; y++) {

                    // we use the index array to access the correct indices

                    let a = indexArray[y][x];
                    let b = indexArray[y + 1][x];
                    let c = indexArray[y + 1][x + 1];
                    let d = indexArray[y][x + 1];

                    // faces

                    indices.push(a, b, d);
                    indices.push(b, c, d);

                    // update group counter

                    groupCount += 6;

                }

            }

            // add a group to the geometry. this will ensure multi material support

            scope.addGroup(groupStart, groupCount, 0);

            // calculate new start value for groups

            groupStart += groupCount;

        }

        function generateCap(top) {

            let x, centerIndexStart, centerIndexEnd;

            let uv = new Vector2();
            let vertex = new Vector3();

            let groupCount = 0;

            let radius = (top === true) ? radiusTop : radiusBottom;
            let sign = (top === true) ? 1 : -1;

            // save the index of the first center vertex
            centerIndexStart = index;

            // first we generate the center vertex data of the cap.
            // because the geometry needs one set of uvs per face,
            // we must generate a center vertex per face/segment

            for (x = 1; x <= radialSegments; x++) {

                // vertex

                vertices.push(0, halfHeight * sign, 0);

                // normal

                normals.push(0, sign, 0);

                // uv

                uvs.push(0.5, 0.5);

                // increase index

                index++;

            }

            // save the index of the last center vertex

            centerIndexEnd = index;

            // now we generate the surrounding vertices, normals and uvs

            for (x = 0; x <= radialSegments; x++) {

                let u = x / radialSegments;
                let theta = u * thetaLength + thetaStart;

                let cosTheta = Math.cos(theta);
                let sinTheta = Math.sin(theta);

                // vertex

                vertex.x = radius * sinTheta;
                vertex.y = halfHeight * sign;
                vertex.z = radius * cosTheta;
                vertices.push(vertex.x, vertex.y, vertex.z);

                // normal

                normals.push(0, sign, 0);

                // uv

                uv.x = (cosTheta * 0.5) + 0.5;
                uv.y = (sinTheta * 0.5 * sign) + 0.5;
                uvs.push(uv.x, uv.y);

                // increase index

                index++;

            }

            // generate indices

            for (x = 0; x < radialSegments; x++) {

                let c = centerIndexStart + x;
                let i = centerIndexEnd + x;

                if (top === true) {

                    // face top

                    indices.push(i, i + 1, c);

                } else {

                    // face bottom

                    indices.push(i + 1, i, c);

                }

                groupCount += 3;

            }

            // add a group to the geometry. this will ensure multi material support

            scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);

            // calculate new start value for groups

            groupStart += groupCount;

        }
    }
}

export {CylinderGeometry,CylinderBufferGeometry};