import {Texture} from "./Texture";

class CanvasTexture extends Texture {
    constructor(image) {
        super(image);
        this.needsUpdate = true;
    }
}

export {CanvasTexture};