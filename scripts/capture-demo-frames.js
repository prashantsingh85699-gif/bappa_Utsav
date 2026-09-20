import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const FRAMES_DIR = path.resolve('frames_temp');

if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
} else {
  fs.readdirSync(FRAMES_DIR).forEach(f => fs.unlinkSync(path.join(FRAMES_DIR, f)));
}

let frameIndex = 0;

async function snap(page, count = 1) {
  for (let i = 0; i < count; i++) {
    const filename = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(5, '0')}.png`);
    await page.screenshot({ path: filename });
    frameIndex++;
    await new Promise(r => setTimeout(r, 100));
  }
}

async function record() {
  console.log('[START] Recording clean mobile showcase frames...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  // Set clean standard mobile viewport (390 x 844 - iPhone 14 / modern Android)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

  // 1. Dismiss splash
  await page.mouse.click(195, 420);
  await new Promise(r => setTimeout(r, 600));

  // 2. Sanctum Home Screen with Bappa & Aarti
  console.log('Capture Home Sanctum...');
  await snap(page, 15);

  // 3. Switch Swaroops
  console.log('Capture Swaroop switching...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Siddhivinayak'));
    if (btn) btn.click();
  });
  await snap(page, 12);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Dagdusheth'));
    if (btn) btn.click();
  });
  await snap(page, 12);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Bal Ganesha'));
    if (btn) btn.click();
  });
  await snap(page, 12);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Lalbaugcha Raja'));
    if (btn) btn.click();
  });
  await snap(page, 12);

  // 4. Tap Bappa for Divine Lightning & Blessing
  console.log('Capture Tap Bappa lightning...');
  await page.mouse.click(195, 300);
  await snap(page, 15);

  // 5. Open Aarti playlist dropdown
  console.log('Capture Devotional Aarti Playlist...');
  await page.evaluate(() => {
    const widgets = Array.from(document.querySelectorAll('div, button'));
    const widget = widgets.find(w => w.textContent && w.textContent.includes('NOW PLAYING AARTI'));
    if (widget) widget.click();
  });
  await snap(page, 16);

  // Close dropdown
  await page.mouse.click(50, 50);
  await new Promise(r => setTimeout(r, 400));

  // 6. Navigate to Mandap Designer (SHOWCASING 100% CENTERED BAPPA & ZERO CUT-OFF!)
  console.log('Capture Mandap Designer screen...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mandapBtn = btns.find(b => b.textContent && b.textContent.includes('Mandap'));
    if (mandapBtn) mandapBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await snap(page, 18);

  // Add a decoration
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent && b.textContent.includes('+ Add'));
    if (addBtn) addBtn.click();
  });
  await snap(page, 12);

  // Finish and Present Mandap
  console.log('Capture Mandap Presentation...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const presentBtn = btns.find(b => b.textContent && b.textContent.includes('Present'));
    if (presentBtn) presentBtn.click();
  });
  await snap(page, 16);

  // Exit back to Hub
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent && (b.textContent.includes('Exit') || b.textContent.includes('Close')));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 7. Modak Catch Mini Game
  console.log('Capture Modak Catch mini-game...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div, button'));
    const modakCard = cards.find(c => c.textContent && c.textContent.includes('Modak'));
    if (modakCard) {
      const btn = modakCard.querySelector('button');
      if (btn) btn.click();
      else modakCard.click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // Move basket left and right to catch modaks
  for (let m = 0; m < 5; m++) {
    await page.mouse.move(120 + m * 30, 720);
    await snap(page, 4);
  }

  // Return to home
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await page.mouse.click(195, 420);
  await new Promise(r => setTimeout(r, 600));
  await snap(page, 15);

  await browser.close();
  console.log(`[DONE] Captured ${frameIndex} frames successfully!`);
}

record().catch(err => {
  console.error('Recording error:', err);
  process.exit(1);
});
