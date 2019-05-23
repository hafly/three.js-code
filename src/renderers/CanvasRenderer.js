import {Renderer} from "./Renderer";
import {Projector, RenderableFace, RenderableSprite, RenderableLine} from "./Projector";
import {Box2} from "../math/Box2";
import {Color} from "../math/Color";
import {NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending, FaceColors, VertexColors} from "../constants";

let _canvas, _context;
let _canvasWidth, _canvasHeight,
    _canvasWidthHalf, _canvasHeightHalf;

let _patterns = {}, _uvs;
let _v1, _v2, _v3,
    _v1x, _v1y, _v2x, _v2y, _v3x, _v3y;
let _clipBox = new Box2(),  // 裁剪盒子，默认设为canvas大小
    _clearBox = new Box2(), // 清空画布2d盒子模型（不需要全屏清除，只清除绘制部分）
    _elemBox = new Box2();
let _color = new Color();

let _clearColor, _clearAlpha;

class CanvasRenderer extends Renderer {
    constructor(parameters = {}) {
        super();
        this.domElement = _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement('canvas');
        _canvas.style.position = "absolute";
        _context = _canvas.getContext("2d");

        _clearColor = new Color(0x000000);
        _clearAlpha = parameters.alpha === true ? 0 : 1;

        this.width = _canvasWidth = 0;
        this.height = _canvasHeight = 0;
        _canvasWidthHalf = 0;
        _canvasHeightHalf = 0;

        this.pixelRatio = 1;

        this.autoClear = true;
        this.sortObjects = true;
        this.sortElements = true;
    }

    setPixelRatio(value) {
        this.pixelRatio = value;
    }

    setSize(width, height) {
        _canvas.width = width;
        _canvas.height = height;

        _canvasWidth = width;
        _canvasHeight = height;

        _canvasWidthHalf = Math.floor(_canvasWidth / 2);
        _canvasHeightHalf = Math.floor(_canvasHeight / 2);

        _clipBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
        _clipBox.max.set(_canvasWidthHalf, _canvasHeightHalf);

        _clearBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
        _clearBox.max.set(_canvasWidthHalf, _canvasHeightHalf);
    }

    render(scene, camera) {
        if (scene.autoUpdate === true) scene.updateMatrixWorld();
        if (camera.parent === null) camera.updateMatrixWorld(); // 相机不加入到scene的情况，单独更新

        let background = scene.background;
        if (background && background.isColor) {
            this.setOpacity(1);
            this.setBlending(NormalBlending);
            this.setFillStyle(background.getStyle());
            _context.fillRect(0, 0, _canvasWidth, _canvasHeight);

        } else if (this.autoClear === true) {
            this.clear();
        }

        // 通过缩放翻转画布上下方向
        _context.setTransform(1, 0, 0, -1, 0, _canvasHeight);
        // 以画布中心为原点
        _context.translate(_canvasWidthHalf, _canvasHeightHalf);

        let projector = new Projector();
        let _renderData = projector.projectScene(scene, camera, this.sortObjects, this.sortElements);

        for (let i = 0; i < _renderData.elements.length; i++) {
            let element = _renderData.elements[i];
            let material = element.material;

            _elemBox.makeEmpty();

            if (element instanceof RenderableFace) {
                _v1 = element.v1;
                _v2 = element.v2;
                _v3 = element.v3;

                _v1.positionScreen.x *= _canvasWidthHalf, _v1.positionScreen.y *= _canvasHeightHalf;
                _v2.positionScreen.x *= _canvasWidthHalf, _v2.positionScreen.y *= _canvasHeightHalf;
                _v3.positionScreen.x *= _canvasWidthHalf, _v3.positionScreen.y *= _canvasHeightHalf;

                if (material.overdraw > 0) {
                    this.expand(_v1.positionScreen, _v2.positionScreen, material.overdraw);
                    this.expand(_v2.positionScreen, _v3.positionScreen, material.overdraw);
                    this.expand(_v3.positionScreen, _v1.positionScreen, material.overdraw);
                }

                _elemBox.setFromPoints([_v1.positionScreen, _v2.positionScreen, _v3.positionScreen]);

                if (_clipBox.intersectsBox(_elemBox) === true) {
                    this.renderFace3(_v1, _v2, _v3, 0, 1, 2, element, element.material);
                }
            }
            else if (element instanceof RenderableLine) {
                _v1 = element.v1, _v2 = element.v2;

                _v1.positionScreen.x *= _canvasWidthHalf, _v1.positionScreen.y *= _canvasHeightHalf;
                _v2.positionScreen.x *= _canvasWidthHalf, _v2.positionScreen.y *= _canvasHeightHalf;

                _elemBox.setFromPoints([_v1.positionScreen, _v2.positionScreen]);

                if (_clipBox.intersectsBox(_elemBox) === true) {
                    this.renderLine(_v1, _v2, element, material);
                }
            }
            else if (element instanceof RenderableSprite) {
                this.renderSprite(element, element.material);
            }

            _clearBox.union(_elemBox);
        }

        _context.setTransform(1, 0, 0, 1, 0, 0);
    }

    setClearColor(color, alpha = 1) {
        _clearColor.set(color);
        _clearAlpha = alpha;

        _clearBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
        _clearBox.max.set(_canvasWidthHalf, _canvasHeightHalf);
    }

    clear() {
        if (_clearBox.isEmpty() === false) {
            _clearBox.intersect(_clipBox).expandByScalar(4);

            _clearBox.min.x = _clearBox.min.x + _canvasWidthHalf;
            _clearBox.min.y = -_clearBox.min.y + _canvasHeightHalf;		// higher y value !
            _clearBox.max.x = _clearBox.max.x + _canvasWidthHalf;
            _clearBox.max.y = -_clearBox.max.y + _canvasHeightHalf;		// lower y value !


            if (_clearAlpha < 1) {
                _context.clearRect(_clearBox.min.x | 0, _clearBox.max.y | 0, (_clearBox.max.x - _clearBox.min.x) | 0, (_clearBox.min.y - _clearBox.max.y) | 0);
            }

            if (_clearAlpha > 0) {
                this.setOpacity(1);
                this.setBlending(NormalBlending);
                this.setFillStyle('rgba(' + Math.floor(_clearColor.r * 255) + ',' + Math.floor(_clearColor.g * 255) + ',' + Math.floor(_clearColor.b * 255) + ',' + _clearAlpha + ')');

                _context.fillRect(_clearBox.min.x | 0, _clearBox.max.y | 0, (_clearBox.max.x - _clearBox.min.x) | 0, (_clearBox.min.y - _clearBox.max.y) | 0);
            }

            _clearBox.makeEmpty();
        }
    }

    drawTriangle(x0, y0, x1, y1, x2, y2) {
        _context.beginPath();
        _context.moveTo(x0, y0);
        _context.lineTo(x1, y1);
        _context.lineTo(x2, y2);
        _context.closePath();
    }

    strokePath(color, linewidth, linecap, linejoin) {
        this.setLineWidth(linewidth);
        this.setLineCap(linecap);
        this.setLineJoin(linejoin);
        this.setStrokeStyle(color.getStyle());
        _context.stroke();

        _elemBox.expandByScalar(linewidth * 2);
    }

    fillPath(color) {
        this.setFillStyle(color.getStyle());
        _context.fill();
    }

    renderFace3(v1, v2, v3, uv1, uv2, uv3, element, material) {
        this.setOpacity(material.opacity);
        this.setBlending(material.blending);

        _v1x = v1.positionScreen.x, _v1y = v1.positionScreen.y;
        _v2x = v2.positionScreen.x, _v2y = v2.positionScreen.y;
        _v3x = v3.positionScreen.x, _v3y = v3.positionScreen.y;

        this.drawTriangle(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y);
        if (material.isMeshBasicMaterial) {
            if (material.map !== null) {
                // uv贴图
                if (material.map.mapping === THREE.UVMapping) {
                    _uvs = element.uvs;
                    this.patternPath(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uvs[uv1].x, _uvs[uv1].y, _uvs[uv2].x, _uvs[uv2].y, _uvs[uv3].x, _uvs[uv3].y, material.map);
                }
            }
            else {
                _color.copy(material.color);
                if (material.vertexColors === FaceColors) {
                    _color.multiply(element.color);
                }

                material.wireframe === true
                    ? this.strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin)
                    : this.fillPath(_color);
            }
        }
    }

    renderSprite(element, material) {
        this.setOpacity(material.opacity);
        this.setBlending(material.blending);
        element.x *= _canvasWidthHalf;
        element.y *= _canvasHeightHalf;
        let scaleX = element.scale.x * _canvasWidthHalf;
        let scaleY = element.scale.y * _canvasHeightHalf;

        let dist = Math.sqrt(scaleX * scaleX + scaleY * scaleY); // allow for rotated sprite
        _elemBox.min.set(element.x - dist, element.y - dist);
        _elemBox.max.set(element.x + dist, element.y + dist);

        if (material.isSpriteMaterial) {
            let texture = material.map;
            if (texture !== null) {
                let pattern = _patterns[texture.id];
                if (pattern === undefined || pattern.version !== texture.version) {
                    pattern = this.textureToPattern(texture);
                    _patterns[texture.id] = pattern;
                }
                if (pattern.canvas !== undefined) {
                    this.setFillStyle(pattern.canvas);
                    let bitmap = texture.image;

                    let ox = bitmap.width * texture.offset.x;
                    let oy = bitmap.height * texture.offset.y;

                    let sx = bitmap.width * texture.repeat.x;
                    let sy = bitmap.height * texture.repeat.y;

                    let cx = scaleX / sx;
                    let cy = scaleY / sy;

                    _context.save();
                    _context.translate(element.x, element.y);
                    if (material.rotation !== 0) _context.rotate(material.rotation);
                    _context.translate(-scaleX / 2, -scaleY / 2);
                    _context.scale(cx, cy);
                    _context.translate(-ox, -oy);
                    _context.fillRect(ox, oy, sx, sy);
                    _context.restore();
                }
            }
            else {
                this.setFillStyle(material.color.getStyle());

                _context.save();
                _context.translate(element.x, element.y);
                if (material.rotation !== 0) _context.rotate(material.rotation);
                _context.scale(scaleX, -scaleY);
                _context.fillRect(-0.5, -0.5, 1, 1);
                _context.restore();
            }
        }
        else if (material.isSpriteCanvasMaterial) {
            this.setStrokeStyle(material.color.getStyle());
            this.setFillStyle(material.color.getStyle());

            _context.save();
            _context.translate(element.x, element.y);
            if (material.rotation !== 0) _context.rotate(material.rotation);
            _context.scale(scaleX, scaleY);
            material.program(_context);
            _context.restore();
        }
    }

    renderLine(v1, v2, element, material) {
        this.setOpacity(material.opacity);
        this.setBlending(material.blending);

        _context.beginPath();
        _context.moveTo(v1.positionScreen.x, v1.positionScreen.y);
        _context.lineTo(v2.positionScreen.x, v2.positionScreen.y);

        if (material.isLineBasicMaterial) {
            this.setLineWidth(material.linewidth);
            this.setLineCap(material.linecap);
            this.setLineJoin(material.linejoin);
            if (material.vertexColors !== VertexColors) {
                this.setStrokeStyle(material.color.getStyle());
            }
            else {
                var colorStyle1 = element.vertexColors[0].getStyle();
                var colorStyle2 = element.vertexColors[1].getStyle();

                if (colorStyle1 === colorStyle2) {
                    this.setStrokeStyle(colorStyle1);
                }
                else {
                    // 线性渐变
                    try {
                        var grad = _context.createLinearGradient(
                            v1.positionScreen.x,
                            v1.positionScreen.y,
                            v2.positionScreen.x,
                            v2.positionScreen.y
                        );
                        grad.addColorStop(0, colorStyle1);
                        grad.addColorStop(1, colorStyle2);
                    } catch (exception) {
                        grad = colorStyle1;
                    }
                    this.setStrokeStyle(grad);
                }
            }

            _context.stroke();
            _elemBox.expandByScalar(material.linewidth * 2);
        }
    }

    textureToPattern(texture) {
        if (texture.version === 0) {
            return {
                canvas: undefined,
                version: texture.version
            };
        }
        let image = texture.image;

        // TODO VU贴图偏移未实现
        // if (image.complete === false) {
        //     return {
        //         canvas: undefined,
        //         version: 0
        //     };
        // }
        // let repeatX = texture.wrapS === RepeatWrapping || texture.wrapS === MirroredRepeatWrapping;
        // let repeatY = texture.wrapT === RepeatWrapping || texture.wrapT === MirroredRepeatWrapping;
        // let mirrorX = texture.wrapS === MirroredRepeatWrapping;
        // let mirrorY = texture.wrapT === MirroredRepeatWrapping;

        let mirrorX = false;
        let mirrorY = false;
        let canvas = document.createElement('canvas');
        canvas.width = image.width * (mirrorX ? 2 : 1);
        canvas.height = image.height * (mirrorY ? 2 : 1);
        let context = canvas.getContext('2d');
        context.setTransform(1, 0, 0, -1, 0, image.height);
        context.drawImage(image, 0, 0);
        // if (mirrorX === true) {
        //     context.setTransform(-1, 0, 0, -1, image.width, image.height);
        //     context.drawImage(image, -image.width, 0);
        // }
        // if (mirrorY === true) {
        //     context.setTransform(1, 0, 0, 1, 0, 0);
        //     context.drawImage(image, 0, image.height);
        // }
        // if (mirrorX === true && mirrorY === true) {
        //     context.setTransform(-1, 0, 0, 1, image.width, 0);
        //     context.drawImage(image, -image.width, image.height);
        // }
        let repeat = 'no-repeat';
        // if (repeatX === true && repeatY === true) {
        //     repeat = 'repeat';
        // } else if (repeatX === true) {
        //     repeat = 'repeat-x';
        // } else if (repeatY === true) {
        //     repeat = 'repeat-y';
        // }
        let pattern = _context.createPattern(canvas, repeat);
        if (texture.onUpdate) texture.onUpdate(texture);
        return {
            canvas: pattern,
            version: texture.version
        };
    }

    patternPath(x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, texture) {
        let pattern = _patterns[texture.id];

        if (pattern === undefined || pattern.version !== texture.version) {
            pattern = this.textureToPattern(texture);
            _patterns[texture.id] = pattern;
        }

        if (pattern.canvas !== undefined) {
            this.setFillStyle(pattern.canvas);
        } else {
            this.setFillStyle('rgba( 0, 0, 0, 1)');
            _context.fill();
            return;
        }

        // http://extremelysatisfactorytotalitarianism.com/blog/?p=2120
        let a, b, c, d, e, f, det, idet,
            offsetX = texture.offset.x / texture.repeat.x,
            offsetY = texture.offset.y / texture.repeat.y,
            width = texture.image.width * texture.repeat.x,
            height = texture.image.height * texture.repeat.y;

        u0 = (u0 + offsetX) * width;
        v0 = (v0 + offsetY) * height;

        u1 = (u1 + offsetX) * width;
        v1 = (v1 + offsetY) * height;

        u2 = (u2 + offsetX) * width;
        v2 = (v2 + offsetY) * height;

        x1 -= x0;
        y1 -= y0;
        x2 -= x0;
        y2 -= y0;

        u1 -= u0;
        v1 -= v0;
        u2 -= u0;
        v2 -= v0;

        det = u1 * v2 - u2 * v1;

        if (det === 0) return;

        idet = 1 / det;

        a = (v2 * x1 - v1 * x2) * idet;
        b = (v2 * y1 - v1 * y2) * idet;
        c = (u1 * x2 - u2 * x1) * idet;
        d = (u1 * y2 - u2 * y1) * idet;

        e = x0 - a * u0 - c * v0;
        f = y0 - b * u0 - d * v0;

        _context.save();
        _context.transform(a, b, c, d, e, f);
        _context.fill();
        _context.restore();
    }

    // Hide anti-alias gaps
    expand(v1, v2, pixels) {
        let x = v2.x - v1.x, y = v2.y - v1.y,
            det = x * x + y * y, idet;

        if (det === 0) return;
        idet = pixels / Math.sqrt(det);

        x *= idet;
        y *= idet;

        v2.x += x;
        v2.y += y;
        v1.x -= x;
        v1.y -= y;
    }

    setOpacity(value) {
        _context.globalAlpha = value;
    }

    // canvas混合模式
    setBlending(value) {
        if (value === NormalBlending) {
            _context.globalCompositeOperation = 'source-over';
        } else if (value === AdditiveBlending) {
            _context.globalCompositeOperation = 'lighter';
        } else if (value === SubtractiveBlending) {
            _context.globalCompositeOperation = 'darker';
        } else if (value === MultiplyBlending) {
            _context.globalCompositeOperation = 'multiply';
        }
    }

    setFillStyle(value) {
        _context.fillStyle = value;
    }

    setStrokeStyle(value) {
        _context.strokeStyle = value;
    }

    setLineWidth(value) {
        _context.lineWidth = value;
    }

    // "butt", "round", "square"
    setLineCap(value) {
        _context.lineCap = value;
    }

    // "butt", "round", "square"
    setLineJoin(value) {
        _context.lineJoin = value;
    }

    setLineDash(value) {
        _context.setLineDash = value;
    }
}

export {CanvasRenderer};