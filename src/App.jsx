import { useState, useRef, useEffect, useMemo } from 'react';
import { T, Q, CATEGORIES, caseView } from './data';
import { LAYOUT, EDGES } from './layout';
import { derive, cardWidth, cardHeight } from './derive';
import { buildEdges } from './geometry';
import { NAMES, USAGE, touched, schemaLayout, stepCols, neighborhood } from './schema';
import { useCanvas } from './hooks/useCanvas';
import { usePlayback } from './hooks/usePlayback';
import { cx } from './ui';
import TableCard from './TableCard';
import SchemaCard from './SchemaCard';
import Edges from './Edges';
import Rail from './Rail';
import Inspector from './Inspector';
import ExplorePanel from './ExplorePanel';
import ModeSwitch, { MODES } from './ModeSwitch';
import Toolbar, { Breadcrumb } from './Toolbar';
import Dock from './Dock';
import './styles.css';

const NONE = [];
const ALL_COLS = Object.fromEntries(NAMES.map((n) => [n, T[n].cols]));
const INSET_DOCK = { top: 110, bottom: 132, side: 56 };
const INSET_FREE = { top: 110, bottom: 40, side: 56 };
const startPositions = () => Object.fromEntries(NAMES.map((n) => [n, { ...LAYOUT[n] }]));
const pick = (map, name) => (map && map[name]) || NONE;

export default function App() {
  const wide = typeof window === 'undefined' ? true : window.innerWidth > 860;
  const [mode, setModeState] = useState('walk');
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [qi, setQi] = useState(0);
  const [ci, setCi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [follow, setFollow] = useState(true);
  const [pos, setPos] = useState(startPositions);
  const [railOpen, setRailOpen] = useState(wide);
  const [inspOpen, setInspOpen] = useState(true);
  const searchRef = useRef(null);
  const fitRef = useRef(null);

  const base = Q[qi];
  const query = useMemo(() => caseView(base, ci), [base, ci]);
  const last = query.steps.length - 1;
  const { si, setSi, playing, toggle, speed, setSpeed, reset: resetPlayback } = usePlayback(last);
  const step = query.steps[si];
  const explore = mode === 'explore';

  const { db, fx } = useMemo(() => derive(query, si), [query, si]);
  const cols = useMemo(() => touched(query), [query]);

  const counts = useMemo(() => {
    const c = { All: Q.length };
    CATEGORIES.slice(1).forEach((k) => {
      c[k] = Q.filter((q) => q.cat === k).length;
    });
    return c;
  }, []);

  const groups = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const items = Q.map((q, i) => ({ q, i })).filter(
      ({ q }) =>
        (cat === 'All' || q.cat === cat) &&
        (!needle || (q.title + ' ' + (q.tag || '') + ' ' + q.sql).toLowerCase().includes(needle))
    );
    return CATEGORIES.slice(1)
      .map((k) => ({ cat: k, items: items.filter((x) => x.q.cat === k) }))
      .filter((g) => g.items.length);
  }, [cat, search]);

  const tableItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return NAMES.filter((n) => !needle || n.includes(needle)).map((n) => ({
      name: n,
      cols: T[n].cols.length,
      uses: USAGE[n].length,
    }));
  }, [search]);

  const rects = useMemo(() => {
    if (mode === 'walk') {
      return Object.fromEntries(
        NAMES.map((n) => [n, { x: pos[n].x, y: pos[n].y, w: cardWidth(T[n]), h: cardHeight(db[n].length) }])
      );
    }
    return schemaLayout(mode === 'schema' ? cols : ALL_COLS);
  }, [mode, pos, db, cols]);

  const shown = useMemo(() => Object.keys(rects), [rects]);
  const edges = useMemo(() => buildEdges(EDGES.filter(([a, b]) => rects[a] && rects[b]), rects), [rects]);
  const near = useMemo(() => (selected ? neighborhood(selected) : NONE), [selected]);

  const canvas = useCanvas({
    canDrag: mode === 'walk',
    getPos: (n) => pos[n],
    onDragTable: (n, x, y) => setPos((p) => ({ ...p, [n]: { x, y } })),
    onUserPan: () => setFollow(false),
    onTap: (name) => {
      if (!explore) return;
      setSelected(name && name !== selected ? name : null);
      if (name) setInspOpen(true);
    },
  });

  fitRef.current = () => {
    let names;
    if (explore) names = selected ? near : NAMES;
    else names = step.tables.length ? step.tables : shown;
    canvas.fit(rects, names, explore || mode === 'schema' ? INSET_FREE : INSET_DOCK);
  };

  useEffect(() => {
    if (follow) fitRef.current();
  }, [mode, qi, ci, si, selected, follow, canvas.size.w, canvas.size.h]);

  const setMode = (m) => {
    setModeState(m);
    setFollow(true);
    if (m === 'explore') resetPlayback();
  };

  const selectQuery = (i) => {
    setQi(i);
    setCi(0);
    resetPlayback();
    setFollow(true);
    if (explore) setModeState('walk');
    if (window.innerWidth <= 860) setRailOpen(false);
  };

  const pickCase = (i) => {
    setCi(i);
    resetPlayback();
  };

  const pickTable = (name) => {
    setSelected(name);
    setFollow(true);
    setInspOpen(true);
    if (window.innerWidth <= 860) setRailOpen(false);
  };

  const fitNow = () => {
    setFollow(true);
    fitRef.current();
  };

  const reset = () => {
    setPos(startPositions());
    setFollow(false);
    canvas.home();
  };

  const jumpTo = (wx, wy) => {
    setFollow(false);
    canvas.jumpTo(wx, wy);
  };

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
      const m = MODES.find((x) => x.key === e.key);
      if (m) setMode(m.id);
      else if (e.key === 'Escape') setSelected(null);
      else if (e.key === '/') {
        e.preventDefault();
        setRailOpen(true);
        if (searchRef.current) searchRef.current.focus();
      } else if (e.key === '+' || e.key === '=') canvas.zoomBy(1.2);
      else if (e.key === '-') canvas.zoomBy(0.83);
      else if (e.key === 'f' || e.key === 'F') fitNow();
      else if (!explore) {
        if (e.key === 'ArrowRight') setSi((s) => Math.min(s + 1, last));
        else if (e.key === 'ArrowLeft') setSi((s) => Math.max(s - 1, 0));
        else if (e.key === 'Home') setSi(0);
        else if (e.key === 'End') setSi(last);
        else if (e.key === ' ' && tag !== 'BUTTON') {
          e.preventDefault();
          toggle();
        } else if (e.key === ']') selectQuery(Math.min(qi + 1, Q.length - 1));
        else if (e.key === '[') selectQuery(Math.max(qi - 1, 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const appClass = cx(
    'grid h-full grid-cols-[var(--rail)_minmax(0,1fr)_var(--insp)] transition-[grid-template-columns,grid-template-rows] duration-[450ms] ease-soft',
    'max-[860px]:grid-cols-[minmax(0,1fr)]',
    railOpen ? '[--rail:292px] max-[1180px]:[--rail:248px]' : '[--rail:0px]',
    inspOpen
      ? '[--insp:408px] max-[1180px]:[--insp:340px] max-[860px]:grid-rows-[minmax(0,1fr)_46vh]'
      : '[--insp:0px] max-[860px]:grid-rows-[minmax(0,1fr)_0px]'
  );

  const railClass = cx(
    'relative z-2 min-w-0 overflow-hidden bg-white border-r border-ln',
    'max-[860px]:fixed max-[860px]:inset-y-0 max-[860px]:left-0 max-[860px]:w-[292px] max-[860px]:z-30 max-[860px]:shadow-l max-[860px]:transition-transform max-[860px]:duration-[400ms] max-[860px]:ease-soft',
    !railOpen && 'max-[860px]:-translate-x-[102%]'
  );

  const { view } = canvas;
  const focusOf = (n) => (explore ? !selected || near.includes(n) : !step.tables.length || step.tables.includes(n));

  return (
    <div className={appClass}>
      <aside className={railClass}>
        <Rail
          mode={mode}
          cat={cat}
          setCat={setCat}
          search={search}
          setSearch={setSearch}
          qi={qi}
          onSelect={selectQuery}
          counts={counts}
          groups={groups}
          searchRef={searchRef}
          total={Q.length}
          tables={tableItems}
          selected={selected}
          onPickTable={pickTable}
        />
      </aside>

      <main
        className="relative min-w-0 overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none bg-canvas bg-[radial-gradient(#d3d8ea_1.2px,transparent_1.2px)]"
        ref={canvas.ref}
        {...canvas.bind}
        style={{
          backgroundSize: `${28 * view.k}px ${28 * view.k}px`,
          backgroundPosition: `${view.x}px ${view.y}px`,
        }}
      >
        <div
          className={cx(
            'absolute left-0 top-0 origin-top-left will-change-transform',
            view.a && 'transition-transform duration-[850ms] ease-soft'
          )}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}
        >
          <Edges edges={edges} tables={explore ? NONE : step.tables} pick={explore ? selected : null} />
          {mode === 'walk' &&
            NAMES.map((n, i) => (
              <TableCard
                key={n}
                name={n}
                index={i}
                pos={pos[n]}
                rows={db[n]}
                focus={focusOf(n)}
                hotCols={pick(step.c, n)}
                hotRows={pick(step.r, n)}
                skipRows={pick(step.s, n)}
                added={pick(fx.added, n)}
                removed={pick(fx.removed, n)}
                changed={pick(fx.changed, n)}
              />
            ))}
          {mode === 'schema' &&
            shown.map((n, i) => (
              <SchemaCard key={n} name={n} index={i} rect={rects[n]} cols={cols[n]} hot={stepCols(step, n)} focus={focusOf(n)} />
            ))}
          {explore &&
            shown.map((n, i) => (
              <SchemaCard key={n} name={n} index={i} rect={rects[n]} cols={ALL_COLS[n]} hot={NONE} focus={focusOf(n)} picked={n === selected} />
            ))}
        </div>

        <Breadcrumb mode={mode} query={query} selected={selected} onToggleRail={() => setRailOpen(!railOpen)} />
        <ModeSwitch mode={mode} setMode={setMode} />
        <Toolbar
          zoom={view.k}
          onZoom={canvas.zoomBy}
          onFit={fitNow}
          follow={follow}
          onFollow={() => setFollow(!follow)}
          onReset={reset}
          inspOpen={inspOpen}
          onInsp={() => setInspOpen(!inspOpen)}
        />
        {!explore && (
          <Dock
            query={query}
            si={si}
            setSi={setSi}
            playing={playing}
            togglePlay={toggle}
            speed={speed}
            setSpeed={setSpeed}
            step={step}
          />
        )}
      </main>

      <aside className="relative z-2 min-w-0 overflow-hidden bg-white border-l border-ln max-[860px]:border-l-0 max-[860px]:border-t">
        {explore ? (
          <ExplorePanel selected={selected} onSelect={pickTable} onOpenQuery={selectQuery} />
        ) : (
          <Inspector mode={mode} query={query} base={base} qi={qi} ci={ci} setCi={pickCase} si={si} setSi={setSi} step={step} />
        )}
      </aside>
    </div>
  );
}
