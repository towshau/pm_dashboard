import { useState, useMemo } from 'react';
import { useStaff } from '../hooks/useStaff';
import { useTaskOwnerIds } from '../hooks/useTaskOwnerIds';
import { Avatar } from '../components/shared/Avatar';
import { StatusBadge } from '../components/shared/StatusBadge';
import { PriorityLabel } from '../components/shared/PriorityLabel';
import { deriveInitials } from '../lib/types';
import type { StaffMember, Task } from '../lib/types';
import { supabase } from '../lib/supabase';

const GYM_COLUMNS = [
  { key: 'BRIDGE', label: 'Bridge Street' },
  { key: 'BLIGH', label: 'Bligh Street' },
  { key: 'COLLINS', label: 'Collins Street' },
  { key: 'HQ', label: 'HQ' },
];

function formatDue(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function PersonCard({ person, hasTasks }: { person: StaffMember; hasTasks: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const handleExpand = () => {
    if (!expanded && tasks.length === 0) {
      setLoadingTasks(true);
      supabase
        .from('pm_tasks')
        .select('id, title, status, priority, due_date, pm_projects(name, team)')
        .eq('owner_id', person.id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .then(({ data }) => {
          const rows = (data || []).map((r: Record<string, unknown>) => {
            const proj = r.pm_projects as Record<string, unknown> | null;
            return { ...r, project_name: (proj?.name as string) ?? null, project_team: (proj?.team as string) ?? null } as Task;
          });
          setTasks(rows);
          setLoadingTasks(false);
        });
    }
    setExpanded(!expanded);
  };

  const initials = deriveInitials(person.first_name, person.last_name);

  return (
    <div className="bg-white border border-[var(--border-light)] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={handleExpand}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50/80 transition-colors"
      >
        <Avatar initials={initials} color={person.rgb_colour ?? '#2d4a6f'} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-[13px] text-[var(--text-primary)] truncate flex items-center gap-1.5">
            {person.first_name} {person.last_name ?? ''}
            {hasTasks && (
              <span className="flex-shrink-0 text-amber-500" title="Has tasks assigned">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
            )}
          </h3>
          <span className="text-[10px] text-[var(--text-tertiary)]">{person.role ?? 'No role'}</span>
        </div>
        <svg
          className="flex-shrink-0 text-[var(--text-tertiary)] transition-transform"
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          style={{ transform: expanded ? 'rotate(90deg)' : undefined }}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      {expanded && (
        <div className="border-t border-[var(--border-lighter)]">
          {loadingTasks ? (
            <div className="p-3 text-center text-[11px] text-[var(--text-secondary)]">Loading tasks…</div>
          ) : tasks.length === 0 ? (
            <div className="p-3 text-center text-[11px] text-[var(--text-tertiary)]">No tasks assigned</div>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="px-3 py-2 border-t border-[var(--border-lighter)] first:border-t-0 hover:bg-gray-50/60">
                <div className="text-[12px] font-medium text-[var(--text-primary)] break-words">
                  {t.title}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 pl-0 text-[10px]">
                  {t.project_name && (
                    <span className="text-[var(--text-tertiary)]">{t.project_name}</span>
                  )}
                  <StatusBadge status={t.status} />
                  <PriorityLabel priority={t.priority} />
                  <span className="text-[#9ca3af]">{formatDue(t.due_date)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function PeoplePage() {
  const { staff, loading, error } = useStaff();
  const taskOwnerIds = useTaskOwnerIds();

  const gymGroups = useMemo(() => {
    const groups: Record<string, StaffMember[]> = { BRIDGE: [], BLIGH: [], COLLINS: [], HQ: [] };
    for (const person of staff) {
      const gym = person.home_gym?.toUpperCase() ?? 'BRIDGE';
      if (gym in groups) {
        groups[gym].push(person);
      } else {
        groups['BRIDGE'].push(person);
      }
    }
    // Sort each column: people with tasks first, then by name
    const name = (p: StaffMember) => `${p.first_name} ${(p.last_name ?? '').trim()}`;
    (Object.keys(groups) as (keyof typeof groups)[]).forEach((key) => {
      groups[key].sort((a, b) => {
        const aHas = taskOwnerIds.has(a.id);
        const bHas = taskOwnerIds.has(b.id);
        if (aHas !== bHas) return aHas ? -1 : 1;
        return name(a).localeCompare(name(b));
      });
    });
    return groups;
  }, [staff, taskOwnerIds]);

  return (
    <div className="min-h-full">
      <header className="px-7 py-5 border-b border-[var(--border-light)] bg-white">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">People</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {staff.length} active staff · ★ = has tasks · Click a person to see their tasks
        </p>
      </header>
      <div className="p-7">
        {error && <div className="text-red-600 text-sm mb-4">Error: {error}</div>}
        {loading ? (
          <div className="py-12 text-center text-[var(--text-secondary)]">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GYM_COLUMNS.map(({ key, label }) => (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">{label}</h2>
                  <span className="text-[11px] text-[var(--text-tertiary)] bg-gray-100 px-1.5 py-0.5 rounded">
                    {gymGroups[key]?.length ?? 0}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {(gymGroups[key] ?? []).map((person) => (
                    <PersonCard
                      key={person.id}
                      person={person}
                      hasTasks={taskOwnerIds.has(person.id)}
                    />
                  ))}
                  {(gymGroups[key] ?? []).length === 0 && (
                    <div className="text-[12px] text-[var(--text-tertiary)] py-4 text-center bg-gray-50 rounded-xl border border-dashed border-[var(--border-light)]">
                      No staff at this location
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
