import { Play, Columns3, Compass } from 'lucide-react';
import { FLOAT, cx } from './ui';

export const MODES = [
  { id: 'walk', label: 'Walkthrough', hint: 'Step through a query with sample data', icon: Play, key: '1' },
  { id: 'schema', label: 'Schema', hint: 'Tables and attributes a query uses, no data', icon: Columns3, key: '2' },
  { id: 'explore', label: 'Explore', hint: 'Browse tables, keys and the queries that use them', icon: Compass, key: '3' },
];

export default function ModeSwitch({ mode, setMode }) {
  return (
    <div
      data-float
      className={cx(
        FLOAT,
        'left-[14px] top-[60px] max-[860px]:top-[106px] flex gap-0.5 p-1 rounded-xl bg-white/92 border border-ln shadow-m backdrop-blur-sm'
      )}
      role="tablist"
      aria-label="Mode"
    >
      {MODES.map(({ id, label, hint, icon: Icon, key }) => {
        const on = id === mode;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={on}
            title={`${hint} (${key})`}
            className={cx(
              'inline-flex items-center gap-1.5 h-8 px-3 rounded-[9px] border-0 text-xs font-semibold transition-[background,color,box-shadow] duration-200',
              on ? 'bg-ac text-white shadow-[0_5px_12px_rgba(79,70,229,0.3)]' : 'bg-transparent text-ink2 hover:bg-bg hover:text-ink'
            )}
            onClick={() => setMode(id)}
          >
            <Icon size={14} strokeWidth={2.4} />
            <span className="max-[520px]:hidden">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
