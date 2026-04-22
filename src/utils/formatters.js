// ─── CURRENCY FORMATTING (Indian System) ───────────────────────

export function formatCurrency(num, showSign = false) {
  if (num === null || num === undefined || isNaN(num)) return '₹0';

  const absNum = Math.abs(num);
  const formatted = absNum.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const sign = num >= 0 ? (showSign ? '+' : '') : '-';
  return `${sign}₹${formatted}`;
}

export function formatCurrencyDecimal(num, showSign = false) {
  if (num === null || num === undefined || isNaN(num)) return '₹0.00';

  const absNum = Math.abs(num);
  const formatted = absNum.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sign = num >= 0 ? (showSign ? '+' : '') : '-';
  return `${sign}₹${formatted}`;
}

// ─── PERCENTAGE FORMATTING ─────────────────────────────────────

export function formatPercent(num, showSign = true) {
  if (num === null || num === undefined || isNaN(num)) return '0.00%';

  const sign = num >= 0 ? (showSign ? '+' : '') : '';
  return `${sign}${num.toFixed(2)}%`;
}

// ─── ARROW INDICATOR ───────────────────────────────────────────

export function getArrow(num) {
  if (num > 0) return '▲';
  if (num < 0) return '▼';
  return '';
}

// ─── P&L CLASS ─────────────────────────────────────────────────

export function getPnLClass(num) {
  if (num > 0) return 'positive';
  if (num < 0) return 'negative';
  return 'neutral';
}

// ─── DATE FORMATTING ──────────────────────────────────────────

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ─── STOCK INITIALS (for avatar) ──────────────────────────────

export function getInitials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}
