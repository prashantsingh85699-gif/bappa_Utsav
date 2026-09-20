import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function check() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  // Test at 390px mobile
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  await page.mouse.click(195, 420); // skip splash
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: 'navbar_mobile_390.png' });

  // Test at 600px (intermediate width)
  await page.setViewport({ width: 600, height: 800 });
  await page.screenshot({ path: 'navbar_tablet_600.png' });

  const metrics = await page.evaluate(() => {
    const header = document.querySelector('header');
    return {
      windowWidth: window.innerWidth,
      headerWidth: header ? header.getBoundingClientRect().width : 0,
      headerScrollWidth: header ? header.scrollWidth : 0,
      docScrollWidth: document.documentElement.scrollWidth,
      docClientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  console.log('Layout metrics:', JSON.stringify(metrics, null, 2));
  await browser.close();
}

check().catch(console.error);
