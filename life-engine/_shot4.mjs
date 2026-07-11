import { chromium } from 'playwright';
const out = '/tmp/claude-0/-home-user-udabno-online/6fad46ef-64fd-55f3-9fba-0ef6c6607ca4/scratchpad';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1180, height: 780 } });
const click = async (re, ms=4000) => { try { await p.getByRole('button',{name:re}).first().click({timeout:ms}); return true;} catch { return false; } };
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
await click(/Steady/); await click(/A Full Life/); await click(/Wager on The Beyond/);
// Life 1: coast to grow slowly, capture the walking figure alive
await click(/Begin a Life/i); await p.waitForTimeout(3400);
await p.screenshot({ path: `${out}/10-living-figure.png`, clip:{x:120,y:360,width:760,height:420} });
await p.screenshot({ path: `${out}/10b-living-full.png` });
// Rest to see Beyond ascension; retry lives until a Legacy shows (bold-ish)
let got={};
for (let i=0;i<16;i++){
  const rested = await click(/Rest & Claim/i, 2000);
  await p.waitForTimeout(1500);
  const badge = await p.locator('.beyond-badge').textContent().catch(()=>null);
  if (badge){ const k = badge.includes('Legacy')?'legacy':badge.includes('Dark')?'dark':'nothing'; if(!got[k]){got[k]=1; await p.screenshot({path:`${out}/11-beyond-${k}.png`});} }
  await click(/Live Again/i, 2000); await p.waitForTimeout(400);
  await click(/Begin a Life/i, 2000); await p.waitForTimeout(900+Math.floor(Math.random()*700));
  if (got.legacy) break;
}
console.log('captured buckets:', Object.keys(got).join(',')||'none');
await b.close();
