const {chromium} = require('playwright-core');
(async () => {
 const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
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
 console.log('Accessibility violations: ' + failures);
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:8000/#/explorer');
 await page.screenshot({path:process.env.TEMP + '/cinderlens-mobile-top.png'});
 await browser.close(); process.exitCode = failures ? 1 : 0;
})().catch(e=>{console.error(e);process.exit(1)});
