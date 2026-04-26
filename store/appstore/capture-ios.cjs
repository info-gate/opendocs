// 실제 OpenDocs 앱(Expo Web) 화면을 iOS iPhone 6.7" viewport (1290×2796) 로 캡처
// App Store Connect 필수 사이즈 — Apple iPhone Pro Max 6.7"
//
// 사용: node store/appstore/capture-ios.cjs (Expo dev server 가 8090 포트에서 떠있어야 함)
//
// ⚠️ Android 캡처 (1080×1920) 와 절대 섞으면 안 됨 (Apple reject 사유)
//    출력: store/appstore/ios/screenshot-N-*.png

const path = require('path');
const fs = require('fs');
const PUP = 'C:/app/nailoop/client/node_modules/puppeteer';
const puppeteer = require(PUP);

const APP_URL = 'http://localhost:8090';
const OUT_DIR = path.resolve(__dirname, 'ios');
fs.mkdirSync(OUT_DIR, { recursive: true });

// iPhone 14/15 Pro Max — 1290×2796 portrait
// devicePixelRatio 3, CSS viewport 430×932
const VIEWPORT = { width: 430, height: 932, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

const SCENES = [
  { name: 'screenshot-1-home',           route: '/',          scrollY: 0 },
  { name: 'screenshot-2-files',          route: '/favorites', scrollY: 0 },
  { name: 'screenshot-3-home-guide',     route: '/',          scrollY: 600 },
  { name: 'screenshot-4-settings',       route: '/settings',  scrollY: 0 },
  { name: 'screenshot-5-settings-family', route: '/settings', scrollY: 1200 },
];

(async () => {
  console.log('▶ 브라우저 시작 (iOS viewport 1290×2796)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: VIEWPORT,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  // iOS Safari user agent
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

  page.on('console', msg => {
    const txt = msg.text();
    if (txt.includes('opendocs') || txt.includes('seed') || txt.includes('demo')) {
      console.log('  [browser]', txt);
    }
  });
  page.on('pageerror', err => console.log('  [pageerror]', err.message));

  // Demo flag 주입 — 페이지 로드 직전
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem('opendocs_demo', '1'); } catch {}
  });
  await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 90_000 });
  await new Promise(r => setTimeout(r, 3_000));

  for (const scene of SCENES) {
    const url = APP_URL + scene.route;
    console.log(`▶ ${scene.name} ← ${scene.route}${scene.scrollY ? ` (scroll ${scene.scrollY})` : ''}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 });
    } catch (e) {
      console.log(`  ⚠ goto failed (${e.message})`);
    }
    await new Promise(r => setTimeout(r, 1_500));

    if (scene.scrollY && scene.scrollY > 0) {
      await page.evaluate((y) => {
        window.scrollTo(0, y);
        document.querySelectorAll('div').forEach((el) => {
          const cs = window.getComputedStyle(el);
          if (/(auto|scroll)/.test(cs.overflowY || '') && el.scrollHeight > el.clientHeight) {
            el.scrollTop = y;
          }
        });
      }, scene.scrollY);
      await new Promise(r => setTimeout(r, 800));
    }

    const outPath = path.join(OUT_DIR, scene.name + '.png');
    await page.screenshot({ path: outPath, fullPage: false });
    const stats = fs.statSync(outPath);
    console.log(`  ✓ ${scene.name}.png  ${(stats.size/1024).toFixed(0)} KB`);
  }

  await browser.close();
  console.log('▶ done');
})().catch((e) => { console.error('FAIL:', e); process.exit(1); });
