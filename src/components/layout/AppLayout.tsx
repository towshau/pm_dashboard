import { useState, useEffect, useRef, useCallback } from 'react';
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

  const [localSearch, setLocalSearch] = useState(searchParams.get('q') ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const syncToUrl = useCallback((value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) {
      next.set('q', value.trim());
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    debounceRef.current = setTimeout(() => syncToUrl(localSearch), 250);
    return () => clearTimeout(debounceRef.current);
  }, [localSearch, syncToUrl]);

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar activeTeams={activeTeams} onTeamToggle={onTeamToggle} />
      <main className="flex-1 ml-0 lg:ml-[210px] min-w-0 overflow-y-auto flex flex-col">
        <header className="flex-shrink-0 sticky top-0 z-[5] px-5 py-2.5 bg-white border-b border-[var(--border-light)]">
          <div className="relative w-full max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search people, projects, tasks…"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-[var(--border-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white placeholder:text-[#9ca3af] transition-colors"
              aria-label="Search"
            />
          </div>
        </header>
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
