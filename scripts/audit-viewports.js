import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\chtus\\.gemini\\antigravity-ide\\brain\\c4b8d8a4-fe77-4f80-8df9-77b69c51ea9a';

const VIEWPORTS = [
  { name: 'android_360x800', width: 360, height: 800, isMobile: true, hasTouch: true },
  { name: 'android_375x812', width: 375, height: 812, isMobile: true, hasTouch: true },
  { name: 'android_390x844', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'android_412x915', width: 412, height: 915, isMobile: true, hasTouch: true },
  { name: 'desktop_1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false },
];

async function runAudit() {
  console.log('Starting Bappa Utsav Android & Desktop Viewport Audit...');
  
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const report = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const page = await browser.newPage();
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      deviceScaleFactor: 2,
    });

    // 1. Load Home
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1, button', { timeout: 10000 });

    // Check horizontal scroll
    const homeScroll = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const innerWidth = window.innerWidth;
      return {
        scrollWidth,
        clientWidth,
        innerWidth,
        hasHorizontalScroll: scrollWidth > innerWidth,
      };
    });

    console.log(`[Home] Scroll check: innerWidth=${homeScroll.innerWidth}, scrollWidth=${homeScroll.scrollWidth}, overflow=${homeScroll.hasHorizontalScroll}`);

    // Take screenshot of Home
    const homeScreenshotPath = path.join(ARTIFACTS_DIR, `${vp.name}_home.png`);
    await page.screenshot({ path: homeScreenshotPath });
    console.log(`[Home] Screenshot saved: ${homeScreenshotPath}`);

    // 2. Open Profile Modal
    // Click devotee pill
    const profileBtn = await page.$('button[title*="Edit Devotee"]');
    let modalResult = null;
    if (profileBtn) {
      await profileBtn.click();
      await new Promise(r => setTimeout(r, 400));

      modalResult = await page.evaluate(() => {
        const modal = document.querySelector('.festive-glass-glow');
        if (!modal) return { found: false };
        const rect = modal.getBoundingClientRect();
        const input = document.querySelector('input[placeholder*="Omkar"]');
        return {
          found: true,
          modalWidth: Math.round(rect.width),
          modalHeight: Math.round(rect.height),
          windowHeight: window.innerHeight,
          windowWidth: window.innerWidth,
          fitsHorizontally: rect.width <= window.innerWidth,
          fitsVertically: rect.height <= window.innerHeight,
          inputFound: !!input,
        };
      });
      console.log(`[Profile Modal] Fits: W=${modalResult.fitsHorizontally}, H=${modalResult.fitsVertically} (${modalResult.modalWidth}x${modalResult.modalHeight})`);

      const modalScreenshotPath = path.join(ARTIFACTS_DIR, `${vp.name}_modal.png`);
      await page.screenshot({ path: modalScreenshotPath });

      // Close modal
      const closeBtn = await page.$('button[aria-label="Close modal"]');
      if (closeBtn) {
        await closeBtn.click();
        await new Promise(r => setTimeout(r, 400));
      }
    }

    // 3. Navigate to Hub
    // Click 'START UTSAV' button
    const startUtsavBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const found = btns.find(b => b.textContent && b.textContent.includes('START UTSAV'));
      if (found) {
        found.click();
        return true;
      }
      return false;
    });

    await new Promise(r => setTimeout(r, 600));

    // Hub scroll check
    const hubScroll = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
        activityCardsCount: document.querySelectorAll('.card-hover-lift, .festive-glass').length,
      };
    });
    console.log(`[Hub] Scroll check: overflow=${hubScroll.hasHorizontalScroll}, cards=${hubScroll.activityCardsCount}`);

    const hubScreenshotPath = path.join(ARTIFACTS_DIR, `${vp.name}_hub.png`);
    await page.screenshot({ path: hubScreenshotPath });

    // 4. Test Modak Catch Arcade
    // Find Modak Catch play button
    const modakLaunched = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div, card'));
      const btns = Array.from(document.querySelectorAll('button'));
      // Find button inside Modak Catch card or containing Play Now / Play Again
      for (const btn of btns) {
        const text = btn.textContent || '';
        const parentText = btn.closest('.animate-slide-up')?.textContent || '';
        if (parentText.includes('Modak Catch') && (text.includes('Play') || text.includes('Again'))) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    await page.waitForSelector('canvas.game-canvas', { timeout: 6000 }).catch(() => null);
    await new Promise(r => setTimeout(r, 400));

    const modakState = await page.evaluate(() => {
      const canvas = document.querySelector('canvas.game-canvas');
      const leftBtn = document.querySelector('button[aria-label="Move basket left"]');
      const rightBtn = document.querySelector('button[aria-label="Move basket right"]');
      return {
        canvasFound: !!canvas,
        canvasWidth: canvas ? canvas.clientWidth : 0,
        canvasHeight: canvas ? canvas.clientHeight : 0,
        leftBtnFound: !!leftBtn,
        leftBtnHeight: leftBtn ? leftBtn.clientHeight : 0,
        rightBtnFound: !!rightBtn,
        rightBtnHeight: rightBtn ? rightBtn.clientHeight : 0,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    console.log(`[Modak Catch] Canvas=${modakState.canvasFound} (${modakState.canvasWidth}x${modakState.canvasHeight}), LeftBtn=${modakState.leftBtnFound} (h=${modakState.leftBtnHeight}px), RightBtn=${modakState.rightBtnFound}, Overflow=${modakState.overflow}`);

    const modakScreenshotPath = path.join(ARTIFACTS_DIR, `${vp.name}_modak.png`);
    await page.screenshot({ path: modakScreenshotPath });

    // Return to Hub
    const backBtn = await page.$('button[aria-label*="Exit"], button:has(svg)');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const exitBtn = btns.find(b => b.textContent && (b.textContent.includes('Hub') || b.textContent.includes('Exit')));
      if (exitBtn) exitBtn.click();
    });

    await new Promise(r => setTimeout(r, 400));

    report.push({
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      homeOverflow: homeScroll.hasHorizontalScroll,
      hubOverflow: hubScroll.hasHorizontalScroll,
      modalFits: modalResult ? modalResult.fitsHorizontally && modalResult.fitsVertically : true,
      modakControls: modakState.leftBtnFound && modakState.rightBtnFound && modakState.leftBtnHeight >= 44,
      modakOverflow: modakState.overflow,
    });

    await page.close();
  }

  await browser.close();

  console.log('\n========================================');
  console.log('FINAL AUDIT SUMMARY:');
  console.log(JSON.stringify(report, null, 2));
  console.log('========================================');
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
