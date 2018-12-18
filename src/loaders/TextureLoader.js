import {ImageLoader} from "./ImageLoader";
import {Texture} from "../textures/Texture";
import {RGBFormat, RGBAFormat} from "../constants";

class TextureLoader {
    load(url, onLoad) {
        let texture = new Texture();

        let loader = new ImageLoader();
        loader.load(url, function (image) {
            texture.image = image;
            texture.needsUpdate = true;
            // JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
            let isJPEG = url.search(/\.(jpg|jpeg)$/) > 0 || url.search(/^data\:image\/jpeg/) === 0;
            texture.format = isJPEG ? RGBFormat : RGBAFormat;

            if (onLoad !== undefined) {
                onLoad(texture);
            }
        });

        return texture;
    }
}

export {TextureLoader};