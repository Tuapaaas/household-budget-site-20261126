// Hearth & Ledger — canvas charts, drawn in code with no libraries:
// a category spending bar chart, an income-vs-spending donut, and a weekly
// spending bar chart. Each draw sizes the canvas to its element and scales
// for the device pixel ratio so the charts stay crisp on phones.

function fitCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

const FONT = '12px system-ui, -apple-system, sans-serif';
const FONT_BOLD = '600 12px system-ui, -apple-system, sans-serif';

export function drawCategoryBars(canvas, rows) {
  // rows: [{ name, color, spent, limit }]
  const { ctx, w, h } = fitCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  if (!rows.length) return;
  const max = Math.max(...rows.map((r) => Math.max(r.spent, r.limit)), 1);
  const barH = 18;
  const gap = 14;
  const labelW = 108;
  const valueW = 62;
  const trackW = w - labelW - valueW;
  rows.forEach((r, i) => {
    const y = i * (barH + gap) + 4;
    ctx.font = FONT;
    ctx.fillStyle = '#22301f';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(r.name, 0, y + barH / 2, labelW - 8);
    ctx.fillStyle = '#e9e2d4';
    ctx.fillRect(labelW, y, trackW, barH);
    const fillW = Math.max(2, (r.spent / max) * trackW);
    ctx.fillStyle = r.spent > r.limit ? '#b3402e' : r.color;
    ctx.fillRect(labelW, y, fillW, barH);
    // limit marker
    const lx = labelW + (r.limit / max) * trackW;
    ctx.fillStyle = '#22301f';
    ctx.fillRect(lx - 1, y - 2, 2, barH + 4);
    ctx.font = FONT_BOLD;
    ctx.textAlign = 'right';
    ctx.fillStyle = r.spent > r.limit ? '#b3402e' : '#22301f';
    ctx.fillText('$' + r.spent.toFixed(2), w, y + barH / 2);
  });
  canvas.style.height = rows.length * (barH + gap) + 'px';
}

export function drawDonut(canvas, income, spent) {
  const { ctx, w, h } = fitCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) / 2 - 10;
  const total = income + spent;
  const spentAngle = total > 0 ? (spent / total) * Math.PI * 2 : 0;
  ctx.lineWidth = 34;
  // income arc (green)
  ctx.beginPath();
  ctx.strokeStyle = '#2d5a3d';
  ctx.arc(cx, cy, radius - 17, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 - spentAngle));
  ctx.stroke();
  // spending arc (terracotta)
  ctx.beginPath();
  ctx.strokeStyle = '#c96f4a';
  ctx.arc(cx, cy, radius - 17, -Math.PI / 2 + (Math.PI * 2 - spentAngle), -Math.PI / 2 + Math.PI * 2);
  ctx.stroke();
  // centre label
  ctx.fillStyle = '#22301f';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Left over', cx, cy - 12);
  ctx.font = '700 20px system-ui, sans-serif';
  ctx.fillText('$' + Math.max(0, income - spent).toFixed(2), cx, cy + 12);
  // legend
  ctx.font = FONT;
  ctx.textAlign = 'left';
  const ly = h - 8;
  ctx.fillStyle = '#2d5a3d';
  ctx.fillRect(8, ly - 9, 10, 10);
  ctx.fillStyle = '#22301f';
  ctx.fillText('Income $' + income.toFixed(2), 24, ly);
  const spentLabel = 'Spent $' + spent.toFixed(2);
  const sw = ctx.measureText(spentLabel).width;
  ctx.fillStyle = '#c96f4a';
  ctx.fillRect(w - sw - 24, ly - 9, 10, 10);
  ctx.fillStyle = '#22301f';
  ctx.fillText(spentLabel, w - sw - 8, ly);
}

export function drawWeeklyBars(canvas, weeks) {
  // weeks: [{ label, amount }]
  const { ctx, w, h } = fitCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  if (!weeks.length) return;
  const max = Math.max(...weeks.map((x) => x.amount), 1);
  const plotH = h - 34;
  const slot = w / weeks.length;
  const barW = Math.min(56, slot * 0.55);
  weeks.forEach((wk, i) => {
    const barH = Math.max(2, (wk.amount / max) * plotH);
    const x = i * slot + (slot - barW) / 2;
    const y = plotH - barH;
    ctx.fillStyle = '#2d5a3d';
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = '#22301f';
    ctx.font = FONT_BOLD;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('$' + wk.amount.toFixed(0), x + barW / 2, y - 4);
    ctx.font = FONT;
    ctx.textBaseline = 'top';
    ctx.fillText(wk.label, x + barW / 2, plotH + 8);
  });
}
