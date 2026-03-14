import { useSearchParams } from 'react-router-dom';
import { useAllTasks } from '../hooks/useAllTasks';
import { TaskRow } from '../components/dashboard/TaskRow';

export default function TasksPage() {
  const [searchParams] = useSearchParams();
  const teamsParam = searchParams.get('teams');
  const activeTeams = teamsParam ? teamsParam.split(',') : [];
  const teamFilter = activeTeams.length > 0 ? activeTeams[0] : null;
  const { tasks: allTasks, loading, error } = useAllTasks(teamFilter);

  const tasks = activeTeams.length > 1
    ? allTasks.filter((t) => t.project_team && activeTeams.includes(t.project_team))
    : allTasks;

  return (
    <div className="min-h-full">
      <header className="px-7 py-5 border-b border-[var(--border-light)] bg-white">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Tasks</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {activeTeams.length > 0 ? `Filtered: ${activeTeams.join(', ')}` : 'All teams'} · {tasks.length} tasks
        </p>
      </header>
      <div className="p-7">
        {error && <div className="text-red-600 text-sm mb-4">Error: {error}</div>}
        {loading ? (
          <div className="py-12 text-center text-[var(--text-secondary)]">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border border-[var(--border-light)] rounded-xl p-12 text-center text-[var(--text-secondary)]">
            No tasks match the filter.
          </div>
        ) : (
          <div className="bg-white border border-[var(--border-light)] rounded-xl overflow-hidden">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
