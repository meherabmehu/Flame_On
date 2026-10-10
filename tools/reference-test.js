/* Seven-screen reference QA. Run with temporary playwright-core on NODE_PATH. */
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage();
    const base = 'http://127.0.0.1:8000/';
    const routes = {
      overview: '#/', explorer: '#/explorer', compare: '#/compare?a=BASS2-T101&b=BASS2-T102&factor=airflow_cms',
      coverage: '#/explorer?coverage=1', evidence: '#/evidence/BASS2-T124', details: '#/record/BASS2-T133', notes: '#/data-notes'
    };
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [name, route] of Object.entries(routes)) {
        await page.goto(base + route);
        await page.locator('main h1').waitFor();
        if (name === 'overview') await page.waitForFunction(() => document.querySelector('canvas')?.heroScene?.inspect().frames > 2);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        await page.screenshot({ path: path.join(process.env.TEMP, `cinderlens-reference-${name}-${width}.png`) });
      }
    }
    await page.goto(base + routes.explorer);
    assert.equal(await page.locator('.catalog-stats strong').nth(0).innerText(), '26');
    await page.locator('#explorer-search').fill('nomex');
    await page.waitForTimeout(250);
    assert.equal(Number(await page.locator('.catalog-stats strong').nth(1).innerText()), await page.locator('.record-card').count());
    await page.goto(base + routes.coverage);
    for (const key of ['oxygen-airflow', 'fuel-shape', 'thickness-airflow']) {
      await page.locator(`[data-coverage-view="${key}"]`).click();
      assert.equal(await page.locator(`[data-coverage-view="${key}"]`).getAttribute('aria-pressed'), 'true');
      const cell = page.locator('[data-heatmap-row]').filter({ hasText: /^[1-9]/ }).first();
      const expected = Number(await cell.innerText());
      await cell.focus();
      assert.equal(await page.locator('#coverage-cell-detail').innerText(), await cell.getAttribute('data-coverage-detail'));
      await cell.click();
      assert.equal(await page.locator('.record-card').count(), expected, key + ': Heatmap filters both axes to the indexed count');
    }
    await page.goto(base + routes.notes);
    await page.locator('[data-notes-section="notes-developer"]').click();
    assert.equal(await page.locator('#notes-developer').getAttribute('open'), '');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'notes-developer');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + routes.compare);
    const a = await page.locator('.pair-slot').first().boundingBox();
    const analysis = await page.locator('.analysis-section').boundingBox();
    const b = await page.locator('.pair-slot').last().boundingBox();
    assert.ok(a.x < b.x && Math.abs(a.y - b.y) < 2 && analysis.y > a.y, 'Desktop experiments sit side by side above condition analysis');
    const backgrounds = new Set();
    for (const name of ['explorer','compare','coverage','evidence','details','notes']) {
      await page.goto(base + routes[name]);
      assert.equal(await page.locator('body').evaluate(el => el.classList.contains('internal-dashboard')), true);
      const image = await page.locator('#main').evaluate(el => getComputedStyle(el).backgroundImage);
      assert.match(image, /space\.svg/);
      backgrounds.add(image);
    }
    assert.equal(backgrounds.size, 6, 'Each internal screen has distinct decorative space art');
    await page.goto(base);
    assert.equal(await page.locator('body').evaluate(el => el.classList.contains('internal-dashboard')), false);
    console.log('PASS seven desktop/mobile screenshots, live totals, three heatmap filters, notes focus, side-by-side comparison, six distinct backgrounds and unmodified hero styling');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
