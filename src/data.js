import tables from './data/tables.json';
import queries from './data/queries/queries.json';
import alert from './data/queries/alert.js';

export const T = tables;

export const CATEGORIES = ['All', 'Queries', 'Alert demo'];

const sqlText = (s) => (Array.isArray(s) ? s.join('\n') : s);

const toQuery = (q) => {
  if (!q.cases) return { ...q, sql: sqlText(q.sql) };
  const cases = q.cases.map((c) => ({ ...c, sql: sqlText(c.sql) }));
  return { ...q, cases, sql: cases.map((c) => c.sql).join('\n'), steps: cases[0].steps };
};

export const Q = [queries, alert].flat().map(toQuery);

export const caseView = (q, ci) => (q.cases ? { ...q, ...q.cases[Math.min(ci, q.cases.length - 1)] } : q);