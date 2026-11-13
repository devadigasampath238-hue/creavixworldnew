// Captures real screenshots of the deployed sites into public/previews. Run: npx playwright install chromium && npm run shots
import { chromium } from 'playwright'
const sites = { trust: 'https://trustcreditsolutions.in/', kundapura: 'https://kundapura-edits-studio.onrender.com/', hotel: 'https://devadigasampath238-hue.github.io/Hotel-Udupi-Upachar/', erp: 'https://devadigasampath238-hue.github.io/student-erp/', temple: 'https://devadigasampath238-hue.github.io/SriBramhaLingeshwara/' }
const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1440, height: 900 } })
for (const [k, u] of Object.entries(sites)) {
  try { await pg.goto(u, { waitUntil: 'networkidle', timeout: 90000 }); await pg.waitForTimeout(3000); await pg.screenshot({ path: `public/previews/${k}.png` }); console.log('saved', k) } catch (e) { console.log('FAILED', k, String(e).slice(0, 80)) }
}
await b.close()
