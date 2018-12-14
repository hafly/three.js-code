import {BufferGeometry} from "./BufferGeometry";

class BufferAttribute {
    constructor(array, itemSize, normalized = true) {
        this.isBufferAttribute = true;
        this.array = array;
        this.itemSize = itemSize;
        this.normalized = normalized;

        this.count = array.length;
        this.version = 0;
    }

    set needsUpdate(value) {
        if (value === true) this.version++;
    }

    onUploadCallback() {
    }
}


class Int8BufferAttribute extends BufferGeometry {
    constructor(array, itemSize, normalized) {
        super(new Int8Array(array), itemSize, normalized);
    }
}
class UInt8BufferAttribute extends BufferGeometry {
    constructor(array, itemSize, normalized) {
        super(new UInt8Array(array), itemSize, normalized);
    }
}

class Int16BufferAttribute extends BufferGeometry {
    constructor(array, itemSize, normalized) {
        super(new Int16Array(array), itemSize, normalized);
    }
}
class UInt16BufferAttribute extends BufferGeometry {
    constructor(array, itemSize, normalized) {
        super(new UInt16Array(array), itemSize, normalized);
    }
}

class Int32BufferAttribute extends BufferGeometry {
    constructor(array, itemSize, normalized) {
        super(new Int32Array(array), itemSize, normalized);
    }
}
class UInt32BufferAttribute extends BufferGeometry {
    constructor(array, itemSize, normalized) {
        super(new UInt32Array(array), itemSize, normalized);
    }
}

class Int64BufferAttribute extends BufferGeometry {
    constructor(array, itemSize, normalized) {
        super(new Int64Array(array), itemSize, normalized);
    }
}
class UInt64BufferAttribute extends BufferGeometry {
    constructor(array, itemSize, normalized) {
        super(new UInt64Array(array), itemSize, normalized);
    }
}

export {
    BufferAttribute,
    Int8BufferAttribute,
    UInt8BufferAttribute,
    Int16BufferAttribute,
    UInt16BufferAttribute,
    Int32BufferAttribute,
    UInt32BufferAttribute,
    Int64BufferAttribute,
    UInt64BufferAttribute
};