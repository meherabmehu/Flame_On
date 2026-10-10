/* Browser verification for the decorative WebGL hero; QA dependencies in TEMP. */
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1536, height: 1024 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const url = 'http://127.0.0.1:8000/';
    await page.goto(url);
    await page.waitForFunction(() => document.querySelector('canvas')?.heroScene?.inspect().frames > 3);
    assert.match(await page.locator('.hero-scene').getAttribute('data-scene-state'), /^webgl/);
    const inspect = () => page.locator('canvas').evaluate(c => c.heroScene.inspect());
    let state = await inspect();
    assert.ok(state.width * state.height <= 442000, 'Desktop pixel budget');
    const initial = await page.locator('canvas').screenshot();
    await page.waitForTimeout(350);
    const animated = await page.locator('canvas').screenshot();
    assert.notDeepEqual(initial, animated, 'Rendered pixels must change, not just DOM/CSS');
    await page.locator('[data-hero-motion]').click();
    state = await inspect();
    await page.waitForTimeout(200);
    assert.equal((await inspect()).frames, state.frames);
    await page.locator('[data-hero-motion]').click();
    const bounds = await page.locator('.hero-renderer').boundingBox();
    await page.mouse.move(bounds.x + bounds.width * .85, bounds.y + bounds.height * .35);
    await page.waitForTimeout(350);
    state = await inspect();
    assert.ok(state.pointer[0] > .01 && state.pointer[0] <= .25, 'Damped pointer response within rotation limit');
    await page.mouse.move(1,1);
    await page.waitForTimeout(900);
    assert.ok(Math.abs((await inspect()).pointer[0]) < .01, 'Pointer settles smoothly');
    console.log('PASS WebGL rendering, animated pixels, pause/resume, damped pointer and pixel budget');

    await page.evaluate(() => scrollTo(0,document.body.scrollHeight));
    await page.waitForTimeout(150);
    state = await inspect();
    await page.waitForTimeout(200);
    assert.equal((await inspect()).frames, state.frames, 'Offscreen scene must stop drawing');
    await page.evaluate(() => scrollTo(0,0));
    await page.waitForTimeout(250);
    assert.ok((await inspect()).frames > state.frames);
    await page.evaluate(() => { window.previousHero = document.querySelector('canvas').heroScene; });
    await page.locator('.hero-actions [href="#/explorer"]').click();
    assert.equal(await page.evaluate(() => previousHero.inspect().destroyed), true);
    const afterCleanup = await page.evaluate(() => previousHero.inspect().frames);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => previousHero.inspect().frames), afterCleanup);
    await page.goBack();
    await page.waitForFunction(() => document.querySelector('canvas')?.heroScene?.inspect().frames > 2);
    console.log('PASS offscreen pause/resume, route cleanup, CTA and history remount');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('.hero-scene').dataset.sceneState === 'reduced-motion');
    assert.equal(await page.locator('.hero-scene').getAttribute('data-scene-state'), 'reduced-motion');
    assert.equal(await page.locator('canvas').isVisible(), false);
    assert.equal(await page.locator('.hero-fallback').isVisible(), true);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.querySelector('canvas').heroScene.inspect().running);
    // Simulate real context loss, then ensure the fallback and renderer recover.
    await page.evaluate(() => { window.heroContextExtension = document.querySelector('canvas').getContext('webgl').getExtension('WEBGL_lose_context'); heroContextExtension.loseContext(); });
    await page.waitForFunction(() => document.querySelector('.hero-scene').dataset.sceneState === 'context-lost');
    assert.equal(await page.locator('.hero-fallback').isVisible(), true);
    await page.evaluate(() => heroContextExtension.restoreContext());
    await page.waitForFunction(() => document.querySelector('.hero-scene').dataset.sceneState.startsWith('webgl'));
    console.log('PASS dynamic reduced-motion fallback and context-loss recovery');

    await page.screenshot({ path: path.join(process.env.TEMP,'cinderlens-3d-desktop.png') });
    for (const width of [375,390,430,768]) {
      await page.setViewportSize({width,height:900});
      await page.evaluate(() => scrollTo(0,0));
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      state = await inspect();
      assert.ok(state.width * state.height <= (width <= 640 ? 232000 : 442000));
    }
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(process.env.TEMP,'cinderlens-3d-mobile.png'),fullPage:true});
    assert.deepEqual(errors,[]);

    const fallbackPage = await browser.newPage({ reducedMotion: 'reduce' });
    await fallbackPage.goto(url);
    assert.equal(await fallbackPage.locator('canvas').isVisible(),false);
    assert.equal(await fallbackPage.locator('.hero-fallback').isVisible(),true);
    await fallbackPage.locator('.hero-actions [href="#/compare"]').click();
    await fallbackPage.locator('.compare-workspace').waitFor();
    const noGL = await browser.newPage();
    await noGL.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(kind,...args) { return kind === 'webgl' ? null : original.call(this,kind,...args); }; });
    await noGL.goto(url);
    assert.equal(await noGL.locator('.hero-scene').getAttribute('data-scene-state'),'unsupported');
    assert.equal(await noGL.locator('.hero-fallback').isVisible(),true);
    const shaderFailure = await browser.newPage();
    await shaderFailure.addInitScript(() => {
      window.shaderResources = { created: 0, deleted: 0 };
      const proto = WebGLRenderingContext.prototype;
      const create = proto.createShader, remove = proto.deleteShader, parameter = proto.getShaderParameter;
      proto.createShader = function(...args) { shaderResources.created++; return create.apply(this,args); };
      proto.deleteShader = function(...args) { shaderResources.deleted++; return remove.apply(this,args); };
      proto.getShaderParameter = function(shader, key) {
        if (key === this.COMPILE_STATUS && parameter.call(this,shader,this.SHADER_TYPE) === this.FRAGMENT_SHADER) return false;
        return parameter.call(this,shader,key);
      };
    });
    await shaderFailure.goto(url);
    assert.equal(await shaderFailure.locator('.hero-scene').getAttribute('data-scene-state'),'unsupported');
    assert.deepEqual(await shaderFailure.evaluate(() => shaderResources), {created: 2, deleted: 2});
    await shaderFailure.evaluate(() => { window.failedContext = document.querySelector('canvas').getContext('webgl'); });
    await shaderFailure.locator('.hero-actions [href="#/explorer"]').click();
    assert.equal(await shaderFailure.evaluate(() => failedContext.isContextLost()),true);
    const low = await browser.newPage({viewport:{width:390,height:844}});
    await low.addInitScript(() => Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2}));
    await low.goto(url);
    assert.equal(await low.locator('.hero-scene').getAttribute('data-scene-state'),'webgl-low-power');
    await low.locator('canvas').scrollIntoViewIfNeeded();
    const touch = await low.evaluate(() => {
      const figure = document.querySelector('.hero-scene'), rect = figure.getBoundingClientRect();
      const event = new PointerEvent('pointermove',{pointerType:'touch',buttons:1,clientX:rect.right-10,clientY:rect.top+120,bubbles:true,cancelable:true});
      figure.dispatchEvent(event);
      return { prevented:event.defaultPrevented, touchAction:getComputedStyle(figure).touchAction };
    });
    assert.equal(touch.prevented,false);
    assert.equal(touch.touchAction,'pan-y');
    await low.waitForTimeout(250);
    assert.ok((await low.locator('canvas').evaluate(c => c.heroScene.inspect())).pointer[0] > .01);
    await low.evaluate(() => document.querySelector('.hero-scene').dispatchEvent(new PointerEvent('pointercancel',{pointerType:'touch'})));
    await low.waitForTimeout(900);
    assert.ok(Math.abs((await low.locator('canvas').evaluate(c => c.heroScene.inspect())).pointer[0]) < .01);
    console.log('PASS mobile sizes, reduced-motion first load, no-WebGL/shader fallback, resource disposal and low-power quality');
    console.log('PASS touch tilt, scroll-compatible gesture handling and cancellation');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
