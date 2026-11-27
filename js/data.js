import { NET_WORTH, COLORS } from './config.js';

/** "$251,260.80" -> 251260.8 */
export function parseMoney(value) {
  const n = Number(String(value ?? '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Red < 100K, Orange 100K–200K, Green >= 200K */
export function colorFor(netWorth) {
  if (netWorth >= NET_WORTH.GREEN_FROM) return COLORS.green;
  if (netWorth >= NET_WORTH.ORANGE_FROM) return COLORS.orange;
  return COLORS.red;
}

/** rows[0] = header row. Header names are matched case-insensitively, ignoring spaces. */
export function rowsToPeople(rows) {
  if (!rows?.length) return [];
  const header = rows[0].map((h) => String(h).replace(/\s+/g, '').toLowerCase());
  const idx = (name) => header.indexOf(name);
  const col = { name: idx('name'), photo: idx('photo'), age: idx('age'),
    country: idx('country'), interest: idx('interest'), worth: idx('networth') };
  if (Object.values(col).some((i) => i < 0)) {
    throw new Error('Sheet must have columns: Name, Photo, Age, Country, Interest, Net Worth');
  }
  return rows.slice(1)
    .filter((r) => r.some((c) => String(c).trim() !== ''))
    .map((r) => {
      const netWorth = parseMoney(r[col.worth]);
      return {
        name: String(r[col.name] ?? '').trim(),
        photo: String(r[col.photo] ?? '').trim(),
        age: String(r[col.age] ?? '').trim(),
        country: String(r[col.country] ?? '').trim(),
        interest: String(r[col.interest] ?? '').trim(),
        netWorth,
        color: colorFor(netWorth),
      };
    });
}

/** Read the first tab of a Google Sheet with the signed-in user's access token. */
export async function fetchSheetPeople(accessToken, sheetId) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}`;

  const metaRes = await fetch(`${base}?fields=sheets.properties.title`, { headers });
  if (!metaRes.ok) throw await apiError(metaRes);
  const meta = await metaRes.json();
  const title = meta.sheets?.[0]?.properties?.title;
  if (!title) throw new Error('The spreadsheet has no tabs.');

  const valRes = await fetch(`${base}/values/${encodeURIComponent(`'${title}'`)}`, { headers });
  if (!valRes.ok) throw await apiError(valRes);
  const { values } = await valRes.json();
  return rowsToPeople(values);
}

async function apiError(res) {
  let msg = `${res.status} ${res.statusText}`;
  try { msg = (await res.json()).error?.message || msg; } catch { /* ignore */ }
  const err = new Error(msg);
  err.status = res.status;
  return err;
}

/* ---------- Local demo mode (?demo=1): reads data/Data_Template.csv ---------- */
export function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export async function loadDemoPeople() {
  const res = await fetch('data/Data_Template.csv');
  if (!res.ok) throw new Error('Could not load data/Data_Template.csv');
  return rowsToPeople(parseCsv(await res.text()));
}
