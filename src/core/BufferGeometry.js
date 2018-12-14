let bufferGeometryId = 1; // BufferGeometry uses odd numbers as Id
class BufferGeometry {
    constructor() {
        this.id = bufferGeometryId += 2;
        this.uuid = _Math.generateUUID();
        this.type = 'BufferGeometry';
        this.isBufferGeometry = true;

        this.index = null;
        this.attributes = {};
    }

    addAttribute(name, attribute) {
        this.attributes[name] = attribute;
        return this;
    }

    getAttribute(name) {
        return this.attributes[name];
    }

    removeAttribute(name) {
        delete this.attributes[name];
        return this;
    }
}

export {BufferGeometry};