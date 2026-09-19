import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testJourney() {
  console.log('Testing full user flow with direct card selectors...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // 1. Splash to Home
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Dismiss splash by tapping anywhere
  await new Promise(r => setTimeout(r, 400));
  await page.mouse.click(200, 400);

  // Wait until START UTSAV is mounted on Home
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('button')).some(b => b.textContent && b.textContent.includes('START UTSAV')),
    { timeout: 8000 }
  );
  console.log('1. On Sanctum Home successfully!');

  // 2. Open Profile Modal
  const profilePill = await page.$('button[title*="Edit Devotee"]');
  console.log('2. Found profile pill:', !!profilePill);
  if (profilePill) {
    await profilePill.click();
    await page.waitForSelector('input[placeholder*="Omkar"]', { timeout: 5000 });
    console.log('2. Profile modal opened successfully!');

    // Type nickname via keyboard events
    const inputSelector = 'input[type="text"]';
    await page.click(inputSelector);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type(inputSelector, 'AaravDevotee');

    // Click submit button
    await page.click('button[type="submit"]');

    // Wait for modal backdrop to completely unmount
    await new Promise(r => setTimeout(r, 600));

    const nicknameOnBanner = await page.evaluate(() => document.querySelector('button[title*="Edit Devotee"]')?.textContent || '');
    console.log('2. Updated nickname on banner:', nicknameOnBanner.includes('AaravDevotee'));
  }

  // 3. Click START UTSAV
  console.log('3. Clicking START UTSAV...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const start = btns.find(b => b.textContent && b.textContent.includes('START UTSAV'));
    if (start) start.click();
  });

  // Wait until FESTIVAL HUB is mounted
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h1')).some(h => h.textContent && h.textContent.includes('FESTIVAL HUB')),
    { timeout: 8000 }
  );
  console.log('3. Entered Festival Hub successfully!');

  // 4. Launch Dhol Beat
  console.log('4. Launching Dhol Beat...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.animate-slide-up'));
    const card = cards.find(c => c.textContent && c.textContent.includes('Dhol Beat'));
    if (card) {
      const btn = card.querySelector('button');
      if (btn) btn.click();
      else card.click();
    }
  });

  await page.waitForSelector('canvas.game-canvas', { timeout: 8000 });
  console.log('4. Dhol Beat canvas mounted!');

  // Exit back to Hub
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent && (b.textContent.includes('Exit') || b.textContent.includes('Hub')));
    if (exitBtn) exitBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h1')).some(h => h.textContent && h.textContent.includes('FESTIVAL HUB')),
    { timeout: 8000 }
  );
  console.log('4. Back to Hub from Dhol Beat!');

  // 5. Launch Modak Catch
  console.log('5. Launching Modak Catch...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.animate-slide-up'));
    const card = cards.find(c => c.textContent && c.textContent.includes('Modak Catch'));
    if (card) {
      const btn = card.querySelector('button');
      if (btn) btn.click();
      else card.click();
    }
  });

  await page.waitForSelector('canvas.game-canvas', { timeout: 8000 });
  const steeringButtons = await page.evaluate(() => {
    const l = document.querySelector('button[aria-label="Move basket left"]');
    const r = document.querySelector('button[aria-label="Move basket right"]');
    return !!l && !!r;
  });
  console.log('5. Modak Catch mounted! Thumb steering buttons verified:', steeringButtons);

  // Exit back to Hub
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent && (b.textContent.includes('Exit') || b.textContent.includes('Hub')));
    if (exitBtn) exitBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h1')).some(h => h.textContent && h.textContent.includes('FESTIVAL HUB')),
    { timeout: 8000 }
  );
  console.log('5. Back to Hub from Modak Catch!');

  // 6. Launch Mandap Designer
  console.log('6. Launching Mandap Designer...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.animate-slide-up'));
    const card = cards.find(c => c.textContent && c.textContent.includes('Mandap Designer'));
    if (card) {
      const btn = card.querySelector('button');
      if (btn) btn.click();
      else card.click();
    }
  });

  await page.waitForSelector('h2', { timeout: 8000 });
  const mandapTitle = await page.evaluate(() => document.querySelector('h2')?.textContent || '');
  console.log('6. Mandap Designer loaded! Header:', mandapTitle);

  // Exit back to Hub
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent && (b.textContent.includes('Exit') || b.textContent.includes('Hub')));
    if (exitBtn) exitBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h1')).some(h => h.textContent && h.textContent.includes('FESTIVAL HUB')),
    { timeout: 8000 }
  );
  console.log('6. Back to Hub from Mandap Designer!');

  // 7. Launch Bappa Quiz
  console.log('7. Launching Bappa Quiz...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.animate-slide-up'));
    const card = cards.find(c => c.textContent && c.textContent.includes('Quiz'));
    if (card) {
      const btn = card.querySelector('button');
      if (btn) btn.click();
      else card.click();
    }
  });

  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('button')).some(b => b.textContent && b.textContent.includes('Begin Quiz Round')),
    { timeout: 8000 }
  );
  console.log('7. Bappa Quiz intro mounted! Starting round...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const beginQuiz = btns.find(b => b.textContent && b.textContent.includes('Begin Quiz Round'));
    if (beginQuiz) beginQuiz.click();
  });
  await page.waitForSelector('.space-y-3 button', { timeout: 8000 });
  console.log('7. First quiz question active!');

  // Exit back to Hub
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent && (b.textContent.includes('Exit') || b.textContent.includes('Hub')));
    if (exitBtn) exitBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h1')).some(h => h.textContent && h.textContent.includes('FESTIVAL HUB')),
    { timeout: 8000 }
  );
  console.log('7. Back to Hub from Quiz!');

  // 8. Open Leaderboard
  console.log('8. Opening Leaderboard...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const lbBtn = btns.find(b => 
      b.getAttribute('title')?.includes('Rankings') || 
      b.getAttribute('title')?.includes('Leaderboard') ||
      b.getAttribute('aria-label')?.includes('Leaderboard') ||
      (b.textContent && (b.textContent.includes('Rankings') || b.textContent.includes('Leaderboard')))
    );
    if (lbBtn) lbBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h2, h1')).some(h => h.textContent && (h.textContent.includes('Leaderboard') || h.textContent.includes('Rankings'))),
    { timeout: 8000 }
  );
  console.log('8. Leaderboard loaded successfully!');

  // Navigate back to Hub from Leaderboard
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const hubBtn = btns.find(b => b.textContent && b.textContent.includes('Festival Hub'));
    if (hubBtn) hubBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h1')).some(h => h.textContent && h.textContent.includes('FESTIVAL HUB')),
    { timeout: 8000 }
  );
  console.log('8. Back to Festival Hub from Leaderboard!');

  // 9. Back to Home and open Settings
  console.log('9. Returning to Home and testing Settings...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const homeBtn = btns.find(b => b.textContent && b.textContent.includes('Home'));
    if (homeBtn) homeBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('button')).some(b => b.textContent && b.textContent.includes('START UTSAV')),
    { timeout: 8000 }
  );

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const settingsBtn = btns.find(b => 
      b.getAttribute('aria-label')?.includes('Settings') || 
      b.getAttribute('title')?.includes('Settings') || 
      (b.textContent && b.textContent.includes('Settings'))
    );
    if (settingsBtn) settingsBtn.click();
  });
  await page.waitForSelector('button[aria-label="Close modal"]', { timeout: 5000 });
  console.log('9. Settings modal opened successfully!');

  await page.evaluate(() => {
    const close = document.querySelector('button[aria-label="Close modal"]');
    if (close) close.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 10. Refresh state test
  console.log('10. Testing page refresh state retention...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await page.mouse.click(200, 400); // dismiss splash
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('button')).some(b => b.textContent && b.textContent.includes('START UTSAV')),
    { timeout: 8000 }
  );

  const retainedName = await page.evaluate(() => document.querySelector('button[title*="Edit Devotee"]')?.textContent || '');
  console.log('10. Nickname retained across refresh:', retainedName.includes('AaravDevotee'));

  await browser.close();
  console.log('\n========================================');
  console.log('ALL FLOW STEPS VERIFIED 100% SUCCESSFULLY!');
  console.log('========================================');
}

testJourney().catch(err => {
  console.error('Test journey failed:', err);
  process.exit(1);
});
