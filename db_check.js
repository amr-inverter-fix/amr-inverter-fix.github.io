// Database validation for Inverter Fix. Run: node db_check.js
// Loads the data files the same way the site does, counts records and flags problems.
// Exit code 1 only for hard failures (records lost, a record without a known brand source, empty steps).
const fs = require('fs'), vm = require('vm');
const ctx = { window: {}, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
for (const f of ['data.js', 'data2.js', 'data3.js', 'data4.js']) {
  if (!fs.existsSync(f)) continue;
  try { vm.runInContext('var window=this.window;' + fs.readFileSync(f, 'utf8'), ctx); }
  catch (e) { console.log('LOAD_ERROR ' + f + ': ' + e.message); process.exit(1); }
}
const KB = ctx.window.KB || {};
const faults = KB.faults || [], src = KB.src || {};
const brands = new Set(faults.map(f => f.b));
const noCode = faults.filter(f => !f.c).length;
const seen = {}, dups = new Set();
for (const f of faults) { if (!f.c) continue; const k = f.b + '|' + f.c; if (seen[k]) dups.add(k); seen[k] = 1; }
const noSrc = faults.filter(f => !src[f.b]).length;
const noSteps = faults.filter(f => !f.s || !f.s.length).length;
const MIN_RECORDS = 1782; // never allow the database to shrink silently
const res = { records: faults.length, brands: brands.size, brands_with_source: Object.keys(src).length, records_without_code: noCode, duplicate_brand_code_groups: dups.size, records_without_source: noSrc, records_without_steps: noSteps, min_records_guard: MIN_RECORDS };
console.log(JSON.stringify(res));
let bad = [];
if (faults.length < MIN_RECORDS) bad.push('records dropped below ' + MIN_RECORDS);
if (noSrc) bad.push(noSrc + ' records without a source entry');
if (noSteps) bad.push(noSteps + ' records without steps');
if (bad.length) { console.log('FAIL: ' + bad.join('; ')); process.exit(1); }
console.log('OK');
