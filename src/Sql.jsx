import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { cx } from './ui';

const WORDS = [
  'INSERT INTO', 'DELETE FROM', 'LEFT JOIN', 'INNER JOIN', 'CROSS JOIN', 'GROUP BY', 'ORDER BY', 'PARTITION BY',
  'IS NOT NULL', 'IS NULL', 'NOT EXISTS', 'SELECT', 'FROM', 'WHERE', 'VALUES', 'UPDATE', 'SET', 'JOIN',
  'LATERAL', 'EXISTS', 'WITH', 'RETURNING', 'HAVING', 'OVER', 'ON', 'AND', 'OR', 'AS', 'IN', 'LIMIT',
  'FILTER', 'DESC', 'ASC', 'INTERVAL', 'TRUE', 'FALSE', 'DISTINCT', 'NOT', 'AT TIME ZONE',
].sort((a, b) => b.length - a.length);

const SOURCE = `('(?:[^']|'')*')|\\b(${WORDS.join('|')})\\b|\\b(\\d+(?:\\.\\d+)?)\\b|\\b([A-Za-z_][A-Za-z0-9_]*)(?=\\()`;

const TOKEN = {
  str: 'text-[#047857]',
  kw: 'text-ac font-bold',
  num: 'text-[#c2410c]',
  fn: 'text-[#0e7490]',
};

function tokenize(line) {
  const out = [];
  const re = new RegExp(SOURCE, 'g');
  let last = 0;
  let m = re.exec(line);
  while (m) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? 'str' : m[2] ? 'kw' : m[3] ? 'num' : 'fn';
    out.push(<span key={m.index} className={TOKEN[cls]}>{m[0]}</span>);
    last = m.index + m[0].length;
    m = re.exec(line);
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export default function Sql({ code, hl }) {
  const [done, setDone] = useState(false);
  const lines = code.split('\n');
  const active = lines.map((l) => Boolean(hl && hl.some((h) => l.includes(h))));
  const any = active.some(Boolean);

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(code);
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };

  return (
    <div className="border border-ln rounded-xl overflow-hidden bg-[#fbfbfe] shadow-s">
      <div className="flex justify-between items-center h-[34px] pl-3 pr-2 bg-[#f4f5fb] border-b border-ln">
        <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.07em] text-mu">
          <Terminal size={13} strokeWidth={2.4} />SQL
        </span>
        <button
          className="inline-flex items-center gap-[5px] h-6 px-2 border-0 rounded-[7px] bg-transparent text-xs font-semibold text-mu transition-[background,color] duration-200 hover:bg-[#e8eaf5] hover:text-ink"
          onClick={copy}
          aria-label="Copy SQL"
        >
          {done ? <Check size={13} strokeWidth={2.6} /> : <Copy size={13} strokeWidth={2.4} />}
          {done ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="py-2 max-h-[270px] overflow-auto font-mono text-xs leading-[1.7]">
        {lines.map((l, i) => (
          <div
            key={i}
            className={cx(
              'flex gap-3 pr-3 border-l-[3px] transition-[background,opacity,border-color] duration-[350ms]',
              active[i]
                ? 'bg-linear-to-r from-[rgba(251,191,36,0.28)] to-[rgba(251,191,36,0.08)] border-l-[#f59e0b]'
                : 'border-l-transparent',
              any && !active[i] && 'opacity-50'
            )}
          >
            <i className="shrink-0 w-[34px] text-right not-italic text-[#b6bcd0] select-none">{i + 1}</i>
            <code className={cx('[font:inherit] whitespace-pre-wrap [word-break:break-word]', active[i] ? 'text-ink' : 'text-ink2')}>
              {tokenize(l)}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
