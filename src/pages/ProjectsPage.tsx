import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProjectsWithTimeline } from '../hooks/useProjects';
import { TeamBadge } from '../components/shared/TeamBadge';
import { StaffPicker } from '../components/shared/StaffPicker';
import { NewProjectForm } from '../components/projects/NewProjectForm';
import type { Team } from '../lib/types';
import { supabase } from '../lib/supabase';

export default function ProjectsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const teamsParam = searchParams.get('teams');
  const activeTeams = teamsParam ? teamsParam.split(',') : [];
  const { projects, loading, error, refetch } = useProjectsWithTimeline();
  const [showNewProject, setShowNewProject] = useState(false);

  const filtered = activeTeams.length > 0
    ? projects.filter((p) => activeTeams.includes(p.team))
    : projects;

  const handleOwnerChange = async (projectId: string, staffId: string) => {
    await supabase.from('pm_projects').update({ owner_id: staffId }).eq('id', projectId);
    refetch();
  };

  const handleNewProjectSuccess = () => {
    setShowNewProject(false);
    refetch();
  };

  return (
    <div className="min-h-full">
      <header className="px-7 py-5 border-b border-[var(--border-light)] bg-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Projects</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {activeTeams.length > 0 ? `Filtered: ${activeTeams.join(', ')}` : 'All teams'} · {filtered.length} active projects
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewProject(true)}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--sidebar-accent)] text-white hover:opacity-90 flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add project
        </button>
      </header>

      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowNewProject(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <NewProjectForm onSuccess={handleNewProjectSuccess} onCancel={() => setShowNewProject(false)} />
          </div>
        </div>
      )}

      <div className="p-7">
        {error && <div className="text-red-600 text-sm mb-4">Error: {error}</div>}
        {loading ? (
          <div className="py-12 text-center text-[var(--text-secondary)]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[var(--border-light)] rounded-xl p-12 text-center text-[var(--text-secondary)]">
            No projects match the filter.
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowNewProject(true)}
                className="text-sm font-medium text-[var(--sidebar-accent)] hover:underline"
              >
                Add project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="bg-white border border-[var(--border-light)] rounded-xl p-4 hover:border-[var(--text-tertiary)] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-medium text-[var(--text-primary)] truncate">{project.name}</h2>
                    <div className="flex items-center gap-2 mt-1.5" onClick={(e) => e.stopPropagation()}>
                      <TeamBadge team={project.team as Team} />
                      <StaffPicker
                        selectedId={project.owner_id}
                        onSelect={(staffId) => handleOwnerChange(project.id, staffId)}
                        size="xs"
                      />
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: project.team_color }} />
                </div>
                {(project.tasks_total != null && project.tasks_total > 0) && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-lighter)] text-[11px] text-[var(--text-secondary)]">
                    {project.tasks_done ?? 0} / {project.tasks_total} tasks done
                    <div className="mt-1 h-1 bg-[var(--border-light)] rounded overflow-hidden">
                      <div className="h-full bg-[#1d9e75] rounded" style={{ width: `${Math.round(((project.tasks_done ?? 0) / project.tasks_total) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
