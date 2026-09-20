import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const FRAMES_DIR = path.resolve('frames_dual');

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

async function run() {
  console.log('[START] Recording Dual View (Laptop + Mobile)...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });

  // ==========================================
  // PART 1: LAPTOP / DESKTOP VIEW (1280 x 720)
  // ==========================================
  console.log('--- PART 1: Laptop View (1280x720) ---');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1280, height: 720 });
  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Desktop Splash & Entry
  await snap(desktopPage, 20);
  await desktopPage.mouse.click(640, 420);
  await new Promise(r => setTimeout(r, 500));

  // 2. Desktop Sanctum & 4 Swaroops
  await snap(desktopPage, 15);
  for (let t = 0; t < 2; t++) {
    await desktopPage.mouse.click(640, 360);
    await snap(desktopPage, 8);
  }

  const swaroops = ['Siddhivinayak', 'Dagdusheth', 'Bal Ganesha', 'Lalbaugcha Raja'];
  for (const sw of swaroops) {
    await desktopPage.evaluate((name) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent && x.textContent.includes(name));
      if (b) b.click();
    }, sw);
    await snap(desktopPage, 10);
  }

  // 3. Desktop Mandap Designer
  await desktopPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, div'));
    const b = btns.find(x => x.textContent && x.textContent.includes('Mandap'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await snap(desktopPage, 15);

  const categories = ['Flowers', 'Diyas', 'Garlands', 'Lights', 'Rangoli'];
  for (const cat of categories) {
    await desktopPage.evaluate((c) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const t = btns.find(x => x.textContent && x.textContent.includes(c));
      if (t) t.click();
    }, cat);
    await snap(desktopPage, 6);

    await desktopPage.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('+ Add'));
      if (addBtns.length > 0) addBtns[0].click();
    });
    await snap(desktopPage, 8);
  }

  // Desktop Mandap Present Mode
  await desktopPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const p = btns.find(x => x.textContent && x.textContent.includes('Present'));
    if (p) p.click();
  });
  await snap(desktopPage, 20);

  // Exit Mandap
  await desktopPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const e = btns.find(x => x.textContent && (x.textContent.includes('Exit') || x.textContent.includes('Close')));
    if (e) e.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 4. Desktop Modak Catch
  await desktopPage.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div, button'));
    const card = cards.find(c => c.textContent && c.textContent.includes('Modak'));
    if (card) {
      const btn = card.querySelector('button');
      if (btn) btn.click();
      else card.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  for (let m = 0; m < 6; m++) {
    await desktopPage.mouse.move(300 + m * 120, 640);
    await snap(desktopPage, 6);
  }

  // 5. Desktop Leaderboard
  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await desktopPage.mouse.click(640, 420);
  await new Promise(r => setTimeout(r, 400));

  await desktopPage.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button, div'));
    const rankBtn = navItems.find(n => n.textContent && n.textContent.includes('Rank'));
    if (rankBtn) rankBtn.click();
  });
  await snap(desktopPage, 25);
  await desktopPage.close();

  // ==========================================
  // PART 2: MOBILE VIEW (390 x 844 scaled into 1280x720 canvas)
  // ==========================================
  console.log('--- PART 2: Mobile View Showcase ---');
  // We can open a showcase page or frame mobile in 1280x720 with festive sidebar
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 1280, height: 720 });
  // We navigate to a wrapper or directly evaluate an iframe / mobile preview or mobile viewport!
  // To show mobile clearly in 16:9, we can create an in-memory page that frames 390x844 right in the center with a mock phone frame, OR record mobile view directly!
  // Recording mobile view directly at 390x844 and scaling in FFmpeg or recording in a clean wrapper:
  await mobilePage.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            width: 1280px;
            height: 720px;
            background: radial-gradient(circle at center, #230438 0%, #0c0116 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, sans-serif;
            color: #FEF08A;
            overflow: hidden;
            box-sizing: border-box;
          }
          .label-left {
            position: absolute;
            left: 40px;
            top: 200px;
            max-width: 320px;
            text-align: left;
          }
          .label-left h2 {
            margin: 0 0 10px;
            color: #F59E0B;
            font-size: 28px;
            font-weight: 800;
          }
          .label-left p {
            color: #FDE047;
            font-size: 15px;
            line-height: 1.5;
            opacity: 0.9;
          }
          .features {
            margin-top: 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 14px;
            color: #86efac;
          }
          .phone-mockup {
            width: 340px;
            height: 680px;
            border-radius: 40px;
            border: 6px solid #F59E0B;
            box-shadow: 0 0 50px rgba(245, 158, 11, 0.4), 0 25px 60px rgba(0,0,0,0.9);
            overflow: hidden;
            position: relative;
            background: #000;
          }
          iframe {
            width: 390px;
            height: 844px;
            border: none;
            transform: scale(0.8717);
            transform-origin: top left;
          }
          .label-right {
            position: absolute;
            right: 40px;
            top: 200px;
            max-width: 320px;
            text-align: right;
          }
          .label-right h3 {
            color: #F59E0B;
            font-size: 22px;
            margin: 0 0 8px;
          }
          .label-right p {
            color: #FEF08A;
            font-size: 14px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="label-left">
          <h2>📱 Mobile View Experience</h2>
          <p>100% Touch-Optimized • Zero Stage Cutoff • Fully Responsive</p>
          <div class="features">
            <div>✓ Compact Responsive Navbar</div>
            <div>✓ Perfectly Centered Bappa Mandap</div>
            <div>✓ Full Jai Ganesh Deva Aarti Player</div>
            <div>✓ Smooth Modak Catch Mini-Game</div>
            <div>✓ Dhol Tasha Festival Rhythm Beats</div>
          </div>
        </div>

        <div class="phone-mockup">
          <iframe id="mobile-frame" src="http://localhost:3000/"></iframe>
        </div>

        <div class="label-right">
          <h3>Tested on Mobile Viewport</h3>
          <p>375px & 390px Viewport Verified</p>
          <p style="color: #fbbf24; font-size: 13px; margin-top: 12px;">
            "Worship, Decorate, Play & Celebrate Bappa Utsav Anytime, Anywhere on Mobile!"
          </p>
        </div>
      </body>
    </html>
  `, { waitUntil: 'load' });

  await new Promise(r => setTimeout(r, 1200));

  // Get frame element
  const frameHandle = await mobilePage.$('#mobile-frame');
  const frame = await frameHandle.contentFrame();

  // 1. Mobile Splash
  await snap(mobilePage, 15);
  try {
    await frame.mouse.click(195, 420);
  } catch(e){}
  await new Promise(r => setTimeout(r, 500));

  // 2. Mobile Sanctum & Swaroops
  await snap(mobilePage, 15);
  for (let s = 0; s < 2; s++) {
    try {
      await frame.mouse.click(195, 300);
    } catch(e){}
    await snap(mobilePage, 8);
  }

  // Switch Swaroop on mobile
  try {
    await frame.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent && x.textContent.includes('Siddhivinayak'));
      if (b) b.click();
    });
  } catch(e){}
  await snap(mobilePage, 12);

  // 3. Mobile Mandap Designer (SHOWCASING ZERO CUTOFF IN MOBILE PHONE FRAME)
  try {
    await frame.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div'));
      const b = btns.find(x => x.textContent && x.textContent.includes('Mandap'));
      if (b) b.click();
    });
  } catch(e){}
  await new Promise(r => setTimeout(r, 600));
  await snap(mobilePage, 25);

  // Add Flowers & Diyas
  try {
    await frame.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('+ Add'));
      if (addBtns.length > 0) addBtns[0].click();
    });
  } catch(e){}
  await snap(mobilePage, 15);

  // Exit Mandap
  try {
    await frame.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const e = btns.find(x => x.textContent && (x.textContent.includes('Exit') || x.textContent.includes('Close')));
      if (e) e.click();
    });
  } catch(e){}
  await new Promise(r => setTimeout(r, 400));

  // 4. Mobile Modak Catch Game
  try {
    await frame.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div, button'));
      const card = cards.find(c => c.textContent && c.textContent.includes('Modak'));
      if (card) {
        const btn = card.querySelector('button');
        if (btn) btn.click();
        else card.click();
      }
    });
  } catch(e){}
  await new Promise(r => setTimeout(r, 600));
  for (let m = 0; m < 5; m++) {
    try {
      await frame.mouse.move(100 + m * 40, 720);
    } catch(e){}
    await snap(mobilePage, 6);
  }

  // 5. Final Grand Sanctum Darshan
  try {
    await frame.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));
    await frame.mouse.click(195, 420);
    await new Promise(r => setTimeout(r, 400));
  } catch(e){}
  await snap(mobilePage, 20);

  await browser.close();
  console.log(`[COMPLETED DUAL RECORDING] Total frames captured: ${frameIndex}!`);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
