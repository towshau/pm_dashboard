import { Outlet, useSearchParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const teamsParam = searchParams.get('teams');
  const activeTeams: string[] = teamsParam ? teamsParam.split(',') : [];

  const onTeamToggle = (team: string) => {
    const next = new URLSearchParams(searchParams);
    let updated: string[];
    if (activeTeams.includes(team)) {
      updated = activeTeams.filter((t) => t !== team);
    } else {
      updated = [...activeTeams, team];
    }
    if (updated.length === 0) {
      next.delete('teams');
    } else {
      next.set('teams', updated.join(','));
    }
    setSearchParams(next, { replace: true });
  };

  const q = searchParams.get('q') ?? '';

  const onSearchChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) {
      next.set('q', value.trim());
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar activeTeams={activeTeams} onTeamToggle={onTeamToggle} />
      <main className="flex-1 ml-0 lg:ml-[210px] min-w-0 overflow-y-auto flex flex-col">
        <header className="flex-shrink-0 sticky top-0 z-[5] px-4 py-2 bg-white border-b border-[var(--border-lighter)]">
          <input
            type="search"
            placeholder="Search…"
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full max-w-sm px-3 py-1.5 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--border-light)] focus:border-[var(--border-light)]"
            aria-label="Search"
          />
        </header>
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
