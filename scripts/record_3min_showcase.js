import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const FRAMES_DIR = path.resolve('frames_3min');

if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
} else {
  fs.readdirSync(FRAMES_DIR).forEach(f => fs.unlinkSync(path.join(FRAMES_DIR, f)));
}

let frameIndex = 0;

async function snap(page, count = 1, delay = 100) {
  for (let i = 0; i < count; i++) {
    const filename = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(6, '0')}.png`);
    await page.screenshot({ path: filename, type: 'jpeg', quality: 85 });
    frameIndex++;
    if (delay > 0) await new Promise(r => setTimeout(r, delay));
  }
}

async function record() {
  console.log('[START] Recording full 3-minute mobile showcase (1800 frames @ 10fps)...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      '--disable-web-security',
      '--autoplay-policy=no-user-gesture-required'
    ],
  });

  const page = await browser.newPage();
  // Standard iPhone/Android viewport
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Splash Screen & Welcome (10s = 100 frames)
  console.log('[1/7] Splash Screen (10s)...');
  await snap(page, 100, 70);

  // Dismiss splash by clicking CTA
  await page.mouse.click(195, 420);
  await new Promise(r => setTimeout(r, 600));

  // 2. Home Sanctum & 4 Divine Swaroops (35s = 350 frames)
  console.log('[2/7] Home Sanctum & Swaroops (35s)...');
  // First Swaroop: Lalbaugcha Raja
  await snap(page, 60, 80);

  // Tap Bappa for Divine Lightning Aura & Aarti
  for (let k = 0; k < 3; k++) {
    await page.mouse.click(195, 300);
    await snap(page, 20, 80);
  }

  // Switch to Siddhivinayak
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Siddhivinayak'));
    if (btn) btn.click();
  });
  await snap(page, 50, 80);

  // Switch to Dagdusheth
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Dagdusheth'));
    if (btn) btn.click();
  });
  await snap(page, 50, 80);

  // Switch to Bal Ganesha
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Bal Ganesha'));
    if (btn) btn.click();
  });
  await snap(page, 50, 80);

  // Open Aarti dropdown to show Jai Ganesh Deva playlist
  await page.evaluate(() => {
    const widgets = Array.from(document.querySelectorAll('div, button'));
    const widget = widgets.find(w => w.textContent && w.textContent.includes('NOW PLAYING AARTI'));
    if (widget) widget.click();
  });
  await snap(page, 80, 80);
  await page.mouse.click(50, 50); // close dropdown

  // 3. Mandap Designer (Full Responsive Mobile Experience - 50s = 500 frames)
  console.log('[3/7] Mandap Designer (50s)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mandapBtn = btns.find(b => b.textContent && b.textContent.includes('Mandap'));
    if (mandapBtn) mandapBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await snap(page, 60, 80);

  // Click tabs and add items
  const tabs = ['Flowers', 'Diyas', 'Garlands', 'Lights', 'Rangoli'];
  for (const tab of tabs) {
    await page.evaluate((tabName) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const t = btns.find(b => b.textContent && b.textContent.includes(tabName));
      if (t) t.click();
    }, tab);
    await snap(page, 30, 80);

    // Add item
    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('+ Add'));
      if (addBtns.length > 0) addBtns[0].click();
    });
    await snap(page, 50, 80);
  }

  // Showcase Present Mode
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const presentBtn = btns.find(b => b.textContent && b.textContent.includes('Present'));
    if (presentBtn) presentBtn.click();
  });
  await snap(page, 100, 80);

  // Exit Mandap
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent && (b.textContent.includes('Exit') || b.textContent.includes('Close')));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 4. Modak Catch Mini Game (35s = 350 frames)
  console.log('[4/7] Modak Catch Mini Game (35s)...');
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

  // Simulate catching modaks left and right
  for (let round = 0; round < 7; round++) {
    for (let x = 80; x <= 310; x += 40) {
      await page.mouse.move(x, 720);
      await snap(page, 5, 60);
    }
    for (let x = 310; x >= 80; x -= 40) {
      await page.mouse.move(x, 720);
      await snap(page, 5, 60);
    }
  }

  // 5. Dhol Tasha Rhythm Game (25s = 250 frames)
  console.log('[5/7] Dhol Tasha Game (25s)...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  await page.mouse.click(195, 420); // skip splash
  await new Promise(r => setTimeout(r, 400));

  // Navigate to Hub/Dhol
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div, button'));
    const dholCard = cards.find(c => c.textContent && c.textContent.includes('Dhol'));
    if (dholCard) {
      const btn = dholCard.querySelector('button');
      if (btn) btn.click();
      else dholCard.click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // Tap dhol drums vigorously
  for (let tap = 0; tap < 25; tap++) {
    await page.mouse.click(120 + (tap % 3) * 75, 520);
    await snap(page, 10, 60);
  }

  // 6. Leaderboard & Festive Hub (15s = 150 frames)
  console.log('[6/7] Leaderboard (15s)...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await page.mouse.click(195, 420);
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button, div'));
    const rankBtn = navItems.find(n => n.textContent && n.textContent.includes('Rank'));
    if (rankBtn) rankBtn.click();
  });
  await snap(page, 150, 70);

  // 7. Final Sanctum Darshan & Aarti (10s = 100 frames)
  console.log('[7/7] Final Sanctum Darshan (10s)...');
  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button, div'));
    const homeBtn = navItems.find(n => n.textContent && n.textContent.includes('Home'));
    if (homeBtn) homeBtn.click();
  });
  // Final Aarti chants & blessings
  for (let b = 0; b < 4; b++) {
    await page.mouse.click(195, 300);
    await snap(page, 25, 70);
  }

  await browser.close();
  console.log(`[COMPLETED] Recorded ${frameIndex} frames!`);
}

record().catch(err => {
  console.error('Error during recording:', err);
  process.exit(1);
});
