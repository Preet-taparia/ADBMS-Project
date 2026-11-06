import { memo } from 'react';
import { Table2, KeyRound, Link2 } from 'lucide-react';
import { T } from './data';
import { FK_REFS } from './layout';
import { cx } from './ui';

function SchemaCard({ name, rect, cols, hot, focus, picked, index }) {
  const t = T[name];
  const refs = FK_REFS[name] || {};

  return (
    <div
      className="absolute left-0 top-0 will-change-transform"
      style={{ transform: `translate(${rect.x}px, ${rect.y}px)`, width: rect.w }}
      data-card={name}
    >
      <div
        className={cx(
          'bg-white border rounded-[14px] overflow-hidden animate-card-in transition-[opacity,box-shadow,border-color,translate,filter] duration-[450ms]',
          focus
            ? 'border-[color-mix(in_srgb,var(--color-ac)_55%,var(--color-ln))] shadow-[0_0_0_4px_rgba(79,70,229,0.1),0_14px_36px_rgba(40,48,100,0.14),0_3px_8px_rgba(40,48,100,0.08)] -translate-y-[3px]'
            : 'border-ln opacity-55 saturate-[0.7] shadow-s',
          picked && 'ring-2 ring-ac ring-offset-2'
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div
          className={cx(
            'flex items-center gap-[7px] h-[34px] px-3 border-b border-ln text-[13px] bg-linear-to-b',
            focus ? 'from-[#f5f5ff] to-[#e9eaff]' : 'from-[#fbfcff] to-[#f2f4fb]'
          )}
        >
          <Table2 size={14} strokeWidth={2.2} className={cx('shrink-0 transition-colors duration-[400ms]', focus ? 'text-ac' : 'text-mu')} />
          <b className="font-[650] tracking-[-0.005em] truncate">{name}</b>
          <span className="ml-auto text-[11px] text-mu tabular-nums shrink-0">{cols.length} of {t.cols.length}</span>
        </div>
        <ul className="py-1">
          {cols.map((c) => {
            const j = t.cols.indexOf(c);
            const pk = j === 0;
            const on = hot.includes(c);
            return (
              <li
                key={c}
                className={cx(
                  'flex items-center gap-1.5 h-6 px-3 text-[11.5px] transition-[background-color,color] duration-[400ms]',
                  on ? 'bg-[color-mix(in_srgb,var(--color-ac)_14%,#fff)] shadow-[inset_3px_0_0_var(--color-ac)]' : ''
                )}
              >
                <span className="size-3 shrink-0 grid place-items-center">
                  {pk && <KeyRound size={11} strokeWidth={2.6} className="text-[#d97706]" />}
                  {!pk && refs[c] && <Link2 size={11} strokeWidth={2.6} className="text-ac" />}
                </span>
                <span className={cx('font-mono truncate', pk && 'font-bold', on ? 'text-ac-ink font-semibold' : 'text-ink2')}>{c}</span>
                <span className="ml-auto pl-2 text-[10px] font-mono text-mu2 truncate">
                  {refs[c] ? `to ${refs[c]}` : t.types[j]}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default memo(SchemaCard);
