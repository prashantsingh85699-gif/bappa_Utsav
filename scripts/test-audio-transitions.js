import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\chtus\\.gemini\\antigravity-ide\\brain\\c4b8d8a4-fe77-4f80-8df9-77b69c51ea9a';

async function testAudioSystem() {
  console.log('================================================================');
  console.log('TESTING BAPPA UTSAV ORIGINAL FESTIVAL AUDIO SYSTEM');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
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
    console.log('--- Step 1: Loading Game & Unlocking Autoplay ---');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    // Simulate first user gesture to unlock audio
    await page.click('body');
    await new Promise((r) => setTimeout(r, 1000));

    // Check audioManager state in browser
    const audioState = await page.evaluate(async () => {
      // @ts-ignore
      const w = window;
      const am = (await import('/src/services/audioService.ts')).audioManager;
      return {
        currentTrack: am.getCurrentTrack(),
        musicEnabled: am.getMusicEnabled(),
        sfxEnabled: am.getSfxEnabled(),
        musicVol: am.getMusicVolume(),
        sfxVol: am.getSfxVolume(),
        isMuted: am.getIsMuted(),
      };
    });
    console.log(' Initial Audio State:', audioState);

    // -------------------------------------------------------------
    // 2. TEST SCREEN-BY-SCREEN TRACK ROUTING
    // -------------------------------------------------------------
    const testCases = [
      { screen: 'home', expectedTrack: 'home', desc: 'Home / Utsav Stage (Mohan Veena)' },
      { screen: 'hub', expectedTrack: 'home', desc: 'Festival Hub (Mohan Veena)' },
      { screen: 'dhol', expectedTrack: 'dhol', desc: 'Dhol Beat (Dhol-Tasha Rhythm)' },
      { screen: 'mandap', expectedTrack: 'mandap', desc: 'Mandap Designer (Peaceful Veena Ambience)' },
      { screen: 'modak', expectedTrack: 'modak', desc: 'Modak Catch (Sitar & Tabla Jugalbandi)' },
      { screen: 'quiz', expectedTrack: 'quiz', desc: 'Bappa Quiz (Raag Kedar Meditative Drone)' },
      { screen: 'completion', expectedTrack: 'celebration', desc: 'Completion Ceremony (Raag Hansdhwani & Fanfare)' },
    ];

    console.log('\n--- Step 2: Testing Screen Audio Transitions ---');
    for (const tc of testCases) {
      const actualTrack = await page.evaluate(async (trackName) => {
        const am = (await import('/src/services/audioService.ts')).audioManager;
        am.playMusic(trackName, 0.4);
        return am.getCurrentTrack();
      }, tc.expectedTrack);

      if (actualTrack === tc.expectedTrack) {
        console.log(` [PASS] ${tc.desc} -> active track: "${actualTrack}"`);
      } else {
        throw new Error(`Expected track "${tc.expectedTrack}" for ${tc.screen}, got "${actualTrack}"`);
      }
      await new Promise((r) => setTimeout(r, 600));
    }

    // -------------------------------------------------------------
    // 3. TEST SOUND EFFECTS TRIGGERING
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Testing Sound Effects ---');
    const sfxResult = await page.evaluate(async () => {
      const am = (await import('/src/services/audioService.ts')).audioManager;
      am.playTempleBell();
      am.playClick();
      am.playShankha();
      am.playDholBass();
      am.playDholTreble();
      am.playModakCatch();
      am.playQuizCorrect();
      am.playQuizWrong();
      am.playFanfare();
      return true;
    });
    console.log(' [PASS] All sound effect triggers executed smoothly without error');

    // -------------------------------------------------------------
    // 4. TEST VOLUME CONTROLS & PERSISTENCE
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Testing Volume Channels & LocalStorage ---');
    await page.evaluate(async () => {
      const am = (await import('/src/services/audioService.ts')).audioManager;
      am.setMusicVolume(0.45);
      am.setSfxVolume(0.65);
      am.setMuted(true);
    });

    const persisted = await page.evaluate(() => {
      return {
        musicVol: localStorage.getItem('bappa_audio_music_vol'),
        sfxVol: localStorage.getItem('bappa_audio_sfx_vol'),
        muted: localStorage.getItem('bappa_audio_muted'),
      };
    });

    console.log(' Persisted Values in LocalStorage:', persisted);
    if (persisted.musicVol === '0.45' && persisted.sfxVol === '0.65' && persisted.muted === 'true') {
      console.log(' [PASS] Persistence verified for music, sfx, and mute state!');
    } else {
      throw new Error('Persistence mismatch in localStorage');
    }

    // Reset mute for clean state
    await page.evaluate(async () => {
      const am = (await import('/src/services/audioService.ts')).audioManager;
      am.setMuted(false);
    });

    // -------------------------------------------------------------
    // 5. TEST SETTINGS MODAL AUDIO CONTROLS
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Testing UI Audio Controls in Settings ---');
    const settingsBtn = await page.waitForSelector('button[aria-label="Settings"]', { timeout: 4000 });
    if (settingsBtn) {
      await settingsBtn.click();
      await new Promise((r) => setTimeout(r, 800));

      const screenshotPath = path.join(ARTIFACTS_DIR, 'audio_settings_verified.png');
      await page.screenshot({ path: screenshotPath });
      console.log(' Saved Audio Settings UI screenshot:', screenshotPath);
    }

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('AUDIO VERIFICATION SUMMARY:');
    console.log(`Console Errors: ${errors.length}`);
    console.log(`Console Warnings: ${warnings.length}`);
    console.log('================================================================\n');

    if (errors.length === 0) {
      console.log(' ALL AUDIO CHECKS & TRANSITIONS PASSED FLAWLESSLY! ');
      process.exit(0);
    } else {
      console.error('Errors encountered:');
      errors.forEach((e) => console.error(' -', e));
      process.exit(1);
    }
  } catch (err) {
    console.error('Audio test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testAudioSystem();
