import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\chtus\\.gemini\\antigravity-ide\\brain\\c4b8d8a4-fe77-4f80-8df9-77b69c51ea9a';

async function testMandapMobile() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

  // Click anywhere to dismiss splash
  await page.mouse.click(180, 400);
  await new Promise(r => setTimeout(r, 1000));

  // Click Mandap directly in bottom nav
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mandapBtn = btns.find(b => b.textContent && b.textContent.includes('Mandap'));
    if (mandapBtn) mandapBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Check overflow
  const metrics = await page.evaluate(() => {
    return {
      docScrollWidth: document.documentElement.scrollWidth,
      docClientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log('Mobile Mandap Metrics:', metrics);

  const screenshotPath = path.join(ARTIFACTS_DIR, 'mandap_mobile_fixed.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  await browser.close();
}

testMandapMobile().catch(console.error);
