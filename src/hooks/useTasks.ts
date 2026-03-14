import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Task } from '../lib/types';
import { deriveInitials } from '../lib/types';

function normalizeTaskRow(row: Record<string, unknown>): Task {
  const p = row.pm_projects as Record<string, unknown> | null;
  const sp = row.pm_sub_projects as Record<string, unknown> | null;
  const owner = row.staff_database as Record<string, unknown> | null;
  const firstName = (owner?.first_name as string) ?? '';
  const lastName = (owner?.last_name as string) ?? '';
  return {
    ...row,
    project_name: (p?.name as string) ?? null,
    project_team: (p?.team as string) ?? null,
    team_color: (p?.team_color as string) ?? null,
    project_owner_id: (p?.owner_id as string) ?? null,
    sub_project_name: (sp?.name as string) ?? null,
    owner_name: owner ? `${firstName} ${lastName}`.trim() : null,
    owner_initials: owner ? deriveInitials(firstName, lastName) : null,
    owner_avatar_color: (owner?.rgb_colour as string) ?? '#2d4a6f',
  } as Task;
}

export function useTasksForDash(dashId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchCnt, setRefetchCnt] = useState(0);

  useEffect(() => {
    if (!dashId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    (async () => {
      const { data, error: e } = await supabase
        .from('pm_tasks')
        .select(`
          *,
          pm_projects!inner(id, name, team, team_color, owner_id),
          pm_sub_projects(name),
          staff_database(first_name, last_name, rgb_colour)
        `)
        .eq('dash_id', dashId)
        .order('sort_order', { ascending: true });
      if (!mounted) return;
      if (e) {
        setError(e.message);
        setTasks([]);
      } else {
        setTasks((data || []).map((row: Record<string, unknown>) => normalizeTaskRow(row)));
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [dashId, refetchCnt]);

  const refetch = () => setRefetchCnt((c) => c + 1);
  return { tasks, loading, error, refetch };
}

export function useTasksForProject(projectId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchCnt, setRefetchCnt] = useState(0);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    (async () => {
      const { data, error: e } = await supabase
        .from('pm_tasks')
        .select(`
          *,
          pm_projects!inner(id, name, team, team_color, owner_id),
          pm_sub_projects(name),
          staff_database(first_name, last_name, rgb_colour)
        `)
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true })
        .order('due_date', { ascending: true, nullsFirst: false });
      if (!mounted) return;
      if (e) {
        setError(e.message);
        setTasks([]);
      } else {
        setTasks((data || []).map((row: Record<string, unknown>) => normalizeTaskRow(row)));
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [projectId, refetchCnt]);

  const refetch = () => setRefetchCnt((c) => c + 1);
  return { tasks, loading, error, refetch };
}

export function useUnscheduledTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchCnt, setRefetchCnt] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('pm_tasks')
        .select(`
          *,
          pm_projects!inner(id, name, team, team_color, owner_id),
          pm_sub_projects(name),
          staff_database(first_name, last_name, rgb_colour)
        `)
        .is('dash_id', null)
        .order('sort_order', { ascending: true });
      if (!mounted) return;
      if (e) {
        setError(e.message);
        setTasks([]);
      } else {
        setTasks((data || []).map((row: Record<string, unknown>) => normalizeTaskRow(row)));
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [refetchCnt]);

  const refetch = () => setRefetchCnt((c) => c + 1);
  return { tasks, loading, error, refetch };
}
