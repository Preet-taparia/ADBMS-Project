import { useState, useRef, useEffect } from 'react';

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 2.5;
export const HOME = { x: 40, y: 40, k: 0.4 };

const clampZoom = (k) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k));

const zoomAt = (p, k, mx, my) => ({
  k,
  a: false,
  x: mx - ((mx - p.x) * k) / p.k,
  y: my - ((my - p.y) * k) / p.k,
});

const TAP_SLOP = 4;

export function useCanvas(handlers) {
  const ref = useRef(null);
  const hand = useRef(handlers);
  hand.current = handlers;

  const [view, setView] = useState({ ...HOME, a: false });
  const [size, setSize] = useState({ w: 1000, h: 700 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const frame = useRef(0);
  const pending = useRef(null);

  const schedule = (fn) => {
    pending.current = fn;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const run = pending.current;
      pending.current = null;
      if (run) run();
    });
  };

  useEffect(() => {
    const el = ref.current;
    const ro = new ResizeObserver(() => {
      const b = el.getBoundingClientRect();
      setSize({ w: b.width, h: b.height });
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    const onWheel = (e) => {
      e.preventDefault();
      const box = el.getBoundingClientRect();
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const speed = e.ctrlKey ? 0.01 : 0.0015;
      const mx = e.clientX - box.left;
      const my = e.clientY - box.top;
      setView((p) => zoomAt(p, clampZoom(p.k * Math.exp(-dy * speed)), mx, my));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const fit = (rects, names, inset) => {
    const { w, h } = sizeRef.current;
    const list = names.filter((n) => rects[n]);
    if (!w || !h || !list.length) return;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    list.forEach((n) => {
      const r = rects[n];
      x0 = Math.min(x0, r.x);
      y0 = Math.min(y0, r.y);
      x1 = Math.max(x1, r.x + r.w);
      y1 = Math.max(y1, r.y + r.h);
    });
    const aw = Math.max(w - inset.side * 2, 100);
    const ah = Math.max(h - inset.top - inset.bottom, 100);
    const k = clampZoom(Math.min(aw / (x1 - x0), ah / (y1 - y0), 1.15));
    setView({
      k,
      a: true,
      x: w / 2 - ((x0 + x1) / 2) * k,
      y: inset.top + ah / 2 - ((y0 + y1) / 2) * k,
    });
  };

  const zoomBy = (f) => {
    const { w, h } = sizeRef.current;
    setView((p) => ({ ...zoomAt(p, clampZoom(p.k * f), w / 2, h / 2), a: true }));
  };

  const jumpTo = (wx, wy) => {
    const { w, h } = sizeRef.current;
    setView((p) => ({ k: p.k, a: false, x: w / 2 - wx * p.k, y: h / 2 - wy * p.k }));
  };

  const home = () => setView({ ...HOME, a: true });

  const onPointerDown = (e) => {
    if (e.target.closest('[data-float]')) return;
    ref.current.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setView((p) => (p.a ? { ...p, a: false } : p));

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { type: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, k0: viewRef.current.k };
      if (hand.current.onUserPan) hand.current.onUserPan();
      return;
    }

    const header = e.target.closest('[data-t]');
    const card = e.target.closest('[data-card]');
    const base = { sx: e.clientX, sy: e.clientY, moved: false };
    if (header && hand.current.canDrag) {
      const name = header.getAttribute('data-t');
      const o = hand.current.getPos(name);
      gesture.current = { ...base, type: 'table', name, ox: o.x, oy: o.y };
    } else {
      const holder = header || card;
      gesture.current = {
        ...base,
        type: 'pan',
        name: holder ? holder.getAttribute(header ? 'data-t' : 'data-card') : null,
        ox: viewRef.current.x,
        oy: viewRef.current.y,
      };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;

    if (g.type === 'pinch') {
      if (pointers.current.size < 2) return;
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const box = ref.current.getBoundingClientRect();
      const mx = (a.x + b.x) / 2 - box.left;
      const my = (a.y + b.y) / 2 - box.top;
      schedule(() => setView((p) => zoomAt(p, clampZoom((g.k0 * d) / g.d0), mx, my)));
      return;
    }

    const dx = e.clientX - g.sx;
    const dy = e.clientY - g.sy;
    if (!g.moved && Math.hypot(dx, dy) < TAP_SLOP) return;
    if (!g.moved) {
      g.moved = true;
      if (g.type === 'pan' && hand.current.onUserPan) hand.current.onUserPan();
    }
    if (g.type === 'table') {
      const k = viewRef.current.k;
      schedule(() => hand.current.onDragTable(g.name, g.ox + dx / k, g.oy + dy / k));
    } else {
      schedule(() => setView((p) => ({ k: p.k, a: false, x: g.ox + dx, y: g.oy + dy })));
    }
  };

  const onPointerUp = (e) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (g && g.type === 'pinch') {
      gesture.current = null;
      return;
    }
    if (pointers.current.size === 0) {
      if (g && !g.moved && hand.current.onTap) hand.current.onTap(g.name || null);
      gesture.current = null;
    }
  };

  const onPointerCancel = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) gesture.current = null;
  };

  return {
    ref,
    view,
    size,
    fit,
    zoomBy,
    jumpTo,
    home,
    bind: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
