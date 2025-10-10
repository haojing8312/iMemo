/**
 * 生成 4:3 比例的白底 PNG 图片
 * 用于 nano banana 生图时的底图
 */

const fs = require('fs');
const path = require('path');

// 图片规格
const WIDTH = 800;
const HEIGHT = 600; // 4:3 比例
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'templates');
const OUTPUT_FILE = 'white-base-4x3.png';

// 创建输出目录
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// PNG 文件头和数据
function generateWhitePNG(width, height) {
  // 使用 Canvas API (需要 node-canvas 或者纯 Buffer 方式)
  // 这里使用纯 Buffer 方式生成最简单的白色 PNG

  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // chunk length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // bit depth
  ihdr.writeUInt8(2, 17); // color type (RGB)
  ihdr.writeUInt8(0, 18); // compression
  ihdr.writeUInt8(0, 19); // filter
  ihdr.writeUInt8(0, 20); // interlace

  // 计算 CRC
  const crc = require('zlib').crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(crc, 21);

  // IDAT chunk (白色像素数据 - 压缩)
  const zlib = require('zlib');
  const rowBytes = width * 3; // RGB, 每像素 3 字节
  const pixelData = Buffer.alloc(height * (rowBytes + 1)); // +1 for filter byte

  for (let y = 0; y < height; y++) {
    const rowStart = y * (rowBytes + 1);
    pixelData[rowStart] = 0; // filter type: none

    // 填充白色 (255, 255, 255)
    for (let x = 0; x < rowBytes; x++) {
      pixelData[rowStart + 1 + x] = 255;
    }
  }

  const compressed = zlib.deflateSync(pixelData, { level: 9 });
  const idat = Buffer.alloc(compressed.length + 12);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);
  const idatCrc = require('zlib').crc32(idat.slice(4, 8 + compressed.length));
  idat.writeUInt32BE(idatCrc, 8 + compressed.length);

  // IEND chunk
  const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);

  // 合并所有部分
  return Buffer.concat([PNG_SIGNATURE, ihdr, idat, iend]);
}

// 生成图片
console.log(`生成 ${WIDTH}x${HEIGHT} (4:3) 白底 PNG 图片...`);

try {
  const pngBuffer = generateWhitePNG(WIDTH, HEIGHT);
  const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);

  fs.writeFileSync(outputPath, pngBuffer);

  console.log(`✅ 成功生成白底图片:`);
  console.log(`   路径: ${outputPath}`);
  console.log(`   尺寸: ${WIDTH}x${HEIGHT}px (4:3)`);
  console.log(`   大小: ${(pngBuffer.length / 1024).toFixed(2)} KB`);
  console.log(`\n📋 使用说明:`);
  console.log(`   1. 在 nano banana 中上传此图片作为底图`);
  console.log(`   2. 使用 inpainting/img2img 模式生成内容`);
  console.log(`   3. 确保输出比例保持 4:3`);

} catch (error) {
  console.error('❌ 生成失败:', error.message);
  process.exit(1);
}
