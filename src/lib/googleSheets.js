const SHEET_ID_REGEX = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
const SHEET_GID_REGEX = /[?&]gid=(\d+)/;

export function extractSheetId(url) {
  if (!url) return null;
  const match = url.match(SHEET_ID_REGEX);
  return match ? match[1] : null;
}

export function extractSheetGid(url) {
  if (!url) return null;
  const match = url.match(SHEET_GID_REGEX);
  return match ? match[1] : null;
}

export function buildGoogleSheetExportUrl({ url, sheetId, gid, sheetName, sheetRange }) {
  const id = sheetId || extractSheetId(url);
  if (!id) {
    throw new Error('Invalid Google Sheet URL');
  }

  if (gid) {
    return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/export?format=csv&gid=${encodeURIComponent(gid)}`;
  }

  if (!sheetName) {
    throw new Error('Sheet name is required when GID is not available');
  }

  const range = sheetRange || 'A2:J1001';
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&range=${encodeURIComponent(range)}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export function parseGoogleSheetHoldings(csvText, { tickerCol = 0, qtyCol = 1, costCol = 9, skipHeader = true } = {}) {
  const rows = parseCsv(csvText);
  const holdings = [];

  for (let i = skipHeader ? 1 : 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const rawTicker = (row[tickerCol] || '').trim();
    const rawQty = (row[qtyCol] || '').trim();
    const rawCost = (row[costCol] || '').trim();

    if (!rawTicker || !rawQty || !rawCost) continue;

    const ticker = rawTicker.toUpperCase().replace(/\s+/g, '');
    const qty = Number(rawQty.replace(/[^0-9.\-]/g, ''));
    const avgPrice = Number(rawCost.replace(/[^0-9.\-]/g, ''));

    if (!ticker || Number.isNaN(qty) || Number.isNaN(avgPrice) || qty <= 0 || avgPrice <= 0) {
      continue;
    }

    holdings.push({
      ticker,
      name: rawTicker,
      qty,
      avgPrice,
    });
  }

  return holdings;
}

export async function fetchGoogleSheetHoldings(sheetConfig) {
  const exportUrl = buildGoogleSheetExportUrl(sheetConfig);
  const res = await fetch(exportUrl);

  if (!res.ok) {
    if (res.status === 403 || res.status === 401) {
      throw new Error('Unable to access Google Sheet. Make sure the sheet is shared publicly or published for access.');
    }
    throw new Error(`Google Sheet fetch failed (${res.status})`);
  }

  const csvText = await res.text();
  return parseGoogleSheetHoldings(csvText, {
    tickerCol: 0,
    qtyCol: 1,
    costCol: 9,
    skipHeader: true,
  });
}
