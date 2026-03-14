import { useSearchParams } from 'react-router-dom';
import { ProjectTimeline } from '../components/timeline/ProjectTimeline';

export default function TimelinePage() {
  const [searchParams] = useSearchParams();
  const teamsParam = searchParams.get('teams');
  const activeTeams = teamsParam ? teamsParam.split(',') : [];

  return (
    <div className="min-h-full">
      <header className="px-7 py-5 border-b border-[var(--border-light)] bg-white">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Project timeline</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {activeTeams.length > 0 ? `Filtered: ${activeTeams.join(', ')}` : 'All teams'} · Click a project to expand sub-projects
        </p>
      </header>
      <ProjectTimeline teamFilter={activeTeams.length > 0 ? activeTeams : null} />
    </div>
  );
}
