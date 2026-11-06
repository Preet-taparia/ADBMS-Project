import { useState, useEffect } from 'react';
import { BASE_MS } from '../meta';

export function usePlayback(last) {
  const [raw, setSi] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const si = Math.min(raw, last);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setTimeout(() => {
      if (si < last) setSi(si + 1);
      else setPlaying(false);
    }, BASE_MS / speed);
    return () => clearTimeout(id);
  }, [playing, si, last, speed]);

  const toggle = () => {
    if (!playing && si === last) setSi(0);
    setPlaying(!playing);
  };

  const reset = () => {
    setSi(0);
    setPlaying(false);
  };

  return { si, setSi, playing, toggle, speed, setSpeed, reset };
}