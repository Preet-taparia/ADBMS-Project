export const cx = (...parts) => parts.filter(Boolean).join(' ');

export const FLOAT = 'absolute z-5 cursor-default';

const icoCommon =
  'grid place-items-center p-0 transition-[background,color,scale,opacity] duration-200 ease-soft disabled:opacity-35 disabled:cursor-default enabled:hover:bg-bg enabled:hover:text-ink enabled:active:scale-[0.92]';

export const ico = (on) =>
  cx(icoCommon, 'size-8 border-0 rounded-[9px]', on ? 'bg-ac-soft text-ac' : 'bg-transparent text-ink2');

export const icoSolo = cx(
  icoCommon,
  'size-[38px] rounded-xl text-ink2 bg-white/92 border border-ln shadow-m'
);

export const icoMain =
  'grid place-items-center p-0 border-0 size-10 rounded-[13px] bg-linear-to-br from-[#6366f1] to-[#4338ca] text-white shadow-[0_6px_14px_rgba(79,70,229,0.35)] transition-[scale,filter] duration-200 ease-soft enabled:hover:brightness-[1.08] enabled:active:scale-[0.92]';