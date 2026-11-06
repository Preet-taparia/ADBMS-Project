import { memo } from 'react';

function Edges({ edges, tables, pick }) {
  const idle = !tables.length && !pick;

  return (
    <svg className="absolute left-0 top-0 overflow-visible pointer-events-none" width="1" height="1">
      {edges.map((e) => {
        const on = pick
          ? e.from === pick || e.to === pick
          : !tables.length || (tables.includes(e.from) && tables.includes(e.to));
        const lit = on && !idle;
        const color = lit ? 'var(--color-ac)' : 'var(--color-cn)';
        return (
          <g key={`${e.from}-${e.to}-${e.col}`} opacity={on ? 1 : 0.4}>
            <path
              d={e.d}
              fill="none"
              stroke={color}
              strokeWidth={lit ? 2 : 1.4}
              strokeDasharray={lit ? '9 6' : undefined}
              strokeLinecap="round"
              className={lit && !pick ? 'animate-flow' : undefined}
            />
            <circle cx={e.start.x} cy={e.start.y} r={3.5} fill={color} />
            {lit && (
              <text
                x={e.label.x}
                y={e.label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--color-ac-ink)"
                stroke="#fff"
                strokeWidth="4"
                paintOrder="stroke"
              >
                {e.col}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default memo(Edges);
