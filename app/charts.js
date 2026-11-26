// Hearth Ledger — small canvas charts, drawn by hand, no library.
// Every chart reads the numbers it is given and nothing else.

// Draw a donut of spending by category into <canvas>.
// slices: [{ label, value, color }]. Returns nothing.
export function drawDonut(canvas, slices) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const total = slices.reduce((s, x) => s + x.value, 0);
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 14;
  const inner = r * 0.62;

  if (total <= 0) {
    ctx.fillStyle = '#8a8a7a';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No spending yet', cx, cy);
    return;
  }

  let start = -Math.PI / 2;
  for (const s of slices) {
    const sweep = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + sweep);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    start += sweep;
  }
  // Punch the hole.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // Centre label: the month's total spend.
  ctx.fillStyle = '#2b2b26';
  ctx.font = '700 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('$' + Math.round(total).toLocaleString('en-US'), cx, cy - 2);
  ctx.fillStyle = '#6b6b60';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('spent in November', cx, cy + 18);
}

// Draw grouped bars: income vs spending for each month.
// rows: [{ month, income, spent }]
export function drawMonthlyBars(canvas, rows) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const padL = 52;
  const padB = 30;
  const padT = 12;
  const max = Math.max(...rows.flatMap((r) => [r.income, r.spent])) * 1.08;
  const plotW = w - padL - 12;
  const plotH = h - padT - padB;
  const y = (v) => padT + plotH - (v / max) * plotH;

  // Gridlines and y labels.
  ctx.strokeStyle = '#e4e0d2';
  ctx.fillStyle = '#6b6b60';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i;
    const yy = y(v);
    ctx.beginPath();
    ctx.moveTo(padL, yy);
    ctx.lineTo(w - 12, yy);
    ctx.stroke();
    ctx.fillText('$' + Math.round(v / 1000) + 'k', padL - 8, yy + 4);
  }

  const groupW = plotW / rows.length;
  const barW = Math.min(26, groupW / 3.4);
  rows.forEach((row, i) => {
    const gx = padL + i * groupW + groupW / 2;
    // Income bar (green), spending bar (terracotta).
    ctx.fillStyle = '#2f6b4f';
    ctx.fillRect(gx - barW - 3, y(row.income), barW, padT + plotH - y(row.income));
    ctx.fillStyle = '#c25e4b';
    ctx.fillRect(gx + 3, y(row.spent), barW, padT + plotH - y(row.spent));
    ctx.fillStyle = '#2b2b26';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(row.month, gx, h - 10);
  });

  // Legend.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#2f6b4f';
  ctx.fillRect(padL, 2, 10, 10);
  ctx.fillStyle = '#2b2b26';
  ctx.fillText('Income', padL + 15, 11);
  ctx.fillStyle = '#c25e4b';
  ctx.fillRect(padL + 78, 2, 10, 10);
  ctx.fillStyle = '#2b2b26';
  ctx.fillText('Spending', padL + 93, 11);
}
