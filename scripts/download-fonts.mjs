import { writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { get } from 'https';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'public', 'fonts');
mkdirSync(DIR, { recursive: true });

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

const url = 'https://fonts.googleapis.com/css2?family=Rosarivo:ital,wght@0,400;1,400&family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Baskervville:ital,wght@0,400;1,400&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400&family=Literata:ital,wght@0,400;0,700;1,400&family=Charis+SIL:ital,wght@0,400;0,700;1,400&family=Alegreya:ital,wght@0,400;0,700;1,400&display=swap';

function fetch(url) {
  return new Promise((resolve, reject) => {
    get(url, { headers: { 'User-Agent': UA } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    get(url, { headers: { 'User-Agent': UA } }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        writeFileSync(dest, Buffer.concat(chunks));
        const size = chunks.reduce((a, c) => a + c.length, 0);
        console.log(`  OK ${(size / 1024).toFixed(1)}K`);
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching font CSS...');
  const css = await fetch(url);

  const blocks = css.split('@font-face').filter(b => b.includes('font-family'));

  for (const block of blocks) {
    const family = block.match(/font-family:\s*'([^']+)'/)[1];
    const style = block.match(/font-style:\s*(\w+)/)[1];
    const weight = block.match(/font-weight:\s*(\d+)/)[1];
    const src = block.match(/url\(([^)]+)\)/)[1];

    if (!family || !weight || !src) continue;

    const sfx = style === 'italic' ? 'i' : '';
    const normalized = family.toLowerCase().replace(/\s+/g, '-');
    const name = `${normalized}-${weight}${sfx}.woff2`;
    const path = join(DIR, name);

    console.log(`Downloading ${name} (${family} ${weight} ${style})...`);
    await download(src, path);
  }

  console.log('\nDone:');
  for (const f of readdirSync(DIR).sort()) {
    const s = statSync(join(DIR, f));
    console.log(`  ${f} (${(s.size / 1024).toFixed(1)}K)`);
  }
}

main().catch(console.error);
