import { memo } from 'react';
import { Table2, KeyRound, Link2, Plus, Minus, Pencil } from 'lucide-react';
import { T } from './data';
import { FK_REFS } from './layout';
import { cardWidth } from './derive';
import { cx } from './ui';

const show = (v) => (v === null ? 'NULL' : String(v));

const BADGE = {
  add: 'bg-nw text-[#047857]',
  del: 'bg-dl text-[#b91c1c]',
  chg: 'bg-ch text-[#c2410c]',
};

function Badge({ kind, count }) {
  const Icon = kind === 'add' ? Plus : kind === 'del' ? Minus : Pencil;
  return (
    <span className={cx('inline-flex items-center gap-0.5 h-[18px] pr-1.5 pl-1 rounded-[9px] text-[11px] font-bold animate-pop', BADGE[kind])}>
      <Icon size={11} strokeWidth={2.6} />
      {count}
    </span>
  );
}

const thClass = (pk, fk, hot) =>
  cx(
    'h-[22px] px-[9px] border-b border-ln2 whitespace-nowrap overflow-hidden text-ellipsis text-left transition-[background-color,color] duration-[400ms]',
    pk ? 'font-bold' : 'font-semibold',
    hot
      ? 'bg-[color-mix(in_srgb,var(--color-ac)_14%,#fff)] text-ac-ink shadow-[inset_0_-2px_0_var(--color-ac)]'
      : cx('bg-[#fcfcff]', fk ? 'text-ac' : 'text-mu')
  );

const tdClass = ({ pk, nil, hot, hr, sk, nw, del, chg }) =>
  cx(
    'h-[22px] px-[9px] border-b border-ln2 whitespace-nowrap overflow-hidden text-ellipsis text-left font-mono text-[11px] transition-[background-color,color] duration-[400ms]',
    sk ? 'text-mu2' : hr ? 'text-ink' : chg ? 'text-[#9a3412]' : nil ? 'text-mu2' : pk ? 'text-ink' : 'text-ink2',
    hr ? 'font-semibold' : chg || pk ? 'font-bold' : 'font-normal',
    nil && 'italic',
    chg ? 'bg-ch' : nw ? 'bg-nw' : del ? 'bg-dl' : sk ? 'bg-sk' : hot ? 'bg-hc' : '',
    sk && 'line-through decoration-[rgba(107,114,128,0.45)]',
    del && 'line-through',
    hr && '[background-image:linear-gradient(90deg,var(--color-hl),var(--color-hl))] bg-no-repeat [background-size:100%_100%]',
    nw ? 'animate-row-in' : del ? 'animate-row-out' : chg ? 'animate-chg-pop' : hr ? 'animate-sweep' : ''
  );

function TableCard({ name, pos, rows, hotCols, hotRows, skipRows, added, removed, changed, focus, picked, index }) {
  const t = T[name];
  const refs = FK_REFS[name] || {};

  return (
    <div
      className="absolute left-0 top-0 will-change-transform"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, width: cardWidth(t) }}
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
            'flex items-center gap-[7px] h-[34px] px-3 border-b border-ln text-[13px] cursor-move bg-linear-to-b',
            focus ? 'from-[#f5f5ff] to-[#e9eaff]' : 'from-[#fbfcff] to-[#f2f4fb]'
          )}
          data-t={name}
        >
          <Table2 size={14} strokeWidth={2.2} className={cx('shrink-0 transition-colors duration-[400ms]', focus ? 'text-ac' : 'text-mu')} />
          <b className="font-[650] tracking-[-0.005em]">{name}</b>
          <div className="flex gap-1 ml-1">
            {added.length > 0 && <Badge kind="add" count={added.length} />}
            {removed.length > 0 && <Badge kind="del" count={removed.length} />}
            {changed.length > 0 && <Badge kind="chg" count={changed.length} />}
          </div>
          <span className="ml-auto text-[11px] text-mu tabular-nums">{rows.length} {rows.length === 1 ? 'row' : 'rows'}</span>
        </div>
        <table className="w-full border-collapse table-fixed text-[11.5px] [&_tbody_tr:last-child_td]:border-b-0">
          <thead>
            <tr>
              {t.cols.map((c, j) => (
                <th
                  key={c}
                  title={refs[c] ? `${c} references ${refs[c]}` : `${c} ${t.types[j]}`}
                  className={thClass(j === 0, Boolean(refs[c]), hotCols.includes(c))}
                >
                  <span className={cx('inline-flex items-center gap-1 max-w-full [&_svg]:shrink-0', j === 0 && '[&_svg]:text-[#d97706]')}>
                    {j === 0 && <KeyRound size={10} strokeWidth={2.6} />}
                    {refs[c] && <Link2 size={10} strokeWidth={2.6} />}
                    {c}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pk = r[0];
              const hr = hotRows.includes(pk);
              const sk = skipRows.includes(pk);
              const nw = added.includes(pk);
              const del = removed.includes(pk);
              return (
                <tr key={pk}>
                  {r.map((v, j) => {
                    const col = t.cols[j];
                    const state = {
                      pk: j === 0,
                      nil: v === null,
                      hot: hotCols.includes(col),
                      hr,
                      sk,
                      nw,
                      del,
                      chg: changed.includes(pk + ':' + col),
                    };
                    return (
                      <td
                        key={j}
                        title={show(v)}
                        className={tdClass(state)}
                        style={hr ? { animationDelay: `${j * 0.04}s` } : undefined}
                      >
                        {show(v)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={t.cols.length} className="h-[22px] px-[9px] text-center text-mu">No rows</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(TableCard);
