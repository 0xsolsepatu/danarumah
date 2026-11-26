// Small hand-drawn SVG charts. No library: each chart is a string of SVG
// built from the numbers, so the first load stays tiny and nothing is
// fetched. Every chart carries a viewBox so it scales cleanly on desktop
// and on a phone.
import { fmtShort } from './format.js';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Horizontal bars: [{label, value, color}] — used for spending by category.
export function hbarChart(items, maxValue) {
  const max = maxValue || Math.max(1, ...items.map((i) => i.value));
  const rows = items
    .map((item) => {
      const w = Math.max(2, Math.round((item.value / max) * 100));
      return (
        '<div class="hbar-row">' +
        '<span class="hbar-label">' + esc(item.label) + '</span>' +
        '<div class="hbar-track"><div class="hbar-fill" style="width:' + w + '%;background:' + item.color + '"></div></div>' +
        '<span class="hbar-value">' + fmtShort(item.value) + '</span>' +
        '</div>'
      );
    })
    .join('');
  return '<div class="hbar-chart">' + rows + '</div>';
}

// Vertical bar chart for a monthly trend: [{label, value}] plus an optional
// second series drawn as a thin line of dots (income).
export function trendChart(months) {
  const W = 560;
  const H = 220;
  const PAD = 28;
  const max = Math.max(...months.map((m) => Math.max(m.spent, m.income)));
  const slot = (W - PAD * 2) / months.length;
  const barW = Math.min(44, slot * 0.5);
  let bars = '';
  let labels = '';
  let dots = '';
  months.forEach((m, i) => {
    const x = PAD + i * slot + (slot - barW) / 2;
    const h = Math.max(3, ((m.spent / max) * (H - PAD - 34)));
    const y = H - 34 - h;
    bars += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW + '" height="' + h.toFixed(1) + '" rx="4" fill="#0f766e"><title>' + esc(m.label) + ' spent ' + fmtShort(m.spent) + '</title></rect>';
    const iy = H - 34 - (m.income / max) * (H - PAD - 34);
    dots += '<circle cx="' + (x + barW / 2).toFixed(1) + '" cy="' + iy.toFixed(1) + '" r="4" fill="#d97706"><title>' + esc(m.label) + ' income ' + fmtShort(m.income) + '</title></circle>';
    if (i > 0) {
      const px = PAD + (i - 1) * slot + slot / 2;
      const py = H - 34 - (months[i - 1].income / max) * (H - PAD - 34);
      dots += '<line x1="' + px.toFixed(1) + '" y1="' + py.toFixed(1) + '" x2="' + (x + barW / 2).toFixed(1) + '" y2="' + iy.toFixed(1) + '" stroke="#d97706" stroke-width="2" stroke-dasharray="4 3" />';
    }
    labels += '<text x="' + (PAD + i * slot + slot / 2).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" class="chart-label">' + esc(m.label) + '</text>';
    labels += '<text x="' + (PAD + i * slot + slot / 2).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="middle" class="chart-value">' + fmtShort(m.spent) + '</text>';
  });
  return (
    '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart-svg" role="img" aria-label="Monthly spending trend">' +
    bars + dots + labels +
    '</svg>'
  );
}

// Donut: [{label, value, color}]. Centre shows the total.
export function donutChart(items, centreLabel, centreValue) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const R = 70;
  const C = 2 * Math.PI * R;
  let offset = 0;
  let circles = '';
  for (const item of items) {
    const frac = item.value / total;
    const len = Math.max(0, frac * C - 2);
    circles +=
      '<circle cx="100" cy="100" r="' + R + '" fill="none" stroke="' + item.color + '" stroke-width="26" ' +
      'stroke-dasharray="' + len.toFixed(1) + ' ' + (C - len).toFixed(1) + '" stroke-dashoffset="' + (-offset).toFixed(1) + '">' +
      '<title>' + esc(item.label) + ' ' + fmtShort(item.value) + '</title></circle>';
    offset += frac * C;
  }
  return (
    '<svg viewBox="0 0 200 200" class="donut-svg" role="img" aria-label="Spending by category">' +
    '<circle cx="100" cy="100" r="' + R + '" fill="none" stroke="#e7e0d4" stroke-width="26" />' +
    circles +
    '<text x="100" y="96" text-anchor="middle" class="donut-centre-value">' + esc(centreValue) + '</text>' +
    '<text x="100" y="116" text-anchor="middle" class="donut-centre-label">' + esc(centreLabel) + '</text>' +
    '</svg>'
  );
}
