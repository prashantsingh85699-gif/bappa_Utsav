import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const FRAMES_DIR = path.resolve('frames_3min');

if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
} else {
  fs.readdirSync(FRAMES_DIR).forEach(f => {
    try { fs.unlinkSync(path.join(FRAMES_DIR, f)); } catch(e){}
  });
}

let frameIndex = 0;

async function snap(page, count = 1) {
  for (let i = 0; i < count; i++) {
    const filename = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(6, '0')}.jpg`);
    await page.screenshot({ path: filename, type: 'jpeg', quality: 80 });
    frameIndex++;
  }
}

async function record() {
  console.log('[START] Fast 3-Minute Walkthrough Capture...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Splash intro (30 frames)
  console.log('1. Splash intro...');
  await snap(page, 30);

  // Click Enter
  await page.mouse.click(195, 420);
  await new Promise(r => setTimeout(r, 500));

  // 2. Home Sanctum & Swaroops (70 frames)
  console.log('2. Sanctum & Swaroops...');
  await snap(page, 20);

  // Tap Bappa for divine auras
  for (let t = 0; t < 3; t++) {
    await page.mouse.click(195, 300);
    await snap(page, 8);
  }

  // Switch Swaroops
  const swaroops = ['Siddhivinayak', 'Dagdusheth', 'Bal Ganesha', 'Lalbaugcha Raja'];
  for (const sw of swaroops) {
    await page.evaluate((name) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent && x.textContent.includes(name));
      if (b) b.click();
    }, sw);
    await snap(page, 12);
  }

  // Open Aarti dropdown
  await page.evaluate(() => {
    const widgets = Array.from(document.querySelectorAll('div, button'));
    const w = widgets.find(x => x.textContent && x.textContent.includes('NOW PLAYING AARTI'));
    if (w) w.click();
  });
  await snap(page, 20);
  await page.mouse.click(50, 50); // close

  // 3. Mandap Designer (100 frames)
  console.log('3. Mandap Designer (Mobile Responsive)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent && x.textContent.includes('Mandap'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await snap(page, 25);

  // Add Flowers, Diyas, Garlands, Lights, Rangoli
  const categories = ['Flowers', 'Diyas', 'Garlands', 'Lights', 'Rangoli'];
  for (const cat of categories) {
    await page.evaluate((c) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const t = btns.find(x => x.textContent && x.textContent.includes(c));
      if (t) t.click();
    }, cat);
    await snap(page, 8);

    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('+ Add'));
      if (addBtns.length > 0) addBtns[0].click();
    });
    await snap(page, 10);
  }

  // Present Mode
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const presentBtn = btns.find(b => b.textContent && b.textContent.includes('Present'));
    if (presentBtn) presentBtn.click();
  });
  await snap(page, 25);

  // Exit Mandap
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent && (b.textContent.includes('Exit') || b.textContent.includes('Close')));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 4. Modak Catch Game (70 frames)
  console.log('4. Modak Catch Mini Game...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div, button'));
    const card = cards.find(c => c.textContent && c.textContent.includes('Modak'));
    if (card) {
      const btn = card.querySelector('button');
      if (btn) btn.click();
      else card.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  for (let m = 0; m < 5; m++) {
    await page.mouse.move(100 + m * 45, 720);
    await snap(page, 7);
  }
  for (let m = 5; m >= 0; m--) {
    await page.mouse.move(100 + m * 45, 720);
    await snap(page, 7);
  }

  // 5. Dhol Tasha Game (50 frames)
  console.log('5. Dhol Tasha Game...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await page.mouse.click(195, 420);
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div, button'));
    const dholCard = cards.find(c => c.textContent && c.textContent.includes('Dhol'));
    if (dholCard) {
      const btn = dholCard.querySelector('button');
      if (btn) btn.click();
      else dholCard.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  for (let t = 0; t < 10; t++) {
    await page.mouse.click(120 + (t % 3) * 75, 520);
    await snap(page, 4);
  }

  // 6. Leaderboards & Final Sanctum (40 frames)
  console.log('6. Leaderboards & Grand Aarti...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await page.mouse.click(195, 420);
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button, div'));
    const rankBtn = navItems.find(n => n.textContent && n.textContent.includes('Rank'));
    if (rankBtn) rankBtn.click();
  });
  await snap(page, 20);

  // Return home
  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button, div'));
    const homeBtn = navItems.find(n => n.textContent && n.textContent.includes('Home'));
    if (homeBtn) homeBtn.click();
  });
  for (let b = 0; b < 2; b++) {
    await page.mouse.click(195, 300);
    await snap(page, 10);
  }

  await browser.close();
  console.log(`[DONE] Captured ${frameIndex} frames!`);
}

record().catch(e => {
  console.error(e);
  process.exit(1);
});
