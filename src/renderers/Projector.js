import {Vector2} from "../math/Vector2";
import {Vector3} from "../math/Vector3";
import {Vector4} from "../math/Vector4";
import {Matrix4} from "../math/Matrix4";
import {Color} from "../math/Color";
import {Box3} from "../math/Box3";
import {MeshBasicMaterial} from "../materials/MeshBasicMaterial";
import {FrontSide, BackSide, DoubleSide, VertexColors} from "../constants";

// 存储对象池
let _object, _face, _vertex, _sprite, _line,
    _objectPool = [], _facePool = [], _vertexPool = [], _spritePool = [], _linePool = [],
    _objectCount = 0, _faceCount = 0, _vertexCount = 0, _spriteCount = 0, _lineCount = 0;

let _vector3 = new Vector3(),
    _vector4 = new Vector4(),
    _clipBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)), // 修剪盒子（设定清除画布的范围）
    _boundingBox = new Box3();  // 包围盒子

let _points3 = new Array(3);

let _viewMatrix = new Matrix4(),            // 相机逆矩阵
    _viewProjectionMatrix = new Matrix4();  // 视图矩阵

let _modelMatrix,                               // 模型矩阵
    _modelViewProjectionMatrix = new Matrix4();

// 裁剪点
let _clippedVertex1PositionScreen = new Vector4(),
    _clippedVertex2PositionScreen = new Vector4();

// 渲染对象
let _renderData = {objects: [], elements: []};

class RenderList {
    constructor() {
        this.object = null;
        this.material = null;

        this.colors = [];   // 顶点 colors 队列
        this.uvs = [];      // 面的 UV 层的队列
    }

    // 设置对象（BufferGeometry支持）
    setObject(value) {
        this.object = value;
        this.material = value.material;

        this.colors.length = 0;
        this.uvs.length = 0;
    }

    // 检查所有渲染对象和子对象
    projectObject(object) {
        let self = this;
        if (object.visible === false) return;
        if (object.isMesh || object.isLine) {
            self.pushObject(object);
        }
        else if (object.isSprite) {
            self.pushObject(object);
        }

        let children = object.children;
        for (let i = 0, l = children.length; i < l; i++) {
            self.projectObject(children[i]);
        }
    }

    // 添加object
    pushObject(object) {
        _object = getNextObjectInPool();
        _object.id = object.id;
        _object.object = object;

        _vector3.setFromMatrixPosition(object.matrixWorld);
        _vector3.applyMatrix4(_viewProjectionMatrix);
        _object.z = _vector3.z;
        _object.renderOrder = object.renderOrder;
        _renderData.objects.push(_object);
    }

    // 投影顶点到屏幕
    projectVertex(vertex) {
        let position = vertex.position;
        let positionWorld = vertex.positionWorld;
        let positionScreen = vertex.positionScreen;

        // 三维转二维
        positionWorld.copy(position).applyMatrix4(_modelMatrix);
        positionScreen.copy(positionWorld).applyMatrix4(_viewProjectionMatrix);

        let invW = 1 / positionScreen.w;

        positionScreen.x *= invW;
        positionScreen.y *= invW;
        positionScreen.z *= invW;

        vertex.visible = positionScreen.x >= -1 && positionScreen.x <= 1 && positionScreen.y >= -1 && positionScreen.y <= 1 && positionScreen.z >= -1 && positionScreen.z <= 1;
    }

    // 添加顶点
    pushVertex(x, y, z) {
        _vertex = getNextVertexInPool();
        _vertex.position.set(x, y, z);
        this.projectVertex(_vertex);
    }

    // 添加粒子且投影到屏幕
    pushPoint(_vector4, object, camera) {
        let invW = 1 / _vector4.w;
        _vector4.z *= invW;
        if (_vector4.z >= -1 && _vector4.z <= 1) {
            _sprite = getNextSpriteInPool();
            _sprite.id = object.id;
            _sprite.renderOrder = object.renderOrder;
            _sprite.rotation = object.rotation;
            _sprite.material = object.material;

            _sprite.x = _vector4.x * invW;
            _sprite.y = _vector4.y * invW;
            _sprite.z = _vector4.z;
            _sprite.scale.x = object.scale.x * Math.abs(_sprite.x - (_vector4.x + camera.projectionMatrix.elements[0]) / (_vector4.w + camera.projectionMatrix.elements[12]));
            _sprite.scale.y = object.scale.y * Math.abs(_sprite.y - (_vector4.y + camera.projectionMatrix.elements[5]) / (_vector4.w + camera.projectionMatrix.elements[13]));

            _renderData.elements.push(_sprite);
        }
    }

    // 添加三角面（BufferGeometry支持）
    pushTriangle(a, b, c) {
        let object = this.object;
        let material = this.material;
        let v1 = _vertexPool[a];
        let v2 = _vertexPool[b];
        let v3 = _vertexPool[c];

        if (checkTriangleVisibility(v1, v2, v3) === false) return;

        if (material.side === DoubleSide || checkBackfaceCulling(v1, v2, v3) === true) {
            _face = getNextFaceInPool();

            _face.id = object.id;
            _face.v1.copy(v1);
            _face.v2.copy(v2);
            _face.v3.copy(v3);
            _face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;
            _face.renderOrder = object.renderOrder;

            // use first vertex normal as face normal

            // _face.normalModel.fromArray(normals, a * 3);
            // _face.normalModel.applyMatrix3(normalMatrix).normalize();

            for (let i = 0; i < 3; i++) {

                // let normal = _face.vertexNormalsModel[i];
                // normal.fromArray(normals, arguments[i] * 3);
                // normal.applyMatrix3(normalMatrix).normalize();

                let uv = _face.uvs[i];
                uv.fromArray(this.uvs, arguments[i] * 2);

            }

            // _face.vertexNormalsLength = 3;

            _face.material = object.material;

            _renderData.elements.push(_face);
        }
    }

    pushLine(a, b) {
        let object = this.object;
        let v1 = _vertexPool[a];
        let v2 = _vertexPool[b];

        // Clip
        v1.positionScreen.copy(v1.position).applyMatrix4(_modelViewProjectionMatrix);
        v2.positionScreen.copy(v2.position).applyMatrix4(_modelViewProjectionMatrix);

        if (clipLine(v1.positionScreen, v2.positionScreen) === true) {
            // Perform the perspective divide
            v1.positionScreen.multiplyScalar(1 / v1.positionScreen.w);
            v2.positionScreen.multiplyScalar(1 / v2.positionScreen.w);

            _line = getNextLineInPool();
            _line.id = object.id;
            _line.v1.copy(v1);
            _line.v2.copy(v2);
            _line.z = Math.max(v1.positionScreen.z, v2.positionScreen.z);
            _line.renderOrder = object.renderOrder;

            _line.material = object.material;

            if (object.material.vertexColors === VertexColors) {
                _line.vertexColors[0].fromArray(colors, a * 3);
                _line.vertexColors[1].fromArray(colors, b * 3);
            }

            _renderData.elements.push(_line);
        }
    }

    // 添加 uv 点
    pushUv(x, y) {
        this.uvs.push(x, y);
    }

    pushColor(r, g, b) {
        this.colors.push(r, g, b);
    }
}

let renderList = new RenderList();

class Projector {
    projectScene(scene, camera, sortObjects, sortElements) {
        _objectCount = 0;
        _faceCount = 0;
        _spriteCount = 0;
        _lineCount = 0;

        _renderData.elements = [];
        _renderData.objects = [];

        _viewMatrix.copy(camera.matrixWorldInverse); // 相机逆矩阵

        // 视图投影矩阵（camera.projectionMatrix = _viewProjectionMatrix * camera.matrixWorld）
        // 当屏幕大小固定时，camera.projectionMatrix不变！camera.matrixWorld的变化影响视图矩阵_viewProjectionMatrix
        _viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, _viewMatrix);

        renderList.projectObject(scene);

        if (sortObjects === true) {
            _renderData.objects.sort(this.painterSort);
        }

        let objects = _renderData.objects;
        for (let o = 0; o < objects.length; o++) {
            let object = objects[o].object;
            let geometry = object.geometry;

            renderList.setObject(object);

            _vertexCount = 0;
            _modelMatrix = object.matrixWorld;

            if (object.isMesh === true) {
                if (geometry.isBufferGeometry === true) {
                    let attributes = geometry.attributes;
                    let groups = geometry.groups;

                    if (attributes.position === undefined) continue;

                    let positions = attributes.position.array;

                    for (let i = 0, l = positions.length; i < l; i += 3) {
                        renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
                    }

                    if (attributes.uv !== undefined) {
                        let uvs = attributes.uv.array;
                        for (let i = 0, l = uvs.length; i < l; i += 2) {
                            renderList.pushUv(uvs[i], uvs[i + 1]);
                        }
                    }

                    if (geometry.index !== null) {
                        let indices = geometry.index.array;

                        if (groups.length > 0) {
                            for (let g = 0; g < groups.length; g++) {
                                let group = groups[g];
                                for (let i = group.start, l = group.start + group.count; i < l; i += 3) {
                                    renderList.pushTriangle(indices[i], indices[i + 1], indices[i + 2]);
                                }
                            }
                        }
                        else {
                            for (let i = 0, l = indices.length; i < l; i += 3) {
                                renderList.pushTriangle(indices[i], indices[i + 1], indices[i + 2]);
                            }
                        }
                    }
                    else {
                        for (let i = 0, l = positions.length / 3; i < l; i += 3) {
                            renderList.pushTriangle(i, i + 1, i + 2);
                        }
                    }
                }
                else if (geometry.isGeometry === true) {
                    let vertices = geometry.vertices;
                    let faces = geometry.faces;
                    let faceVertexUvs = geometry.faceVertexUvs[0];

                    let material = object.material;
                    let isMultiMaterial = Array.isArray(material);

                    // 点
                    for (let v = 0; v < vertices.length; v++) {
                        let vertex = vertices[v];
                        _vector3.copy(vertex);
                        renderList.pushVertex(_vector3.x, _vector3.y, _vector3.z);
                    }

                    // 面
                    for (let f = 0; f < faces.length; f++) {
                        material = isMultiMaterial === true ? object.material[face.materialIndex] : object.material;

                        let face = faces[f];
                        let v1 = _vertexPool[face.a];
                        let v2 = _vertexPool[face.b];
                        let v3 = _vertexPool[face.c];

                        if (checkTriangleVisibility(v1, v2, v3) === false) continue;
                        // 过滤面
                        let visible = checkBackfaceCulling(v1, v2, v3);
                        if (material.side !== DoubleSide) {
                            if (material.side === FrontSide && visible === false) continue;
                            if (material.side === BackSide && visible === true) continue;
                        }

                        _face = getNextFaceInPool();

                        _face.v1.copy(v1);
                        _face.v2.copy(v2);
                        _face.v3.copy(v3);

                        let vertexUvs = faceVertexUvs[f];
                        if (vertexUvs !== undefined) {
                            for (let u = 0; u < 3; u++) {
                                _face.uvs[u].copy(vertexUvs[u]);
                            }
                        }

                        _face.id = object.id;
                        _face.color = face.color;
                        _face.material = material;

                        _face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;
                        _face.renderOrder = object.renderOrder;

                        _renderData.elements.push(_face);
                    }
                }
            }
            else if (object.isSprite === true) {
                _vector4.set(_modelMatrix.elements[12], _modelMatrix.elements[13], _modelMatrix.elements[14], 1);
                _vector4.applyMatrix4(_viewProjectionMatrix);
                renderList.pushPoint(_vector4, object, camera);
            }
            else if (object.isLine === true) {
                _modelViewProjectionMatrix.multiplyMatrices(_viewProjectionMatrix, _modelMatrix);

                if (geometry.isBufferGeometry === true) {
                    let attributes = geometry.attributes;
                    if (attributes.position !== undefined) {
                        let positions = attributes.position.array;
                        for (let i = 0, l = positions.length; i < l; i += 3) {
                            renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
                        }

                        if (attributes.color !== undefined) {
                            let colors = attributes.color.array;
                            for (let i = 0, l = colors.length; i < l; i += 3) {
                                renderList.pushColor(colors[i], colors[i + 1], colors[i + 2]);
                            }
                        }

                        if (geometry.index !== null) {
                            let indices = geometry.index.array;
                            for (let i = 0, l = indices.length; i < l; i += 2) {
                                renderList.pushLine(indices[i], indices[i + 1]);
                            }
                        }
                    }
                }
                else if (geometry.isGeometry === true) {
                    let vertices = object.geometry.vertices;

                    if (vertices.length === 0) continue;

                    let v1 = getNextVertexInPool();
                    v1.positionScreen.copy(vertices[0]).applyMatrix4(_modelViewProjectionMatrix);

                    let step = 1;

                    for (let v = 1, vl = vertices.length; v < vl; v++) {
                        v1 = getNextVertexInPool();
                        v1.positionScreen.copy(vertices[v]).applyMatrix4(_modelViewProjectionMatrix);

                        if ((v + 1) % step > 0) continue;

                        let v2 = _vertexPool[_vertexCount - 2];

                        _clippedVertex1PositionScreen.copy(v1.positionScreen);
                        _clippedVertex2PositionScreen.copy(v2.positionScreen);

                        if (clipLine(_clippedVertex1PositionScreen, _clippedVertex2PositionScreen) === true) {
                            // Perform the perspective divide
                            _clippedVertex1PositionScreen.multiplyScalar(1 / _clippedVertex1PositionScreen.w);
                            _clippedVertex2PositionScreen.multiplyScalar(1 / _clippedVertex2PositionScreen.w);

                            _line = getNextLineInPool();

                            _line.id = object.id;
                            _line.v1.positionScreen.copy(_clippedVertex1PositionScreen);
                            _line.v2.positionScreen.copy(_clippedVertex2PositionScreen);

                            _line.z = Math.max(_clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z);
                            _line.renderOrder = object.renderOrder;

                            _line.material = object.material;

                            if (object.material.vertexColors === VertexColors) {
                                _line.vertexColors[0].copy(object.geometry.colors[v]);
                                _line.vertexColors[1].copy(object.geometry.colors[v - 1]);
                            }

                            _renderData.elements.push(_line);
                        }
                    }
                }
            }
        }

        if (sortElements === true) {
            _renderData.elements.sort(this.painterSort);
        }
        return _renderData;
    }

    painterSort(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.z !== b.z) {
            return b.z - a.z;
        } else if (a.id !== b.id) {
            return a.id - b.id;
        } else {
            return 0;
        }
    }
}

function checkTriangleVisibility(v1, v2, v3) {
    if (v1.visible === true || v2.visible === true || v3.visible === true) return true;

    _points3[0] = v1.positionScreen;
    _points3[1] = v2.positionScreen;
    _points3[2] = v3.positionScreen;

    return _clipBox.intersectsBox(_boundingBox.setFromPoints(_points3));
}

function checkBackfaceCulling(v1, v2, v3) {
    return ((v3.positionScreen.x - v1.positionScreen.x) * (v2.positionScreen.y - v1.positionScreen.y) - (v3.positionScreen.y - v1.positionScreen.y) * (v2.positionScreen.x - v1.positionScreen.x)) < 0;
}

// 裁剪线
function clipLine(s1, s2) {
    let alpha1 = 0, alpha2 = 1,
        // Calculate the boundary coordinate of each vertex for the near and far clip planes,
        // Z = -1 and Z = +1, respectively.
        bc1near = s1.z + s1.w,
        bc2near = s2.z + s2.w,
        bc1far = -s1.z + s1.w,
        bc2far = -s2.z + s2.w;

    if (bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0) {
        // Both vertices lie entirely within all clip planes.
        return true;
    }
    else if ((bc1near < 0 && bc2near < 0) || (bc1far < 0 && bc2far < 0)) {
        // Both vertices lie entirely outside one of the clip planes.
        return false;
    }
    else {
        // The line segment spans at least one clip plane.
        if (bc1near < 0) {
            // v1 lies outside the near plane, v2 inside
            alpha1 = Math.max(alpha1, bc1near / (bc1near - bc2near));
        }
        else if (bc2near < 0) {
            // v2 lies outside the near plane, v1 inside
            alpha2 = Math.min(alpha2, bc1near / (bc1near - bc2near));
        }

        if (bc1far < 0) {
            // v1 lies outside the far plane, v2 inside
            alpha1 = Math.max(alpha1, bc1far / (bc1far - bc2far));
        }
        else if (bc2far < 0) {
            // v2 lies outside the far plane, v2 inside
            alpha2 = Math.min(alpha2, bc1far / (bc1far - bc2far));
        }

        if (alpha2 < alpha1) {
            // The line segment spans two boundaries, but is outside both of them.
            // (This can't happen when we're only clipping against just near/far but good
            //  to leave the check here for future usage if other clip planes are added.)
            return false;
        }
        else {
            // Update the s1 and s2 vertices to match the clipped line segment.
            s1.lerp(s2, alpha1);
            s2.lerp(s1, 1 - alpha2);
            return true;
        }
    }
}

// Object
class RenderableObject {
    constructor() {
        this.id = 0;
        this.object = null;
        this.z = 0;
        this.renderOrder = 0;
    }
}

// Face3
class RenderableFace {
    constructor() {
        this.id = 0;

        this.v1 = new RenderableVertex();
        this.v2 = new RenderableVertex();
        this.v3 = new RenderableVertex();

        this.color = new MeshBasicMaterial();
        this.material = null;
        this.uvs = [new Vector2(), new Vector2(), new Vector2()];

        this.z = 0;
        this.renderOrder = 0;
    }
}

// 顶点
class RenderableVertex {
    constructor() {
        this.position = new Vector3();
        this.positionWorld = new Vector3();
        this.positionScreen = new Vector4();
    }

    copy(vertex) {
        this.position.copy(vertex.position);
        this.positionWorld.copy(vertex.positionWorld);
        this.positionScreen.copy(vertex.positionScreen);
    }
}

// 粒子
class RenderableSprite {
    constructor() {
        this.id = 0;
        this.object = null;

        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.rotation = 0;
        this.scale = new Vector2();

        this.material = null;
        this.renderOrder = 0;
    }
}

// 线
class RenderableLine {
    constructor() {
        this.id = 0;

        this.v1 = new RenderableVertex();
        this.v2 = new RenderableVertex();

        this.vertexColors = [new Color(), new Color()];
        this.material = null;

        this.z = 0;
        this.renderOrder = 0;
    }
}

function getNextObjectInPool() {
    if (_objectCount === _objectPool.length) {
        let object = new RenderableObject();
        _objectPool.push(object);
        _objectCount++;
        return object;
    }
    return _objectPool[_objectCount++];
}

function getNextVertexInPool() {
    if (_vertexCount === _vertexPool.length) {
        let vertex = new RenderableVertex();
        _vertexPool.push(vertex);
        _vertexCount++;
        return vertex;

    }
    return _vertexPool[_vertexCount++];
}

function getNextFaceInPool() {
    if (_faceCount === _facePool.length) {
        let face = new RenderableFace();
        _facePool.push(face);
        _faceCount++;
        return face;

    }
    return _facePool[_faceCount++];
}

function getNextSpriteInPool() {
    if (_spriteCount === _spritePool.length) {
        let sprite = new RenderableSprite();
        _spritePool.push(sprite);
        _spriteCount++;
        return sprite;
    }
    return _spritePool[_spriteCount++];
}

function getNextLineInPool() {
    if (_lineCount === _linePool.length) {
        let line = new RenderableLine();
        _linePool.push(line);
        _lineCount++;
        return line;
    }
    return _linePool[_lineCount++];
}

export {RenderableObject, RenderableFace, RenderableSprite, RenderableLine, Projector};