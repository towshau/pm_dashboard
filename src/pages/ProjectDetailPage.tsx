import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TaskRow } from '../components/dashboard/TaskRow';
import { TeamBadge } from '../components/shared/TeamBadge';
import { StaffPicker } from '../components/shared/StaffPicker';
import { NewTaskForm } from '../components/planning/NewTaskForm';
import { useTasksForProject } from '../hooks/useTasks';
import type { Project, Team } from '../lib/types';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const { tasks, loading: tasksLoading, error: tasksError, refetch } = useTasksForProject(id ?? null);
  const [showNewTask, setShowNewTask] = useState(false);

  useEffect(() => {
    if (!id) {
      setProjectLoading(false);
      return;
    }
    let mounted = true;
    supabase
      .from('pm_projects')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setProjectError(error.message);
          setProject(null);
        } else {
          setProject(data as Project);
        }
        setProjectLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  const handleOwnerChange = async (staffId: string) => {
    if (!id) return;
    await supabase.from('pm_projects').update({ owner_id: staffId }).eq('id', id);
    setProject((p) => (p ? { ...p, owner_id: staffId } : null));
  };

  const handleNewTaskSuccess = () => {
    setShowNewTask(false);
    refetch();
  };

  if (projectLoading || !id) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <span className="text-[var(--text-secondary)]">Loading…</span>
      </div>
    );
  }
  if (projectError || !project) {
    return (
      <div className="min-h-full px-7 py-5">
        <p className="text-red-600">{projectError ?? 'Project not found'}</p>
        <button type="button" onClick={() => navigate('/projects')} className="mt-2 text-sm text-[var(--sidebar-accent)] hover:underline">
          Back to projects
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <header className="px-7 py-5 border-b border-[var(--border-light)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <TeamBadge team={project.team as Team} />
                <StaffPicker
                  selectedId={project.owner_id}
                  onSelect={handleOwnerChange}
                  size="xs"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNewTask(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--sidebar-accent)] text-white hover:opacity-90 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add task
          </button>
        </div>
      </header>

      <div className="p-7">
        {tasksError && <div className="text-red-600 text-sm mb-4">Error: {tasksError}</div>}

        {showNewTask ? (
          <div className="bg-white border border-[var(--border-light)] rounded-xl overflow-hidden max-w-xl">
            <NewTaskForm
              fixedProjectId={id}
              onSuccess={handleNewTaskSuccess}
              onCancel={() => setShowNewTask(false)}
            />
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] font-medium text-[var(--text-secondary)]">
                Tasks in this project
              </span>
              <button
                type="button"
                onClick={() => setShowNewTask(true)}
                className="text-xs font-medium text-[var(--sidebar-accent)] hover:underline"
              >
                + Add task
              </button>
            </div>

            {tasksLoading ? (
              <div className="py-8 text-center text-[var(--text-secondary)]">Loading tasks…</div>
            ) : tasks.length === 0 ? (
              <div className="bg-white border border-[var(--border-light)] rounded-xl p-8 text-center text-[var(--text-secondary)]">
                No tasks yet. Add a task to get started.
              </div>
            ) : (
              <div className="bg-white border border-[var(--border-light)] rounded-xl overflow-hidden">
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} onTaskUpdated={refetch} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
