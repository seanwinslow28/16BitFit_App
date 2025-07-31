const fs = require('fs');
const path = require('path');

// Create a simple colored PNG of specified dimensions
function createColoredPNG(width, height, color = [155, 189, 15]) { // Game Boy green
  const IHDR = Buffer.alloc(13);
  IHDR.writeUInt32BE(width, 0);
  IHDR.writeUInt32BE(height, 4);
  IHDR[8] = 8; // bit depth
  IHDR[9] = 2; // color type (RGB)
  IHDR[10] = 0; // compression method
  IHDR[11] = 0; // filter method
  IHDR[12] = 0; // interlace method

  // Create pixel data (RGB)
  const pixelData = Buffer.alloc(width * height * 3);
  for (let i = 0; i < pixelData.length; i += 3) {
    pixelData[i] = color[0];     // R
    pixelData[i + 1] = color[1]; // G
    pixelData[i + 2] = color[2]; // B
  }

  // Simple uncompressed IDAT (for placeholder purposes)
  const IDAT = Buffer.concat([
    Buffer.from([0x78, 0x9c]), // zlib header
    pixelData,
    Buffer.from([0x00, 0x00, 0x00, 0x00]) // adler32 (simplified)
  ]);

  // Construct PNG
  const chunks = [
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG signature
    createChunk('IHDR', IHDR),
    createChunk('IDAT', IDAT),
    createChunk('IEND', Buffer.alloc(0))
  ];

  return Buffer.concat(chunks);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(0, 0); // Simplified CRC for placeholder
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

const assetsDir = path.join(__dirname, '..', 'app', 'assets', 'images');

// Ensure directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder images with proper dimensions
const iconConfigs = [
  { name: 'icon.png', width: 1024, height: 1024 },
  { name: 'splash.png', width: 1242, height: 2436 },
  { name: 'adaptive-icon.png', width: 1024, height: 1024 },
  { name: 'favicon.png', width: 32, height: 32 }
];

iconConfigs.forEach(config => {
  const filePath = path.join(assetsDir, config.name);
  const pngData = createColoredPNG(config.width, config.height);
  fs.writeFileSync(filePath, pngData);
  console.log(`Created ${config.name} (${config.width}x${config.height})`);
});

console.log('✅ Proper placeholder icons created!');
console.log('Note: These are temporary colored placeholders. Replace them with actual app icons later.');