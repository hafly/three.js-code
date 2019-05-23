export const REVISION = '1';
// 材质附着面
export let FrontSide = 0;   // 正面
export let BackSide = 1;    // 背面
export let DoubleSide = 2;  // 双面
// 作色方式
export let FlatShading = 1;     // GL_FLAT恒定着色
export let SmoothShading = 2;   // GL_SMOOTH平滑着色
// 作色点或面
export let NoColors = 0;    // 顶点没有颜色
export let FaceColors = 1;  // 顶点使用面的颜色
export let VertexColors = 2;// 顶点使用顶点的颜色
// 材质混合模式
export let NoBlending = 0;          // 没有混合
export let NormalBlending = 1;      // 普通混合
export let AdditiveBlending = 2;    // 相加混合
export let SubtractiveBlending = 3; // 相减混合
export let MultiplyBlending = 4;    // 相乘混合
export let CustomBlending = 5;      // 自定义混合
// 纹理映射
export let UVMapping = 300;
// Pixel formats像素颜色格式
export let RGBFormat = 1022;
export let RGBAFormat = 1023;