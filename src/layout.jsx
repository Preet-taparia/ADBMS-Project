import layout from './data/layout.json';

export const CARD = layout.card;

export const LAYOUT = layout.positions;

export const EDGES = layout.edges;

export const FK_REFS = EDGES.reduce((acc, [child, parent, col]) => {
  acc[child] = { ...(acc[child] || {}), [col]: parent };
  return acc;
}, {});
