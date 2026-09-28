// Builds the email header/footer images from the brand assets:
//   node scripts/build-email-assets.mjs
// Output lands in apps/studio/public/zb/email/ (served from the studio domain).
import sharp from "sharp";

const A = "apps/studio/public/zb/assets/";
const OUT = "apps/studio/public/zb/email/";
const W = 1200, H = 420;

const fur = await sharp(A + "zebra-fur-macro.jpg").resize(W, H, { fit: "cover", position: "centre" }).modulate({ brightness: 0.55 }).toBuffer();
// Fade the fur into the email background (#060608) toward the bottom and edges.
const fade = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060608" stop-opacity=".35"/><stop offset=".62" stop-color="#060608" stop-opacity=".78"/><stop offset="1" stop-color="#060608" stop-opacity="1"/></linearGradient>
    <radialGradient id="c" cx=".5" cy=".46" r=".45"><stop offset="0" stop-color="#060608" stop-opacity=".85"/><stop offset="1" stop-color="#060608" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/><rect width="100%" height="100%" fill="url(#c)"/>
</svg>`);
const mark = await sharp(A + "zebraish-mark.png").resize({ height: 150 }).toBuffer();
const markMeta = await sharp(mark).metadata();
const word = await sharp(A + "zebraish-wordmark.png").resize({ width: 380 }).toBuffer();
const wordMeta = await sharp(word).metadata();

await sharp(fur)
  .composite([
    { input: fade },
    { input: mark, left: Math.round((W - markMeta.width) / 2), top: 70 },
    { input: word, left: Math.round((W - wordMeta.width) / 2), top: 70 + markMeta.height + 26 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUT + "header.jpg");

// Small mark for the footer.
await sharp(A + "zebraish-mark.png").resize({ height: 72 }).png().toFile(OUT + "mark.png");
console.log("email assets written to", OUT);
