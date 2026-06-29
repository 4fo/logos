const sharp = require('sharp');
const fs = require('fs');

const MASTER = 'LOGOS_logo/logos-icon-master.png';
const RES_DIR = 'android/app/src/main/res';
const BG = { r: 230, g: 230, b: 230, alpha: 1 }; // #e6e6e6

const DENS = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

(async () => {
  // ======== Adaptive foreground: master → 108×108 transparent ========
  const fg = await sharp(MASTER).resize(108, 108).png().toBuffer();

  await sharp(fg).toFile(RES_DIR + '/mipmap-anydpi-v26/ic_launcher_foreground.png');
  for (const d of DENS) {
    await sharp(fg).resize(d.size, d.size).png().toFile(
      RES_DIR + '/' + d.dir + '/ic_launcher_foreground.png'
    );
  }
  console.log('OK foreground');

  // ======== Legacy icons: master → size, composited over #e6e6e6 ========
  for (const d of DENS) {
    const icon = await sharp(MASTER).resize(d.size, d.size).png().toBuffer();
    const bg = await sharp({
      create: { width: d.size, height: d.size, channels: 4, background: BG }
    }).png().toBuffer();

    await sharp(bg).composite([{ input: icon }]).png().toFile(
      RES_DIR + '/' + d.dir + '/ic_launcher.png'
    );
    await sharp(bg).composite([{ input: icon }]).png().toFile(
      RES_DIR + '/' + d.dir + '/ic_launcher_round.png'
    );
    console.log('OK legacy ' + d.dir);
  }

  console.log('Done.');
})();
