import { Scale, Timer } from 'lucide-react';
import { cx } from './ui';

const peak = (steps) => Math.max(0, ...steps.map((s) => s.f || 0));
const BAR = ['bg-[#ef4444]', 'bg-[#10b981]'];

const fmt = (ms) => {
  if (ms < 1) return `${ms.toFixed(2)} ms`;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  const m = Math.floor(ms / 60000);
  const s = Math.round((ms % 60000) / 1000);
  return `${m} min ${s} s`;
};

const speedup = (before, after) => {
  const r = before / after;
  if (r >= 1.05) return `${r >= 100 ? Math.round(r).toLocaleString() : r.toFixed(1)}x faster`;
  if (r <= 0.95) return `${(1 / r).toFixed(1)}x slower`;
  return 'about the same';
};

function Timing({ timing, ci, hasCases }) {
  const vals = [timing.before, timing.after];
  const top = Math.log10(Math.max(...vals) + 1);
  const labels = ['Unoptimized', 'Optimized'];
  const good = timing.after < timing.before;

  return (
    <div className="px-3 pb-3 border-t border-ln2 pt-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-mu">
          <Timer size={13} strokeWidth={2.4} />Measured run time
        </span>
        <span className={cx('text-[11px] font-bold px-2 py-0.5 rounded-full', good ? 'bg-nw text-[#047857]' : 'bg-bg text-ink2')}>
          {speedup(timing.before, timing.after)}
        </span>
      </div>
      {vals.map((v, i) => (
        <div key={labels[i]} className={cx('flex items-center gap-2 mb-1 transition-opacity duration-300', hasCases && i !== ci && 'opacity-50')}>
          <span className="w-[84px] shrink-0 text-[11.5px] font-medium text-ink2">{labels[i]}</span>
          <span className="flex-1 h-2 rounded bg-ln2 overflow-hidden">
            <i
              className={cx('block h-full rounded transition-[width] duration-500', BAR[i])}
              style={{ width: `${Math.max(3, (Math.log10(v + 1) / (top || 1)) * 100)}%` }}
            />
          </span>
          <b className="w-[74px] text-right text-[11.5px] tabular-nums">{fmt(v)}</b>
        </div>
      ))}
      <div className="text-[10.5px] text-mu2 mt-1">Bars use a log scale so milliseconds and minutes can share one chart.</div>
    </div>
  );
}

export default function Compare({ base, ci }) {
  const { compare, cases } = base;
  const stats = cases ? cases.map((c) => ({ label: c.label, n: peak(c.steps) })) : [];
  const top = Math.max(0, ...stats.map((s) => s.n));
  const heads = ['Unoptimized', 'Optimized'];
  const timing = compare.timing && compare.timing.before != null && compare.timing.after != null ? compare.timing : null;

  return (
    <div className="mt-3.5 border border-ln rounded-xl bg-white shadow-s overflow-hidden">
      <div className="flex items-center gap-1.5 h-8 px-3 bg-[#f4f5fb] border-b border-ln text-[11px] font-bold tracking-[0.06em] uppercase text-mu">
        <Scale size={13} strokeWidth={2.4} />Optimized vs unoptimized
      </div>
      <p className="px-3 pt-2.5 pb-2 text-[13px] leading-[1.55] text-ink2">{compare.verdict}</p>
      {timing && <Timing timing={timing} ci={ci} hasCases={Boolean(cases)} />}
      {top > 0 && (
        <div className="px-3 pb-3">
          <div className="text-[11px] font-semibold text-mu mb-1.5">Peak rows in flight</div>
          {stats.map((s, i) => (
            <div key={s.label} className={cx('flex items-center gap-2 mb-1 transition-opacity duration-300', i !== ci && 'opacity-50')}>
              <span className="w-[84px] shrink-0 text-[11.5px] font-medium text-ink2">{s.label}</span>
              <span className="flex-1 h-2 rounded bg-ln2 overflow-hidden">
                <i className={cx('block h-full rounded transition-[width] duration-500', BAR[i])} style={{ width: `${(s.n / top) * 100}%` }} />
              </span>
              <b className="w-5 text-right text-[11.5px] tabular-nums">{s.n}</b>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[76px_1fr_1fr] text-[11.5px] leading-[1.45] border-t border-ln">
        <span className="px-2.5 py-1.5 bg-[#fbfbfe]" />
        {heads.map((h, i) => (
          <span key={h} className={cx('px-2.5 py-1.5 font-bold border-l border-ln', i === 0 ? 'bg-dl text-[#b91c1c]' : 'bg-nw text-[#047857]', cases && i === ci && 'underline')}>
            {h}
          </span>
        ))}
        {compare.rows.map((r) => (
          <div key={r.aspect} className="contents">
            <span className="px-2.5 py-2 font-semibold text-mu border-t border-ln2">{r.aspect}</span>
            <span className="px-2.5 py-2 text-ink2 border-t border-l border-ln2">{r.before}</span>
            <span className="px-2.5 py-2 text-ink2 border-t border-l border-ln2">{r.after}</span>
          </div>
        ))}
      </div>
    </div>
  );
}