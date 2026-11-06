const GAP = 40;
const STEP = 14;
const DIR = { r: [1, 0], l: [-1, 0], t: [0, -1], b: [0, 1] };

const isSide = (s) => s === 'l' || s === 'r';

const pickSides = (a, b) => {
  if (a.x + a.w + GAP <= b.x) return ['r', 'l'];
  if (b.x + b.w + GAP <= a.x) return ['l', 'r'];
  if (a.y <= b.y) return ['b', 't'];
  return ['t', 'b'];
};

const anchorAt = (r, side, index, count) => {
  const off = (index - (count - 1) / 2) * STEP;
  if (side === 'r') return { x: r.x + r.w, y: r.y + r.h / 2 + off };
  if (side === 'l') return { x: r.x, y: r.y + r.h / 2 + off };
  if (side === 't') return { x: r.x + r.w / 2 + off, y: r.y };
  return { x: r.x + r.w / 2 + off, y: r.y + r.h };
};

export function buildEdges(edges, rects) {
  const plan = edges.map(([from, to, col]) => {
    const [sa, sb] = pickSides(rects[from], rects[to]);
    return { from, to, col, sa, sb };
  });

  const slots = {};
  const enlist = (table, side, id, key) => {
    const k = table + ':' + side;
    (slots[k] = slots[k] || []).push({ id, key });
  };
  plan.forEach((p, i) => {
    const a = rects[p.from];
    const b = rects[p.to];
    enlist(p.from, p.sa, i + 'a', isSide(p.sa) ? b.y + b.h / 2 : b.x + b.w / 2);
    enlist(p.to, p.sb, i + 'b', isSide(p.sb) ? a.y + a.h / 2 : a.x + a.w / 2);
  });

  const place = {};
  Object.values(slots).forEach((list) => {
    list.sort((u, v) => u.key - v.key);
    list.forEach((s, index) => {
      place[s.id] = { index, count: list.length };
    });
  });

  return plan.map((p, i) => {
    const pa = place[i + 'a'];
    const pb = place[i + 'b'];
    const p0 = anchorAt(rects[p.from], p.sa, pa.index, pa.count);
    const p3 = anchorAt(rects[p.to], p.sb, pb.index, pb.count);
    const d = Math.min(220, Math.max(40, Math.hypot(p3.x - p0.x, p3.y - p0.y) * 0.4));
    const c1 = { x: p0.x + DIR[p.sa][0] * d, y: p0.y + DIR[p.sa][1] * d };
    const c2 = { x: p3.x + DIR[p.sb][0] * d, y: p3.y + DIR[p.sb][1] * d };
    return {
      from: p.from,
      to: p.to,
      col: p.col,
      start: p0,
      d: `M${p0.x},${p0.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p3.x},${p3.y}`,
      label: {
        x: (p0.x + 3 * c1.x + 3 * c2.x + p3.x) / 8,
        y: (p0.y + 3 * c1.y + 3 * c2.y + p3.y) / 8,
      },
    };
  });
}
