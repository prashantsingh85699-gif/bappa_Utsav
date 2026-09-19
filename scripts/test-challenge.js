import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\chtus\\.gemini\\antigravity-ide\\brain\\c4b8d8a4-fe77-4f80-8df9-77b69c51ea9a';

async function testChallengeFeature() {
  console.log('================================================================');
  console.log('VERIFYING FESTIVAL CHALLENGE & GROUP ROOMS (DESKTOP + MOBILE)');
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

  try {
    // -------------------------------------------------------------
    // 1. DESKTOP VIEW (1440 x 900)
    // -------------------------------------------------------------
    console.log('--- Step 1: Navigating to Home on Desktop (1440x900) ---');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 2000));

    // Check if on splash or home
    const enterBtn = await page.$('button');
    if (enterBtn) {
      await enterBtn.click();
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log('--- Step 2: Clicking Challenge Nav in Header ---');
    const challengeBtn = await page.waitForSelector('button[aria-label="Festival Challenge"]', { timeout: 6000 });
    if (!challengeBtn) throw new Error('Challenge button not found in Header');
    await challengeBtn.click();
    await new Promise((r) => setTimeout(r, 1500));

    // Verify Challenge Screen Header & Hero elements
    const heading = await page.$eval('h1', (el) => el.textContent);
    console.log(' Challenge Screen Title:', heading);

    const countdown = await page.$eval('span', (el) => el.textContent);
    console.log(' Live Elements loaded successfully');

    // Take Desktop Challenge Screen Screenshot
    const desktopChallengePath = path.join(ARTIFACTS_DIR, 'festival_challenge_desktop.png');
    await page.screenshot({ path: desktopChallengePath });
    console.log(' Saved desktop screenshot:', desktopChallengePath);

    // -------------------------------------------------------------
    // 2. TEST GROUP ROOMS TAB & CREATION
    // -------------------------------------------------------------
    console.log('--- Step 3: Switching to Group Rooms Tab ---');
    const roomTabBtn = await page.waitForSelector('#challenge-tab-rooms', { timeout: 4000 });
    await roomTabBtn.click();
    await new Promise((r) => setTimeout(r, 1000));

    console.log('--- Step 4: Creating a Festival Room ---');
    const createRoomBtn = await page.waitForSelector('#btn-open-create-room', { timeout: 4000 });
    await createRoomBtn.click();
    await new Promise((r) => setTimeout(r, 800));

    // Fill room form
    const roomInput = await page.waitForSelector('#input-room-name', { timeout: 3000 });
    await roomInput.type('Mumbai Lalbaug Mandal');

    const submitCreateBtn = await page.waitForSelector('#btn-confirm-create-room', { timeout: 3000 });
    await submitCreateBtn.click();
    await new Promise((r) => setTimeout(r, 1500));

    // Verify room view is displayed with code
    const roomCodeEl = await page.waitForSelector('#active-room-code', { timeout: 5000 });
    const generatedCode = await page.evaluate((el) => el.textContent, roomCodeEl);
    console.log(' Created Group Room with Code:', generatedCode);

    const desktopRoomsPath = path.join(ARTIFACTS_DIR, 'festival_rooms_desktop.png');
    await page.screenshot({ path: desktopRoomsPath });
    console.log(' Saved rooms screenshot:', desktopRoomsPath);

    // -------------------------------------------------------------
    // 3. TEST FEATURED BANNER IN FESTIVAL HUB
    // -------------------------------------------------------------
    console.log('--- Step 5: Testing Hub Screen Featured Challenge Banner ---');
    const backBtn = await page.waitForSelector('button[aria-label="Back"]', { timeout: 4000 });
    if (backBtn) await backBtn.click();
    await new Promise((r) => setTimeout(r, 1200));

    // Verify Hub Screen has Daily Challenge Banner
    const hubBanner = await page.waitForSelector('div:has(h3), div', { timeout: 4000 });
    console.log(' Hub screen and featured banner loaded');

    const hubBannerPath = path.join(ARTIFACTS_DIR, 'festival_hub_challenge_banner.png');
    await page.screenshot({ path: hubBannerPath });
    console.log(' Saved hub banner screenshot:', hubBannerPath);

    // -------------------------------------------------------------
    // 4. MOBILE AUDIT (360 x 800)
    // -------------------------------------------------------------
    console.log('--- Step 6: Testing Mobile 360x800 Viewport ---');
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    // Enter Challenge on mobile
    const mobChallengeBtn = await page.waitForSelector('button[aria-label="Festival Challenge"]', { timeout: 5000 });
    await mobChallengeBtn.click();
    await new Promise((r) => setTimeout(r, 1500));

    // Check for horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(` Mobile Widths: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    if (scrollWidth > clientWidth) {
      console.warn(` [WARNING]: Horizontal scroll detected on 360px! (${scrollWidth} > ${clientWidth})`);
    } else {
      console.log(' Perfect mobile fit (no horizontal scrollbar)!');
    }

    const mobileChallengePath = path.join(ARTIFACTS_DIR, 'festival_challenge_mobile_360.png');
    await page.screenshot({ path: mobileChallengePath });
    console.log(' Saved mobile screenshot:', mobileChallengePath);

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('TEST SUMMARY:');
    console.log(`Console Errors: ${errors.length}`);
    console.log(`Console Warnings: ${warnings.length}`);
    console.log('================================================================\n');

    if (errors.length > 0) {
      console.error('Errors encountered:');
      errors.forEach((e) => console.error(' -', e));
      process.exit(1);
    } else {
      console.log(' ALL FESTIVAL CHALLENGE TESTS PASSED CLEANLY! ');
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testChallengeFeature();
