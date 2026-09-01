/* Bundles the prototype into one self-contained HTML file, for sharing where
   a folder of assets cannot travel (an artifact, an email, a USB stick).
   The four source files stay the thing you edit; this only inlines them.

   Usage: node build-single.js [outfile]
          node build-single.js --fragment [outfile]

   --fragment drops the document wrapper and the head metadata, leaving the
   title, the font link, the styles and the markup. That is the shape a host
   that supplies its own <head> and <body> expects.

   Default output: dist/carzone-kuwait.html
*/
const fs = require('fs'), path = require('path');
const here = __dirname;
const args = process.argv.slice(2);
const fragment = args.includes('--fragment');
const out = args.filter(a => !a.startsWith('--'))[0]
  || path.join(here, 'dist', fragment ? 'carzone-fragment.html' : 'carzone-kuwait.html');

const read = f => fs.readFileSync(path.join(here, f), 'utf8');
let html = read('index.html');

html = html.replace('<link rel="stylesheet" href="assets/carzone.css">',
  '<style>\n' + read('assets/carzone.css') + '\n</style>');

for (const f of ['data', 'art', 'app']) {
  html = html.replace(`<script src="assets/${f}.js"></script>`,
    '<script>\n' + read(`assets/${f}.js`) + '\n</script>');
}

if (fragment) {
  // the host shows this in a gallery beside other pages, so it wants the
  // product name on its own rather than the page's full SEO title
  const title = html.match(/<title>([^<]*)<\/title>/)[1].split(':')[0].trim();
  const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>/)[0];
  const style = html.match(/<style>[\s\S]*?<\/style>/)[0];
  const body  = html.match(/<body>([\s\S]*?)<\/body>/)[1];
  html = `<title>${title}</title>\n${fonts}\n${style}\n${body.trim()}\n`;
}

const left = html.match(/(src|href)="assets\//g);
if (left) { console.error('Unbundled asset references remain:', left); process.exit(1); }

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`${out}  ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
