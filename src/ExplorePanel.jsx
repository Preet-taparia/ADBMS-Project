import { KeyRound, Link2, ArrowUpRight, ArrowDownLeft, Compass, Table2, Rows3 } from 'lucide-react';
import { T, Q } from './data';
import { EDGES, FK_REFS } from './layout';
import { CAT_META } from './meta';
import { NAMES, USAGE, relations } from './schema';
import { cx } from './ui';

const show = (v) => (v === null ? 'NULL' : String(v));

const SECTION = 'text-[11px] font-bold tracking-[0.07em] uppercase text-mu mb-2 flex items-center gap-1.5';

function TableChip({ name, col, onSelect }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-ln bg-white text-xs font-semibold text-ink2 transition-[background,border-color,translate] duration-200 hover:bg-ac-soft hover:border-ac hover:-translate-y-px"
      onClick={() => onSelect(name)}
    >
      <Table2 size={12} strokeWidth={2.4} className="text-ac" />
      {name}
      {col && <span className="font-mono text-[10.5px] text-mu font-medium">{col}</span>}
    </button>
  );
}

function Overview({ onSelect }) {
  const links = NAMES.map((n) => ({ n, count: relations(n).parents.length + relations(n).children.length }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="animate-fade-up">
      <div className="flex gap-1.5 mb-2">
        <span className="inline-flex items-center gap-[5px] h-[22px] px-[9px] rounded-full text-[11px] font-bold text-ac bg-ac-soft">
          <Compass size={12} strokeWidth={2.5} />Explore
        </span>
      </div>
      <h2 className="text-[19px] font-bold tracking-[-0.02em] leading-[1.25]">Wildlife schema</h2>
      <p className="text-ink2 leading-[1.6] mt-2 mb-4">
        Click a table on the canvas or in the list to see its columns, how it connects to other tables and which queries use it.
      </p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          [NAMES.length, 'tables'],
          [EDGES.length, 'foreign keys'],
          [Q.length, 'queries'],
        ].map(([n, l]) => (
          <div key={l} className="rounded-xl border border-ln bg-white px-3 py-2.5 shadow-s">
            <b className="block text-[20px] tracking-[-0.02em] tabular-nums">{n}</b>
            <span className="text-[11.5px] text-mu">{l}</span>
          </div>
        ))}
      </div>
      <div className={SECTION}>Most connected</div>
      <div className="flex flex-wrap gap-1.5">
        {links.slice(0, 8).map(({ n, count }) => (
          <TableChip key={n} name={n} col={`${count}`} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function Detail({ name, onSelect, onOpenQuery }) {
  const t = T[name];
  const refs = FK_REFS[name] || {};
  const { parents, children } = relations(name);
  const used = USAGE[name];

  return (
    <div className="animate-fade-up" key={name}>
      <div className="flex gap-1.5 mb-2">
        <span className="inline-flex items-center gap-[5px] h-[22px] px-[9px] rounded-full text-[11px] font-bold text-ac bg-ac-soft">
          <Table2 size={12} strokeWidth={2.5} />Table
        </span>
        <span className="inline-flex items-center gap-[5px] h-[22px] px-[9px] rounded-full text-[11px] font-bold bg-bg text-ink2 border border-ln">
          <Rows3 size={12} strokeWidth={2.5} />{t.rows.length} sample rows
        </span>
      </div>
      <h2 className="text-[19px] font-bold tracking-[-0.02em] leading-[1.25] font-mono">{name}</h2>

      <div className="mt-4 border border-ln rounded-xl overflow-hidden bg-white shadow-s">
        {t.cols.map((c, j) => (
          <div key={c} className="flex items-center gap-2 h-[30px] px-3 border-b border-ln2 last:border-b-0 text-xs">
            <span className="size-3.5 grid place-items-center shrink-0">
              {j === 0 && <KeyRound size={12} strokeWidth={2.6} className="text-[#d97706]" />}
              {j !== 0 && refs[c] && <Link2 size={12} strokeWidth={2.6} className="text-ac" />}
            </span>
            <span className={cx('font-mono truncate', j === 0 ? 'font-bold' : 'font-medium')}>{c}</span>
            <span className="ml-auto flex items-center gap-2 shrink-0">
              {refs[c] && (
                <button className="font-mono text-[11px] text-ac font-semibold hover:underline" onClick={() => onSelect(refs[c])}>
                  to {refs[c]}
                </button>
              )}
              <span className="font-mono text-[10.5px] text-mu2">{t.types[j]}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className={SECTION}><ArrowUpRight size={13} strokeWidth={2.4} />References</div>
        {parents.length ? (
          <div className="flex flex-wrap gap-1.5">
            {parents.map((p) => <TableChip key={p.table + p.col} name={p.table} col={`via ${p.col}`} onSelect={onSelect} />)}
          </div>
        ) : (
          <p className="text-[13px] text-mu">Nothing. This is a root table.</p>
        )}
      </div>

      <div className="mt-4">
        <div className={SECTION}><ArrowDownLeft size={13} strokeWidth={2.4} />Referenced by</div>
        {children.length ? (
          <div className="flex flex-wrap gap-1.5">
            {children.map((c) => <TableChip key={c.table + c.col} name={c.table} col={`via ${c.col}`} onSelect={onSelect} />)}
          </div>
        ) : (
          <p className="text-[13px] text-mu">No table points here.</p>
        )}
      </div>

      <div className="mt-5">
        <div className={SECTION}>Sample rows</div>
        <div className="border border-ln rounded-xl overflow-auto bg-white shadow-s max-h-[170px]">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {t.cols.map((c) => (
                  <th key={c} className="px-2.5 py-1.5 text-left text-mu font-semibold whitespace-nowrap border-b border-ln bg-white sticky top-0">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r) => (
                <tr key={r[0]} className="even:bg-[#fafbff]">
                  {r.map((v, j) => (
                    <td key={j} className={cx('px-2.5 py-1.5 font-mono whitespace-nowrap', v === null ? 'italic text-mu2' : 'text-ink2')}>{show(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5">
        <div className={SECTION}>Used by {used.length} {used.length === 1 ? 'query' : 'queries'}</div>
        {used.length ? (
          <div className="flex flex-col gap-1">
            {used.map((i) => {
              const q = Q[i];
              const meta = CAT_META[q.cat];
              return (
                <button
                  key={i}
                  className="flex items-center gap-2 text-left px-2.5 py-2 rounded-[10px] border border-transparent bg-transparent transition-[background,border-color] duration-200 hover:bg-bg hover:border-ln"
                  onClick={() => onOpenQuery(i)}
                >
                  <i className="size-2 rounded-full shrink-0" style={{ background: meta.hue }} />
                  <span className="text-[13px] font-medium flex-1 min-w-0 truncate">{q.title}</span>
                  <span className="text-[11px] text-mu shrink-0">{q.cat}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] text-mu">No query touches this table yet.</p>
        )}
      </div>
    </div>
  );
}

export default function ExplorePanel({ selected, onSelect, onOpenQuery }) {
  return (
    <div className="h-full flex flex-col w-[408px] max-[1180px]:w-[340px] max-[860px]:w-full max-[860px]:h-[46vh]">
      <div className="flex-1 min-h-0 overflow-auto px-[18px] pt-[18px] pb-6 [scrollbar-width:thin]">
        {selected ? <Detail name={selected} onSelect={onSelect} onOpenQuery={onOpenQuery} /> : <Overview onSelect={onSelect} />}
      </div>
    </div>
  );
}
