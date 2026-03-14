import { useMemo } from 'react';
import { ProjectGroup } from './ProjectGroup';
import type { Task } from '../../lib/types';
import type { Team } from '../../lib/types';

interface DashBoardProps {
  tasks: Task[];
  loading: boolean;
  activeTeams: string[];
}

export function DashBoard({ tasks, loading, activeTeams }: DashBoardProps) {
  const grouped = useMemo(() => {
    const filtered =
      activeTeams.length === 0
        ? tasks
        : tasks.filter((t) => t.project_team && activeTeams.includes(t.project_team));
    const byProject = new Map<
      string,
      { projectId: string; projectName: string; team: Team; teamColor: string; ownerId: string | null; tasks: Task[] }
    >();
    for (const t of filtered) {
      const key = t.project_id;
      const existing = byProject.get(key);
      if (existing) {
        existing.tasks.push(t);
      } else {
        byProject.set(key, {
          projectId: t.project_id,
          projectName: t.project_name ?? 'Unknown',
          team: (t.project_team as Team) ?? 'Admin',
          teamColor: t.team_color ?? '#6b7280',
          ownerId: t.project_owner_id ?? null,
          tasks: [t],
        });
      }
    }
    return Array.from(byProject.values());
  }, [tasks, activeTeams]);

  const projectCount = grouped.length;
  const taskCount = grouped.reduce((n, g) => n + g.tasks.length, 0);

  return (
    <section className="px-7 py-4">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <h2 className="text-[15px] font-semibold">This dash</h2>
        <span className="text-[11px] text-[var(--text-secondary)]">
          {taskCount} tasks across {projectCount} projects
          {activeTeams.length > 0 && ` · Filtered: ${activeTeams.join(', ')}`}
        </span>
      </div>
      <div className="bg-white border border-[var(--border-light)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[var(--text-secondary)]">Loading…</div>
        ) : grouped.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-secondary)]">No tasks in this dash.</div>
        ) : (
          grouped.map((g, i) => (
            <ProjectGroup
              key={g.projectId}
              projectId={g.projectId}
              projectName={g.projectName}
              team={g.team}
              teamColor={g.teamColor}
              ownerId={g.ownerId}
              tasks={g.tasks}
              defaultOpen={i === 0}
            />
          ))
        )}
      </div>
    </section>
  );
}
