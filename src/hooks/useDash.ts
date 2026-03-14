import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Dash } from '../lib/types';

const AU_TZ = 'Australia/Sydney';

function todayInSydney(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: AU_TZ }));
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function useDash() {
  const [dash, setDash] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('pm_dashes')
        .select('*')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();
      if (!mounted) return;
      if (e) {
        setError(e.message);
        setDash(null);
      } else {
        setDash(data as Dash | null);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const statusLabel = (): string => {
    if (!dash) return '—';
    const today = todayInSydney();
    const start = parseLocalDate(dash.start_date);
    const end = parseLocalDate(dash.end_date);
    if (today < start) return 'Starts Monday';
    if (today > end) return 'Completed';
    const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const dayNum = Math.min(diffDays + 1, 10);
    return `Day ${dayNum} of 10`;
  };

  const dateRangeLabel = (): string => {
    if (!dash) return '—';
    const start = parseLocalDate(dash.start_date);
    const end = parseLocalDate(dash.end_date);
    const fmt = (d: Date) => d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}`;
  };

  return { dash, loading, error, statusLabel, dateRangeLabel };
}
