// SVG → PNG 일괄 렌더링 (resvg-js)
// 위치: store/play/
// 사용: node store/play/render-all.js
const path = require('path');
const fs = require('fs');

// nailoop 의 node_modules 활용 (OpenDocs 에 별도 설치 안 해도 됨)
const RESVG_PATH = 'C:/app/nailoop/client/node_modules/@resvg/resvg-js';
const { Resvg } = require(RESVG_PATH);

const HERE = __dirname;
const TARGETS = [
  { svg: 'feature-graphic.svg',     out: 'feature-graphic.png',     width: 1024 },
  { svg: 'screenshot-1-home.svg',   out: 'screenshot-1-home.png',   width: 1080 },
  { svg: 'screenshot-2-formats.svg', out: 'screenshot-2-formats.png', width: 1080 },
  { svg: 'screenshot-3-viewer.svg', out: 'screenshot-3-viewer.png', width: 1080 },
  { svg: 'screenshot-4-privacy.svg', out: 'screenshot-4-privacy.png', width: 1080 },
];

for (const { svg, out, width } of TARGETS) {
  const svgPath = path.join(HERE, svg);
  const outPath = path.join(HERE, out);
  if (!fs.existsSync(svgPath)) { console.log(`  skip ${svg} (missing)`); continue; }
  const buf = fs.readFileSync(svgPath);
  const r = new Resvg(buf, { fitTo: { mode: 'width', value: width } });
  const png = r.render().asPng();
  fs.writeFileSync(outPath, png);
  console.log(`  ${out}  ${(png.length/1024).toFixed(0)} KB`);
}
console.log('done');
