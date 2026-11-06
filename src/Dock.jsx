import { SkipBack, SkipForward, Play, Pause, RotateCcw, Gauge } from 'lucide-react';
import { SPEEDS, BASE_MS } from './meta';
import { cx, FLOAT, ico, icoMain } from './ui';

const BAR =
  'block w-full rounded-[3px] relative overflow-hidden transition-[background,height] duration-[350ms] ease-soft';
const BAR_RUN =
  "h-[7px] bg-ln after:content-[''] after:absolute after:inset-0 after:bg-ac after:origin-left after:animate-seg-fill";

export default function Dock({ query, si, setSi, playing, togglePlay, speed, setSpeed, step }) {
  const last = query.steps.length - 1;
  const ms = BASE_MS / speed;
  const cycle = () => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]);
  const PlayIcon = playing ? Pause : si === last ? RotateCcw : Play;

  const bar = (i) =>
    cx(
      BAR,
      i === si
        ? playing
          ? BAR_RUN
          : 'h-[7px] bg-ac'
        : i < si
          ? 'h-[5px] bg-ac group-hover:h-2'
          : 'h-[5px] bg-ln group-hover:h-2'
    );

  return (
    <div
      data-float
      className={cx(
        FLOAT,
        'left-1/2 bottom-[18px] -translate-x-1/2 w-[min(560px,calc(100%_-_28px))] py-2.5 pr-3 pl-2.5 rounded-[18px] bg-white/94 border border-ln shadow-l backdrop-blur-[10px] max-[860px]:bottom-3'
      )}
    >
      <div className="flex items-baseline gap-2.5 px-1.5 pb-2 min-w-0">
        <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-ac shrink-0">
          Step {si + 1} of {query.steps.length}
        </span>
        <span className="text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis animate-fade-up" key={si}>
          {step.title}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button className={ico(false)} disabled={si === 0} onClick={() => setSi(si - 1)} title="Previous step" aria-label="Previous step">
          <SkipBack size={16} strokeWidth={2.4} />
        </button>
        <button className={icoMain} onClick={togglePlay} title={playing ? 'Pause' : 'Play'} aria-label={playing ? 'Pause' : 'Play'}>
          <PlayIcon size={17} strokeWidth={2.4} />
        </button>
        <button className={ico(false)} disabled={si === last} onClick={() => setSi(si + 1)} title="Next step" aria-label="Next step">
          <SkipForward size={16} strokeWidth={2.4} />
        </button>
        <div className="flex-1 flex gap-[5px] items-center px-1.5 min-w-0" style={{ '--ms': `${ms}ms` }}>
          {query.steps.map((s, i) => (
            <button
              key={i}
              className="group flex-1 h-[18px] p-0 border-0 bg-transparent flex items-center"
              onClick={() => setSi(i)}
              title={s.title}
              aria-label={`Step ${i + 1}: ${s.title}`}
            >
              <i key={`${i === si}-${playing}-${speed}`} className={bar(i)} />
            </button>
          ))}
        </div>
        <button
          className="inline-flex items-center gap-[5px] h-8 px-2.5 rounded-[9px] border border-ln bg-white text-xs font-semibold text-ink2 tabular-nums transition-[background,scale] duration-200 ease-soft hover:bg-bg active:scale-95"
          onClick={cycle}
          title="Playback speed"
        >
          <Gauge size={14} strokeWidth={2.4} />
          {speed}x
        </button>
      </div>
    </div>
  );
}