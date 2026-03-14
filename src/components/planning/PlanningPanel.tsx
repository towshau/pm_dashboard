import { useState } from 'react';
import { useUnscheduledTasks } from '../../hooks/useTasks';
import { useDash } from '../../hooks/useDash';
import { supabase } from '../../lib/supabase';
import { Avatar } from '../shared/Avatar';
import { TeamBadge } from '../shared/TeamBadge';
import { NewTaskForm } from './NewTaskForm';
import type { Team } from '../../lib/types';

export function PlanningPanel({ onAssigned }: { onAssigned?: () => void }) {
  const { tasks, loading, error, refetch } = useUnscheduledTasks();
  const { dash } = useDash();
  const [showNewTask, setShowNewTask] = useState(false);

  const assignToCurrentDash = async (taskId: string) => {
    if (!dash?.id) return;
    await supabase.from('pm_tasks').update({ dash_id: dash.id }).eq('id', taskId);
    refetch();
    onAssigned?.();
  };

  const handleNewTaskSuccess = () => {
    setShowNewTask(false);
    refetch();
  };

  return (
    <div className="border-t border-[var(--border-lighter)]">
      {error && <div className="p-4 text-red-600 text-sm">Error: {error}</div>}
      {loading && <div className="p-4 text-[var(--text-secondary)] text-sm">Loading…</div>}

      {!loading && !error && (
        <>
          {tasks.length === 0 && !showNewTask ? (
            <div className="px-4 py-3 text-[var(--text-secondary)] text-sm border-t border-[var(--border-lighter)]">
              No unscheduled tasks. All tasks are assigned to a dash.
            </div>
          ) : (
            <>
              <div className="px-4 py-2 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Unscheduled tasks — click to add to current dash
              </div>
              <ul className="divide-y divide-[var(--border-lighter)] max-h-64 overflow-y-auto">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-gray-50/80">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-[13px] block truncate">{task.title}</span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        {task.project_name}
                        {task.sub_project_name ? ` · ${task.sub_project_name}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.project_team && <TeamBadge team={task.project_team as Team} />}
                      {task.owner_initials && (
                        <Avatar
                          initials={task.owner_initials}
                          color={task.owner_avatar_color ?? undefined}
                          size="xs"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => assignToCurrentDash(task.id)}
                        className="text-xs font-medium text-[var(--sidebar-accent)] hover:underline"
                      >
                        Add to dash
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {showNewTask ? (
            <NewTaskForm
              onSuccess={handleNewTaskSuccess}
              onCancel={() => setShowNewTask(false)}
            />
          ) : (
            <div className="px-4 py-3 border-t border-[var(--border-lighter)]">
              <button
                type="button"
                onClick={() => setShowNewTask(true)}
                className="text-xs font-medium text-[var(--sidebar-accent)] hover:underline flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add new task
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
