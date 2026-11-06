import { T } from './data';
import { CARD } from './layout';

export const cardWidth = (t) => Math.max(CARD.minWidth, t.cols.length * CARD.colWidth);
export const cardHeight = (rowCount) => CARD.head + CARD.row * (Math.max(rowCount, 1) + 1) + 2;

const bagPush = (bag, table, value) => {
  bag[table] = (bag[table] || []).concat(value);
};

export function derive(query, stepIndex) {
  const db = {};
  const owned = {};
  Object.keys(T).forEach((name) => {
    db[name] = T[name].rows;
  });
  const own = (t) => {
    if (!owned[t]) {
      db[t] = T[t].rows.map((r) => r.slice());
      owned[t] = true;
    }
    return db[t];
  };
  const fx = { added: {}, changed: {}, removed: {} };

  query.steps.forEach((step, j) => {
    if (j > stepIndex) return;
    const current = j === stepIndex;
    (step.ops || []).forEach((o) => {
      const cols = T[o.t].cols;
      if (o.op === 'ins') {
        own(o.t).push(o.row.slice());
        if (current) bagPush(fx.added, o.t, o.row[0]);
      }
      if (o.op === 'upd') {
        const row = own(o.t).find((r) => r[0] === o.pk);
        Object.keys(o.set).forEach((k) => {
          row[cols.indexOf(k)] = o.set[k];
          if (current) bagPush(fx.changed, o.t, o.pk + ':' + k);
        });
      }
      if (o.op === 'del') {
        if (current) o.pks.forEach((p) => bagPush(fx.removed, o.t, p));
        else db[o.t] = own(o.t).filter((r) => !o.pks.includes(r[0]));
      }
    });
  });
  return { db, fx };
}
