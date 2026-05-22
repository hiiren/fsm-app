import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const __dirname = import.meta.dirname
const publicDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(publicDir, { recursive: true })

async function generateIcon(size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect fill="#3B82F6" rx="${size * 0.2}" width="${size}" height="${size}"/>
    <text y="${size * 0.72}" x="${size * 0.5}" text-anchor="middle" font-size="${size * 0.6}" font-family="Arial" fill="white" font-weight="bold">D</text>
  </svg>`

  await sharp(Buffer.from(svg)).png().toFile(join(publicDir, `icon-${size}x${size}.png`))
  console.log(`Created icon-${size}x${size}.png`)
}

Promise.all([generateIcon(192), generateIcon(512)])
  .then(() => console.log('Done!'))
  .catch(console.error)
