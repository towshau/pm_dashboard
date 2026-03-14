import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashBanner } from '../components/layout/DashBanner';
import { DashBoard } from '../components/dashboard/DashBoard';
import { ProjectTimeline } from '../components/timeline/ProjectTimeline';
import { PlanningPanel } from '../components/planning/PlanningPanel';
import { useDash } from '../hooks/useDash';
import { useTasksForDash } from '../hooks/useTasks';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const teamsParam = searchParams.get('teams');
  const activeTeams: string[] = teamsParam ? teamsParam.split(',') : [];

  const { dash } = useDash();
  const { tasks, loading: tasksLoading, refetch: refetchDashTasks } = useTasksForDash(dash?.id ?? null);
  const [planningMode, setPlanningMode] = useState(false);

  const stats = useMemo(() => {
    const committed = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const completion = committed > 0 ? Math.round((done / committed) * 100) : 0;
    const blockers = tasks.filter((t) => t.status === 'blocked').length;
    return { tasksCommitted: committed, completionPercent: completion, blockerCount: blockers };
  }, [tasks]);

  return (
    <>
      <DashBanner
        planningMode={planningMode}
        onPlanningToggle={() => setPlanningMode((p) => !p)}
        tasksCommitted={stats.tasksCommitted}
        completionPercent={stats.completionPercent}
        blockerCount={stats.blockerCount}
      />

      {/* Stat cards */}
      <section className="px-7 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-[var(--border-light)] rounded-xl p-4">
          <div className="text-[12px] text-[var(--text-secondary)] mb-1">Active projects</div>
          <div className="text-[28px] font-semibold leading-tight">7</div>
          <div className="text-[11px] text-[#1d9e75] mt-1">+2 this dash</div>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-xl p-4">
          <div className="text-[12px] text-[var(--text-secondary)] mb-1">Tasks in progress</div>
          <div className="text-[28px] font-semibold leading-tight">
            {tasks.filter((t) => t.status === 'in_progress').length}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">of {tasks.length} total</div>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-xl p-4">
          <div className="text-[12px] text-[var(--text-secondary)] mb-1">Blockers</div>
          <div className="text-[28px] font-semibold leading-tight text-[#e24b4a]">{stats.blockerCount}</div>
          <div className="text-[11px] text-[#e24b4a] mt-1">{stats.blockerCount > 0 ? 'needs attention' : 'none'}</div>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-xl p-4">
          <div className="text-[12px] text-[var(--text-secondary)] mb-1">Dash progress</div>
          <div className="text-[28px] font-semibold leading-tight">{stats.completionPercent}%</div>
          <div className="mt-1.5 h-1.5 bg-[var(--border-light)] rounded overflow-hidden">
            <div className="h-full bg-[#1d9e75] rounded" style={{ width: `${stats.completionPercent}%` }} />
          </div>
        </div>
      </section>

      {/* Zone 2: This dash */}
      <div className={planningMode ? 'border border-amber-200 rounded-xl mx-7 mt-4 overflow-hidden bg-amber-50/30' : ''}>
        <DashBoard
          tasks={tasks}
          loading={tasksLoading}
          activeTeams={activeTeams}
        />
        {planningMode && <PlanningPanel onAssigned={refetchDashTasks} />}
      </div>

      {/* Zone 3: Timeline — receives same team filter */}
      <ProjectTimeline teamFilter={activeTeams.length > 0 ? activeTeams : null} />
    </>
  );
}
