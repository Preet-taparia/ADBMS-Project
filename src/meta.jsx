import { Layers, FilePlus2, GitMerge, MapPin, Clock, Compass, Activity, Zap } from 'lucide-react';

export const CAT_META = {
  All: { icon: Layers, hue: '#4f46e5' },
  CRUD: { icon: FilePlus2, hue: '#2563eb' },
  Joins: { icon: GitMerge, hue: '#7c3aed' },
  Spatial: { icon: MapPin, hue: '#059669' },
  Temporal: { icon: Clock, hue: '#d97706' },
  Spatiotemporal: { icon: Compass, hue: '#0d9488' },
  Analytical: { icon: Activity, hue: '#db2777' },
  Trigger: { icon: Zap, hue: '#ea580c' },
};

export const SPEEDS = [0.5, 1, 1.5, 2];
export const BASE_MS = 3200;
