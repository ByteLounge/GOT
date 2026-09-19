const Jimp = require('jimp-compact');
const path = require('path');
const fs = require('fs');

async function createAssets() {
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 1024x1024 icon
  const icon = new Jimp(1024, 1024, 0x1E3A8AFF);
  // Add inner rounded-like square
  icon.scan(256, 256, 512, 512, function(x, y, idx) {
    this.bitmap.data[idx + 0] = 0x25; // R
    this.bitmap.data[idx + 1] = 0x63; // G
    this.bitmap.data[idx + 2] = 0xEB; // B
    this.bitmap.data[idx + 3] = 0xFF; // A
  });
  await icon.writeAsync(path.join(assetsDir, 'icon.png'));
  console.log('Created valid icon.png');

  // 1024x1024 adaptive-icon
  const adaptiveIcon = new Jimp(1024, 1024, 0x1E3A8AFF);
  adaptiveIcon.scan(300, 300, 424, 424, function(x, y, idx) {
    this.bitmap.data[idx + 0] = 0x38;
    this.bitmap.data[idx + 1] = 0xBD;
    this.bitmap.data[idx + 2] = 0xF8;
    this.bitmap.data[idx + 3] = 0xFF;
  });
  await adaptiveIcon.writeAsync(path.join(assetsDir, 'adaptive-icon.png'));
  console.log('Created valid adaptive-icon.png');

  // 1242x2436 splash
  const splash = new Jimp(1242, 2436, 0x0B192CFF);
  await splash.writeAsync(path.join(assetsDir, 'splash.png'));
  console.log('Created valid splash.png');

  // 48x48 favicon
  const favicon = new Jimp(48, 48, 0x1E3A8AFF);
  await favicon.writeAsync(path.join(assetsDir, 'favicon.png'));
  console.log('Created valid favicon.png');
}

createAssets().catch(err => {
  console.error(err);
  process.exit(1);
});
