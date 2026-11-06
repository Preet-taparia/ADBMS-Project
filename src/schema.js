import { T, Q } from './data';
import { LAYOUT, EDGES } from './layout';

export const NAMES = Object.keys(T);

export const SCHEMA_CARD = { head: 34, row: 24, width: 270, gapX: 90, gapY: 70 };

const NONE = [];

export function stepCols(step, name) {
  const cols = new Set((step.c && step.c[name]) || NONE);
  (step.ops || []).forEach((o) => {
    if (o.t !== name) return;
    if (o.op === 'ins') T[name].cols.forEach((c) => cols.add(c));
    if (o.op === 'upd') Object.keys(o.set).forEach((c) => cols.add(c));
  });
  return cols.size ? [...cols] : NONE;
}

export const schemaHeight = (count) => SCHEMA_CARD.head + SCHEMA_CARD.row * count + 10;

const allSteps = (q) => (q.cases ? q.cases.flatMap((c) => c.steps) : q.steps);

export function touched(query) {
  const found = {};
  const add = (t, c) => {
    found[t] = found[t] || new Set();
    found[t].add(c);
  };
  query.steps.forEach((s) => {
    (s.tables || []).forEach((t) => {
      found[t] = found[t] || new Set();
    });
    Object.entries(s.c || {}).forEach(([t, cols]) => cols.forEach((c) => add(t, c)));
    (s.ops || []).forEach((o) => {
      const cols = T[o.t].cols;
      if (o.op === 'ins') cols.forEach((c) => add(o.t, c));
      if (o.op === 'upd') Object.keys(o.set).forEach((c) => add(o.t, c));
      if (o.op === 'del') add(o.t, cols[0]);
    });
  });
  return Object.fromEntries(
    Object.entries(found).map(([t, set]) => [t, T[t].cols.filter((c, i) => i === 0 || set.has(c))])
  );
}

export function schemaLayout(cols) {
  const names = Object.keys(cols);
  const rows = {};
  names.forEach((n) => {
    const r = Math.round(LAYOUT[n].y / 280);
    rows[r] = rows[r] || [];
    rows[r].push(n);
  });
  const keys = Object.keys(rows).map(Number).sort((a, b) => a - b);
  const widthOf = (list) => list.length * SCHEMA_CARD.width + (list.length - 1) * SCHEMA_CARD.gapX;
  const maxW = Math.max(...keys.map((k) => widthOf(rows[k])));
  const rects = {};
  let y = 0;
  keys.forEach((k) => {
    const list = rows[k].sort((a, b) => LAYOUT[a].x - LAYOUT[b].x);
    let x = (maxW - widthOf(list)) / 2;
    let tallest = 0;
    list.forEach((n) => {
      const h = schemaHeight(cols[n].length);
      rects[n] = { x, y, w: SCHEMA_CARD.width, h };
      x += SCHEMA_CARD.width + SCHEMA_CARD.gapX;
      tallest = Math.max(tallest, h);
    });
    y += tallest + SCHEMA_CARD.gapY;
  });
  return rects;
}

export const USAGE = (() => {
  const map = Object.fromEntries(NAMES.map((n) => [n, []]));
  Q.forEach((q, i) => {
    const used = new Set();
    allSteps(q).forEach((s) => (s.tables || []).forEach((t) => used.add(t)));
    used.forEach((t) => map[t].push(i));
  });
  return map;
})();

export const relations = (name) => ({
  parents: EDGES.filter(([child]) => child === name).map(([, parent, col]) => ({ table: parent, col })),
  children: EDGES.filter(([, parent]) => parent === name).map(([child, , col]) => ({ table: child, col })),
});

export const neighborhood = (name) => {
  if (!name) return [];
  const { parents, children } = relations(name);
  return [...new Set([name, ...parents.map((p) => p.table), ...children.map((c) => c.table)])];
};

export const joinsFor = (step) => {
  const here = step.tables || [];
  return EDGES.filter(
    ([from, to, col]) => here.includes(from) && here.includes(to) && ((step.c || {})[from] || []).includes(col)
  ).map(([from, to, col]) => ({ key: `${from}.${col}.${to}`, text: `${from}.${col} to ${to}.${T[to].cols[0]}` }));
};

export const countRows = (map) => Object.values(map || {}).reduce((sum, list) => sum + list.length, 0);
