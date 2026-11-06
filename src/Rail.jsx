import { useEffect } from 'react';
import { Database, Search, X, Table2, KeyRound } from 'lucide-react';
import { CATEGORIES } from './data';
import { CAT_META } from './meta';
import { cx } from './ui';

function SearchBox({ search, setSearch, searchRef, placeholder }) {
  return (
    <label className="flex items-center gap-2 h-[38px] px-2.5 rounded-[10px] border border-ln bg-bg text-mu transition-[border-color,background,box-shadow] duration-200 focus-within:bg-white focus-within:border-ac focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.12)]">
      <Search size={15} strokeWidth={2.3} />
      <input
        className="flex-1 min-w-0 border-0 outline-0 bg-transparent text-ink placeholder:text-mu2"
        ref={searchRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
      {search ? (
        <button
          className="border-0 bg-ln rounded-full size-[18px] grid place-items-center text-mu p-0 hover:bg-cn hover:text-ink"
          onClick={() => setSearch('')}
          aria-label="Clear search"
        >
          <X size={13} strokeWidth={2.6} />
        </button>
      ) : (
        <kbd className="font-mono text-[11px] font-semibold text-mu border border-ln border-b-2 rounded-[5px] px-1.5 bg-white">/</kbd>
      )}
    </label>
  );
}

function TableList({ items, selected, onPick }) {
  return (
    <div className="flex-1 min-h-0 overflow-auto -mx-3.5 px-3.5 pt-3.5 pb-5 [scrollbar-width:thin]">
      {items.map((t) => {
        const on = t.name === selected;
        return (
          <button
            key={t.name}
            data-tn={t.name}
            className={cx(
              'flex items-center gap-2 w-full text-left border-0 py-2 px-2.5 rounded-[10px] transition-[background,translate] duration-200 ease-soft hover:translate-x-0.5',
              on ? 'bg-ac-soft' : 'bg-transparent hover:bg-bg'
            )}
            onClick={() => onPick(t.name)}
          >
            <Table2 size={14} strokeWidth={2.3} className={on ? 'text-ac' : 'text-mu'} />
            <span className={cx('flex-1 min-w-0 truncate font-mono text-[12.5px]', on ? 'font-bold text-ac-ink' : 'font-medium')}>{t.name}</span>
            <span className="flex items-center gap-1 text-[11px] text-mu tabular-nums shrink-0" title={`${t.cols} columns, used by ${t.uses} queries`}>
              <KeyRound size={10} strokeWidth={2.4} />{t.cols}
              <span className="text-mu2">/</span>{t.uses}q
            </span>
          </button>
        );
      })}
      {!items.length && <p className="py-6 px-2 text-center text-mu text-[13px]">No tables match your search.</p>}
    </div>
  );
}

export default function Rail({
  mode, cat, setCat, search, setSearch, qi, onSelect, counts, groups, searchRef, total, tables, selected, onPickTable,
}) {
  const explore = mode === 'explore';

  useEffect(() => {
    const el = document.querySelector(explore ? `[data-tn="${selected}"]` : `[data-qi="${qi}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [qi, selected, explore]);

  return (
    <div className="w-[292px] max-[1180px]:w-[248px] h-full flex flex-col pt-[18px] px-3.5 pb-0">
      <div className="flex items-center gap-[11px] px-1 pb-4">
        <span className="size-9 shrink-0 rounded-[11px] grid place-items-center text-white bg-linear-to-br from-[#6366f1] to-[#4338ca] shadow-[0_6px_14px_rgba(79,70,229,0.32)]">
          <Database size={18} strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="text-[15px] font-bold tracking-[-0.01em]">Wildlife SQL</h1>
          <p className="text-xs text-mu">{explore ? `${tables.length} tables` : `${total} queries, step by step`}</p>
        </div>
      </div>

      <SearchBox search={search} setSearch={setSearch} searchRef={searchRef} placeholder={explore ? 'Search tables' : 'Search queries'} />

      {explore ? (
        <TableList items={tables} selected={selected} onPick={onPickTable} />
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 pt-3.5 pb-3">
            {CATEGORIES.map((c) => {
              const meta = CAT_META[c];
              const Icon = meta.icon;
              const on = c === cat;
              return (
                <button
                  key={c}
                  className={cx(
                    'inline-flex items-center gap-[5px] h-7 pl-2 pr-2.5 rounded-full border text-xs font-medium transition-[background,border-color,color,translate,box-shadow] duration-200 ease-soft hover:-translate-y-px',
                    on
                      ? 'bg-[color:var(--cc)] border-[color:var(--cc)] text-white shadow-[0_5px_12px_color-mix(in_srgb,var(--cc)_35%,transparent)] [&>svg]:text-white/90'
                      : 'bg-white border-ln text-ink2 hover:shadow-s hover:border-[color-mix(in_srgb,var(--cc)_40%,var(--color-ln))] [&>svg]:text-[color:var(--cc)]'
                  )}
                  style={{ '--cc': meta.hue }}
                  onClick={() => setCat(c)}
                >
                  <Icon size={13} strokeWidth={2.4} />
                  {c}
                  <em className={cx('not-italic text-[11px] tabular-nums', on ? 'text-white/90' : 'text-mu')}>{counts[c]}</em>
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-h-0 overflow-auto -mx-3.5 px-3.5 pb-5 [scrollbar-width:thin]">
            {groups.map((g) => {
              const meta = CAT_META[g.cat];
              const Icon = meta.icon;
              return (
                <section key={g.cat} className="mb-3.5" style={{ '--cc': meta.hue }}>
                  <h3 className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] font-bold text-[color:var(--cc)] px-1.5 pt-1 pb-1.5">
                    <Icon size={13} strokeWidth={2.4} />
                    {g.cat}
                  </h3>
                  {g.items.map(({ q, i }) => {
                    const on = i === qi;
                    return (
                      <button
                        key={i}
                        data-qi={i}
                        className={cx(
                          "relative block w-full text-left border-0 py-2 pr-2.5 pl-3.5 rounded-[10px] transition-[background,translate] duration-200 ease-soft hover:translate-x-0.5 before:content-[''] before:absolute before:left-[3px] before:top-2.5 before:bottom-2.5 before:w-[3px] before:rounded-[3px] before:bg-[color:var(--cc)] before:transition-[scale] before:duration-300 before:ease-soft",
                          on
                            ? 'bg-[color-mix(in_srgb,var(--cc)_9%,#fff)] before:scale-y-100'
                            : 'bg-transparent hover:bg-bg before:scale-y-0'
                        )}
                        onClick={() => onSelect(i)}
                      >
                        <span className={cx('block text-[13px] leading-[1.35]', on ? 'font-[650]' : 'font-medium')}>{q.title}</span>
                        <span className="flex items-center gap-2 mt-0.5 text-[11px] text-mu">
                          {q.tag && (
                            <b className="font-mono font-bold text-[9.5px] tracking-[0.04em] px-1.5 py-px rounded-[5px] text-[color:var(--cc)] bg-[color-mix(in_srgb,var(--cc)_12%,#fff)]">
                              {q.tag}
                            </b>
                          )}
                          <span>{q.cases ? `${q.cases.length} scenarios` : `${q.steps.length} steps`}</span>
                        </span>
                      </button>
                    );
                  })}
                </section>
              );
            })}
            {!groups.length && <p className="py-6 px-2 text-center text-mu text-[13px]">No queries match your search.</p>}
          </div>
        </>
      )}
    </div>
  );
}
