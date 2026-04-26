// 실제 OpenDocs 앱(Expo Web) 화면을 Android Pixel-like viewport 로 캡처
// 사용: node store/play/capture-android.cjs
//
// 동작:
//   1. localStorage 에 demo flag 세팅 → seedDemoIfNeeded() 가 데모 데이터 삽입
//   2. 홈 진입 → 시드 후 reload → home capture
//   3. 파일 탭 → capture
//   4. 즐겨찾기 탭 → capture
//   5. 설정 탭 → capture
//   6. 모두 1080×1920 PNG 출력 (Play Store 표준 해상도)
//
// 출력: store/play/android/screenshot-1-home.png ~ screenshot-4-settings.png

const path = require('path');
const fs = require('fs');
const PUP = 'C:/app/nailoop/client/node_modules/puppeteer';
const puppeteer = require(PUP);

const APP_URL = 'http://localhost:8090';
const OUT_DIR = path.resolve(__dirname, 'android');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Pixel 6 Pro 스타일 — Play Store 표준
const VIEWPORT = { width: 360, height: 640, deviceScaleFactor: 3 };

// 실제 라우트: 3 탭 (index/favorites/settings) — _layout.tsx 확인됨
// scrollY: 0 = 상단, > 0 = 스크롤 후 캡처 (마케팅용 추가 컷)
const SCENES = [
  { name: 'screenshot-1-home',           route: '/',          scrollY: 0 },
  { name: 'screenshot-2-files',          route: '/favorites', scrollY: 0 },
  { name: 'screenshot-3-home-guide',     route: '/',          scrollY: 600 },  // 가이드 카드 풀 노출
  { name: 'screenshot-4-settings',       route: '/settings',  scrollY: 0 },
  { name: 'screenshot-5-settings-family', route: '/settings', scrollY: 1200 }, // wowpia family + footer
];

(async () => {
  console.log('▶ 브라우저 시작...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: VIEWPORT,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.on('console', msg => {
    const txt = msg.text();
    if (txt.includes('opendocs') || txt.includes('seed') || txt.includes('demo')) {
      console.log('  [browser]', txt);
    }
  });
  page.on('pageerror', err => console.log('  [pageerror]', err.message));

  // ── 1. demo flag 주입 + 시드 (시드 후 자동 reload 됨) ─────────────
  console.log('▶ demo flag 주입 + 시드...');
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem('opendocs_demo', '1'); } catch {}
  });
  await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 90_000 });
  // 시드 → DB insert → 자동 reload → fresh fetch → 화면에 데이터 보임
  await new Promise(r => setTimeout(r, 5_000));

  // ── 3. 각 탭 캡처 ────────────────────────────────────────────────
  for (const scene of SCENES) {
    const url = APP_URL + scene.route;
    console.log(`▶ ${scene.name} ← ${scene.route}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 });
    } catch (e) {
      console.log(`  ⚠ goto failed (${e.message}) — page may already be loaded`);
    }
    await new Promise(r => setTimeout(r, 1_500));

    // 스크롤이 필요하면 적용 후 약간 대기
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
