/* Shared 3D scene lifecycle and compact workspace checks. */
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage();
    const base = process.env.CINDERLENS_BASE_URL || 'http://127.0.0.1:8000/';
    const routes = ['#/', '#/explorer', '#/compare?a=BASS2-T101&b=BASS2-T102&factor=airflow_cms', '#/explorer?coverage=1', '#/evidence/BASS2-T124', '#/record/BASS2-T133', '#/data-notes'];
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(base + route);
        await page.waitForFunction(() => document.querySelector('canvas')?.heroScene?.inspect().frames > 2);
        assert.equal(await page.locator('canvas').count(), 1, 'One owned WebGL scene per page');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        const before = await page.locator('canvas').evaluate(el => el.heroScene.inspect().time);
        await page.waitForFunction(time => document.querySelector('canvas').heroScene.inspect().time > time, before, { timeout: 5000 });
        if (route !== '#/') {
          assert.ok(await page.locator('#main').evaluate(el => getComputedStyle(el).backgroundAttachment.split(',').every(value => value.trim() === 'fixed')));
          assert.match(await page.locator('#main').evaluate(el => getComputedStyle(el).backgroundImage), /cosmic\.jpg/);
        }
      }
    }
    await page.goto(base + routes[2]);
    await page.waitForFunction(() => document.querySelector('canvas')?.heroScene?.inspect().frames > 2);
    await page.evaluate(() => { window.previousScene = document.querySelector('canvas').heroScene; });
    await page.locator('[data-factor="oxygen_pct"]').click();
    await page.waitForFunction(() => window.previousScene.inspect().destroyed && document.querySelector('canvas')?.heroScene?.inspect().frames > 2);
    assert.equal(await page.locator('canvas').count(), 1, 'Compare rerenders dispose the previous context');
    const rect = await page.locator('.dashboard-scene').boundingBox();
    await page.mouse.move(rect.x + rect.width * .8, rect.y + 30);
    await page.waitForTimeout(180);
    assert.ok(await page.locator('canvas').evaluate(el => Math.abs(el.heroScene.inspect().pointer[0])) > .01);
    await page.locator('[data-hero-motion]').click();
    assert.equal(await page.locator('canvas').evaluate(el => el.heroScene.inspect().running), false);
    assert.equal(await page.locator('.pair-slot > details[open]').count(), 0);
    await page.goto(base + routes[5]);
    await page.locator('[data-target="record-provenance"]').click();
    assert.equal(await page.locator('#record-provenance').isVisible(), true, 'Section shortcuts reveal collapsed ancestors');
    await page.goto(base + routes[6]);
    assert.equal(await page.locator('.notes-content > [id]:visible').count(), 1);
    await page.locator('[data-notes-section="notes-matching"]').click();
    assert.equal(await page.locator('.notes-content > [id]:visible').count(), 1);
    assert.equal(await page.locator('#notes-matching').isVisible(), true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(base + routes[1]);
    await page.locator('.dashboard-scene[data-scene-state="reduced-motion"]').waitFor();
    assert.equal(await page.locator('.dashboard-scene canvas').isVisible(), false);
    assert.deepEqual(errors, []);
    console.log('PASS all seven pages animate in desktop/mobile, continuous backgrounds, single-context disposal, pointer, pause, compact disclosures, section reveal, notes panels and reduced motion');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
