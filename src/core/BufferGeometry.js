import {arrayMax} from "../utils";
import {_Math} from "../math/Math";
import {BufferAttribute, Float32BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute} from './BufferAttribute.js';

let bufferGeometryId = 1; // BufferGeometry uses odd numbers as Id
class BufferGeometry {
    constructor() {
        this.id = bufferGeometryId += 2;
        this.uuid = _Math.generateUUID();
        this.type = 'BufferGeometry';
        this.isBufferGeometry = true;

        this.index = null;
        this.attributes = {};

        this.groups = [];
    }

    getIndex() {
        return this.index;
    }

    setIndex(index) {
        if (Array.isArray(index)) {
            this.index = new (arrayMax(index) > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute)(index, 1);
        } else {
            this.index = index;
        }
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

    addGroup(start, count, materialIndex) {
        this.groups.push({
            start: start,
            count: count,
            materialIndex: materialIndex !== undefined ? materialIndex : 0
        });
    }

    clearGroups() {
        this.groups = [];
    }
}

export {BufferGeometry};