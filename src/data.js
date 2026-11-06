import tables from './data/tables.json';
import crud from './data/queries/crud.json';
import spatial from './data/queries/spatial.json';
import temporal from './data/queries/temporal.json';
import spatiotemporal from './data/queries/spatiotemporal.json';
import analytical from './data/queries/analytical.json';
import trigger from './data/queries/trigger.json';

export const T = tables;

export const CATEGORIES = ['All', 'CRUD', 'Spatial', 'Temporal', 'Spatiotemporal', 'Analytical', 'Trigger'];

const sqlText = (s) => (Array.isArray(s) ? s.join('\n') : s);

const toQuery = (q) => {
  if (!q.cases) return { ...q, sql: sqlText(q.sql) };
  const cases = q.cases.map((c) => ({ ...c, sql: sqlText(c.sql) }));
  return { ...q, cases, sql: cases.map((c) => c.sql).join('\n'), steps: cases[0].steps };
};

export const Q = [crud, spatial, temporal, spatiotemporal, analytical, trigger].flat().map(toQuery);

export const caseView = (q, ci) => (q.cases ? { ...q, ...q.cases[Math.min(ci, q.cases.length - 1)] } : q);
