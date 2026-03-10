import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js';

const STORAGE_KEY = 'meal-plan-record-v2';
const FIREBASE_CONFIG_KEY = 'meal-plan-record-firebase-config';
const FIREBASE_COLLECTION = 'meal_plan_record_months';

const ITEM_MASTER = [
  {
    section: 'ABF',
    sectionClass: 'abf',
    items: [
      { code: 'RB Regular', price: 300 },
      { code: 'RB Extra Charge (Exclusive Lounge)', price: 250 },
      { code: 'Air Arabian', price: 390 },
    ],
  },
  {
    section: 'Meal Plan',
    sectionClass: 'meal',
    items: [
      { code: 'AIP Package @ 1550', price: 1550 },
      { code: 'AIP Package @ 2500', price: 2500 },
      { code: 'AIP Package upgrade @ 1950', price: 1950 },
      { code: 'AIP Package upgrade @ 1550', price: 1550 },
      { code: 'Half Board Lunch', price: 0 },
      { code: 'Full Board Lunch', price: 0 },
      { code: 'Crew (1)', price: 0 },
      { code: 'Crew (2)', price: 0 },
      { code: 'Crew (3)', price: 0 },
      { code: 'Crew (4)', price: 0 },
      { code: 'Half Board Dinner', price: 0 },
      { code: 'Full Board Dinner', price: 0 },
    ],
  },
];

const ALL_ITEMS = ITEM_MASTER.flatMap(group =>
  group.items.map(item => ({ ...item, section: group.section, sectionClass: group.sectionClass }))
);

const stored = loadData();
const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  guestRecords: stored.guestRecords,
  cellEntries: stored.cellEntries,
  firebase: {
    config: loadFirebaseConfig(),
    app: null,
    db: null,
    connected: false,
    syncing: false,
    loadedPeriods: new Set(),
    pendingSyncPeriods: new Set(),
    flushTimer: null,
    status: 'ยังไม่ได้ตั้งค่า Firebase ระบบจะเก็บข้อมูลไว้ในเบราว์เซอร์เครื่องนี้',
  },
};

const el = {
  yearInput: document.getElementById('yearInput'),
  monthSelect: document.getElementById('monthSelect'),
  periodKey: document.getElementById('periodKey'),
  totalCover: document.getElementById('totalCover'),
  totalRevenue: document.getElementById('totalRevenue'),
  currentMonthLabel: document.getElementById('currentMonthLabel'),
  summaryHead: document.getElementById('summaryHead'),
  summaryBody: document.getElementById('summaryBody'),
  recordsBody: document.getElementById('recordsBody'),
  recordCountBadge: document.getElementById('recordCountBadge'),
  quickMonth: document.getElementById('quickMonth'),
  sectionSummary: document.getElementById('sectionSummary'),
  firebaseStatusBadge: document.getElementById('firebaseStatusBadge'),
  firebaseStatusText: document.getElementById('firebaseStatusText'),
  syncNowBtn: document.getElementById('syncNowBtn'),
  firebaseSettingsBtn: document.getElementById('firebaseSettingsBtn'),

  modal: document.getElementById('recordModal'),
  openModalBtn: document.getElementById('openModalBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  closeModalBackdrop: document.getElementById('closeModalBackdrop'),
  cancelBtn: document.getElementById('cancelBtn'),
  saveRecordBtn: document.getElementById('saveRecordBtn'),
  clearMonthBtn: document.getElementById('clearMonthBtn'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  formDate: document.getElementById('formDate'),
  formItem: document.getElementById('formItem'),
  formGuestName: document.getElementById('formGuestName'),
  formRoom: document.getElementById('formRoom'),
  formPax: document.getElementById('formPax'),
  formPrice: document.getElementById('formPrice'),
  formRemark: document.getElementById('formRemark'),
  previewSection: document.getElementById('previewSection'),
  previewItem: document.getElementById('previewItem'),
  previewPax: document.getElementById('previewPax'),
  previewRevenue: document.getElementById('previewRevenue'),

  firebaseModal: document.getElementById('firebaseModal'),
  closeFirebaseBackdrop: document.getElementById('closeFirebaseBackdrop'),
  closeFirebaseBtn: document.getElementById('closeFirebaseBtn'),
  cancelFirebaseBtn: document.getElementById('cancelFirebaseBtn'),
  saveFirebaseBtn: document.getElementById('saveFirebaseBtn'),
  disconnectFirebaseBtn: document.getElementById('disconnectFirebaseBtn'),
  firebaseApiKey: document.getElementById('firebaseApiKey'),
  firebaseAuthDomain: document.getElementById('firebaseAuthDomain'),
  firebaseProjectId: document.getElementById('firebaseProjectId'),
  firebaseStorageBucket: document.getElementById('firebaseStorageBucket'),
  firebaseMessagingSenderId: document.getElementById('firebaseMessagingSenderId'),
  firebaseAppId: document.getElementById('firebaseAppId'),
  firebaseDocPreview: document.getElementById('firebaseDocPreview'),
};

init();

async function init() {
  fillMonthOptions(el.monthSelect);
  fillItemOptions(el.formItem);

  el.yearInput.value = state.year;
  el.monthSelect.value = String(state.month);
  el.formDate.value = toDateInputValue(new Date());
  el.formItem.value = ALL_ITEMS[0].code;
  el.formPrice.value = ALL_ITEMS[0].price;

  populateFirebaseForm(state.firebase.config);
  updateFirebaseDocPreview();
  updatePreview();
  bindEvents();
  render();

  if (state.firebase.config) {
    await connectFirebase(state.firebase.config, { loadCurrentMonth: true, silent: true });
  } else {
    setFirebaseStatus('offline', 'ยังไม่ได้ตั้งค่า Firebase ระบบจะเก็บข้อมูลไว้ในเบราว์เซอร์เครื่องนี้');
  }
}

function bindEvents() {
  el.yearInput.addEventListener('input', async () => {
    state.year = Number(el.yearInput.value || new Date().getFullYear());
    render();
    await loadCurrentMonthFromFirebase({ silentWhenMissing: true });
  });

  el.monthSelect.addEventListener('change', async () => {
    state.month = Number(el.monthSelect.value);
    render();
    await loadCurrentMonthFromFirebase({ silentWhenMissing: true });
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  el.openModalBtn.addEventListener('click', openModal);
  el.closeModalBtn.addEventListener('click', closeModal);
  el.closeModalBackdrop.addEventListener('click', closeModal);
  el.cancelBtn.addEventListener('click', closeModal);

  el.firebaseSettingsBtn.addEventListener('click', openFirebaseModal);
  el.closeFirebaseBtn.addEventListener('click', closeFirebaseModal);
  el.closeFirebaseBackdrop.addEventListener('click', closeFirebaseModal);
  el.cancelFirebaseBtn.addEventListener('click', closeFirebaseModal);
  el.saveFirebaseBtn.addEventListener('click', saveFirebaseSettings);
  el.disconnectFirebaseBtn.addEventListener('click', disconnectFirebase);
  el.syncNowBtn.addEventListener('click', () => flushSyncQueue(true));

  [el.firebaseApiKey, el.firebaseAuthDomain, el.firebaseProjectId, el.firebaseStorageBucket, el.firebaseMessagingSenderId, el.firebaseAppId]
    .forEach(input => input.addEventListener('input', updateFirebaseDocPreview));

  [el.formItem, el.formPax, el.formPrice].forEach(node => {
    node.addEventListener('input', syncFormFromItem);
    node.addEventListener('change', syncFormFromItem);
  });

  el.formItem.addEventListener('change', () => {
    const selected = findItem(el.formItem.value);
    if (selected) el.formPrice.value = selected.price;
    updatePreview();
  });

  el.saveRecordBtn.addEventListener('click', saveRecord);
  el.clearMonthBtn.addEventListener('click', clearMonthRecords);
  el.exportCsvBtn.addEventListener('click', exportCsv);

  document.addEventListener('click', event => {
    const deleteBtn = event.target.closest('[data-delete-id]');
    if (!deleteBtn) return;
    deleteRecord(deleteBtn.dataset.deleteId);
  });

  document.addEventListener('change', event => {
    const input = event.target.closest('[data-cell-input]');
    if (!input) return;
    saveCellInput(input);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeModal();
      closeFirebaseModal();
    }
    if (event.key === 'Enter' && event.target.matches('[data-cell-input]')) {
      event.target.blur();
    }
  });
}

function render() {
  const guestRecords = getFilteredGuestRecords();
  const summaryRows = getSummaryRows(guestRecords);
  const daysInMonth = getDaysInMonth(state.year, state.month);
  const monthLabel = formatMonthLabel(state.year, state.month);

  el.periodKey.value = getCurrentPeriodKey();
  el.currentMonthLabel.textContent = monthLabel;
  el.quickMonth.textContent = monthLabel;
  updateFirebaseDocPreview();

  const totalCover = summaryRows.reduce((sum, row) => sum + row.totalCover, 0);
  const totalRevenue = summaryRows.reduce((sum, row) => sum + row.revenue, 0);
  el.totalCover.textContent = numberFormat(totalCover);
  el.totalRevenue.textContent = numberFormat(totalRevenue);

  renderSummaryTable(summaryRows, guestRecords, daysInMonth);
  renderRecords(guestRecords);
  renderSectionSummary(summaryRows);
  updateFirebaseStatusUI();
}

function renderSummaryTable(summaryRows, guestRecords, daysInMonth) {
  const headCells = [
    '<th>Section</th>',
    '<th>Promotion Detail</th>',
    '<th>Revenue</th>',
    '<th>Price</th>',
    '<th>Total Cover</th>',
  ];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const weekday = new Date(state.year, state.month, day).getDay();
    const weekend = weekday === 0 || weekday === 6;
    headCells.push(`
      <th class="day-head ${weekend ? 'weekend' : ''}">
        <div>${weekdayLabel(state.year, state.month, day)}</div>
        <div>${day}</div>
      </th>
    `);
  }

  el.summaryHead.innerHTML = `<tr>${headCells.join('')}</tr>`;

  let html = '';
  let lastSection = null;

  summaryRows.forEach(row => {
    const sectionSize = summaryRows.filter(item => item.section === row.section).length;
    html += '<tr>';

    if (row.section !== lastSection) {
      html += `<td rowspan="${sectionSize}" class="section-cell ${row.sectionClass}">${escapeHtml(row.section)}</td>`;
      lastSection = row.section;
    }

    html += `
      <td class="item-cell">${escapeHtml(row.item)}</td>
      <td>${numberFormat(row.revenue)}</td>
      <td>${numberFormat(row.price)}</td>
      <td><strong>${numberFormat(row.totalCover)}</strong></td>
    `;

    row.dayCells.forEach(cell => {
      const minValue = cell.guestCount || 0;
      html += `
        <td>
          <input
            class="cell-input"
            type="number"
            min="${minValue}"
            value="${cell.total ? escapeAttribute(cell.total) : ''}"
            data-cell-input="1"
            data-date="${escapeAttribute(cell.date)}"
            data-item="${escapeAttribute(row.item)}"
            data-guest-base="${escapeAttribute(cell.guestCount)}"
            title="พิมพ์จำนวน cover ได้โดยตรง"
          />
        </td>
      `;
    });

    html += '</tr>';
  });

  const dayTotals = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = buildDateString(state.year, state.month, day);
    const guestTotal = guestRecords
      .filter(record => record.date === date)
      .reduce((sum, record) => sum + Number(record.pax || 0), 0);
    const manualTotal = Object.entries(state.cellEntries)
      .filter(([key]) => key.startsWith(`${date}|`))
      .reduce((sum, [, value]) => sum + Number(value || 0), 0);
    dayTotals.push(guestTotal + manualTotal);
  }

  html += `
    <tr class="total-row">
      <td colspan="2" style="text-align:right">Monthly Total</td>
      <td>${numberFormat(summaryRows.reduce((sum, row) => sum + row.revenue, 0))}</td>
      <td>-</td>
      <td>${numberFormat(summaryRows.reduce((sum, row) => sum + row.totalCover, 0))}</td>
      ${dayTotals.map(value => `<td>${value ? numberFormat(value) : ''}</td>`).join('')}
    </tr>
  `;

  el.summaryBody.innerHTML = html;
}

function renderRecords(records) {
  const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
  el.recordCountBadge.textContent = `${sorted.length} detailed records`;

  if (!sorted.length) {
    el.recordsBody.innerHTML = `<tr><td colspan="7" class="empty-state">ยังไม่มีข้อมูลแบบรายชื่อลูกค้าในเดือนนี้</td></tr>`;
    return;
  }

  el.recordsBody.innerHTML = sorted.map(record => `
    <tr>
      <td>${escapeHtml(record.date)}</td>
      <td>
        <strong>${escapeHtml(record.guestName)}</strong>
        ${record.remark ? `<div class="meta">${escapeHtml(record.remark)}</div>` : ''}
      </td>
      <td>${escapeHtml(record.room || '-')}</td>
      <td>${escapeHtml(record.item)}</td>
      <td>${numberFormat(record.pax)}</td>
      <td>${numberFormat(record.revenue)}</td>
      <td><button class="delete-btn" data-delete-id="${record.id}">Delete</button></td>
    </tr>
  `).join('');
}

function renderSectionSummary(summaryRows) {
  el.sectionSummary.innerHTML = ITEM_MASTER.map(group => {
    const rows = summaryRows.filter(row => row.section === group.section);
    const cover = rows.reduce((sum, row) => sum + row.totalCover, 0);
    const revenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    return `
      <section class="section-card">
        <div class="panel-title-row">
          <h3>${escapeHtml(group.section)}</h3>
          <span class="badge">${rows.length} items</span>
        </div>
        <div class="section-grid">
          <div>
            <span class="meta">Cover</span>
            <strong>${numberFormat(cover)}</strong>
          </div>
          <div>
            <span class="meta">Revenue</span>
            <strong>${numberFormat(revenue)}</strong>
          </div>
        </div>
      </section>
    `;
  }).join('');
}

function fillMonthOptions(select) {
  select.innerHTML = Array.from({ length: 12 }, (_, index) => {
    const label = new Date(2026, index, 1).toLocaleDateString('en-GB', { month: 'long' });
    return `<option value="${index}">${escapeHtml(label)}</option>`;
  }).join('');
}

function fillItemOptions(select) {
  select.innerHTML = ITEM_MASTER.map(group => `
    <optgroup label="${escapeAttribute(group.section)}">
      ${group.items.map(item => `<option value="${escapeAttribute(item.code)}">${escapeHtml(item.code)}</option>`).join('')}
    </optgroup>
  `).join('');
}

function getFilteredGuestRecords() {
  return state.guestRecords.filter(record => {
    const date = new Date(record.date);
    return date.getFullYear() === state.year && date.getMonth() === state.month;
  });
}

function getSummaryRows(guestRecords) {
  const daysInMonth = getDaysInMonth(state.year, state.month);
  return ITEM_MASTER.flatMap(group => group.items.map(item => {
    const matching = guestRecords.filter(record => record.item === item.code);
    const guestCover = matching.reduce((sum, record) => sum + Number(record.pax || 0), 0);
    const guestRevenue = matching.reduce((sum, record) => sum + Number(record.revenue || 0), 0);

    const dayCells = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = buildDateString(state.year, state.month, day);
      const guestCount = matching
        .filter(record => record.date === date)
        .reduce((sum, record) => sum + Number(record.pax || 0), 0);
      const manualCount = getCellEntry(date, item.code);
      return {
        day,
        date,
        guestCount,
        manualCount,
        total: guestCount + manualCount,
      };
    });

    const manualCover = dayCells.reduce((sum, cell) => sum + cell.manualCount, 0);
    return {
      section: group.section,
      sectionClass: group.sectionClass,
      item: item.code,
      price: item.price,
      totalCover: guestCover + manualCover,
      revenue: guestRevenue + manualCover * item.price,
      dayCells,
    };
  }));
}

function saveCellInput(input) {
  const date = input.dataset.date;
  const item = input.dataset.item;
  const guestBase = Number(input.dataset.guestBase || 0);
  const desiredTotal = Math.max(0, Number(input.value || 0));
  const manualValue = Math.max(0, desiredTotal - guestBase);
  const key = getCellKey(date, item);

  if (manualValue > 0) {
    state.cellEntries[key] = manualValue;
  } else {
    delete state.cellEntries[key];
  }

  saveData();
  render();
  requestCloudSync(getPeriodKeyFromDate(date));
}

function openModal() {
  el.formDate.value = toDateInputValue(new Date(state.year, state.month, new Date().getDate()));
  el.formItem.value = el.formItem.value || ALL_ITEMS[0].code;
  const selected = findItem(el.formItem.value) || ALL_ITEMS[0];
  el.formPrice.value = selected.price;
  el.formGuestName.value = '';
  el.formRoom.value = '';
  el.formPax.value = 1;
  el.formRemark.value = '';
  updatePreview();
  el.modal.classList.remove('hidden');
}

function closeModal() {
  el.modal.classList.add('hidden');
}

function openFirebaseModal() {
  populateFirebaseForm(state.firebase.config);
  updateFirebaseDocPreview();
  el.firebaseModal.classList.remove('hidden');
}

function closeFirebaseModal() {
  el.firebaseModal.classList.add('hidden');
}

function syncFormFromItem() {
  if (document.activeElement === el.formItem) {
    const selected = findItem(el.formItem.value);
    if (selected) el.formPrice.value = selected.price;
  }
  updatePreview();
}

function updatePreview() {
  const item = findItem(el.formItem.value) || ALL_ITEMS[0];
  const pax = Number(el.formPax.value || 1);
  const price = Number(el.formPrice.value || item.price || 0);
  el.previewSection.textContent = item.section;
  el.previewItem.textContent = item.code;
  el.previewPax.textContent = numberFormat(pax);
  el.previewRevenue.textContent = numberFormat(pax * price);
}

function updateFirebaseDocPreview() {
  el.firebaseDocPreview.textContent = getCurrentPeriodKey();
}

function saveRecord() {
  const guestName = el.formGuestName.value.trim();
  if (!guestName) {
    alert('กรุณากรอกชื่อลูกค้า');
    el.formGuestName.focus();
    return;
  }

  const item = findItem(el.formItem.value) || ALL_ITEMS[0];
  const pax = Math.max(1, Number(el.formPax.value || 1));
  const price = Math.max(0, Number(el.formPrice.value || item.price || 0));

  const record = {
    id: generateId(),
    date: el.formDate.value,
    item: item.code,
    section: item.section,
    guestName,
    room: el.formRoom.value.trim(),
    pax,
    price,
    revenue: pax * price,
    remark: el.formRemark.value.trim(),
    createdAt: new Date().toISOString(),
  };

  state.guestRecords.unshift(record);
  saveData();
  render();
  closeModal();
  requestCloudSync(getPeriodKeyFromDate(record.date));
}

function deleteRecord(id) {
  const found = state.guestRecords.find(record => record.id === id);
  if (!found) return;
  if (!confirm('Delete this record?')) return;
  state.guestRecords = state.guestRecords.filter(record => record.id !== id);
  saveData();
  render();
  requestCloudSync(getPeriodKeyFromDate(found.date));
}

function clearMonthRecords() {
  const label = formatMonthLabel(state.year, state.month);
  const ok = confirm(`Delete all data in ${label}? ทั้งรายการลูกค้าและตัวเลขที่คีย์ในตารางจะถูกลบ`);
  if (!ok) return;

  state.guestRecords = state.guestRecords.filter(record => {
    const date = new Date(record.date);
    return !(date.getFullYear() === state.year && date.getMonth() === state.month);
  });

  Object.keys(state.cellEntries).forEach(key => {
    const [date] = key.split('|');
    const d = new Date(date);
    if (d.getFullYear() === state.year && d.getMonth() === state.month) {
      delete state.cellEntries[key];
    }
  });

  saveData();
  render();
  requestCloudSync(getCurrentPeriodKey());
}

function exportCsv() {
  const guestRecords = getFilteredGuestRecords();
  const manualRows = getManualRowsForMonth();
  const rows = [...guestRecords.map(record => ({
    source: 'Guest Record',
    date: record.date,
    section: record.section,
    item: record.item,
    guestName: record.guestName,
    room: record.room,
    pax: record.pax,
    price: record.price,
    revenue: record.revenue,
    remark: record.remark,
  })), ...manualRows];

  if (!rows.length) {
    alert('ยังไม่มีข้อมูลสำหรับ export');
    return;
  }

  const header = ['Source', 'Date', 'Section', 'Item', 'GuestName', 'Room', 'Pax', 'Price', 'Revenue', 'Remark'];
  const lines = rows.map(row => [
    row.source,
    row.date,
    row.section,
    row.item,
    row.guestName,
    row.room,
    row.pax,
    row.price,
    row.revenue,
    row.remark,
  ].map(csvEscape).join(','));

  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meal-plan-record-${state.year}-${String(state.month + 1).padStart(2, '0')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getManualRowsForMonth() {
  return Object.entries(state.cellEntries)
    .map(([key, pax]) => {
      const [date, itemCode] = key.split('|');
      const d = new Date(date);
      if (d.getFullYear() !== state.year || d.getMonth() !== state.month) return null;
      const item = findItem(itemCode);
      return {
        source: 'Manual Cell',
        date,
        section: item?.section || '',
        item: itemCode,
        guestName: '',
        room: '',
        pax,
        price: item?.price || 0,
        revenue: Number(pax || 0) * Number(item?.price || 0),
        remark: 'Entered directly in summary table',
      };
    })
    .filter(Boolean);
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
  document.getElementById('summaryTab').classList.toggle('active', tabName === 'summary');
  document.getElementById('recordsTab').classList.toggle('active', tabName === 'records');
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        guestRecords: Array.isArray(parsed.guestRecords) ? parsed.guestRecords : [],
        cellEntries: parsed.cellEntries && typeof parsed.cellEntries === 'object' ? parsed.cellEntries : {},
      };
    }

    const legacyRaw = localStorage.getItem('meal-plan-record-v1');
    if (legacyRaw) {
      const parsedLegacy = JSON.parse(legacyRaw);
      if (Array.isArray(parsedLegacy)) {
        return { guestRecords: parsedLegacy, cellEntries: {} };
      }
    }
  } catch {
    // ignore broken local data
  }
  return { guestRecords: [], cellEntries: {} };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    guestRecords: state.guestRecords,
    cellEntries: state.cellEntries,
  }));
}

function loadFirebaseConfig() {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeFirebaseConfig(parsed);
  } catch {
    return null;
  }
}

function saveFirebaseConfigToStorage(config) {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
}

function clearFirebaseConfigFromStorage() {
  localStorage.removeItem(FIREBASE_CONFIG_KEY);
}

function populateFirebaseForm(config) {
  el.firebaseApiKey.value = config?.apiKey || '';
  el.firebaseAuthDomain.value = config?.authDomain || '';
  el.firebaseProjectId.value = config?.projectId || '';
  el.firebaseStorageBucket.value = config?.storageBucket || '';
  el.firebaseMessagingSenderId.value = config?.messagingSenderId || '';
  el.firebaseAppId.value = config?.appId || '';
}

function readFirebaseForm() {
  return normalizeFirebaseConfig({
    apiKey: el.firebaseApiKey.value,
    authDomain: el.firebaseAuthDomain.value,
    projectId: el.firebaseProjectId.value,
    storageBucket: el.firebaseStorageBucket.value,
    messagingSenderId: el.firebaseMessagingSenderId.value,
    appId: el.firebaseAppId.value,
  });
}

function normalizeFirebaseConfig(input) {
  if (!input || typeof input !== 'object') return null;
  const config = {
    apiKey: String(input.apiKey || '').trim(),
    authDomain: String(input.authDomain || '').trim(),
    projectId: String(input.projectId || '').trim(),
    storageBucket: String(input.storageBucket || '').trim(),
    messagingSenderId: String(input.messagingSenderId || '').trim(),
    appId: String(input.appId || '').trim(),
  };
  return config;
}

function validateFirebaseConfig(config) {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = requiredFields.filter(field => !config[field]);
  if (missing.length) {
    throw new Error(`กรอกค่า Firebase ให้ครบก่อน: ${missing.join(', ')}`);
  }
}

async function saveFirebaseSettings() {
  try {
    const config = readFirebaseForm();
    validateFirebaseConfig(config);
    await connectFirebase(config, { loadCurrentMonth: true, silent: false });
    closeFirebaseModal();
  } catch (error) {
    alert(error?.message || 'เชื่อม Firebase ไม่สำเร็จ');
  }
}

async function connectFirebase(config, options = {}) {
  const { loadCurrentMonth = true, silent = false } = options;
  validateFirebaseConfig(config);

  try {
    const appName = `meal-plan-record-${config.projectId}`;
    const app = getApps().some(item => item.name === appName)
      ? getApp(appName)
      : initializeApp(config, appName);

    const db = getFirestore(app);
    state.firebase.config = config;
    state.firebase.app = app;
    state.firebase.db = db;
    state.firebase.connected = true;
    saveFirebaseConfigToStorage(config);
    setFirebaseStatus('connected', `เชื่อม Firebase สำเร็จ: ${config.projectId}`);
    render();

    if (loadCurrentMonth) {
      await loadCurrentMonthFromFirebase({ silentWhenMissing: silent });
    }
  } catch (error) {
    state.firebase.connected = false;
    state.firebase.app = null;
    state.firebase.db = null;
    setFirebaseStatus('error', `เชื่อม Firebase ไม่สำเร็จ: ${error?.message || 'Unknown error'}`);
    render();
    throw error;
  }
}

function disconnectFirebase() {
  const ok = confirm('Disconnect Firebase? ค่า config จะถูกลบออกจากเบราว์เซอร์เครื่องนี้ แต่ข้อมูล local จะยังอยู่');
  if (!ok) return;

  state.firebase.config = null;
  state.firebase.app = null;
  state.firebase.db = null;
  state.firebase.connected = false;
  state.firebase.syncing = false;
  state.firebase.loadedPeriods = new Set();
  state.firebase.pendingSyncPeriods = new Set();
  if (state.firebase.flushTimer) {
    clearTimeout(state.firebase.flushTimer);
    state.firebase.flushTimer = null;
  }
  clearFirebaseConfigFromStorage();
  populateFirebaseForm(null);
  closeFirebaseModal();
  setFirebaseStatus('offline', 'ตัดการเชื่อมต่อ Firebase แล้ว ระบบจะเก็บข้อมูลไว้ในเบราว์เซอร์เครื่องนี้');
  render();
}

async function loadCurrentMonthFromFirebase(options = {}) {
  const { silentWhenMissing = false } = options;
  if (!state.firebase.connected || !state.firebase.db) return;

  const periodKey = getCurrentPeriodKey();
  try {
    setFirebaseStatus('syncing', `กำลังโหลดข้อมูลจาก Firebase: ${periodKey}`);
    const ref = doc(state.firebase.db, FIREBASE_COLLECTION, periodKey);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      state.firebase.loadedPeriods.add(periodKey);
      if (!silentWhenMissing) {
        setFirebaseStatus('connected', `เชื่อม Firebase แล้ว แต่ยังไม่มีข้อมูลบนคลาวด์สำหรับ ${periodKey}`);
      } else {
        setFirebaseStatus('connected', `เชื่อม Firebase สำเร็จ: ${state.firebase.config?.projectId || ''}`.trim());
      }
      render();
      return;
    }

    const data = snap.data() || {};
    replaceMonthDataFromCloud(periodKey, data);
    state.firebase.loadedPeriods.add(periodKey);
    saveData();
    setFirebaseStatus('connected', `โหลดข้อมูลจาก Firebase แล้ว: ${periodKey}`);
    render();
  } catch (error) {
    setFirebaseStatus('error', `โหลดข้อมูล Firebase ไม่สำเร็จ: ${error?.message || 'Unknown error'}`);
    render();
  }
}

function replaceMonthDataFromCloud(periodKey, data) {
  const { year, month } = parsePeriodKey(periodKey);
  const sanitizedGuestRecords = Array.isArray(data.guestRecords)
    ? data.guestRecords.map(record => ({
        id: String(record.id || generateId()),
        date: String(record.date || ''),
        item: String(record.item || ''),
        section: String(record.section || ''),
        guestName: String(record.guestName || ''),
        room: String(record.room || ''),
        pax: Number(record.pax || 0),
        price: Number(record.price || 0),
        revenue: Number(record.revenue || 0),
        remark: String(record.remark || ''),
        createdAt: String(record.createdAt || ''),
      }))
    : [];

  const sanitizedCellEntries = data.cellEntries && typeof data.cellEntries === 'object'
    ? Object.fromEntries(
        Object.entries(data.cellEntries).map(([key, value]) => [String(key), Number(value || 0)]).filter(([, value]) => value > 0)
      )
    : {};

  state.guestRecords = state.guestRecords.filter(record => {
    const date = new Date(record.date);
    return !(date.getFullYear() === year && date.getMonth() === month);
  });

  Object.keys(state.cellEntries).forEach(key => {
    const [date] = key.split('|');
    const d = new Date(date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      delete state.cellEntries[key];
    }
  });

  state.guestRecords.unshift(...sanitizedGuestRecords);
  Object.assign(state.cellEntries, sanitizedCellEntries);
}

function requestCloudSync(periodKey) {
  if (!state.firebase.connected || !state.firebase.db || !periodKey) return;
  state.firebase.pendingSyncPeriods.add(periodKey);
  setFirebaseStatus('syncing', `มีข้อมูลรอ sync ไป Firebase (${state.firebase.pendingSyncPeriods.size})`);
  render();

  if (state.firebase.flushTimer) {
    clearTimeout(state.firebase.flushTimer);
  }
  state.firebase.flushTimer = setTimeout(() => {
    flushSyncQueue(false);
  }, 700);
}

async function flushSyncQueue(forceCurrentPeriod) {
  if (!state.firebase.connected || !state.firebase.db) {
    alert('ยังไม่ได้เชื่อม Firebase');
    return;
  }

  if (forceCurrentPeriod) {
    state.firebase.pendingSyncPeriods.add(getCurrentPeriodKey());
  }

  const periods = Array.from(state.firebase.pendingSyncPeriods);
  if (!periods.length) {
    setFirebaseStatus('connected', `ไม่มีข้อมูลใหม่ที่ต้อง sync${state.firebase.config?.projectId ? ` (${state.firebase.config.projectId})` : ''}`);
    render();
    return;
  }

  state.firebase.syncing = true;
  setFirebaseStatus('syncing', `กำลัง sync ไป Firebase: ${periods.join(', ')}`);
  render();

  try {
    for (const periodKey of periods) {
      const payload = buildCloudPayload(periodKey);
      const ref = doc(state.firebase.db, FIREBASE_COLLECTION, periodKey);
      await setDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp(),
        savedAtISO: new Date().toISOString(),
      }, { merge: true });
      state.firebase.pendingSyncPeriods.delete(periodKey);
      state.firebase.loadedPeriods.add(periodKey);
    }

    state.firebase.syncing = false;
    setFirebaseStatus('connected', `Sync สำเร็จไป Firebase แล้ว: ${periods.join(', ')}`);
    render();
  } catch (error) {
    state.firebase.syncing = false;
    setFirebaseStatus('error', `Sync Firebase ไม่สำเร็จ: ${error?.message || 'Unknown error'}`);
    render();
  }
}

function buildCloudPayload(periodKey) {
  const { year, month } = parsePeriodKey(periodKey);
  const guestRecords = state.guestRecords
    .filter(record => {
      const date = new Date(record.date);
      return date.getFullYear() === year && date.getMonth() === month;
    })
    .map(record => ({ ...record }));

  const cellEntries = Object.fromEntries(
    Object.entries(state.cellEntries).filter(([key, value]) => {
      const [date] = key.split('|');
      const d = new Date(date);
      return d.getFullYear() === year && d.getMonth() === month && Number(value || 0) > 0;
    })
  );

  return {
    periodKey,
    year,
    month: month + 1,
    guestRecords,
    cellEntries,
  };
}

function setFirebaseStatus(type, text) {
  state.firebase.status = text;
  state.firebase.statusType = type;
}

function updateFirebaseStatusUI() {
  const type = state.firebase.statusType || (state.firebase.connected ? 'connected' : 'offline');
  const badgeMap = {
    connected: 'Connected',
    syncing: 'Syncing',
    error: 'Error',
    offline: 'Offline',
  };
  el.firebaseStatusBadge.textContent = `Firebase: ${badgeMap[type] || 'Offline'}`;
  el.firebaseStatusBadge.className = `status-badge ${type}`;
  el.firebaseStatusText.textContent = state.firebase.status;
  el.syncNowBtn.disabled = !state.firebase.connected || state.firebase.syncing;
}

function getCellEntry(date, item) {
  return Number(state.cellEntries[getCellKey(date, item)] || 0);
}

function getCellKey(date, item) {
  return `${date}|${item}`;
}

function getCurrentPeriodKey() {
  return `${state.year}-${String(state.month + 1).padStart(2, '0')}`;
}

function getPeriodKeyFromDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function parsePeriodKey(periodKey) {
  const [yearText, monthText] = String(periodKey).split('-');
  const year = Number(yearText || new Date().getFullYear());
  const month = Math.max(0, Number(monthText || 1) - 1);
  return { year, month };
}

function findItem(code) {
  return ALL_ITEMS.find(item => item.code === code);
}

function buildDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function weekdayLabel(year, month, day) {
  return new Date(year, month, day).toLocaleDateString('en-GB', { weekday: 'short' });
}

function formatMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function numberFormat(value) {
  return new Intl.NumberFormat('en-US').format(Number(value || 0));
}

function toDateInputValue(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

function generateId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
