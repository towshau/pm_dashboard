import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Project, SubProject } from '../lib/types';
import { deriveInitials } from '../lib/types';

export function useProjectsWithTimeline() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchCnt, setRefetchCnt] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      const { data, error: e } = await supabase
        .from('pm_projects')
        .select(`
          *,
          staff_database(first_name, last_name, rgb_colour)
        `)
        .eq('status', 'active')
        .order('start_date', { ascending: true });
      if (!mounted) return;
      if (e) {
        setError(e.message);
        setProjects([]);
      } else {
        const withCounts = await Promise.all(
          (data || []).map(async (row: Record<string, unknown>) => {
            const owner = row.staff_database as Record<string, unknown> | null;
            const firstName = (owner?.first_name as string) ?? '';
            const lastName = (owner?.last_name as string) ?? '';
            const id = row.id as string;
            const { count: total } = await supabase.from('pm_tasks').select('*', { count: 'exact', head: true }).eq('project_id', id);
            const { count: done } = await supabase.from('pm_tasks').select('*', { count: 'exact', head: true }).eq('project_id', id).eq('status', 'done');
            return {
              ...row,
              owner_name: owner ? `${firstName} ${lastName}`.trim() : null,
              owner_initials: owner ? deriveInitials(firstName, lastName) : null,
              owner_avatar_color: (owner?.rgb_colour as string) ?? '#2d4a6f',
              tasks_total: total ?? 0,
              tasks_done: done ?? 0,
            } as Project;
          })
        );
        setProjects(withCounts);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [refetchCnt]);

  const refetch = () => setRefetchCnt((c) => c + 1);
  return { projects, loading, error, refetch };
}

export function useSubProjects(projectId: string | null) {
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setSubProjects([]);
      return;
    }
    let mounted = true;
    setLoading(true);
    supabase
      .from('pm_sub_projects')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: true })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (!error) setSubProjects((data as SubProject[]) || []);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [projectId]);

  return { subProjects, loading };
}
