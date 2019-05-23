let _Math = {
    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,

    // 生成一个36位的uuid通用唯一识别码
    generateUUID: (function () {
        let lut = [];
        for (let i = 0; i < 256; i++) {
            lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
        }

        return function generateUUID() {
            let d0 = Math.random() * 0xffffffff | 0;
            let d1 = Math.random() * 0xffffffff | 0;
            let d2 = Math.random() * 0xffffffff | 0;
            let d3 = Math.random() * 0xffffffff | 0;
            let uuid = lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
                lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
                lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
                lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
            // .toUpperCase() here flattens concatenated strings to save heap memory space.
            return uuid.toUpperCase();
        };
    })(),

    // 限制最小最大值
    clamp: function (value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    // 计算m % n的欧几里得模
    euclideanModulo: function (n, m) {
        return ((n % m) + m) % m;
    },

    // 线性插值
    lerp: function (x, y, t) {
        return (1 - t) * x + t * y;
    },

    // 和lerp类似，在最小和最大值之间的插值，并在限制处渐入渐出。三次平滑插值
    // 返回0-1之间的值，该值表示x在最小值和最大值之间移动的百分比，但当x接近最小值和最大值时，则使其平滑或减慢
    smoothstep: function (x, min, max) {
        if (x <= min) return 0;
        if (x >= max) return 1;
        x = (x - min) / (max - min);
        return x * x * (3 - 2 * x);
    },
    // 五次平滑插值
    smootherstep: function (x, min, max) {
        if (x <= min) return 0;
        if (x >= max) return 1;
        x = (x - min) / (max - min);
        return x * x * x * (x * (x * 6 - 15) + 10);
    },

    randInt: function (low, high) {
        return low + Math.floor(Math.random() * (high - low + 1));
    },

    randFloat: function (low, high) {
        return low + Math.random() * (high - low);
    },

    // Random float from <-range/2, range/2> interval
    randFloatSpread: function (range) {
        return range * (0.5 - Math.random());
    },

    // 角度转弧度
    degToRad: function (degrees) {
        return degrees * _Math.DEG2RAD;
    },

    // 弧度转角度
    radToDeg: function (radians) {
        return radians * _Math.RAD2DEG;
    },

    // 是否是2的幂
    isPowerOfTwo: function (value) {
        return (value & (value - 1)) === 0 && value !== 0;
    },

    ceilPowerOfTwo: function (value) {
        return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
    },

    floorPowerOfTwo: function (value) {
        return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
    }
};

export {_Math};