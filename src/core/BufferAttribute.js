/**
 * 缓存属性
 * 用来存储于bufferGeometry相关联的属性数据，例如顶点位置向量，面片索引，法向量，颜色值，UV坐标以及任何自定义 attribute
 */
class BufferAttribute {
    constructor(array, itemSize, normalized = true) {
        if (Array.isArray(array)) {
            throw new TypeError('THREE.BufferAttribute: array should be a Typed Array.');
        }

        this.name='';   // 该 attribute 实例的别名

        this.array = array; // 缓存数据
        this.itemSize = itemSize; // 队列中与顶点相关的数据值的大小。举例，如果 attribute 存储的是三元组（例如顶点空间坐标、法向量或颜色值）则itemSize的值应该是3

        this.count = array.length;
        this.version = 0;   // 版本号，当 needsUpdate 被设置为 true 时，该值会自增
    }

    set needsUpdate(value) {
        if (value === true) this.version++;
    }

    getX(index) {
        return this.array[index * this.itemSize];
    }

    getY(index) {
        return this.array[index * this.itemSize + 1];
    }

    getZ(index) {
        return this.array[index * this.itemSize + 2];
    }

    getW(index) {
        return this.array[index * this.itemSize + 3];
    }

    setXYZ(index, x, y, z) {
        index *= this.itemSize;

        this.array[index + 0] = x;
        this.array[index + 1] = y;
        this.array[index + 2] = z;

        return this;
    }

    setXYZW(index, x, y, z, w) {
        index *= this.itemSize;

        this.array[index + 0] = x;
        this.array[index + 1] = y;
        this.array[index + 2] = z;
        this.array[index + 3] = w;

        return this;
    }
}

Object.defineProperty(BufferAttribute.prototype, 'isBufferAttribute', {value: true});

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