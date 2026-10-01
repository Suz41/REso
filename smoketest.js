// Temporary smoke-test harness (not part of the app). Stubs the minimum DOM
// surface app.js touches, then loads it and exercises each view + interaction.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const store = {};
const el = (id) => ({
  id, innerHTML: '', textContent: '', value: '', style: {},
  classList: { add() {}, remove() {} },
});

const main = el('main');
const sheet = el('sheet');
const opts = el('opts');
const backBtn = el('backBtn');
const navButtons = ['today', 'calendar', 'report'].map(el);

const panelHeader = el('panel-header');
const registry = { main, sheet, opts, backBtn, st: el('st'), ss: el('ss'), ref: el('ref'), toast: el('toast'), panelHeader };
for (const b of navButtons) registry[b.id] = b;

const document = {
  getElementById: (id) => registry[id] || null,
  querySelector: (sel) => (sel === '.panel-header' ? panelHeader : null),
  querySelectorAll: () => navButtons,
};

let fail = 0;
const check = (name, fn) => {
  try { fn(); console.log('  PASS  ' + name); }
  catch (e) { fail++; console.log('  FAIL  ' + name + ' -> ' + e.message); }
};

const sandbox = {
  document,
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
  },
  alert: (m) => console.log('        (alert: ' + m + ')'),
  scrollTo: () => {},
  Date,
  JSON,
  Object,
  Math,
  console,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), sandbox, { filename: 'app.js' });

console.log('\nSmoke tests:');

check('app.js evaluated and render() ran without throwing', () => {
  if (!main.innerHTML.includes('Keep it simple.')) throw new Error('today view did not render');
});

check('nav views all render', () => {
  for (const v of ['calendar', 'report', 'today']) {
    sandbox.setView(v);
    if (!main.innerHTML.length) throw new Error(v + ' rendered empty');
  }
});

check('calendar view includes months overview and unwell legend', () => {
  sandbox.setView('calendar');
  if (!main.innerHTML.includes('Months Overview')) throw new Error('missing Months Overview in Calendar view');
  if (!main.innerHTML.includes('Unwell')) throw new Error('missing Unwell in Calendar legend');
});

check('setS writes a value and persists to localStorage', () => {
  sandbox.setS('2026-10-05', 'health', 'bad');
  if (sandbox.st('health', '2026-10-05')[0] !== 'Neglected') throw new Error('status not Neglected');
  if (!store['resolutions-final']) throw new Error('nothing persisted');
});

check('openDay / openRes build the sheet with health toggles and proper layout', () => {
  sandbox.openDay('2026-10-05');
  if (sheet.style.display !== 'flex') throw new Error('sheet not shown');
  if (panelHeader.style.display !== 'none') throw new Error('panelHeader should be hidden in openDay');
  if (!opts.innerHTML.includes('day-switcher')) throw new Error('day-switcher missing from day sheet');
  if (!opts.innerHTML.includes('sheet-health-grid')) throw new Error('sheet-health-grid missing from day sheet');
  if (!opts.innerHTML.includes('day-res-card')) throw new Error('day-res-card missing from day sheet');
  if (!opts.innerHTML.includes('modal-done-btn')) throw new Error('modal-done-btn missing from day sheet');
  if (!opts.innerHTML.includes('Khud Pe Focus')) throw new Error('resolution missing from day sheet');
  if (!opts.innerHTML.includes('Period')) throw new Error('period option missing from day sheet');
  if (!opts.innerHTML.includes('Unwell')) throw new Error('unwell option missing from day sheet');
  
  sandbox.openRes('health', '2026-10-05', true);
  if (!opts.innerHTML.includes('Focused on myself')) throw new Error('Focused on myself option missing');
  if (!opts.innerHTML.includes('sheet-back')) throw new Error('sheet-back missing in openRes when opened fromDay');
  if (!opts.innerHTML.includes('sheet-res-meta')) throw new Error('sheet-res-meta missing in openRes');

  sandbox.closeSheet();
  if (panelHeader.style.display !== '') throw new Error('panelHeader should be reset upon closeSheet');
});

check('calendar day dots have distinct colors and proper day-dots container', () => {
  // Simulate today as Oct 10 so Oct 8 is an elapsed date that gets dots
  sandbox.__MOCK_TODAY = '2026-10-10';
  vm.runInContext('TODAY = getTodayKey()', sandbox);
  sandbox.setS('2026-10-08', 'health', 'bad');
  sandbox.setPeriod('2026-10-08', 'yes');
  sandbox.setUnwell('2026-10-08', 'yes');
  sandbox.setView('calendar');
  if (!main.innerHTML.includes('day-dots')) throw new Error('day-dots container missing from calendar days');
  if (!main.innerHTML.includes('dot-period')) throw new Error('dot-period missing from day-dots');
  if (!main.innerHTML.includes('dot-unwell')) throw new Error('dot-unwell missing from day-dots');
  if (!main.innerHTML.includes('Busy / Rest')) throw new Error('legend missing Busy / Rest label');
  
  // Verify styles.css has distinct color variables and static positioning
  const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
  if (!css.includes('--blue:')) throw new Error('missing --blue in styles.css');
  if (!css.includes('.day-dots .dot.w')) throw new Error('missing .day-dots .dot.w in styles.css');
  if (!css.includes('.legend i.w')) throw new Error('missing .legend i.w in styles.css');
  if (!css.includes('.day.future')) throw new Error('missing .day.future in styles.css');
});

check('gym is disabled by default, optional, and excluded from streak and scores unless enabled', () => {
  const testDate = '2026-10-15';
  sandbox.setGymEnabled(testDate, false, true);
  if (sandbox.isGymEnabled(testDate)) throw new Error('gym should be disabled by default');
  
  const status = sandbox.st('move', testDate);
  if (status[0] !== 'Disabled • Off') throw new Error('status should be Disabled • Off, got: ' + status[0]);
  if (status[1] !== 'subtle') throw new Error('pill class should be subtle, got: ' + status[1]);
  
  // When disabled, setting period/unwell does not force gym to rest
  sandbox.setUnwell(testDate, 'yes');
  const d1 = vm.runInContext('D("' + testDate + '")', sandbox);
  if (d1.move) throw new Error('disabled gym should not be auto-set to rest');
  
  // Enable gym
  sandbox.setGymEnabled(testDate, true, true);
  if (!sandbox.isGymEnabled(testDate)) throw new Error('gym should now be enabled');
  
  // Now with gym enabled, unwell auto-sets to rest if unlogged
  sandbox.setUnwell(testDate, 'no');
  sandbox.setUnwell(testDate, 'yes');
  const d2 = vm.runInContext('D("' + testDate + '")', sandbox);
  if (d2.move !== 'rest') throw new Error('enabled gym should auto-set to rest on unwell');
  
  // User can mark workout done even when unwell
  sandbox.setS(testDate, 'move', 'done');
  const d3 = vm.runInContext('D("' + testDate + '")', sandbox);
  if (d3.move !== 'done') throw new Error('workout should be done');
  
  // Disabling gym clears move and excludes from counts
  sandbox.setGymEnabled(testDate, false, true);
  const d4 = vm.runInContext('D("' + testDate + '")', sandbox);
  if (d4.move) throw new Error('disabling gym should clear move status');
});

check('unwell auto-marks gym as rest day if gym is enabled, but gym remains fully editable and keeps workout done', () => {
  // Case A: Enabled gym + setting unwell yes -> auto-marks gym rest
  sandbox.setGymEnabled('2026-10-10', true, true);
  vm.runInContext('delete D("2026-10-10").move; delete D("2026-10-10").unwell;', sandbox);
  sandbox.setUnwell('2026-10-10', 'yes');
  const d1 = vm.runInContext('D("2026-10-10")', sandbox);
  if (d1.unwell !== 'yes') throw new Error('unwell not yes');
  if (d1.move !== 'rest') throw new Error('gym should be auto-set to rest day when unwell is marked yes and gym enabled');

  // Case B: User works out even when unwell -> can mark gym as done
  sandbox.setS('2026-10-10', 'move', 'done');
  const d2 = vm.runInContext('D("2026-10-10")', sandbox);
  if (d2.move !== 'done') throw new Error('gym should be marked done even when unwell');
  if (d2.unwell !== 'yes') throw new Error('unwell should remain yes');

  // Case C: When gym is already done, toggling unwell yes does not downgrade workout to rest
  sandbox.setUnwell('2026-10-10', 'no');
  sandbox.setUnwell('2026-10-10', 'yes');
  const d3 = vm.runInContext('D("2026-10-10")', sandbox);
  if (d3.move !== 'done') throw new Error('workout should not be overwritten to rest when already done');
});

check('period auto-marks gym as rest day if gym is enabled, but gym remains fully editable and keeps workout done', () => {
  // Case A: Enabled gym + setting period yes -> auto-marks gym rest
  sandbox.setGymEnabled('2026-10-11', true, true);
  vm.runInContext('delete D("2026-10-11").move; delete D("2026-10-11").period;', sandbox);
  sandbox.setPeriod('2026-10-11', 'yes');
  const d1 = vm.runInContext('D("2026-10-11")', sandbox);
  if (d1.period !== 'yes') throw new Error('period not yes');
  if (d1.move !== 'rest') throw new Error('gym should be auto-set to rest day when period is marked yes and gym enabled');

  // Case B: User works out even on period -> can mark gym as done
  sandbox.setS('2026-10-11', 'move', 'done');
  const d2 = vm.runInContext('D("2026-10-11")', sandbox);
  if (d2.move !== 'done') throw new Error('gym should be marked done even when on period');
  if (d2.period !== 'yes') throw new Error('period should remain yes');

  // Case C: When gym is already done, toggling period yes does not downgrade workout to rest
  sandbox.setPeriod('2026-10-11', 'no');
  sandbox.setPeriod('2026-10-11', 'yes');
  const d3 = vm.runInContext('D("2026-10-11")', sandbox);
  if (d3.move !== 'done') throw new Error('workout should not be overwritten to rest when already done');
});

check('outside food status works properly', () => {
  if (sandbox.st('food', '2026-10-01')[0] !== 'Home food') throw new Error('food initial status incorrect');
  sandbox.setS('2026-10-01', 'food', 'bad');
  if (sandbox.st('food', '2026-10-01')[0] !== 'Ate outside') throw new Error('food bad status incorrect');
});

check('mind choices can be toggled and tracked', () => {
  sandbox.toggleMindChoice('2026-10-03', 'given_explanation');
  sandbox.toggleMindChoice('2026-10-03', 'given_sympathy');
  const d = vm.runInContext('D("2026-10-03")', sandbox);
  if (!d.mindChoices.includes('given_explanation')) throw new Error('missing given_explanation');
  if (!d.mindChoices.includes('given_sympathy')) throw new Error('missing given_sympathy');
  if (d.mind !== 'handled') throw new Error('expected mind to auto-set to handled');

  sandbox.toggleMindChoice('2026-10-03', 'given_sympathy');
  if (d.mindChoices.includes('given_sympathy')) throw new Error('given_sympathy was not toggled off');

  // Untick remaining choice
  sandbox.toggleMindChoice('2026-10-03', 'given_explanation');
  if (d.mindChoices.length !== 0) throw new Error('mindChoices should be empty');
  if (d.mind) throw new Error('mind should be deleted when all choices unticked');
});

check('today view renders health card, quote, resolutions and separate occasional card with tick toggles', () => {
  sandbox.setView('today');
  if (!main.innerHTML.includes('health-card')) throw new Error('health-card missing from today view');
  if (!main.innerHTML.includes('Outside Food')) throw new Error('Outside Food missing from today view');
  if (!main.innerHTML.includes('Occasional Boundaries')) throw new Error('Occasional Boundaries section missing from today view');
  if (!main.innerHTML.includes('Given explanation')) throw new Error('Given explanation toggle missing');
  if (!main.innerHTML.includes('Given sympathy')) throw new Error('Given sympathy toggle missing');
  if (!main.innerHTML.includes('Exaggerated thing')) throw new Error('Exaggerated thing toggle missing');
  if (!main.innerHTML.includes('tick-toggle-btn')) throw new Error('tick-toggle-btn missing');
  if (!main.innerHTML.includes('Jo badal gaya woh advik kya')) throw new Error('quote missing');
  if (!main.innerHTML.includes('save-home-btn')) throw new Error('save-home-btn missing from today view');
  sandbox.saveHomeLog();
});

check('unwell and period auto-mark family as self-care rest, remaining fully editable', () => {
  const dateP = '2026-10-18';
  const dateU = '2026-10-19';
  
  // Period auto-marks family = 'rest' if not already done
  sandbox.setPeriod(dateP, 'yes');
  const dP = vm.runInContext('D("' + dateP + '")', sandbox);
  if (dP.family !== 'rest') throw new Error('family should be auto-set to rest on period, got: ' + dP.family);
  const statusP = sandbox.st('family', dateP);
  if (statusP[0] !== 'Self-care') throw new Error('family status should be Self-care on period, got: ' + statusP[0]);

  // User can still edit family to 'done' (e.g. spent time)
  sandbox.setS(dateP, 'family', 'done');
  if (dP.family !== 'done') throw new Error('user should be able to edit family to done on period');

  // Unwell auto-marks family = 'rest' if not already done
  sandbox.setUnwell(dateU, 'yes');
  const dU = vm.runInContext('D("' + dateU + '")', sandbox);
  if (dU.family !== 'rest') throw new Error('family should be auto-set to rest on unwell, got: ' + dU.family);
  const statusU = sandbox.st('family', dateU);
  if (statusU[0] !== 'Self-care') throw new Error('family status should be Self-care on unwell, got: ' + statusU[0]);

  // If already done, setting unwell does NOT downgrade family
  sandbox.setS(dateU, 'family', 'done');
  sandbox.setUnwell(dateU, 'no');
  sandbox.setUnwell(dateU, 'yes');
  if (dU.family !== 'done') throw new Error('family already done should not be overwritten to rest on unwell');
});

check('month overview and report logic calculate clean days accurately without double penalties', () => {
  // Set simulated TODAY to 2026-10-05 so Oct 1, 2, 3 are completed dates
  sandbox.__MOCK_TODAY = '2026-10-05';
  vm.runInContext('TODAY = getTodayKey()', sandbox);

  // Clear any existing test data for October 2026
  const days = vm.runInContext('db.days', sandbox);
  for (const k of Object.keys(days)) {
    if (k.startsWith('2026-10')) delete days[k];
  }
  
  // Day 1: Perfect clean day
  sandbox.setS('2026-10-01', 'health', 'done');
  sandbox.setS('2026-10-01', 'food', 'done');
  sandbox.setS('2026-10-01', 'phone', 'done');
  sandbox.setS('2026-10-01', 'family', 'done');

  // Day 2: Day with MULTIPLE misses (food bad + health bad)
  sandbox.setS('2026-10-02', 'food', 'bad');
  sandbox.setS('2026-10-02', 'health', 'bad');
  sandbox.setS('2026-10-02', 'phone', 'done');
  sandbox.setS('2026-10-02', 'family', 'done');

  // Day 3: Period day with self-care (no bad misses -> counts as clean!)
  sandbox.setPeriod('2026-10-03', 'yes');
  sandbox.setS('2026-10-03', 'food', 'done');
  sandbox.setS('2026-10-03', 'phone', 'done');

  // Check stats for October 2026:
  const octStats = vm.runInContext('md(months[0])', sandbox);
  if (!octStats.resStats) throw new Error('missing resStats in md(m)');
  if (octStats.resStats.food.bad !== 1) throw new Error('food.bad should be 1, got: ' + octStats.resStats.food.bad);
  if (octStats.resStats.health.bad !== 1) throw new Error('health.bad should be 1, got: ' + octStats.resStats.health.bad);
  if (octStats.days !== 5) throw new Error('only elapsed dates (1-5 Oct) should be counted, got: ' + octStats.days);
  
  // Verify Calendar renders detailed breakdown chips
  sandbox.setView('calendar');
  if (!main.innerHTML.includes('detail-chip')) throw new Error('missing detail-chip in calendar overview');
  if (!main.innerHTML.includes('<span>Outside Food</span>')) throw new Error('missing Outside Food row in calendar month breakdown');
  if (!main.innerHTML.includes('clean days •')) throw new Error('missing clean days in calendar month overview');

  // Verify Report renders habit cards, health metrics, clean days, and real reasons slips log
  sandbox.setView('report');
  if (!main.innerHTML.includes('report-habit-card')) throw new Error('missing report-habit-card in report view');
  if (!main.innerHTML.includes('Clean Days')) throw new Error('missing Clean Days in report view');
  if (!main.innerHTML.includes('Habit Performance Breakdown')) throw new Error('missing Habit Performance Breakdown in report view');
  if (!main.innerHTML.includes('Real Reasons &amp; Exceptions Log') && !main.innerHTML.includes('Real Reasons & Exceptions Log')) throw new Error('missing Real Reasons Log in report view');
  if (!main.innerHTML.includes('class="compare"')) throw new Error('missing compare table in report view');
  if (!main.innerHTML.includes('Workouts')) throw new Error('missing Workouts column in report comparison');
});

check('upcoming dates are not counted in advance and future months show upcoming status', () => {
  // Set TODAY to Oct 1
  sandbox.__MOCK_TODAY = '2026-10-01';
  vm.runInContext('TODAY = getTodayKey()', sandbox);
  
  // November should have 0 days counted and isUpcoming true
  const novStats = vm.runInContext('md(months[1])', sandbox);
  if (novStats.days !== 0) throw new Error('November should have 0 days counted when today is Oct 1, got: ' + novStats.days);
  if (!novStats.isUpcoming) throw new Error('November should be marked isUpcoming');
  
  // October should only count 1 day (today)
  const octStats = vm.runInContext('md(months[0])', sandbox);
  if (octStats.days !== 1) throw new Error('October should only count 1 day when today is Oct 1, got: ' + octStats.days);

  // Calendar should render future month as Upcoming
  sandbox.setView('calendar');
  if (!main.innerHTML.includes('Upcoming • Starts November 1')) throw new Error('missing upcoming status for November in Calendar');
});

console.log(fail === 0 ? '\nAll smoke tests passed.\n' : '\n' + fail + ' smoke test(s) FAILED.\n');
process.exit(fail === 0 ? 0 : 1);
