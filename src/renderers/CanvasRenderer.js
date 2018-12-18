import {Renderer} from "./Renderer";
import {Projector, RenderableFace, RenderableSprite} from "./Projector";
import {Box2} from "../math/Box2";
import {Color} from "../math/Color";
import {NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending, FaceColors} from "../constants";

let _canvas, _context;
let _canvasWidth, _canvasHeight,
    _canvasWidthHalf, _canvasHeightHalf;

let _patterns = {};
let _v1, _v2, _v3,
    _v1x, _v1y, _v2x, _v2y, _v3x, _v3y;
let _clipBox = new Box2(),
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
        if (camera.parent === null) camera.updateMatrixWorld();

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
                    this.renderFace3(_v1, _v2, _v3, element, element.material);
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

    renderFace3(v1, v2, v3, element, material) {
        this.setOpacity(material.opacity);
        this.setBlending(material.blending);

        _v1x = v1.positionScreen.x, _v1y = v1.positionScreen.y;
        _v2x = v2.positionScreen.x, _v2y = v2.positionScreen.y;
        _v3x = v3.positionScreen.x, _v3y = v3.positionScreen.y;

        this.drawTriangle(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y);
        if (material.isMeshBasicMaterial) {
            if (material.map != null) {
                console.log("暂未实现");
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

    textureToPattern(texture) {
        if (texture.version === 0) {
            return {
                canvas: undefined,
                version: texture.version
            };
        }
        let image = texture.image;
        if (image.complete === false) {
            return {
                canvas: undefined,
                version: 0
            };
        }
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