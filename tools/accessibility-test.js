const {chromium} = require('playwright-core');
(async () => {
 const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try {
 const page = await browser.newPage();
 const axePath = require.resolve('axe-core/axe.min.js');
 let failures = 0;
 for (const width of [390,1440]) {
  await page.setViewportSize({width,height:1000});
  for (const route of ['#/','#/explorer','#/explorer?coverage=1','#/compare?a=BASS2-T101&b=BASS2-T102&factor=airflow_cms','#/evidence/BASS2-T124','#/record/BASS2-T133','#/data-notes']) {
   await page.goto('http://127.0.0.1:8000/' + route);
   await page.addScriptTag({path:axePath});
   const results = await page.evaluate(async () => await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
   for (const v of results.violations) { console.log(JSON.stringify({width,route,id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})); failures++; }
  }
 }
 // Exercise expanded controls as well as the fourteen default page states.
 for (const state of ['mobile-nav', 'evidence-disclosures', 'record-inventory']) {
  await page.setViewportSize({width:390,height:1000});
  await page.goto('http://127.0.0.1:8000/' + (state === 'mobile-nav' ? '#/explorer' : state === 'record-inventory' ? '#/record/BASS2-T133' : '#/evidence/BASS2-T101'));
  if (state === 'mobile-nav') await page.locator('#nav-toggle').click();
  else if (state === 'record-inventory') await page.locator('.record-media > summary').click();
  else {
   await page.locator('.schematic-disclosure > summary').click();
   await page.locator('.planned-measurements > summary').click();
   await page.locator('.claim-concept > summary').click();
  }
  await page.addScriptTag({path:axePath});
  const results = await page.evaluate(() => axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
  for (const v of results.violations) { console.log(JSON.stringify({state,id:v.id,nodes:v.nodes.map(n=>n.target)})); failures++; }
 }
 console.log('Accessibility violations: ' + failures + ' across 17 page and expanded-control scans');
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:8000/#/explorer');
 await page.screenshot({path:process.env.TEMP + '/cinderlens-mobile-top.png'});
 process.exitCode = failures ? 1 : 0;
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
