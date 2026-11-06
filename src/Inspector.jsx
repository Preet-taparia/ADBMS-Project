import { useEffect, useRef } from 'react';
import { Check, Rows3, Table2, Plus, Pencil, Trash2, Link2, Columns3 } from 'lucide-react';
import Sql from './Sql';
import { CAT_META } from './meta';
import { joinsFor } from './schema';
import { cx } from './ui';

const CHIP = {
  flow: 'bg-ac-soft text-ac-ink',
  join: 'bg-[#ecfeff] text-[#0e7490]',
  col: 'bg-bg text-ink2 border border-ln',
  add: 'bg-nw text-[#047857]',
  chg: 'bg-ch text-[#c2410c]',
  del: 'bg-dl text-[#b91c1c]',
};

const CHIP_BASE =
  'inline-flex items-center gap-[5px] h-6 pl-2 pr-2.5 rounded-lg text-xs font-semibold animate-pop';

const LEGEND_WALK = [
  ['bg-hl', 'Matches'],
  ['bg-sk', 'Rejected'],
  ['bg-nw', 'Inserted'],
  ['bg-ch', 'Changed'],
  ['bg-dl', 'Deleted'],
];

const LEGEND_SCHEMA = [
  ['bg-ac-soft', 'Column used in this step'],
  ['bg-bg', 'Other column of the query'],
];

function ResultTable({ res, showData }) {
  return (
    <div className="border border-ln rounded-xl overflow-hidden bg-white shadow-s">
      <div className="flex justify-between items-center h-8 px-3 bg-[#f4f5fb] border-b border-ln">
        <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.06em] uppercase text-mu">
          <Table2 size={13} strokeWidth={2.4} />{showData ? 'Query result' : 'Result columns'}
        </span>
        {showData && <em className="not-italic text-[11px] text-mu">{res.rows.length} {res.rows.length === 1 ? 'row' : 'rows'}</em>}
      </div>
      <div className="overflow-auto">
        <table className="w-full border-collapse table-auto text-xs [&_tbody_tr:last-child_td]:border-b-0">
          <thead>
            <tr>
              {res.cols.map((c) => (
                <th key={c} className="px-3 py-[7px] whitespace-nowrap text-[11px] tracking-[0.02em] bg-white border-b border-ln text-left text-mu font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          {showData && (
            <tbody>
              {res.rows.map((r, i) => (
                <tr key={i} className="even:bg-[#fafbff] animate-row-in" style={{ animationDelay: `${160 + i * 90}ms` }}>
                  {r.map((v, j) => (
                    <td
                      key={j}
                      className={cx(
                        'px-3 py-[7px] border-b border-ln2 whitespace-nowrap font-mono text-[11px] text-left',
                        v === null ? 'text-mu2 italic' : 'text-ink2'
                      )}
                    >
                      {v === null ? 'NULL' : String(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}

const opLabel = (o) => {
  if (o.op === 'ins') return { Icon: Plus, text: `Insert into ${o.t}`, kind: 'add' };
  if (o.op === 'upd') return { Icon: Pencil, text: `Update ${o.t}`, kind: 'chg' };
  return { Icon: Trash2, text: `Delete from ${o.t}`, kind: 'del' };
};

function Funnel({ query, si, setSi }) {
  const flows = query.steps.map((s) => s.f);
  if (!flows.some((f) => f != null)) return null;
  const max = Math.max(...flows.filter((f) => f != null));
  return (
    <div className="mt-3.5 pt-3 px-3.5 pb-2 border border-ln rounded-xl bg-white shadow-s">
      <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.07em] uppercase text-mu mb-1.5">
        <Rows3 size={13} strokeWidth={2.4} />Rows in the pipeline
      </div>
      <div className="flex items-end gap-2 h-[82px]">
        {query.steps.map((s, i) => (
          <button
            key={i}
            className="group flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-[3px] p-0 border-0 bg-transparent"
            onClick={() => setSi(i)}
            title={s.title}
            aria-label={`Step ${i + 1}`}
          >
            <span className="text-[11px] font-bold text-ink2 tabular-nums min-h-3.5">{s.f != null ? s.f : ''}</span>
            <i
              className={cx(
                'block w-full max-w-[34px] rounded-t-[6px] rounded-b-[3px] transition-[height,background,translate] duration-500 ease-soft group-hover:-translate-y-0.5',
                i === si
                  ? 'bg-ac shadow-[0_6px_12px_rgba(79,70,229,0.3)]'
                  : i < si
                    ? 'bg-[color-mix(in_srgb,var(--color-ac)_45%,#fff)]'
                    : 'bg-ln'
              )}
              style={{ height: s.f != null ? 8 + (s.f / max) * 34 : 6 }}
            />
            <span className={cx('text-[10px] font-semibold', i === si ? 'text-ac' : 'text-mu2')}>{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CaseTabs({ cases, ci, onPick }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-3.5" role="tablist" aria-label="Scenario">
      {cases.map((c, i) => (
        <button
          key={c.label}
          role="tab"
          aria-selected={i === ci}
          className={cx(
            'h-7 px-3 rounded-full border text-xs font-semibold transition-[background,color,border-color] duration-200',
            i === ci ? 'bg-ac border-ac text-white' : 'bg-white border-ln text-ink2 hover:border-ac hover:text-ac'
          )}
          onClick={() => onPick(i)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

export default function Inspector({ mode, query, base, qi, ci, setCi, si, setSi, step }) {
  const activeRef = useRef(null);
  const meta = CAT_META[query.cat];
  const Icon = meta.icon;
  const showData = mode === 'walk';
  const joins = joinsFor(step);
  const colChips = Object.entries(step.c || {}).flatMap(([t, cols]) => cols.map((c) => `${t}.${c}`));

  useEffect(() => {
    if (activeRef.current) activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [qi, ci, si]);

  return (
    <div className="h-full flex flex-col w-[408px] max-[1180px]:w-[340px] max-[860px]:w-full max-[860px]:h-[46vh]">
      <div className="flex-1 min-h-0 overflow-auto px-[18px] pt-[18px] pb-6 [scrollbar-width:thin]">
        <header className="mb-3.5 animate-fade-up" key={qi} style={{ '--cc': meta.hue }}>
          <div className="flex gap-1.5 mb-2">
            <span className="inline-flex items-center gap-[5px] h-[22px] px-[9px] rounded-full text-[11px] font-bold text-[color:var(--cc)] bg-[color-mix(in_srgb,var(--cc)_12%,#fff)]">
              <Icon size={12} strokeWidth={2.5} />{query.cat}
            </span>
            {query.tag && (
              <span className="inline-flex items-center h-[22px] px-[9px] rounded-full font-mono text-[10.5px] font-bold tracking-[0.04em] bg-bg text-ink2 border border-ln">
                {query.tag}
              </span>
            )}
          </div>
          <h2 className="text-[19px] font-bold tracking-[-0.02em] leading-[1.25]">{query.title}</h2>
        </header>

        {base.cases && <CaseTabs cases={base.cases} ci={ci} onPick={setCi} />}

        <Sql code={query.sql} hl={step.h} />
        {showData && <Funnel query={query} si={si} setSi={setSi} />}

        <ol className="list-none mt-[18px] relative">
          {query.steps.map((s, i) => {
            const on = i === si;
            const done = i < si;
            return (
              <li
                key={i}
                ref={on ? activeRef : null}
                className={cx(
                  "relative pl-[38px] before:content-[''] before:absolute before:left-[13px] before:top-7 before:-bottom-1 before:w-0.5 before:rounded-sm last:before:hidden",
                  done ? 'before:bg-ac' : 'before:bg-ln'
                )}
              >
                <button className="group flex items-center w-full text-left gap-0 border-0 bg-transparent py-1 min-h-7" onClick={() => setSi(i)}>
                  <span
                    className={cx(
                      'absolute left-0 top-0 size-7 rounded-full grid place-items-center text-xs font-bold border-[1.5px] transition-[background,color,border-color,scale,box-shadow] duration-300',
                      on
                        ? 'bg-ac border-ac text-white scale-[1.12] shadow-[0_0_0_5px_rgba(79,70,229,0.15)]'
                        : done
                          ? 'bg-ac border-ac text-white'
                          : 'bg-white border-ln text-mu'
                    )}
                  >
                    {done ? <Check size={12} strokeWidth={3.2} /> : i + 1}
                  </span>
                  <span
                    className={cx(
                      'transition-colors duration-300 group-hover:text-ink',
                      on ? 'text-ink font-bold text-[14.5px]' : done ? 'text-ink2 font-medium text-[13.5px]' : 'text-mu font-medium text-[13.5px]'
                    )}
                  >
                    {s.title}
                  </span>
                </button>
                {on && (
                  <div className="pt-1 pb-[18px] animate-fade-up" key={`${qi}:${ci}:${i}`}>
                    <p className="text-ink2 leading-[1.6] mb-2.5">{s.text}</p>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {showData && s.f != null && (
                        <span className={cx(CHIP_BASE, CHIP.flow)}>
                          <Rows3 size={13} strokeWidth={2.4} />
                          {s.f} {s.f === 1 ? 'row' : 'rows'} in flight
                        </span>
                      )}
                      {joins.map((j) => (
                        <span key={j.key} className={cx(CHIP_BASE, CHIP.join)}>
                          <Link2 size={13} strokeWidth={2.4} />
                          {j.text}
                        </span>
                      ))}
                      {!showData && colChips.map((c) => (
                        <span key={c} className={cx(CHIP_BASE, CHIP.col, 'font-mono text-[11px]')}>
                          <Columns3 size={12} strokeWidth={2.4} />
                          {c}
                        </span>
                      ))}
                      {(s.ops || []).map((o, k) => {
                        const { Icon: OpIcon, text, kind } = opLabel(o);
                        return (
                          <span key={k} className={cx(CHIP_BASE, CHIP[kind])}>
                            <OpIcon size={13} strokeWidth={2.4} />
                            {text}
                          </span>
                        );
                      })}
                    </div>
                    {s.res && <ResultTable res={s.res} showData={showData} />}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <footer className="flex flex-wrap gap-x-3.5 gap-y-1.5 px-[18px] py-[11px] border-t border-ln bg-[#fbfbfe] text-[11.5px] text-mu">
        {(showData ? LEGEND_WALK : LEGEND_SCHEMA).map(([bg, label]) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <i className={cx('inline-block size-3 rounded-[4px] border border-[rgba(17,24,39,0.08)]', bg)} />
            {label}
          </span>
        ))}
      </footer>
    </div>
  );
}
