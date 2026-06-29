const sharp = require('sharp');
const fs = require('fs');

const SVG_PATH = 'LOGOS_logo/Logos_App_Logo.svg';
const RES_DIR = 'android/app/src/main/res';

const DENS = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

(async () => {
  let src = fs.readFileSync(SVG_PATH, 'utf-8');

  // Remove <rect ... /> — find the actual rect element
  const rectStart = src.indexOf('<rect');
  const rectEnd = src.indexOf('/>', rectStart) + 2;
  let body = src.slice(0, rectStart) + src.slice(rectEnd);

  // Remove path2 and path3 (decorative paths, not the line)
  body = body.replace(/<path\s+id="path2"[^>]*\/>/g, '');
  body = body.replace(/<path\s+id="path3"[^>]*\/>/g, '');

  // Remove newlines around empty space
  body = body.replace(/\n{3,}/g, '\n\n');

  // Make text and strokes white
  let whiteBody = body
    .replace(/fill:#333333/g, 'fill:#FFFFFF')
    .replace(/fill:#4d4d4d/g, 'fill:#FFFFFF')
    .replace(/stroke:#333333/g, 'stroke:#FFFFFF');

  // ======== LEGACY ICONS: white text / line on dark background ========
  const svgClose = whiteBody.indexOf('>', whiteBody.indexOf('<svg')) + 1;
  let legacySvg = whiteBody.slice(0, svgClose) +
    '<rect width="100%" height="100%" fill="#0a0a0a"/>' +
    whiteBody.slice(svgClose);

  for (const d of DENS) {
    await sharp(Buffer.from(legacySvg)).resize(d.size, d.size).png().toFile(
      RES_DIR + '/' + d.dir + '/ic_launcher.png'
    );
    await sharp(Buffer.from(legacySvg)).resize(d.size, d.size).png().toFile(
      RES_DIR + '/' + d.dir + '/ic_launcher_round.png'
    );
    console.log('OK legacy ' + d.dir);
  }

  // ======== ADAPTIVE FOREGROUND: white text / line on transparent ========
  const fg = 108;
  let fgBuf = await sharp(Buffer.from(whiteBody)).resize(fg, fg).png().toBuffer();
  await sharp(fgBuf).toFile(RES_DIR + '/mipmap-anydpi-v26/ic_launcher_foreground.png');
  for (const d of DENS) {
    await sharp(fgBuf).resize(d.size, d.size).png().toFile(
      RES_DIR + '/' + d.dir + '/ic_launcher_foreground.png'
    );
  }
  console.log('OK foreground');

  // ======== VERIFY ========
  const verify = p => sharp(p).raw().toBuffer({resolveWithObject: true}).then(buf => {
    let d=buf.data, trans=0, dark=0, white=0, gray=0;
    for (let i=0; i<d.length; i+=4) {
      if (d[i+3]<10) trans++;
      else if (d[i]<40&&d[i+1]<40&&d[i+2]<40) dark++;
      else if (d[i]>200&&d[i+1]>200&&d[i+2]>200) white++;
      else gray++;
    }
    return {trans, dark, white, gray, tot: d.length/4};
  });

  const fgInfo = await verify(RES_DIR + '/mipmap-xxxhdpi/ic_launcher_foreground.png');
  console.log('Foreground: trans='+(fgInfo.trans/fgInfo.tot*100).toFixed(1)+'% white='+(fgInfo.white/fgInfo.tot*100).toFixed(1)+'% gray='+(fgInfo.gray/fgInfo.tot*100).toFixed(1)+'%');

  const legInfo = await verify(RES_DIR + '/mipmap-xxxhdpi/ic_launcher.png');
  console.log('Legacy: dark='+(legInfo.dark/legInfo.tot*100).toFixed(1)+'% white='+(legInfo.white/legInfo.tot*100).toFixed(1)+'% gray='+(legInfo.gray/legInfo.tot*100).toFixed(1)+'%');
})();
