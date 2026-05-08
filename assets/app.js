const STORAGE_KEY = 'atms-sites-v1';
const HEADERS = ['id','region','location','coordinate','type','status','provider','routerIp','cameraIp','cabinetIp','powerIp','username','password','meterId','address'];
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let sites = [];
let selectedId = null;

function parseSeed(tsv) {
  const rows = tsv.trim().split(/\n+/).map((line) => line.split('|'));
  const headers = rows.shift();
  return rows.map((cols) => Object.fromEntries(headers.map((key, index) => [key, (cols[index] || '').trim()])))
    .map((site) => ({ password: '', address: '', ...site }));
}
function loadSites() {
  const stored = localStorage.getItem(STORAGE_KEY);
  sites = stored ? JSON.parse(stored) : parseSeed(window.ATMS_SEED_SITES || '');
}
function saveSites() { localStorage.setItem(STORAGE_KEY, JSON.stringify(sites)); }
function unique(key, data = sites) { return [...new Set(data.map((item) => item[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b)); }
function statusClass(status) { return `status status-${String(status || 'Planned').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`; }
function primaryIp(site) { return site.cameraIp || site.routerIp || site.cabinetIp || site.powerIp || '-'; }
function matches(site) {
  const text = $('#searchInput').value.toLowerCase();
  const haystack = Object.values(site).join(' ').toLowerCase();
  return (!text || haystack.includes(text))
    && ($('#regionFilter').value === 'all' || site.region === $('#regionFilter').value)
    && ($('#typeFilter').value === 'all' || site.type === $('#typeFilter').value)
    && ($('#statusFilter').value === 'all' || site.status === $('#statusFilter').value)
    && ($('#providerFilter').value === 'all' || site.provider === $('#providerFilter').value);
}
function filteredSites() { return sites.filter(matches); }
function fillSelect(selector, values) {
  const select = $(selector);
  const current = select.value;
  select.querySelectorAll('option:not([value="all"])').forEach((option) => option.remove());
  values.forEach((value) => select.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`));
  select.value = values.includes(current) ? current : 'all';
}
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function mapsUrl(coordinate) { return `https://www.google.com/maps?q=${encodeURIComponent(coordinate)}`; }
function renderStats(data) {
  const completed = data.filter((s) => s.status === 'Completed').length;
  const problem = data.filter((s) => s.status === 'Problem').length;
  const notFound = data.filter((s) => s.status === 'Not Found').length;
  const regions = unique('region', data).length;
  $('#stats').innerHTML = [
    ['Total Site', data.length, 'Site sesuai filter aktif'],
    ['Completed', completed, 'Site siap/selesai'],
    ['Problem/Not Found', problem + notFound, 'Perlu tindak lanjut'],
    ['Wilayah', regions, 'Kab/Kota terdaftar'],
  ].map(([label, value, hint]) => `<article class="stat"><small>${label}</small><b>${value}</b><small>${hint}</small></article>`).join('');
  const score = data.length ? Math.round((completed / data.length) * 100) : 0;
  $('#healthScore').textContent = `${score}%`;
  $('#statusBars').innerHTML = ['Completed', 'Problem', 'Not Found'].map((status) => {
    const count = data.filter((s) => s.status === status).length;
    const width = data.length ? (count / data.length) * 100 : 0;
    const color = status === 'Completed' ? '#22c55e' : status === 'Problem' ? '#ef4444' : '#f59e0b';
    return `<div><small>${status}: ${count}</small><div class="bar"><span style="width:${width}%;background:${color}"></span></div></div>`;
  }).join('');
}
function renderCharts(data) {
  const groups = ['Completed', 'Problem', 'Not Found', ...unique('type', data)];
  $('#charts').innerHTML = groups.map((label) => {
    const count = data.filter((site) => site.status === label || site.type === label).length;
    const width = data.length ? Math.max(4, (count / data.length) * 100) : 0;
    return `<div class="chart-row"><strong>${escapeHtml(label)}</strong><div class="chart-track"><span style="width:${width}%"></span></div><b>${count}</b></div>`;
  }).join('');
}
function renderTable(data) {
  $('#resultInfo').textContent = `Menampilkan ${data.length} dari ${sites.length} site`;
  $('#siteTable tbody').innerHTML = data.map((site) => `<tr data-id="${escapeHtml(site.id)}">
    <td><strong>${escapeHtml(site.id)}</strong><span class="muted">Meter: ${escapeHtml(site.meterId || '-')}</span></td>
    <td>${escapeHtml(site.region)}</td><td><strong>${escapeHtml(site.location)}</strong><span class="muted">User: ${escapeHtml(site.username || '-')}</span></td>
    <td><span class="chip">${escapeHtml(site.type)}</span></td>
    <td><a href="${mapsUrl(site.coordinate)}" target="_blank" rel="noopener">${escapeHtml(site.coordinate)}</a></td>
    <td><strong>${escapeHtml(primaryIp(site))}</strong><span class="muted">Router: ${escapeHtml(site.routerIp || '-')}</span></td>
    <td><span class="${statusClass(site.status)}">${escapeHtml(site.status)}</span></td><td>${escapeHtml(site.provider)}</td>
    <td class="action-cell"><button class="small-btn" data-action="detail">Detail</button><button class="small-btn" data-action="edit">Edit</button></td>
  </tr>`).join('');
}
function renderMap(site = filteredSites()[0]) {
  if (!site) { $('#mapPreview').innerHTML = '<p>Tidak ada site sesuai filter.</p>'; return; }
  selectedId = site.id;
  $('#mapPreview').innerHTML = `<h3>${escapeHtml(site.id)} • ${escapeHtml(site.location)}</h3><p>${escapeHtml(site.region)} — ${escapeHtml(site.address || 'Alamat dapat dilengkapi melalui tombol edit.')}</p><div class="chips"><span class="chip">${escapeHtml(site.type)}</span><span class="${statusClass(site.status)}">${escapeHtml(site.status)}</span><span class="chip">${escapeHtml(site.provider)}</span></div><p><strong>Koordinat:</strong> ${escapeHtml(site.coordinate)}<br><strong>IP utama:</strong> ${escapeHtml(primaryIp(site))}</p><a class="primary" href="${mapsUrl(site.coordinate)}" target="_blank" rel="noopener">Buka Google Maps</a>`;
}
function render() {
  fillSelect('#regionFilter', unique('region'));
  fillSelect('#typeFilter', unique('type'));
  fillSelect('#statusFilter', unique('status'));
  fillSelect('#providerFilter', unique('provider'));
  const data = filteredSites();
  renderStats(data); renderCharts(data); renderTable(data); renderMap(data.find((site) => site.id === selectedId) || data[0]);
}
function openEditor(site = null) {
  const form = $('#siteForm'); form.reset();
  $('#formTitle').textContent = site ? `Edit Site ${site.id}` : 'Tambah Site';
  $('#deleteSite').style.visibility = site ? 'visible' : 'hidden';
  HEADERS.forEach((key) => { if (form.elements[key]) form.elements[key].value = site?.[key] || ''; });
  $('#siteDialog').showModal();
}
function formData() { return Object.fromEntries(new FormData($('#siteForm')).entries()); }
function toCsvRow(values) { return values.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','); }
function exportCsv() {
  const csv = [toCsvRow(HEADERS), ...sites.map((site) => toCsvRow(HEADERS.map((key) => site[key] || '')))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `atms-sites-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
}
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const split = (line) => line.match(/("([^"]|"")*"|[^,]+)/g)?.map((cell) => cell.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
  const headers = split(lines.shift());
  return lines.map((line) => Object.fromEntries(split(line).map((value, index) => [headers[index], value])));
}

loadSites();
['#searchInput','#regionFilter','#typeFilter','#statusFilter','#providerFilter'].forEach((selector) => $(selector).addEventListener('input', render));
$('#siteTable').addEventListener('click', (event) => {
  const row = event.target.closest('tr'); if (!row) return;
  const site = sites.find((item) => item.id === row.dataset.id); renderMap(site);
  if (event.target.dataset.action === 'edit') openEditor(site);
});
$('#openForm').addEventListener('click', () => openEditor());
$('#closeForm').addEventListener('click', () => $('#siteDialog').close());
$('#cancelForm').addEventListener('click', () => $('#siteDialog').close());
$('#siteForm').addEventListener('submit', (event) => { event.preventDefault(); const data = formData(); const index = sites.findIndex((site) => site.id === data.id); index >= 0 ? sites.splice(index, 1, data) : sites.push(data); saveSites(); $('#siteDialog').close(); selectedId = data.id; render(); });
$('#deleteSite').addEventListener('click', () => { const id = $('#siteForm').elements.id.value; sites = sites.filter((site) => site.id !== id); saveSites(); $('#siteDialog').close(); selectedId = null; render(); });
$('#resetData').addEventListener('click', () => { if (confirm('Reset data ke seed awal 153 site?')) { localStorage.removeItem(STORAGE_KEY); loadSites(); selectedId = null; render(); } });
$('#exportCsv').addEventListener('click', exportCsv);
$('#importCsv').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; sites = parseCsv(await file.text()).map((site) => ({ password: '', address: '', ...site })); saveSites(); selectedId = null; render(); event.target.value = ''; });
$('#themeToggle').addEventListener('click', () => { document.body.classList.toggle('dark'); $('#themeToggle').textContent = document.body.classList.contains('dark') ? '☀️ Mode Terang' : '🌙 Mode Gelap'; });
render();
