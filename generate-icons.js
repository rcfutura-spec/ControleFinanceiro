import { writeFileSync } from 'fs'
import { createCanvas } from 'canvas'

// Fallback: generate PNG using raw pixel data as a simple approach
// Since we may not have 'canvas' module, let's create a minimal valid PNG manually

function createPNG(size) {
  // Create a minimal BMP-style icon encoded as PNG
  // We'll generate a proper SVG and also a HTML file that can generate the PNGs

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0a0a0f"/>
  <rect x="${size * 0.06}" y="${size * 0.06}" width="${size * 0.88}" height="${size * 0.88}" rx="${size * 0.15}" fill="#12121a" stroke="#6366f1" stroke-width="${size * 0.015}"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="${size * 0.4}" fill="#6366f1">$</text>
</svg>`
  return svg
}

writeFileSync('public/icon-192.svg', createPNG(192))
writeFileSync('public/icon-512.svg', createPNG(512))
console.log('SVG icons generated')
