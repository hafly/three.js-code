import {Renderer} from "./Renderer";
import {Projector, RenderableFace, RenderableSprite} from "./Projector";
import {SpriteCanvasMaterial} from "../materials/SpriteCanvasMaterial";

let _patterns = {};

class CanvasRenderer extends Renderer {
    constructor() {
        super();
        this.domElement = document.createElement("canvas");
        this.domElement.style.position = "absolute";
        this.context = this.domElement.getContext("2d");

        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.canvasWidthHalf = 0;
        this.canvasHeightHalf = 0;

        this.pixelRatio = 1;

        this.autoClear = true;
        this.sortObjects = true;
        this.sortElements = true;
    }

    setPixelRatio(value) {
        this.pixelRatio = value;
    }

    setSize(width, height) {
        this.domElement.width = width;
        this.domElement.height = height;

        this.canvasWidth = width;
        this.canvasHeight = height;

        this.canvasWidthHalf = Math.floor(this.canvasWidth / 2);
        this.canvasHeightHalf = Math.floor(this.canvasHeight / 2);

        this.context.setTransform(1, 0, 0, 1, this.canvasWidthHalf, this.canvasHeightHalf);
    }

    render(scene, camera) {
        let background = scene.background;
        if (background && background.isColor) {
            this.setOpacity(1);
            this.setBlending(THREE.NormalBlending);
            this.setFillStyle(background.getStyle());
            this.context.fillRect(-this.canvasWidthHalf, -this.canvasHeightHalf, this.canvasWidth, this.canvasHeight);

        } else if (this.autoClear === true) {
            this.clear();
        }

        if (scene.autoUpdate === true) scene.updateMatrixWorld();
        if (camera.parent === null) camera.updateMatrixWorld();

        let projector = new Projector();
        let _renderData = projector.projectScene(scene, camera);

        for (let i = 0; i < _renderData.elements.length; i++) {
            let element = _renderData.elements[i];

            if (element instanceof RenderableFace) {
                this.renderFace(element, element.material);
            }
            else if (element instanceof RenderableSprite) {
                this.renderSprite(element, element.material);
            }
        }
    }

    clear() {
        this.context.clearRect(-this.canvasWidthHalf, -this.canvasHeightHalf, this.canvasWidth, this.canvasHeight);
    }

    renderFace(element, material) {
        this.setOpacity(material.opacity);
        this.setBlending(material.blending);
        this.setFillStyle(material.getStyle());
        this.context.beginPath();
        this.context.moveTo(element.v1.positionScreen.x * this.canvasWidthHalf, -element.v1.positionScreen.y * this.canvasHeightHalf);
        this.context.lineTo(element.v2.positionScreen.x * this.canvasWidthHalf, -element.v2.positionScreen.y * this.canvasHeightHalf);
        this.context.lineTo(element.v3.positionScreen.x * this.canvasWidthHalf, -element.v3.positionScreen.y * this.canvasHeightHalf);
        this.context.lineTo(element.v4.positionScreen.x * this.canvasWidthHalf, -element.v4.positionScreen.y * this.canvasHeightHalf);
        this.context.fill();
        this.context.closePath();
    }

    renderSprite(element, material) {
        this.setOpacity(material.opacity);
        this.setBlending(material.blending);
        let _context = this.context;
        element.x *= this.canvasWidthHalf;
        element.y *= -this.canvasHeightHalf;
        let scaleX = element.scale.x * this.canvasWidthHalf;
        let scaleY = element.scale.y * this.canvasHeightHalf;
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
        // let repeatX = texture.wrapS === THREE.RepeatWrapping || texture.wrapS === THREE.MirroredRepeatWrapping;
        // let repeatY = texture.wrapT === THREE.RepeatWrapping || texture.wrapT === THREE.MirroredRepeatWrapping;
        // let mirrorX = texture.wrapS === THREE.MirroredRepeatWrapping;
        // let mirrorY = texture.wrapT === THREE.MirroredRepeatWrapping;

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
        let pattern = this.context.createPattern(canvas, repeat);
        if (texture.onUpdate) texture.onUpdate(texture);
        return {
            canvas: pattern,
            version: texture.version
        };
    }

    setOpacity(value) {
        this.context.globalAlpha = value;
    }

    // canvas混合模式
    setBlending(value) {
        if (value === THREE.NormalBlending) {
            this.context.globalCompositeOperation = 'source-over';
        } else if (value === THREE.AdditiveBlending) {
            this.context.globalCompositeOperation = 'lighter';
        } else if (value === THREE.SubtractiveBlending) {
            this.context.globalCompositeOperation = 'darker';
        } else if (value === THREE.MultiplyBlending) {
            this.context.globalCompositeOperation = 'multiply';
        }
    }

    setFillStyle(value) {
        this.context.fillStyle = value;
    }

    setStrokeStyle(value) {
        this.context.strokeStyle = value;
    }

    setLineWidth(value) {
        this.context.lineWidth = value;
    }

    // "butt", "round", "square"
    setLineCap(value) {
        this.context.lineCap = value;
    }

    // "butt", "round", "square"
    setLineJoin(value) {
        this.context.lineJoin = value;
    }

    setLineDash(value) {
        this.context.setLineDash = value;
    }
}

export {CanvasRenderer};