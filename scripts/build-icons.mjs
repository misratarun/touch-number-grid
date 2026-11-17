// Draws the home-screen icon: two rows of three dots in the app's own colours.
// Run with `npm run icons`; writes PNG files to public/icons/.
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SIZE = 1024;
const dots = [];
for (let r = 0; r < 2; r++)
  for (let c = 0; c < 3; c++)
    dots.push(`<circle cx="${272 + c * 240}" cy="${392 + r * 240}" r="84" fill="${r ? "#9486ad" : "#7fa39c"}"/>`);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
<rect width="${SIZE}" height="${SIZE}" fill="#ecebe6"/>${dots.join("")}</svg>`;

mkdirSync("public/icons", { recursive: true });
for (const [name, size] of [["icon-512", 512], ["icon-192", 192], ["apple-touch-icon", 180]]) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(`public/icons/${name}.png`);
  console.log(`public/icons/${name}.png`);
}
