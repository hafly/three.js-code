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

    getX( index ) {
        return this.array[ index * this.itemSize ];
    }

    getY( index ) {
        return this.array[ index * this.itemSize + 1 ];
    }

    getZ( index ) {
        return this.array[ index * this.itemSize + 2 ];
    }

    setXYZ(index, x, y, z) {
        index *= this.itemSize;

        this.array[index + 0] = x;
        this.array[index + 1] = y;
        this.array[index + 2] = z;

        return this;
    }

    onUploadCallback() {
    }
}

class Int8BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
        super(new Int8Array(array), itemSize, normalized);
    }
}
class Uint8BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
        super(new Uint8Array(array), itemSize, normalized);
    }
}

class Int16BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
        super(new Int16Array(array), itemSize, normalized);
    }
}
class Uint16BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
        super(new Uint16Array(array), itemSize, normalized);
    }
}

class Int32BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
        super(new Int32Array(array), itemSize, normalized);
    }
}
class Uint32BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
        super(new Uint32Array(array), itemSize, normalized);
    }
}

class Int64BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
        super(new Int64Array(array), itemSize, normalized);
    }
}
class Float32BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
        super(new Float32Array(array), itemSize, normalized);
    }
}

class Float64BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
        super(new Float64Array(array), itemSize, normalized);
    }
}

export {
    BufferAttribute,
    Int8BufferAttribute,
    Uint8BufferAttribute,
    Int16BufferAttribute,
    Uint16BufferAttribute,
    Int32BufferAttribute,
    Uint32BufferAttribute,
    Int64BufferAttribute,
    Float32BufferAttribute,
    Float64BufferAttribute
};