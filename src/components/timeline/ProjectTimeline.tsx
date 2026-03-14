import { useProjectsWithTimeline, useSubProjects } from '../../hooks/useProjects';
import { useDash } from '../../hooks/useDash';
import { GanttRow } from './GanttRow';

function getWeekLabels(rangeStart: Date, rangeEnd: Date): { label: string; date: string }[] {
  const out: { label: string; date: string }[] = [];
  const d = new Date(rangeStart);
  while (d <= rangeEnd) {
    const weekNum = getWeekNumber(d);
    out.push({
      label: `W${weekNum}`,
      date: d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
    });
    d.setDate(d.getDate() + 7);
  }
  return out;
}

function getWeekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + start.getDay() + 1) / 7);
}

interface ProjectTimelineProps {
  teamFilter?: string[] | string | null;
}

export function ProjectTimeline({ teamFilter }: ProjectTimelineProps = {}) {
  const { projects, loading } = useProjectsWithTimeline();
  const { dash } = useDash();

  const teams: string[] = Array.isArray(teamFilter)
    ? teamFilter
    : teamFilter
      ? [teamFilter]
      : [];

  const filteredProjects =
    teams.length > 0 ? projects.filter((p) => teams.includes(p.team)) : projects;

  const rangeStart = new Date('2026-03-09');
  const rangeEnd = new Date('2026-04-30');
  const weeks = getWeekLabels(rangeStart, rangeEnd);
  const dashStart = dash ? new Date(dash.start_date + 'T12:00:00') : null;
  const dashEnd = dash ? new Date(dash.end_date + 'T12:00:00') : null;

  return (
    <section className="px-7 py-4 pb-6">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <h2 className="text-[15px] font-semibold">Project timeline</h2>
        <div className="flex gap-2 items-center">
          <span className="text-[11px] text-[var(--text-secondary)]">
            {teams.length > 0
              ? `Filtered: ${teams.join(', ')}`
              : 'Click a project to expand sub-projects'}
          </span>
          <select className="text-xs py-1 px-2 rounded-lg border border-gray-200 bg-white">
            <option>Mar – Apr 2026</option>
          </select>
        </div>
      </div>
      <div className="bg-white border border-[var(--border-light)] rounded-xl overflow-hidden relative">
        <div className="flex border-b border-[var(--border-light)]">
          <div className="w-[200px] min-w-[200px] py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)] border-r border-[var(--border-light)]">
            Project
          </div>
          <div className="flex-1 grid gap-0" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
            {weeks.map((w, i) => (
              <div
                key={w.label + w.date}
                className={`py-2 px-1 text-center text-[11px] font-semibold text-[var(--text-secondary)] border-r border-[var(--border-lighter)] last:border-r-0 ${
                  dashStart && dashEnd && i >= 0 && i < 2 ? 'bg-[rgba(127,119,221,0.06)]' : ''
                }`}
              >
                {w.label}
                <span className="block text-[9px] font-normal text-[#9ca3af]">{w.date}</span>
              </div>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="py-12 text-center text-[var(--text-secondary)]">Loading…</div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-secondary)]">No projects match the filter.</div>
        ) : (
          filteredProjects.map((project) => (
            <GanttRowWithSubs
              key={project.id}
              project={project}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              dashStart={dashStart}
              dashEnd={dashEnd}
            />
          ))
        )}
      </div>
      <div className="flex gap-4 mt-2 text-[11px] text-[var(--text-secondary)]">
        <span className="flex items-center gap-1">
          <span className="w-5 h-2 rounded bg-gray-400 block" />
          Project
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-1.5 rounded bg-gray-400/50 block" />
          Sub-project
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-3 rounded-sm bg-[rgba(127,119,221,0.08)] border border-dashed border-[rgba(127,119,221,0.3)] block" />
          Current dash
        </span>
      </div>
    </section>
  );
}

function GanttRowWithSubs({
  project,
  rangeStart,
  rangeEnd,
  dashStart,
  dashEnd,
}: {
  project: { id: string; name: string; team: string; team_color: string; owner_initials?: string | null; owner_avatar_color?: string | null; start_date: string | null; target_end_date: string | null };
  rangeStart: Date;
  rangeEnd: Date;
  dashStart: Date | null;
  dashEnd: Date | null;
}) {
  const { subProjects } = useSubProjects(project.id);
  return (
    <GanttRow
      project={project as import('../../lib/types').Project}
      subProjects={subProjects}
      rangeStart={rangeStart}
      rangeEnd={rangeEnd}
      dashStart={dashStart}
      dashEnd={dashEnd}
    />
  );
}
