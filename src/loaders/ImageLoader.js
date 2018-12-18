class ImageLoader {
    load(url, onLoad) {
        let image = new Image();
        image.addEventListener('load', function () {
            if (onLoad !== undefined) {
                onLoad(this);
            }
        }, false);
        image.src = url;
        return image;
    }
}

export {ImageLoader};