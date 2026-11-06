import {
  ZoomIn, ZoomOut, Maximize2, LocateFixed, RotateCcw, Map as MapIcon, PanelLeft, PanelRight, ChevronRight, Compass,
} from 'lucide-react';
import { CAT_META } from './meta';
import { cx, FLOAT, ico, icoSolo } from './ui';

export function Breadcrumb({ mode, query, selected, onToggleRail }) {
  const meta = CAT_META[query.cat];
  const CatIcon = mode === 'explore' ? Compass : meta.icon;
  const hue = mode === 'explore' ? '#4f46e5' : meta.hue;
  const lead = mode === 'explore' ? 'Explore' : query.cat;
  const tail = mode === 'explore' ? selected || 'All tables' : query.title;

  return (
    <div
      data-float
      className={cx(
        FLOAT,
        'left-[14px] top-[14px] flex items-center gap-2 max-w-[calc(100%_-_340px)] max-[1180px]:max-w-[calc(100%_-_330px)] max-[860px]:max-w-[calc(100%_-_20px)]'
      )}
    >
      <button className={icoSolo} onClick={onToggleRail} title="Toggle query list" aria-label="Toggle query list">
        <PanelLeft size={16} strokeWidth={2.3} />
      </button>
      <div
        className="flex items-center gap-1.5 h-[38px] pl-3 pr-3.5 rounded-xl bg-white/92 border border-ln shadow-m backdrop-blur-sm text-[13px] text-mu min-w-0 animate-fade-up"
        key={`${mode}:${query.title}:${query.label || ''}:${selected || ''}`}
      >
        <CatIcon size={14} strokeWidth={2.4} className="shrink-0" style={{ color: hue }} />
        <span className="font-semibold" style={{ color: hue }}>{lead}</span>
        <ChevronRight size={13} strokeWidth={2.4} className="shrink-0 text-mu2" />
        <b className="font-[650] text-ink whitespace-nowrap overflow-hidden text-ellipsis">{tail}</b>
        {mode !== 'explore' && query.label && (
          <>
            <ChevronRight size={13} strokeWidth={2.4} className="shrink-0 text-mu2" />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{query.label}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function Toolbar({ zoom, onZoom, onFit, follow, onFollow, onReset, inspOpen, onInsp }) {
  return (
    <div
      data-float
      className={cx(
        FLOAT,
        'right-[14px] top-[14px] flex items-center gap-0.5 p-1 rounded-xl bg-white/92 border border-ln shadow-m backdrop-blur-sm max-[860px]:top-[60px]'
      )}
    >
      <button className={ico(false)} onClick={() => onZoom(1.25)} title="Zoom in" aria-label="Zoom in">
        <ZoomIn size={16} strokeWidth={2.3} />
      </button>
      <span className="min-w-[42px] text-center text-xs font-semibold text-ink2 tabular-nums">{Math.round(zoom * 100)}%</span>
      <button className={ico(false)} onClick={() => onZoom(0.8)} title="Zoom out" aria-label="Zoom out">
        <ZoomOut size={16} strokeWidth={2.3} />
      </button>
      <i className="w-px h-[18px] bg-ln mx-1" />
      <button className={ico(false)} onClick={onFit} title="Fit what matters" aria-label="Fit">
        <Maximize2 size={15} strokeWidth={2.3} />
      </button>
      <button className={ico(follow)} onClick={onFollow} title="Follow the active tables" aria-label="Follow">
        <LocateFixed size={16} strokeWidth={2.3} />
      </button>
      <button className={ico(false)} onClick={onReset} title="Reset layout and view" aria-label="Reset">
        <RotateCcw size={15} strokeWidth={2.3} />
      </button>
      <i className="w-px h-[18px] bg-ln mx-1" />
      <button className={ico(inspOpen)} onClick={onInsp} title="Toggle details" aria-label="Toggle details">
        <PanelRight size={16} strokeWidth={2.3} />
      </button>
    </div>
  );
}
