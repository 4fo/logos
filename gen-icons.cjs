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
  const src = fs.readFileSync(SVG_PATH, 'utf-8');

  // ======== LEGACY ICONS: SVG as-is (light gray rect, dark text) ========
  for (const d of DENS) {
    await sharp(Buffer.from(src)).resize(d.size, d.size).png().toFile(
      RES_DIR + '/' + d.dir + '/ic_launcher.png'
    );
    await sharp(Buffer.from(src)).resize(d.size, d.size).png().toFile(
      RES_DIR + '/' + d.dir + '/ic_launcher_round.png'
    );
    console.log('OK legacy ' + d.dir);
  }

  // ======== ADAPTIVE FOREGROUND: just remove the rect, keep everything else ========
  const rectStart = src.indexOf('<rect');
  const rectEnd = src.indexOf('/>', rectStart) + 2;
  const fgSvg = src.slice(0, rectStart) + src.slice(rectEnd);

  const fgSize = 108;
  const fgBuf = await sharp(Buffer.from(fgSvg)).resize(fgSize, fgSize).png().toBuffer();
  await sharp(fgBuf).toFile(RES_DIR + '/mipmap-anydpi-v26/ic_launcher_foreground.png');
  for (const d of DENS) {
    await sharp(fgBuf).resize(d.size, d.size).png().toFile(
      RES_DIR + '/' + d.dir + '/ic_launcher_foreground.png'
    );
  }
  console.log('OK foreground');

  // ======== VERIFY ========
  const verify = async (p) => {
    const buf = await sharp(p).raw().toBuffer({resolveWithObject: true});
    const d = buf.data;
    let trans=0, dark=0, white=0, gray=0;
    for (let i=0; i<d.length; i+=4) {
      if (d[i+3]<10) trans++;
      else if (d[i]<40 && d[i+1]<40 && d[i+2]<40) dark++;
      else if (d[i]>200 && d[i+1]>200 && d[i+2]>200) white++;
      else gray++;
    }
    return {trans, dark, white, gray, tot: d.length/4, w: buf.info.width, h: buf.info.height};
  };

  const fg = await verify(RES_DIR + '/mipmap-xxxhdpi/ic_launcher_foreground.png');
  console.log('Foreground: ' + fg.w + 'x' + fg.h + ' trans=' + (fg.trans/fg.tot*100).toFixed(1) + '% dark=' + (fg.dark/fg.tot*100).toFixed(1) + '% white=' + (fg.white/fg.tot*100).toFixed(1) + '% gray=' + (fg.gray/fg.tot*100).toFixed(1) + '%');

  const leg = await verify(RES_DIR + '/mipmap-xxxhdpi/ic_launcher.png');
  console.log('Legacy: ' + leg.w + 'x' + leg.h + ' trans=' + (leg.trans/leg.tot*100).toFixed(1) + '% dark=' + (leg.dark/leg.tot*100).toFixed(1) + '% white=' + (leg.white/leg.tot*100).toFixed(1) + '% gray=' + (leg.gray/leg.tot*100).toFixed(1) + '%');
})();
