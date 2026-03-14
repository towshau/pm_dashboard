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

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar activeTeams={activeTeams} onTeamToggle={onTeamToggle} />
      <main className="flex-1 ml-0 lg:ml-[210px] min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
