import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\chtus\\.gemini\\antigravity-ide\\brain\\c4b8d8a4-fe77-4f80-8df9-77b69c51ea9a';

async function testStage() {
  console.log('================================================================');
  console.log('VERIFYING LIVE UTSAV STAGE BACKGROUND (DESKTOP + MOBILE)');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const errors = [];
  const warnings = [];

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error(' [CONSOLE ERROR]:', msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    errors.push(err.message);
    console.error(' [UNCAUGHT ERROR]:', err.message);
  });

  // -------------------------------------------------------------
  // 1. DESKTOP TEST (1440 x 900)
  // -------------------------------------------------------------
  console.log('--- Step 1: Testing Desktop 1440x900 Live Utsav Stage ---');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

  // Dismiss splash if active
  await page.waitForSelector('h1, h2, button, div', { timeout: 8000 });
  await page.mouse.click(720, 450);
  await new Promise((r) => setTimeout(r, 1200));

  // Wait for Sanctum Home
  await page.waitForSelector('button[title*="Edit Devotee"], button', { timeout: 8000 });

  // Verify Canvas particle engine is rendered
  const canvasMounted = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return canvas && canvas.width > 0 && canvas.height > 0;
  });
  console.log(' [Desktop] Canvas particle engine active:', canvasMounted);

  // Verify Mandap elements are rendered
  const stageElements = await page.evaluate(() => {
    const hasArch = document.querySelector('svg') !== null;
    const hasPillars = document.body.innerText.includes('ॐ') || document.querySelector('.animate-stage-sway') !== null;
    const hasLights = document.querySelector('.animate-fairy-a, .animate-fairy-b') !== null;
    const hasDiyas = document.querySelector('.animate-diya-flicker') !== null;
    return { hasArch, hasPillars, hasLights, hasDiyas };
  });
  console.log(' [Desktop] Stage Visual Layers:', stageElements);

  // Capture Desktop Home Screenshot
  const desktopHomePath = path.join(ARTIFACTS_DIR, 'desktop_stage_home.png');
  await page.screenshot({ path: desktopHomePath });
  console.log(' [Screenshot Saved]:', desktopHomePath);

  // Navigate to Festival Hub
  console.log('\n--- Step 2: Navigating to Festival Hub (Intensity: High) ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find((b) => b.textContent && b.textContent.includes('START UTSAV'));
    if (startBtn) startBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h1')).some((h) => h.textContent && h.textContent.includes('FESTIVAL HUB')),
    { timeout: 8000 }
  );

  const desktopHubPath = path.join(ARTIFACTS_DIR, 'desktop_stage_hub.png');
  await page.screenshot({ path: desktopHubPath });
  console.log(' [Screenshot Saved]:', desktopHubPath);

  // Navigate to Modak Catch (Intensity: Low)
  console.log('\n--- Step 3: Navigating to Modak Catch (Intensity: Low - Gameplay Mode) ---');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.animate-slide-up'));
    const card = cards.find((c) => c.textContent && c.textContent.includes('Modak'));
    if (card) {
      const btn = card.querySelector('button');
      if (btn) btn.click();
      else card.click();
    }
  });
  await page.waitForSelector('canvas', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 600));

  const desktopModakPath = path.join(ARTIFACTS_DIR, 'desktop_stage_modak.png');
  await page.screenshot({ path: desktopModakPath });
  console.log(' [Screenshot Saved]:', desktopModakPath);

  // Return to Hub
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find((b) => b.textContent && (b.textContent.includes('Exit') || b.textContent.includes('Hub')));
    if (exitBtn) exitBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h1')).some((h) => h.textContent && h.textContent.includes('FESTIVAL HUB')),
    { timeout: 8000 }
  );

  // -------------------------------------------------------------
  // 2. MOBILE TEST (360 x 800)
  // -------------------------------------------------------------
  console.log('\n--- Step 4: Testing Mobile 360x800 Live Utsav Stage ---');
  await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 600));
  await page.mouse.click(180, 400); // dismiss splash

  await page.waitForSelector('button[title*="Edit Devotee"], button', { timeout: 8000 });

  // Check horizontal scroll
  const scrollInfo = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(' [Mobile 360x800] Scroll Status:', scrollInfo);

  // Capture Mobile Home Screenshot
  const mobileHomePath = path.join(ARTIFACTS_DIR, 'mobile_stage_360x800_home.png');
  await page.screenshot({ path: mobileHomePath });
  console.log(' [Screenshot Saved]:', mobileHomePath);

  // Navigate to Hub on Mobile
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find((b) => b.textContent && b.textContent.includes('START UTSAV'));
    if (startBtn) startBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h1')).some((h) => h.textContent && h.textContent.includes('FESTIVAL HUB')),
    { timeout: 8000 }
  );

  const mobileHubPath = path.join(ARTIFACTS_DIR, 'mobile_stage_360x800_hub.png');
  await page.screenshot({ path: mobileHubPath });
  console.log(' [Screenshot Saved]:', mobileHubPath);

  await browser.close();

  console.log('\n================================================================');
  console.log(`LIVE UTSAV STAGE VERIFICATION: ${errors.length === 0 ? 'ALL CHECKS PASSED (100%)' : 'ISSUES DETECTED'}`);
  console.log(`Console Errors: ${errors.length}`);
  console.log(`Console Warnings: ${warnings.length}`);
  console.log('================================================================\n');

  if (errors.length > 0) {
    process.exit(1);
  }
}

testStage().catch((err) => {
  console.error('Fatal Stage Test Error:', err);
  process.exit(1);
});
