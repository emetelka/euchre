#!/usr/bin/env node
/**
 * Generate PWA icons from SVG
 *
 * This script converts the icon.svg to PNG files at required sizes.
 * Requires sharp library: npm install --save-dev sharp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, 'public/icons/icon.svg');
const outputDir = path.join(__dirname, 'public/icons');

// Icon sizes to generate
const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
];

async function generateIcons() {
  console.log('Reading SVG file...');
  const svgBuffer = fs.readFileSync(svgPath);

  for (const { name, size } of sizes) {
    const outputPath = path.join(outputDir, name);
    console.log(`Generating ${name} (${size}x${size})...`);

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Created ${name}`);
    } catch (err) {
      console.error(`✗ Failed to create ${name}:`, err.message);
    }
  }

  console.log('\nIcon generation complete!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
