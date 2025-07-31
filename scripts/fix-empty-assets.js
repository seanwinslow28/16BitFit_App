#!/usr/bin/env node
/**
 * Fix empty asset files in the 16BitFit project
 * Scans all assets and replaces empty/corrupted files with valid placeholders
 */

const fs = require('fs-extra');
const path = require('path');

// Create a simple 1x1 pixel transparent PNG
const TRANSPARENT_PNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x01, 0x03, 0x00, 0x00, 0x00, 0x25, 0xDB, 0x56, 0xCA, 0x00, 0x00, 0x00,
  0x03, 0x50, 0x4C, 0x54, 0x45, 0x00, 0x00, 0x00, 0xA7, 0x7A, 0x3D, 0xDA,
  0x00, 0x00, 0x00, 0x01, 0x74, 0x52, 0x4E, 0x53, 0x00, 0x40, 0xE6, 0xD8,
  0x66, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63,
  0x60, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
]);

// Silent MP3 (1 second)
const SILENT_MP3 = Buffer.from(
  'SUQzAwAAAAAADlRTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAD/+0DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAEAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMYXZmNTguMjkuMTAwAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'base64'
);

const ASSETS_DIR = path.join(__dirname, '..', 'app', 'assets');

// Function to check if file is empty, corrupted, or too small
function isFileInvalid(filePath) {
  try {
    const stats = fs.statSync(filePath);
    
    // Check file size
    if (stats.size === 0) {
      return { invalid: true, reason: 'empty file' };
    }
    
    // For image files, check if they're too small to be valid
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg')) {
      if (stats.size < 100) {
        return { invalid: true, reason: 'file too small' };
      }
      
      // Check PNG header
      if (filePath.endsWith('.png')) {
        const buffer = fs.readFileSync(filePath);
        const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
        if (!buffer.slice(0, 4).equals(pngHeader)) {
          return { invalid: true, reason: 'invalid PNG header' };
        }
      }
    }
    
    // For audio files
    if (filePath.endsWith('.mp3') || filePath.endsWith('.wav')) {
      if (stats.size < 500) {
        return { invalid: true, reason: 'audio file too small' };
      }
    }
    
    return { invalid: false };
  } catch (error) {
    return { invalid: true, reason: 'file not found or error reading' };
  }
}

// Function to fix a single file
async function fixFile(filePath, fileType = 'image') {
  const check = isFileInvalid(filePath);
  
  if (check.invalid) {
    try {
      // Ensure directory exists
      await fs.ensureDir(path.dirname(filePath));
      
      // Write appropriate placeholder
      if (fileType === 'audio') {
        await fs.writeFile(filePath, SILENT_MP3);
      } else {
        await fs.writeFile(filePath, TRANSPARENT_PNG);
      }
      
      console.log(`✓ Fixed: ${filePath} (${check.reason})`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to fix ${filePath}:`, error.message);
      return false;
    }
  }
  
  return false;
}

// Scan directory recursively for asset files
async function scanDirectory(dir, baseDir = dir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await scanDirectory(fullPath, baseDir));
        }
      } else if (entry.isFile()) {
        // Check if it's an asset file
        const ext = path.extname(entry.name).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.gif', '.mp3', '.wav', '.ogg'].includes(ext)) {
          files.push({
            path: fullPath,
            relativePath: path.relative(baseDir, fullPath),
            type: ['.mp3', '.wav', '.ogg'].includes(ext) ? 'audio' : 'image'
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
  
  return files;
}

// Main function
async function main() {
  console.log('🔧 16BitFit Asset Fixer');
  console.log('📂 Scanning for empty or corrupted asset files...\n');
  
  let fixedCount = 0;
  let checkedCount = 0;
  
  // Scan all asset files
  const assetFiles = await scanDirectory(ASSETS_DIR);
  
  console.log(`Found ${assetFiles.length} asset files to check\n`);
  
  // Check and fix each file
  for (const asset of assetFiles) {
    checkedCount++;
    const fixed = await fixFile(asset.path, asset.type);
    if (fixed) {
      fixedCount++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Checked: ${checkedCount} files`);
  console.log(`🔧 Fixed: ${fixedCount} files`);
  console.log('='.repeat(50));
  
  if (fixedCount > 0) {
    console.log('\n📋 Next steps:');
    console.log('1. Run "npm run assets:generate" to create proper placeholder assets');
    console.log('2. Run "npm run assets:bundle" to bundle assets for Phaser');
    console.log('3. Test the app to ensure assets load correctly');
  } else {
    console.log('\n✨ All asset files are valid!');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { isFileInvalid, fixFile, scanDirectory };