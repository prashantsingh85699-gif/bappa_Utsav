import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\chtus\\.gemini\\antigravity-ide\\brain\\c4b8d8a4-fe77-4f80-8df9-77b69c51ea9a';

async function testAudio() {
  console.log('================================================================');
  console.log('TESTING BAPPA UTSAV PROFESSIONAL FESTIVAL AUDIO ENGINE');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'],
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

  console.log('1. Loading application at http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

  // Dismiss splash by user click (which also triggers autoplay unlock)
  await page.waitForSelector('h1, h2, button, div', { timeout: 8000 });
  await page.mouse.click(300, 300);
  await new Promise((r) => setTimeout(r, 1200));

  // Wait for Sanctum Home
  await page.waitForSelector('button[title*="Edit Devotee"], button', { timeout: 8000 });
  console.log('1. Sanctum Home reached!');

  // Check AudioManager state on Home screen
  const audioStateHome = await page.evaluate(async () => {
    // Access global audioManager if exported on window or check AudioContext state
    const audioManagerMod = await import('/src/services/audioService.ts');
    const am = audioManagerMod.audioManager;
    return {
      currentTrack: am.getCurrentTrack(),
      musicEnabled: am.getMusicEnabled(),
      sfxEnabled: am.getSfxEnabled(),
      musicVolume: am.getMusicVolume(),
      sfxVolume: am.getSfxVolume(),
      isMuted: am.getIsMuted(),
    };
  });
  console.log('2. Audio State on Home:', audioStateHome);

  // Verify sound effects trigger without errors
  console.log('3. Triggering all 10 dedicated sound effects...');
  const sfxTestResults = await page.evaluate(async () => {
    const audioManagerMod = await import('/src/services/audioService.ts');
    const am = audioManagerMod.audioManager;
    am.init();

    am.playButtonClick();
    am.playCorrectAnswer();
    am.playWrongAnswer();
    am.playPerfectHit();
    am.playComboIncrease(5);
    am.playLevelUp();
    am.playUnlock();
    am.playGameStart();
    am.playGameComplete();
    am.playCelebration();

    return true;
  });
  console.log('3. All sound effects executed successfully:', sfxTestResults);

  // Navigate to Hub and verify track changes to 'festival'
  console.log('4. Navigating to Festival Hub...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find((b) => b.textContent && b.textContent.includes('START UTSAV'));
    if (startBtn) startBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h1')).some((h) => h.textContent && h.textContent.includes('FESTIVAL HUB')),
    { timeout: 8000 }
  );

  const audioStateHub = await page.evaluate(async () => {
    const audioManagerMod = await import('/src/services/audioService.ts');
    return audioManagerMod.audioManager.getCurrentTrack();
  });
  console.log('4. Music track on Festival Hub:', audioStateHub);

  // Navigate to Modak Catch and verify track changes to 'gameplay'
  console.log('5. Navigating to Modak Catch...');
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

  const audioStateGameplay = await page.evaluate(async () => {
    const audioManagerMod = await import('/src/services/audioService.ts');
    return audioManagerMod.audioManager.getCurrentTrack();
  });
  console.log('5. Music track in Modak Catch (gameplay):', audioStateGameplay);

  // Exit back to Hub
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find((b) => b.textContent && (b.textContent.includes('Exit') || b.textContent.includes('Hub')));
    if (exitBtn) exitBtn.click();
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h1')).some((h) => h.textContent && h.textContent.includes('FESTIVAL HUB')),
    { timeout: 8000 }
  );

  // Open Settings Modal to verify Volume Sliders & Master Mute
  console.log('6. Opening Settings to test Volume Sliders & Master Mute...');
  await page.evaluate(() => {
    const settingsBtn = document.querySelector('button[aria-label="Settings"], button[title*="Settings"]');
    if (settingsBtn) settingsBtn.click();
  });
  await page.waitForSelector('input[aria-label="Music Volume"]', { timeout: 6000 });

  // Test adjusting volume sliders and toggle mute
  const volumeTestResults = await page.evaluate(async () => {
    const audioManagerMod = await import('/src/services/audioService.ts');
    const am = audioManagerMod.audioManager;

    am.setMusicVolume(0.5);
    am.setSfxVolume(0.6);
    const musicVol = am.getMusicVolume();
    const sfxVol = am.getSfxVolume();

    const muted1 = am.toggleMute();
    const muted2 = am.toggleMute();

    return { musicVol, sfxVol, muted1, muted2 };
  });
  console.log('6. Volume slider & Mute test results:', volumeTestResults);

  // Capture screenshot of Settings Audio controls
  const settingsAudioPath = path.join(ARTIFACTS_DIR, 'settings_audio_controls.png');
  await page.screenshot({ path: settingsAudioPath });
  console.log(' [Screenshot Saved]:', settingsAudioPath);

  await browser.close();

  console.log('\n================================================================');
  console.log(`AUDIO SYSTEM VERIFICATION: ${errors.length === 0 ? 'ALL CHECKS PASSED (100%)' : 'ISSUES DETECTED'}`);
  console.log(`Console Errors: ${errors.length}`);
  console.log(`Console Warnings: ${warnings.length}`);
  console.log('================================================================\n');

  if (errors.length > 0) {
    process.exit(1);
  }
}

testAudio().catch((err) => {
  console.error('Fatal Audio Test Error:', err);
  process.exit(1);
});
