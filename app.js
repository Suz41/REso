// Resolutions Reset: 1 Oct 2026 -> 1 Jan 2027 (93 days)
const START = '2026-10-01';
const END = '2027-01-01';
const N = 93;

const pad = n => String(n).padStart(2, '0');
const formatDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDateKey = str => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const getTodayKey = () => (typeof globalThis !== 'undefined' && globalThis.__MOCK_TODAY) || formatDate(new Date());

let TODAY = getTodayKey();
const db = JSON.parse(localStorage.getItem('resolutions-final') || '{"days":{},"reflection":""}');
const months = [
  ['October', 2026, 9],
  ['November', 2026, 10],
  ['December', 2026, 11],
  ['January', 2027, 0]
];

const R = [
  ['health', 'Khud Pe Focus', 'Physical + mental health', 'H', 'habit'],
  ['food', 'Outside Food', 'Limit / avoid outside food', 'F', 'habit'],
  ['phone', '11:30 PM Boundary', 'No phone after 11:30 max', 'P', 'habit'],
  ['move', 'Gym & Movement', 'Gym or active movement', 'A', 'flex'],
  ['family', 'Family & Myself', 'Make time for both', 'F', 'flex']
];

const MIND_CHOICES = [
  { id: 'given_explanation', title: 'Given explanation', sub: 'Overexplained instead of “Meri marzi”', label: 'Given explanation', altId: 'no_explanation' },
  { id: 'given_sympathy', title: 'Given sympathy', sub: 'Felt guilty or gave sympathy instead of “Ok leave it”', label: 'Given sympathy', altId: 'no_sympathy' },
  { id: 'exaggerated_thing', title: 'Exaggerated thing', sub: 'Lost cool, ego or anger instead of ignoring', label: 'Exaggerated thing', altId: 'no_exaggerating' }
];

const RESOLUTION_CONFIG = {
  health: {
    title: 'Khud Pe Focus',
    sub: 'Physical & mental health',
    icon: 'health',
    options: [
      { val: 'ok', label: 'Focused on myself', short: 'Focused', type: 'ok', desc: 'Prioritized my physical and mental health' },
      { val: 'bad', label: 'Neglected / Stressed', short: 'Neglected', type: 'bad', desc: 'Drained, stressed, or skipped self-care' }
    ]
  },
  food: {
    title: 'Outside Food',
    sub: 'Avoid or limit outside food',
    icon: 'food',
    options: [
      { val: 'ok', label: 'Home food / Clean', short: 'Home food', type: 'ok', desc: 'Healthy home-cooked meals, no outside food' },
      { val: 'bad', label: 'Ate outside food', short: 'Ate outside', type: 'bad', desc: 'Had restaurant, takeout, or junk food' }
    ]
  },
  phone: {
    title: '11:30 PM Boundary',
    sub: 'No phone after 11:30 max',
    icon: 'phone',
    options: [
      { val: 'ok', label: 'Off by 11:30 PM', short: 'Off by 11:30', type: 'ok', desc: 'Phone put away on time, slept peacefully' },
      { val: 'bad', label: 'Used past 11:30 PM', short: 'Past 11:30', type: 'bad', desc: 'Stayed awake browsing or texting late' }
    ]
  },
  move: {
    title: 'Gym & Movement',
    sub: 'Gym or active movement',
    icon: 'move',
    options: [
      { val: 'done', label: 'Workout completed', short: 'Workout done', type: 'done', desc: 'Went to the gym or did active movement' },
      { val: 'rest', label: 'Planned rest day', short: 'Rest day', type: 'warn', desc: 'Legitimate planned body recovery' },
      { val: 'bad', label: 'Skipped workout', short: 'Skipped', type: 'bad', desc: 'Lazy or missed scheduled workout' }
    ]
  },
  family: {
    title: 'Family & Myself',
    sub: 'Make time for both',
    icon: 'family',
    options: [
      { val: 'done', label: 'Quality time spent', short: 'Spent time', type: 'done', desc: 'Meaningful time with family & self' },
      { val: 'rest', label: 'Self-care & resting', short: 'Self-care', type: 'warn', desc: 'Focused on recovery & myself (Unwell/Period)' },
      { val: 'busy', label: 'Busy / Work day', short: 'Busy', type: 'warn', desc: 'Busy day, but kept it balanced' },
      { val: 'bad', label: 'Disconnected', short: 'Disconnected', type: 'bad', desc: 'Felt distant or neglected loved ones' }
    ]
  },
  mind: {
    title: 'No Explanation, Sympathy, Exaggerating',
    sub: 'Situational • "Meri marzi" • "Ok leave it then & there"',
    badge: 'Occasional',
    icon: 'mind',
    options: [
      { val: '', label: 'No occasion today', short: 'No occasion', type: 'ok', desc: 'Peaceful day — no confrontation or drama occurred' },
      { val: 'handled', label: 'Occasion arose • Stood firm', short: 'Stood firm', type: 'done', desc: 'Held boundaries ("Meri marzi" / "Leave it then & there")' },
      { val: 'improve', label: 'Occasion arose • Slipped', short: 'Slipped', type: 'bad', desc: 'Overexplained, gave sympathy, or lost control of ego/anger' }
    ]
  }
};

const ICONS = {
  health: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  food: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="13" height="19" x="5.5" y="2.5" rx="2"/><path d="M12 18h.01"/></svg>',
  move: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 12 6-6 6 6"/><path d="M12 18V6"/></svg>',
  family: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  mind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
};

let view = 'today';
let cm = 0;
let sheetContext = null; // null | { type: 'day'|'res', id?: string, date: string, fromDay?: boolean }
let toastTimeout = null;

const main = document.getElementById('main');
const sheet = document.getElementById('sheet');
const opts = document.getElementById('opts');

const k = d => formatDate(d);
const D = dateStr => db.days[dateStr] || (db.days[dateStr] = {});

function save() {
  localStorage.setItem('resolutions-final', JSON.stringify(db));
}

function isGymEnabled(dateKey) {
  if (!dateKey) dateKey = TODAY;
  const d = D(dateKey);
  if (d.gymEnabled !== undefined) {
    return Boolean(d.gymEnabled);
  }
  return Boolean(db.gymEnabled);
}

function setGymEnabled(dateKey, enabled, applyGlobal = false) {
  if (!dateKey) dateKey = TODAY;
  enabled = Boolean(enabled);
  D(dateKey).gymEnabled = enabled;
  if (applyGlobal || db.gymEnabled === undefined || dateKey === TODAY) {
    db.gymEnabled = enabled;
  }
  if (!enabled) {
    delete D(dateKey).move;
    showToast('Gym disabled • Excluded from counts');
  } else {
    showToast('Gym enabled • Active for tracking');
  }
  save();
  if (sheetContext && sheetContext.type === 'day') {
    openDay(dateKey);
  } else if (sheetContext && sheetContext.type === 'res' && sheetContext.id === 'move') {
    openRes('move', dateKey, sheetContext.fromDay);
  }
  render();
}

function setPeriod(dateKey, val) {
  if (!val || val === 'no') {
    delete D(dateKey).period;
    if (D(dateKey).family === 'rest' && !D(dateKey).unwell) {
      delete D(dateKey).family;
    }
    showToast('Period cleared');
  } else {
    D(dateKey).period = 'yes';
    const notes = [];
    // Auto-mark Gym as Rest day ONLY if gym is enabled
    if (isGymEnabled(dateKey)) {
      if (D(dateKey).move !== 'done') {
        D(dateKey).move = 'rest';
        notes.push('Gym rest');
      }
    }
    // Auto-mark Family & Myself as Self-care unless quality time was completed
    if (D(dateKey).family !== 'done') {
      D(dateKey).family = 'rest';
      notes.push('Family self-care');
    }
    const suffix = notes.length > 0 ? ' • Auto-set ' + notes.join(' & ') : '';
    showToast('Period logged' + suffix);
  }
  save();
  if (sheetContext && sheetContext.type === 'day') {
    openDay(dateKey);
  }
  render();
}

function setUnwell(dateKey, val) {
  if (!val || val === 'no') {
    delete D(dateKey).unwell;
    if (D(dateKey).family === 'rest' && !D(dateKey).period) {
      delete D(dateKey).family;
    }
    showToast('Unwell cleared');
  } else {
    D(dateKey).unwell = 'yes';
    const notes = [];
    // Auto-mark Gym as Rest day ONLY if gym is enabled
    if (isGymEnabled(dateKey)) {
      if (D(dateKey).move !== 'done') {
        D(dateKey).move = 'rest';
        notes.push('Gym rest');
      }
    }
    // Auto-mark Family & Myself as Self-care unless quality time was completed
    if (D(dateKey).family !== 'done') {
      D(dateKey).family = 'rest';
      notes.push('Family self-care');
    }
    const suffix = notes.length > 0 ? ' • Auto-set ' + notes.join(' & ') : '';
    showToast('Unwell logged' + suffix);
  }
  save();
  if (sheetContext && sheetContext.type === 'day') {
    openDay(dateKey);
  }
  render();
}

function isMindChoiceTicked(choices, c) {
  if (!choices || !Array.isArray(choices)) return false;
  return choices.includes(c.id) || Boolean(c.altId && choices.includes(c.altId));
}

function toggleMindChoice(dateKey, choiceId) {
  const d = D(dateKey);
  if (!Array.isArray(d.mindChoices)) d.mindChoices = [];
  const c = MIND_CHOICES.find(item => item.id === choiceId || item.altId === choiceId);
  const targetId = c ? c.id : choiceId;
  const altId = c ? c.altId : null;

  const idx = d.mindChoices.findIndex(x => x === targetId || (altId && x === altId));
  if (idx > -1) {
    d.mindChoices.splice(idx, 1);
  } else {
    d.mindChoices.push(targetId);
  }
  if (d.mindChoices.length > 0) {
    d.mind = 'handled';
  } else {
    delete d.mind;
  }
  save();
  const name = c ? c.title : choiceId;
  showToast((idx > -1 ? 'Unticked: ' : 'Ticked: ') + name);
  if (sheetContext && sheetContext.type === 'day') {
    openDay(dateKey);
  } else if (sheetContext && sheetContext.type === 'res') {
    openRes(sheetContext.id, dateKey, sheetContext.fromDay);
  }
  render();
}

function renderOccasionalBoundaries(dateKey) {
  const choices = D(dateKey).mindChoices || [];

  return (
    '<div class="section occasional-section">' +
      '<div class="section-title-wrap">' +
        '<span>Occasional Boundaries</span>' +
        '<span class="res-badge-occasional">Situational</span>' +
      '</div>' +
    '</div>' +
    '<div class="card occasional-card">' +
      '<div class="occasional-hint-text">Situational • Tick if you did any of these today:</div>' +
      MIND_CHOICES.map(c => {
        const isChecked = isMindChoiceTicked(choices, c);
        return (
          '<div class="boundary-toggle-row' + (isChecked ? ' active' : '') + '" onclick="toggleMindChoice(\'' + dateKey + '\', \'' + c.id + '\')">' +
            '<div class="boundary-info">' +
              '<div class="boundary-title">' + c.title + '</div>' +
              '<div class="boundary-sub">' + c.sub + '</div>' +
            '</div>' +
            '<button class="tick-toggle-btn' + (isChecked ? ' active' : '') + '" ' +
                    'type="button" ' +
                    'aria-label="' + c.title + '" ' +
                    'aria-pressed="' + (isChecked ? 'true' : 'false') + '" ' +
                    'onclick="event.stopPropagation();toggleMindChoice(\'' + dateKey + '\', \'' + c.id + '\')">' +
              '<span class="tick-icon">✓</span>' +
            '</button>' +
          '</div>'
        );
      }).join('') +
    '</div>'
  );
}

function saveHomeLog() {
  save();
  showToast("Today's log saved successfully");
}

function st(id, dateKey) {
  const cfg = RESOLUTION_CONFIG[id];
  if (!cfg) return ['On track', ''];
  const v = D(dateKey)[id];

  if (id === 'mind') {
    const choices = D(dateKey).mindChoices || [];
    if (v === 'handled') {
      return [choices.length > 0 ? choices.length + ' maintained' : 'Stood firm', 'done'];
    }
    if (v === 'improve') return ['Slipped', 'bad'];
    if (choices.length > 0) return [choices.length + ' maintained', 'done'];
    return ['No occasion', 'occasional'];
  }

  if (id === 'move') {
    if (!isGymEnabled(dateKey)) {
      return ['Disabled • Off', 'subtle'];
    }
    if (!v) {
      return ['Tap to log', 'warn'];
    }
    const opt = cfg.options.find(o => o.val === v) || cfg.options[0];
    const pillClass = opt.type === 'bad' ? 'bad' : opt.type === 'warn' ? 'busy' : opt.type === 'done' ? 'done' : '';
    return [opt.short, pillClass];
  }

  const curVal = v || 'ok';
  const opt = cfg.options.find(o => o.val === curVal) || cfg.options[0];
  const pillClass = opt.type === 'bad' ? 'bad' : opt.type === 'warn' ? 'busy' : opt.type === 'done' ? 'done' : '';
  return [opt.short, pillClass];
}

function renderResFlexButtons(id, type, dateStr) {
  const cfg = RESOLUTION_CONFIG[id];
  if (!cfg) return '';
  const curVal = D(dateStr)[id] || '';

  if (id === 'move') {
    const gymOn = isGymEnabled(dateStr);
    const toggleHtml =
      '<div class="gym-toggle-strip">' +
        '<span class="gym-toggle-hint">Optional resolution</span>' +
        '<div class="segmented-pill mini">' +
          '<button class="seg-btn' + (!gymOn ? ' active' : '') + '" onclick="event.stopPropagation();setGymEnabled(\'' + dateStr + '\', false, true)">Disabled</button>' +
          '<button class="seg-btn rose' + (gymOn ? ' active' : '') + '" onclick="event.stopPropagation();setGymEnabled(\'' + dateStr + '\', true, true)">Enabled</button>' +
        '</div>' +
      '</div>';

    if (!gymOn) {
      return (
        '<div class="gym-box-wrapper">' +
          toggleHtml +
          '<div class="gym-disabled-card" onclick="event.stopPropagation();setGymEnabled(\'' + dateStr + '\', true, true)">' +
            '<span>Gym tracking is disabled (not counted in streak/reports)</span>' +
            '<button class="gym-enable-action-btn" type="button">Enable Gym</button>' +
          '</div>' +
        '</div>'
      );
    }

    const buttonsHtml =
      '<div class="flex-btn-group">' +
        cfg.options.map(opt => {
          const isSelected = curVal === opt.val;
          const cls = opt.type === 'done' ? 'done' : opt.type === 'bad' ? 'bad' : 'busy';

          return (
            '<button class="flex-btn ' + cls + (isSelected ? ' active' : '') + '" onclick="event.stopPropagation();setS(\'' + dateStr + '\',\'move\',\'' + opt.val + '\')">' +
              opt.short +
            '</button>'
          );
        }).join('') +
      '</div>';

    return (
      '<div class="gym-box-wrapper">' +
        toggleHtml +
        buttonsHtml +
      '</div>'
    );
  }

  const buttonsHtml =
    '<div class="flex-btn-group">' +
      cfg.options.map(opt => {
        let isSelected = false;
        if (id === 'mind') {
          isSelected = (opt.val === '' && !curVal) || (opt.val !== '' && curVal === opt.val);
        } else {
          isSelected = (!curVal && opt.val === 'ok') || (curVal === opt.val);
        }

        const cls = opt.type === 'done' || opt.val === 'handled' ? 'done' :
                    opt.type === 'bad' || opt.val === 'improve' ? 'bad' :
                    opt.type === 'warn' ? 'busy' : '';

        return (
          '<button class="flex-btn ' + cls + (isSelected ? ' active' : '') + '" onclick="event.stopPropagation();setS(\'' + dateStr + '\',\'' + id + '\',\'' + opt.val + '\')">' +
            opt.short +
          '</button>'
        );
      }).join('') +
    '</div>';

  return buttonsHtml;
}

function dc(dateKey) {
  if (dateKey > TODAY) return '';
  const dayData = D(dateKey);
  const gymOn = isGymEnabled(dateKey);

  const vals = [];
  if (dayData.health) vals.push(dayData.health);
  if (dayData.food) vals.push(dayData.food);
  if (dayData.phone) vals.push(dayData.phone);
  if (dayData.family) vals.push(dayData.family);
  if (gymOn && dayData.move) vals.push(dayData.move);

  if (vals.length === 0) return '';
  if (vals.some(x => x === 'bad')) return 'r';
  if (vals.includes('busy') || vals.includes('rest')) return 'w';
  if (vals.some(x => x === 'done' || x === 'ok')) return 'g';
  return '';
}

function setView(v) {
  view = v;
  render();
}

function render() {
  document.querySelectorAll('.nav button').forEach(x => x.classList.remove('active'));
  const activeId = view === 'months' ? 'calendar' : view;
  const activeBtn = document.getElementById(activeId);
  if (activeBtn) activeBtn.classList.add('active');

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    if (view === 'today' && (!sheet || sheet.style.display !== 'flex')) {
      backBtn.classList.add('hidden');
    } else {
      backBtn.classList.remove('hidden');
    }
  }

  const views = { today, monthsView, calendar, report };
  const target = view === 'months' ? calendar : view === 'calendar' ? calendar : view === 'report' ? report : today;
  target();
  scrollTo(0, 0);
}

function getDayProgress() {
  const startMs = new Date(2026, 9, 1).getTime();
  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.floor((todayMs - startMs) / 86400000) + 1;
  return Math.max(0, Math.min(N, diffDays));
}

function getStreak() {
  let current = 0;
  let best = 0;
  let temp = 0;
  const p = getDayProgress();
  const startD = parseDateKey(START);

  for (let i = 0; i < p; i++) {
    const curD = new Date(startD);
    curD.setDate(curD.getDate() + i);
    const key = formatDate(curD);
    const dayData = D(key);
    const hasMiss = Object.keys(dayData).some(k => {
      if (k === 'period' || k === 'unwell' || k === 'mindChoices' || k === 'mind' || k === 'gymEnabled') return false;
      if (k === 'move' && !isGymEnabled(key)) return false;
      return dayData[k] === 'bad';
    });
    if (!hasMiss) {
      temp++;
      if (temp > best) best = temp;
    } else {
      temp = 0;
    }
  }
  current = temp;
  return { current, best };
}

function today() {
  TODAY = getTodayKey();
  const p = getDayProgress();
  const pct = Math.round((p / N) * 100);
  const remaining = Math.max(0, N - p);
  const streak = getStreak();
  const isPeriod = Boolean(D(TODAY).period);
  const isUnwell = Boolean(D(TODAY).unwell);

  const healthCardHtml =
    '<div class="health-card">' +
      '<div class="health-row">' +
        '<div>' +
          '<div class="health-title">Period</div>' +
          '<div class="health-desc">Cycle tracking</div>' +
        '</div>' +
        '<div class="segmented-pill">' +
          '<button class="seg-btn' + (!isPeriod ? ' active' : '') + '" onclick="setPeriod(TODAY, \'no\')">No</button>' +
          '<button class="seg-btn rose' + (isPeriod ? ' active' : '') + '" onclick="setPeriod(TODAY, \'yes\')">Yes</button>' +
        '</div>' +
      '</div>' +
      '<div class="health-row">' +
        '<div>' +
          '<div class="health-title">Unwell</div>' +
          '<div class="health-desc">Sick / low energy day</div>' +
        '</div>' +
        '<div class="segmented-pill">' +
          '<button class="seg-btn' + (!isUnwell ? ' active' : '') + '" onclick="setUnwell(TODAY, \'no\')">No</button>' +
          '<button class="seg-btn amber' + (isUnwell ? ' active' : '') + '" onclick="setUnwell(TODAY, \'yes\')">Yes</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  main.innerHTML =
    '<section class="hero">' +
      '<h1>Keep it simple.</h1>' +
      '<div class="hero-quote">“Jo badal gaya woh advik kya 😒”</div>' +
    '</section>' +
    '<div class="blue">' +
      '<div class="hero-card-header">' +
        '<div class="hero-pill-badge">Day ' + p + ' of ' + N + '</div>' +
        '<div class="hero-percent">' + pct + '%</div>' +
      '</div>' +
      '<div class="big">' + p + ' <span>/ ' + N + ' days</span></div>' +
      '<div class="progress"><i style="width:' + pct + '%"></i></div>' +
      '<div class="hero-footer">' +
        '<span>' + remaining + ' days left</span>' +
        '<span>' + streak.current + ' day streak</span>' +
      '</div>' +
    '</div>' +
    healthCardHtml +
    '<div class="section">' +
      '<span>Daily Resolutions</span>' +
    '</div>' +
    '<div class="card resolutions-card">' +
      R.map(r => {
        const id = r[0];
        const type = r[4];
        const s = st(id, TODAY);
        const iconSvg = ICONS[id] || r[3];
        const flexButtons = renderResFlexButtons(id, type, TODAY);

        return (
          '<div class="res-item" onclick="openRes(\'' + id + '\',\'' + TODAY + '\',false)">' +
            '<div class="res-head">' +
              '<div class="ico">' + iconSvg + '</div>' +
              '<div class="body">' +
                '<div class="name">' + r[1] + '</div>' +
                '<div class="note">' + r[2] + '</div>' +
              '</div>' +
              '<span class="pill ' + s[1] + '">' + s[0] + '</span>' +
            '</div>' +
            flexButtons +
          '</div>'
        );
      }).join('') +
    '</div>' +
    renderOccasionalBoundaries(TODAY) +
    '<div class="home-save-bar">' +
      '<button class="save-home-btn" onclick="saveHomeLog()">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>' +
        'Save Today\'s Log' +
      '</button>' +
    '</div>';
}

function md(m) {
  let days = 0;
  let cleanDays = 0;
  let missDays = 0;
  let missCount = 0;
  let busyCount = 0;
  let doneCount = 0;
  let periodDays = 0;
  let unwellDays = 0;

  const reasons = {
    food: { bad: 0 },
    phone: { bad: 0 },
    health: { bad: 0 },
    family: { bad: 0, rest: 0, busy: 0, done: 0 },
    move: { bad: 0, rest: 0, done: 0, enabledDays: 0 },
    mind: { choices: {} }
  };

  const resStats = {
    health: { ok: 0, bad: 0 },
    food: { ok: 0, bad: 0 },
    phone: { ok: 0, bad: 0 },
    move: { done: 0, rest: 0, bad: 0, enabledDays: 0 },
    family: { done: 0, rest: 0, busy: 0, bad: 0 },
    mind: { handled: 0, improve: 0, totalChoices: 0 }
  };

  const slipsLog = [];

  const numDays = new Date(m[1], m[2] + 1, 0).getDate();
  for (let d = 1; d <= numDays; d++) {
    const dStr = `${m[1]}-${pad(m[2] + 1)}-${pad(d)}`;
    if (dStr < START || dStr > END) continue;
    if (dStr > TODAY) continue; // CRITICAL: Never count upcoming dates in advance!

    days++;
    const dayData = D(dStr);
    const gymOn = isGymEnabled(dStr);
    if (dayData.period) periodDays++;
    if (dayData.unwell) unwellDays++;

    const daySlips = [];

    // Health
    if (dayData.health === 'bad') {
      resStats.health.bad++;
      missCount++;
      reasons.health.bad++;
      daySlips.push({ habit: 'Khud Pe Focus', reason: 'Neglected / Stressed', type: 'bad' });
    } else {
      resStats.health.ok++;
    }

    // Food
    if (dayData.food === 'bad') {
      resStats.food.bad++;
      missCount++;
      reasons.food.bad++;
      daySlips.push({ habit: 'Outside Food', reason: 'Ate outside food', type: 'bad' });
    } else {
      resStats.food.ok++;
    }

    // Phone
    if (dayData.phone === 'bad') {
      resStats.phone.bad++;
      missCount++;
      reasons.phone.bad++;
      daySlips.push({ habit: '11:30 PM Boundary', reason: 'Past 11:30 PM (late phone)', type: 'bad' });
    } else {
      resStats.phone.ok++;
    }

    // Gym
    if (gymOn) {
      resStats.move.enabledDays++;
      if (dayData.move === 'done') {
        resStats.move.done++;
        doneCount++;
        reasons.move.done++;
      } else if (dayData.move === 'rest') {
        resStats.move.rest++;
        busyCount++;
        reasons.move.rest++;
      } else if (dayData.move === 'bad') {
        resStats.move.bad++;
        missCount++;
        reasons.move.bad++;
        daySlips.push({ habit: 'Gym', reason: 'Skipped workout', type: 'bad' });
      }
    }

    // Family & Myself
    if (dayData.family === 'done') {
      resStats.family.done++;
      doneCount++;
      reasons.family.done++;
    } else if (dayData.family === 'rest') {
      resStats.family.rest++;
      busyCount++;
      reasons.family.rest++;
    } else if (dayData.family === 'busy') {
      resStats.family.busy++;
      busyCount++;
      reasons.family.busy++;
    } else if (dayData.family === 'bad') {
      resStats.family.bad++;
      missCount++;
      reasons.family.bad++;
      daySlips.push({ habit: 'Family & Myself', reason: 'Disconnected / Ignored', type: 'bad' });
    }

    // Mind
    if (dayData.mind === 'handled') resStats.mind.handled++;
    else if (dayData.mind === 'improve') resStats.mind.improve++;
    if (Array.isArray(dayData.mindChoices)) {
      resStats.mind.totalChoices += dayData.mindChoices.length;
      dayData.mindChoices.forEach(cid => {
        const item = MIND_CHOICES.find(mc => mc.id === cid || mc.altId === cid);
        const name = item ? item.title : cid;
        reasons.mind.choices[name] = (reasons.mind.choices[name] || 0) + 1;
        daySlips.push({ habit: 'Occasion Caught', reason: name, type: 'warn' });
      });
    }

    const hasMiss = Object.keys(dayData).some(k => {
      if (k === 'period' || k === 'unwell' || k === 'mindChoices' || k === 'mind' || k === 'gymEnabled') return false;
      if (k === 'move' && !gymOn) return false;
      return dayData[k] === 'bad';
    });

    if (hasMiss) {
      missDays++;
    } else {
      cleanDays++;
    }

    if (daySlips.length > 0 || dayData.period || dayData.unwell || dayData.family === 'rest' || dayData.move === 'rest') {
      const summaryItems = [...daySlips];
      if (dayData.period) summaryItems.unshift({ habit: 'Cycle', reason: 'Period logged', type: 'rose' });
      if (dayData.unwell) summaryItems.unshift({ habit: 'Health', reason: 'Unwell logged', type: 'amber' });
      if (dayData.family === 'rest' && !summaryItems.some(x => x.reason.includes('Self-care'))) {
        summaryItems.push({ habit: 'Family & Myself', reason: 'Self-care & recovery rest', type: 'warn' });
      }
      if (dayData.move === 'rest' && !summaryItems.some(x => x.reason.includes('Rest day'))) {
        summaryItems.push({ habit: 'Gym', reason: 'Rest day', type: 'warn' });
      }
      slipsLog.push({
        date: dStr,
        dayNum: d,
        monthName: m[0],
        period: Boolean(dayData.period),
        unwell: Boolean(dayData.unwell),
        slips: summaryItems
      });
    }
  }

  const isUpcoming = days === 0;
  const score = days > 0 ? Math.round((cleanDays / days) * 100) : 0;
  const barWidth = days > 0 ? Math.max(4, Math.min(100, score)) : 0;
  const mindsetScore = (resStats.mind.handled + resStats.mind.improve) > 0 
    ? Math.round((resStats.mind.handled / (resStats.mind.handled + resStats.mind.improve)) * 100) 
    : null;

  return {
    days,
    cleanDays,
    missDays,
    missCount,
    miss: missDays,
    busy: busyCount,
    done: doneCount,
    periodDays,
    unwellDays,
    score,
    barWidth,
    mindsetScore,
    isUpcoming,
    resStats,
    reasons,
    slipsLog
  };
}

function selectCalendarMonth(i, e) {
  if (cm !== i) {
    cm = i;
    calendar();
  } else if (e && e.currentTarget) {
    e.currentTarget.classList.toggle('open');
  }
}

function monthsView() {
  calendar();
}

function calendar() {
  TODAY = getTodayKey();
  const m = months[cm];
  const first = new Date(m[1], m[2], 1);
  const last = new Date(m[1], m[2] + 1, 0);
  const off = (first.getDay() + 6) % 7;
  let c = '';
  for (let i = 0; i < off; i++) c += '<div class="day out-of-range" style="pointer-events:none"></div>';
  for (let n = 1; n <= last.getDate(); n++) {
    const kk = `${m[1]}-${pad(m[2] + 1)}-${pad(n)}`;
    const isToday = kk === TODAY;
    const isFuture = kk > TODAY;
    const isOutOfRange = kk < START || kk > END;
    const isPeriod = Boolean(D(kk).period);
    const isUnwell = Boolean(D(kk).unwell);
    const q = isFuture ? '' : dc(kk);

    const classes = ['day'];
    if (isToday) classes.push('today');
    if (isFuture && !isOutOfRange) classes.push('future');
    if (isOutOfRange) classes.push('out-of-range');
    if (isPeriod) classes.push('period-day');
    if (isUnwell) classes.push('unwell-day');

    let dotsHtml = '';
    if (!isFuture && (q || isPeriod || isUnwell)) {
      dotsHtml =
        '<div class="day-dots">' +
          (q ? '<i class="dot ' + q + '"></i>' : '') +
          (isPeriod ? '<i class="dot-period" title="Period"></i>' : '') +
          (isUnwell ? '<i class="dot-unwell" title="Unwell"></i>' : '') +
        '</div>';
    }
    c += '<button class="' + classes.join(' ') + '" onclick="openDay(\'' + kk + '\')">' + n + dotsHtml + '</button>';
  }

  const monthsSection =
    '<div class="section" style="margin-top:24px;">' +
      '<span>Months Overview</span>' +
      '<span style="font-size:11px;color:var(--text-muted)">Tap month card for details</span>' +
    '</div>' +
    '<div class="months">' +
      months.map((monthItem, i) => {
        const x = md(monthItem);
        const isSelected = i === cm;
        const gymText = x.resStats.move.enabledDays > 0 
          ? x.resStats.move.done + ' done • ' + x.resStats.move.rest + ' rest' 
          : 'Optional (Disabled)';

        let subText = '';
        let scoreBadge = '';
        let detailHtml = '';

        if (x.isUpcoming) {
          subText = 'Upcoming • Starts ' + monthItem[0] + ' 1';
          scoreBadge = '<div class="score" style="font-size:12px;color:var(--text-muted);font-weight:600;">Upcoming</div>';
          detailHtml = '<div class="detail"><div class="detail-empty-note">Month has not started yet. Dates will be tracked once they arrive.</div></div>';
        } else {
          subText = x.cleanDays + ' / ' + x.days + ' clean days • ' + x.score + '% score';
          scoreBadge = '<div class="score">' + x.score + '%</div>';
          detailHtml =
            '<div class="detail">' +
              '<div class="detail-grid">' +
                '<div class="detail-chip green">' +
                  '<span>Clean</span>' +
                  '<b>' + x.cleanDays + 'd</b>' +
                '</div>' +
                '<div class="detail-chip ' + (x.reasons.food.bad > 0 ? 'red' : 'dim') + '">' +
                  '<span>Outside Food</span>' +
                  '<b>' + x.reasons.food.bad + 'd</b>' +
                '</div>' +
                '<div class="detail-chip ' + (x.reasons.phone.bad > 0 ? 'red' : 'dim') + '">' +
                  '<span>Late Sleep</span>' +
                  '<b>' + x.reasons.phone.bad + 'd</b>' +
                '</div>' +
                '<div class="detail-chip ' + (x.periodDays > 0 ? 'rose' : 'dim') + '">' +
                  '<span>Period</span>' +
                  '<b>' + x.periodDays + 'd</b>' +
                '</div>' +
              '</div>' +
              '<div class="detail-section-title">Habit Performance</div>' +
              '<div class="row"><span>Outside Food</span><b>' + x.resStats.food.ok + ' clean • ' + x.resStats.food.bad + ' outside</b></div>' +
              '<div class="row"><span>11:30 PM Sleep</span><b>' + x.resStats.phone.ok + ' on time • ' + x.resStats.phone.bad + ' late</b></div>' +
              '<div class="row"><span>Khud Pe Focus</span><b>' + x.resStats.health.ok + ' focused • ' + x.resStats.health.bad + ' neglected</b></div>' +
              '<div class="row"><span>Family & Myself</span><b>' + x.resStats.family.done + ' spent time • ' + x.resStats.family.rest + ' self-care</b></div>' +
              '<div class="row"><span>Gym & Movement</span><b>' + gymText + '</b></div>' +
              (x.resStats.mind.totalChoices > 0 ? '<div class="row"><span>Occasions caught</span><b>' + x.resStats.mind.totalChoices + ' recorded</b></div>' : '') +
            '</div>';
        }

        return (
          '<div class="month' + (isSelected ? ' active-month open' : '') + '" onclick="selectCalendarMonth(' + i + ', event)">' +
            '<div class="mtop">' +
              '<div>' +
                '<div class="mn">' + monthItem[0] + ' ' + monthItem[1] + (isSelected ? ' <span class="badge-mini">Active</span>' : '') + '</div>' +
                '<div class="m-sub">' + subText + '</div>' +
              '</div>' +
              scoreBadge +
            '</div>' +
            '<div class="bar"><i style="width:' + x.barWidth + '%"></i></div>' +
            detailHtml +
          '</div>'
        );
      }).join('') +
    '</div>';

  main.innerHTML =
    '<div class="card">' +
      '<div class="calhead">' +
        '<b>' + m[0] + ' ' + m[1] + '</b>' +
        '<div>' +
          '<button onclick="event.stopPropagation();cm=Math.max(0,cm-1);calendar()"' + (cm === 0 ? ' disabled' : '') + ' aria-label="Previous month">‹</button>' +
          '<button onclick="event.stopPropagation();cm=Math.min(3,cm+1);calendar()"' + (cm === 3 ? ' disabled' : '') + ' aria-label="Next month">›</button>' +
        '</div>' +
      '</div>' +
      '<div class="weeks">' +
        '<div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>' +
      '</div>' +
      '<div class="grid">' + c + '</div>' +
      '<div class="legend">' +
        '<span><i class="g"></i>Done</span>' +
        '<span><i class="w"></i>Busy / Rest</span>' +
        '<span><i class="r"></i>Missed</span>' +
        '<span><i class="p"></i>Period</span>' +
        '<span><i class="u"></i>Unwell</span>' +
      '</div>' +
    '</div>' +
    monthsSection;
}

function report() {
  let totalDays = 0;
  let totalCleanDays = 0;
  let totalMissDays = 0;
  let totalPeriodDays = 0;
  let totalUnwellDays = 0;
  let noExp = 0, noSym = 0, noExag = 0;

  const aggStats = {
    health: { ok: 0, bad: 0 },
    food: { ok: 0, bad: 0 },
    phone: { ok: 0, bad: 0 },
    move: { done: 0, rest: 0, bad: 0, enabledDays: 0 },
    family: { done: 0, rest: 0, busy: 0, bad: 0 }
  };

  const monthAggregates = months.map(m => {
    const x = md(m);
    totalDays += x.days;
    totalCleanDays += x.cleanDays;
    totalMissDays += x.missDays;
    totalPeriodDays += x.periodDays;
    totalUnwellDays += x.unwellDays;

    aggStats.health.ok += x.resStats.health.ok;
    aggStats.health.bad += x.resStats.health.bad;
    aggStats.food.ok += x.resStats.food.ok;
    aggStats.food.bad += x.resStats.food.bad;
    aggStats.phone.ok += x.resStats.phone.ok;
    aggStats.phone.bad += x.resStats.phone.bad;

    aggStats.move.done += x.resStats.move.done;
    aggStats.move.rest += x.resStats.move.rest;
    aggStats.move.bad += x.resStats.move.bad;
    aggStats.move.enabledDays += x.resStats.move.enabledDays;

    aggStats.family.done += x.resStats.family.done;
    aggStats.family.rest += x.resStats.family.rest;
    aggStats.family.busy += x.resStats.family.busy;
    aggStats.family.bad += x.resStats.family.bad;

    const numDays = new Date(m[1], m[2] + 1, 0).getDate();
    for (let d = 1; d <= numDays; d++) {
      const dStr = `${m[1]}-${pad(m[2] + 1)}-${pad(d)}`;
      if (dStr < START || dStr > END || dStr > TODAY) continue; // STOP upcoming dates!
      const dayData = D(dStr);
      const mc = dayData.mindChoices || [];
      if (mc.includes('given_explanation') || mc.includes('no_explanation')) noExp++;
      if (mc.includes('given_sympathy') || mc.includes('no_sympathy')) noSym++;
      if (mc.includes('exaggerated_thing') || mc.includes('no_exaggerating')) noExag++;
    }

    return { m, x };
  });

  const overallScore = totalDays > 0 ? Math.round((totalCleanDays / totalDays) * 100) : 100;
  const streak = getStreak();

  const foodPct = totalDays > 0 ? Math.round((aggStats.food.ok / totalDays) * 100) : 100;
  const phonePct = totalDays > 0 ? Math.round((aggStats.phone.ok / totalDays) * 100) : 100;
  const healthPct = totalDays > 0 ? Math.round((aggStats.health.ok / totalDays) * 100) : 100;

  const allSlips = monthAggregates.flatMap(({ x }) => x.slipsLog || []);
  allSlips.sort((a, b) => (a.date < b.date ? 1 : -1));

  let slipsSectionHtml = '';
  if (allSlips.length > 0) {
    slipsSectionHtml =
      '<div class="section"><span>Real Reasons & Exceptions Log</span><span style="font-size:11px;color:var(--text-muted)">Day-by-day record</span></div>' +
      '<div class="slips-timeline">' +
        allSlips.map(s => {
          const dName = s.dayNum + ' ' + s.monthName.slice(0, 3);
          const tags = s.slips.map(item => {
            const cls = item.type || 'bad';
            return '<span class="reason-tag ' + cls + '">' + item.reason + '</span>';
          }).join('');
          return (
            '<div class="slip-entry">' +
              '<div class="slip-date">' + dName + '</div>' +
              '<div class="slip-reasons">' + tags + '</div>' +
            '</div>'
          );
        }).join('') +
      '</div>';
  } else if (totalDays > 0) {
    slipsSectionHtml =
      '<div class="section"><span>Real Reasons & Exceptions Log</span></div>' +
      '<div class="clean-record-card">' +
        '<div class="clean-record-icon">✨</div>' +
        '<div class="clean-record-title">Clean Track Record!</div>' +
        '<div class="clean-record-sub">No outside food, no late phone scrolling, no neglected days, and boundaries held firm so far.</div>' +
      '</div>';
  }

  main.innerHTML =
    '<section class="hero">' +
      '<h1>Report</h1>' +
    '</section>' +
    '<div class="metrics">' +
      '<div class="metric">' +
        '<b>' + totalCleanDays + ' <span style="font-size:14px;color:var(--text-muted);font-weight:500;">/ ' + totalDays + '</span></b>' +
        '<span>Clean Days (' + overallScore + '%)</span>' +
      '</div>' +
      '<div class="metric">' +
        '<b>' + streak.current + 'd</b>' +
        '<span>Streak (Best: ' + streak.best + 'd)</span>' +
      '</div>' +
    '</div>' +
    '<div class="health-metrics-row">' +
      '<div class="health-mini-card rose">' +
        '<span><i class="dot-period" style="position:static;display:inline-block;margin-right:6px;"></i>Period Logged</span>' +
        '<b>' + totalPeriodDays + ' d</b>' +
      '</div>' +
      '<div class="health-mini-card amber">' +
        '<span><i class="dot-unwell" style="position:static;display:inline-block;margin-right:6px;"></i>Unwell Logged</span>' +
        '<b>' + totalUnwellDays + ' d</b>' +
      '</div>' +
    '</div>' +
    '<div class="section"><span>Habit Performance Breakdown</span></div>' +
    '<div class="report-habit-grid">' +
      '<div class="report-habit-card">' +
        '<div class="report-habit-top">' +
          '<span class="report-habit-name">🥗 Outside Food Control</span>' +
          '<span class="report-habit-score">' + foodPct + '%</span>' +
        '</div>' +
        '<div class="report-habit-bar green"><i style="width:' + foodPct + '%"></i></div>' +
        '<div class="report-habit-stats">' + aggStats.food.ok + ' clean home food days • <b>Reason:</b> ' + (aggStats.food.bad > 0 ? aggStats.food.bad + ' days ate outside food' : '0 days outside food') + '</div>' +
      '</div>' +
      '<div class="report-habit-card">' +
        '<div class="report-habit-top">' +
          '<span class="report-habit-name">🌙 11:30 PM Sleep Boundary</span>' +
          '<span class="report-habit-score">' + phonePct + '%</span>' +
        '</div>' +
        '<div class="report-habit-bar green"><i style="width:' + phonePct + '%"></i></div>' +
        '<div class="report-habit-stats">' + aggStats.phone.ok + ' slept on time • <b>Reason:</b> ' + (aggStats.phone.bad > 0 ? aggStats.phone.bad + ' days past 11:30 PM' : '0 days late phone') + '</div>' +
      '</div>' +
      '<div class="report-habit-card">' +
        '<div class="report-habit-top">' +
          '<span class="report-habit-name">💖 Khud Pe Focus</span>' +
          '<span class="report-habit-score">' + healthPct + '%</span>' +
        '</div>' +
        '<div class="report-habit-bar green"><i style="width:' + healthPct + '%"></i></div>' +
        '<div class="report-habit-stats">' + aggStats.health.ok + ' focused on self • <b>Reason:</b> ' + (aggStats.health.bad > 0 ? aggStats.health.bad + ' days neglected / stressed' : '0 days neglected') + '</div>' +
      '</div>' +
      '<div class="report-habit-card">' +
        '<div class="report-habit-top">' +
          '<span class="report-habit-name">👨‍👩‍👧 Family & Myself</span>' +
          '<span class="report-habit-score">' + (aggStats.family.done + aggStats.family.rest) + ' d</span>' +
        '</div>' +
        '<div class="report-habit-stats">' + aggStats.family.done + ' quality time • ' + aggStats.family.rest + ' self-care rest • <b>Reason:</b> ' + (aggStats.family.bad > 0 ? aggStats.family.bad + ' days disconnected' : '0 days disconnected') + '</div>' +
      '</div>' +
      '<div class="report-habit-card">' +
        '<div class="report-habit-top">' +
          '<span class="report-habit-name">💪 Gym & Movement</span>' +
          '<span class="report-habit-score">' + (aggStats.move.enabledDays > 0 ? aggStats.move.done + ' done' : 'Optional') + '</span>' +
        '</div>' +
        '<div class="report-habit-stats">' + (aggStats.move.enabledDays > 0 ? aggStats.move.done + ' workouts • ' + aggStats.move.rest + ' recovery rest days • <b>Reason:</b> ' + (aggStats.move.bad > 0 ? aggStats.move.bad + ' days skipped' : '0 workouts skipped') : 'Gym tracking is optional & currently disabled') + '</div>' +
      '</div>' +
    '</div>' +
    slipsSectionHtml +
    '<div class="section"><span>Occasional Boundary Check</span></div>' +
    '<div class="card" style="padding:12px 16px;display:grid;gap:6px;">' +
      '<div class="occasional-hint-text">Tracked when you caught yourself doing any of these:</div>' +
      '<div class="row"><span>Given explanation</span><b>' + noExp + ' days</b></div>' +
      '<div class="row"><span>Given sympathy</span><b>' + noSym + ' days</b></div>' +
      '<div class="row"><span>Exaggerated thing</span><b>' + noExag + ' days</b></div>' +
    '</div>' +
    '<div class="section"><span>Months Overview</span></div>' +
    '<div class="compare">' +
      '<div class="cr head">' +
        '<div>Month</div><div>Clean</div><div>Score</div><div>Health</div><div>Workouts</div>' +
      '</div>' +
      monthAggregates.map(({ m, x }) => {
        if (x.isUpcoming) {
          return (
            '<div class="cr">' +
              '<b>' + m[0].slice(0, 3) + '</b>' +
              '<div style="color:var(--text-dim);font-size:11px;">Upcoming</div>' +
              '<div style="color:var(--text-dim);font-size:11px;">—</div>' +
              '<div style="color:var(--text-dim);font-size:11px;">—</div>' +
              '<div style="color:var(--text-dim);font-size:11px;">—</div>' +
            '</div>'
          );
        }

        const healthText = (x.periodDays > 0 || x.unwellDays > 0) 
          ? (x.periodDays > 0 ? 'P:' + x.periodDays : '') + (x.periodDays > 0 && x.unwellDays > 0 ? ' ' : '') + (x.unwellDays > 0 ? 'U:' + x.unwellDays : '')
          : '—';
        const gymText = x.resStats.move.enabledDays > 0 ? x.resStats.move.done + 'd' : 'Off';

        return (
          '<div class="cr">' +
            '<b>' + m[0].slice(0, 3) + '</b>' +
            '<div>' + x.cleanDays + '/' + x.days + '</div>' +
            '<div>' + x.score + '%</div>' +
            '<div>' + healthText + '</div>' +
            '<div>' + gymText + '</div>' +
          '</div>'
        );
      }).join('') +
    '</div>' +
    '<div class="section"><span>Reflection</span></div>' +
    '<div class="card">' +
      '<textarea id="ref" placeholder="Personal notes...">' + (db.reflection || '') + '</textarea>' +
      '<button class="save" onclick="saveReflection()">Save</button>' +
    '</div>';
}

function saveReflection() {
  const refEl = document.getElementById('ref');
  if (refEl) {
    db.reflection = refEl.value;
    save();
    showToast('Saved');
  }
}

function openDay(kk) {
  sheetContext = { type: 'day', date: kk };
  const d = parseDateKey(kk);
  const formatted = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const pVal = Boolean(D(kk).period);
  const uVal = Boolean(D(kk).unwell);
  const isFuture = kk > TODAY;

  const prevDate = new Date(d);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevK = formatDate(prevDate);

  const nextDate = new Date(d);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextK = formatDate(nextDate);

  const phEl = document.querySelector('.panel-header');
  if (phEl) phEl.style.display = 'none';

  const upcomingNoticeHtml = isFuture 
    ? '<div class="upcoming-date-notice">📅 Upcoming Date — Tracking will count this date once it arrives</div>' 
    : '';

  const headerHtml =
    '<div class="sheet-top">' +
      '<div class="day-switcher">' +
        '<button onclick="openDay(\'' + prevK + '\')" aria-label="Previous day">‹</button>' +
        '<span>' + (kk === TODAY ? 'Today (' + formatted + ')' : formatted) + '</span>' +
        '<button onclick="openDay(\'' + nextK + '\')" aria-label="Next day">›</button>' +
      '</div>' +
      '<button class="sheet-close" onclick="closeSheet()" aria-label="Close">✕</button>' +
    '</div>';

  const healthSelectorsHtml =
    upcomingNoticeHtml +
    '<div class="sheet-section-title">Health & Well-being</div>' +
    '<div class="sheet-health-grid">' +
      '<div class="sheet-health-row">' +
        '<div class="sheet-health-meta">' +
          '<span class="sheet-health-label">Period</span>' +
          '<span class="sheet-health-hint">Auto-rest gym</span>' +
        '</div>' +
        '<div class="segmented-pill">' +
          '<button class="seg-btn' + (!pVal ? ' active' : '') + '" onclick="setPeriod(\'' + kk + '\', \'no\')">No</button>' +
          '<button class="seg-btn rose' + (pVal ? ' active' : '') + '" onclick="setPeriod(\'' + kk + '\', \'yes\')">Yes</button>' +
        '</div>' +
      '</div>' +
      '<div class="sheet-health-row">' +
        '<div class="sheet-health-meta">' +
          '<span class="sheet-health-label">Unwell</span>' +
          '<span class="sheet-health-hint">Auto-rest gym</span>' +
        '</div>' +
        '<div class="segmented-pill">' +
          '<button class="seg-btn' + (!uVal ? ' active' : '') + '" onclick="setUnwell(\'' + kk + '\', \'no\')">No</button>' +
          '<button class="seg-btn amber' + (uVal ? ' active' : '') + '" onclick="setUnwell(\'' + kk + '\', \'yes\')">Yes</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  const itemsSectionTitle = '<div class="sheet-section-title" style="margin-top:14px;">Daily Resolutions</div>';

  const itemsHtml = R.map(r => {
    const id = r[0];
    const type = r[4];
    const s = st(id, kk);
    const iconSvg = ICONS[id] || r[3];
    const flexButtons = renderResFlexButtons(id, type, kk);

    return (
      '<div class="day-res-card">' +
        '<div class="day-res-opt" onclick="openRes(\'' + id + '\',\'' + kk + '\',true)">' +
          '<div class="ico">' + iconSvg + '</div>' +
          '<div class="body">' +
            '<div class="name">' + r[1] + '</div>' +
          '</div>' +
          '<span class="pill ' + s[1] + '">' + s[0] + '</span>' +
          '<span class="chevron">›</span>' +
        '</div>' +
        flexButtons +
      '</div>'
    );
  }).join('');

  const occasionalHtml = renderOccasionalBoundaries(kk);

  const doneButtonHtml =
    '<div class="sheet-done-bar">' +
      '<button class="modal-done-btn" onclick="closeSheet();showToast(\'Day updated\')">Done</button>' +
    '</div>';

  opts.innerHTML = headerHtml + healthSelectorsHtml + itemsSectionTitle + itemsHtml + occasionalHtml + doneButtonHtml;
  showSheet();
}

function openRes(id, kk, fromDay) {
  fromDay = Boolean(fromDay);
  sheetContext = { type: 'res', id, date: kk, fromDay };
  const r = R.find(x => x[0] === id);
  const cfg = RESOLUTION_CONFIG[id];
  if (!r || !cfg) return;

  const currentVal = D(kk)[id] || '';
  const d = parseDateKey(kk);
  const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  const phEl = document.querySelector('.panel-header');
  if (phEl) phEl.style.display = 'none';

  const topHtml =
    '<div class="sheet-top">' +
      (fromDay
        ? '<button class="sheet-back" onclick="openDay(\'' + kk + '\')">‹ Back</button>'
        : '<span></span>') +
      '<div class="sheet-res-meta">' +
        '<div class="sheet-res-title">' + cfg.title + '</div>' +
        '<div class="sheet-res-date">' + dateStr + '</div>' +
      '</div>' +
      '<button class="sheet-close" onclick="closeSheet()" aria-label="Close">✕</button>' +
    '</div>';

  let gymToggleHtml = '';
  if (id === 'move') {
    const gymOn = isGymEnabled(kk);
    gymToggleHtml =
      '<div class="sheet-info-box">' +
        '💪 <b>Optional Resolution:</b> If disabled, gym is completely excluded from your streak, scores, and reports. Enable only when you want to track workouts.' +
      '</div>' +
      '<div class="sheet-health-row" style="margin-bottom:12px;">' +
        '<div class="sheet-health-meta">' +
          '<span class="sheet-health-label">Gym Tracking</span>' +
          '<span class="sheet-health-hint">' + (gymOn ? 'Currently enabled & counted' : 'Currently disabled & excluded') + '</span>' +
        '</div>' +
        '<div class="segmented-pill">' +
          '<button class="seg-btn' + (!gymOn ? ' active' : '') + '" onclick="setGymEnabled(\'' + kk + '\', false, true)">Disabled</button>' +
          '<button class="seg-btn rose' + (gymOn ? ' active' : '') + '" onclick="setGymEnabled(\'' + kk + '\', true, true)">Enabled</button>' +
        '</div>' +
      '</div>';
  }

  let mindChecklistHtml = '';
  if (id === 'mind') {
    const choices = D(kk).mindChoices || [];
    mindChecklistHtml =
      '<div class="sheet-info-box">' +
        '⚡ <b>Occasional Habit:</b> This resolution is situational. On calm days with no arguments or drama, leave as <i>No occasion today</i>.' +
      '</div>' +
      '<div class="section" style="margin:12px 0 8px;"><span>Which Boundaries Did You Practice? (When Tested)</span></div>' +
      MIND_CHOICES.map(c => {
        const isSelected = isMindChoiceTicked(choices, c);
        return (
          '<button class="opt' + (isSelected ? ' selected' : '') + '" onclick="toggleMindChoice(\'' + kk + '\',\'' + c.id + '\')">' +
            '<div class="opt-content">' +
              '<b>' + (isSelected ? '✓ ' : '+ ') + c.title + '</b>' +
              '<small>' + c.sub + '</small>' +
            '</div>' +
            '<div class="opt-check">' + (isSelected ? '✓' : '+') + '</div>' +
          '</button>'
        );
      }).join('');
  }

  const optionsHtml =
    '<div class="section" style="margin:14px 0 8px;"><span>' + (id === 'mind' ? 'Today\'s Situation Outcome' : 'Select Status') + '</span></div>' +
    cfg.options.map(opt => {
      let isSelected = false;
      if (id === 'mind') {
        isSelected = (opt.val === '' && !currentVal) || (opt.val !== '' && currentVal === opt.val);
      } else {
        isSelected = (!currentVal && opt.val === 'ok') || (currentVal === opt.val);
      }

      return (
        '<button class="opt' + (isSelected ? ' selected' : '') + '" onclick="setS(\'' + kk + '\',\'' + id + '\',\'' + opt.val + '\')">' +
          '<div class="opt-content">' +
            '<b>' + opt.label + '</b>' +
            '<small>' + opt.desc + '</small>' +
          '</div>' +
          '<div class="opt-check">' + (isSelected ? '✓' : '') + '</div>' +
        '</button>'
      );
    }).join('');

  opts.innerHTML = topHtml + gymToggleHtml + mindChecklistHtml + optionsHtml;
  showSheet();
}

function setS(kk, id, v) {
  const cfg = RESOLUTION_CONFIG[id];
  const name = cfg ? cfg.title : 'Resolution';

  if (id === 'move' && v) {
    D(kk).gymEnabled = true;
    db.gymEnabled = true;
  }

  if (v === '' || (id !== 'mind' && id !== 'move' && v === 'ok')) {
    delete D(kk)[id];
  } else {
    D(kk)[id] = v;
  }

  if (id === 'mind' && (v === '' || !v)) {
    delete D(kk).mindChoices;
  }
  save();

  const statusLabel = st(id, kk)[0];
  showToast(name + ': ' + statusLabel);

  if (sheetContext && sheetContext.type === 'day') {
    openDay(kk);
  } else if (sheetContext && sheetContext.type === 'res' && sheetContext.fromDay) {
    openDay(kk);
  } else if (sheetContext && sheetContext.type === 'res') {
    closeSheet();
  }
  render();
}

function showSheet() {
  sheet.style.display = 'flex';
  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.classList.remove('hidden');
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => sheet.classList.add('open'));
  } else {
    sheet.classList.add('open');
  }
}

function closeSheet() {
  sheet.classList.remove('open');
  sheet.style.display = 'none';
  sheetContext = null;
  const phEl = document.querySelector('.panel-header');
  if (phEl) phEl.style.display = '';
  const backBtn = document.getElementById('backBtn');
  if (backBtn && view === 'today') {
    backBtn.classList.add('hidden');
  }
}

function back() {
  if (sheetContext) {
    if (sheetContext.type === 'res' && sheetContext.fromDay) {
      openDay(sheetContext.date);
      return;
    }
    closeSheet();
    return;
  }
  if (sheet.style.display === 'flex') {
    closeSheet();
    return;
  }
  setView('today');
}

function showToast(msg) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.innerHTML = '<span class="icon">✓</span> <span>' + msg + '</span>';
  toastEl.classList.add('show');
  if (typeof setTimeout === 'function') {
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 1800);
  }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sheet && sheet.style.display === 'flex') {
      closeSheet();
    }
  });
}

render();