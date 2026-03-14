import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Returns the set of staff_database IDs who have at least one task assigned (as owner).
 * Used to show star and sort "has tasks" first on People page.
 */
export function useTaskOwnerIds(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    supabase
      .from('pm_tasks')
      .select('owner_id')
      .not('owner_id', 'is', null)
      .then(({ data }) => {
        if (!mounted) return;
        const set = new Set<string>((data || []).map((r: { owner_id: string }) => r.owner_id));
        setIds(set);
      });
    return () => { mounted = false; };
  }, []);

  return ids;
}
