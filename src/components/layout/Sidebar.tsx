import { NavLink } from 'react-router-dom';
import { Avatar } from '../shared/Avatar';
import type { Team } from '../../lib/types';
import { TEAM_COLORS } from '../../lib/types';

const TEAMS: Team[] = ['Admin', 'Maintenance', 'Leadership', 'Managers', 'Subsidiary', 'Marketing'];

const navItems = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'Projects', path: '/projects', icon: 'folder' },
  { label: 'Tasks', path: '/tasks', icon: 'check' },
  { label: 'Timeline', path: '/timeline', icon: 'calendar' },
  { label: 'People', path: '/people', icon: 'users' },
];

interface SidebarProps {
  activeTeams: string[];
  onTeamToggle: (team: string) => void;
}

export function Sidebar({ activeTeams, onTeamToggle }: SidebarProps) {
  return (
    <nav className="w-[210px] min-w-[210px] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] flex flex-col p-5 pt-6 fixed top-0 left-0 bottom-0 z-10 max-lg:hidden">
      <div className="pb-6 border-b border-[var(--sidebar-border)]">
        <h1 className="text-[17px] font-semibold text-white tracking-tight">Lockeroom</h1>
        <p className="text-[11px] text-[#6e6e8a] mt-0.5">Project management</p>
      </div>
      <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider text-[#5a5a7a]">Main</div>
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex items-center gap-2.5 py-1.5 px-5 text-[13px] w-full text-left transition-colors rounded-none no-underline ${
              isActive
                ? 'text-white bg-white/8 border-r-2 border-[var(--sidebar-accent)]'
                : 'text-[#8e8ea8] hover:text-[#d0d0e0] hover:bg-white/4'
            }`
          }
        >
          <NavIcon name={item.icon} />
          {item.label}
        </NavLink>
      ))}
      <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider text-[#5a5a7a]">Teams</div>
      {TEAMS.map((team) => {
        const isActive = activeTeams.includes(team);
        return (
          <button
            key={team}
            type="button"
            onClick={() => onTeamToggle(team)}
            className={`flex items-center gap-2 py-1.5 px-5 text-[12px] w-full text-left transition-colors ${
              isActive ? 'text-white bg-white/8' : 'text-[#8e8ea8] hover:bg-white/4'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: TEAM_COLORS[team as Team],
                boxShadow: isActive ? `0 0 0 2px var(--sidebar-bg), 0 0 0 3px ${TEAM_COLORS[team as Team]}` : undefined,
              }}
            />
            {team}
            {isActive && (
              <svg className="ml-auto flex-shrink-0 text-white/60" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path d="M5 12l5 5L20 7" />
              </svg>
            )}
          </button>
        );
      })}
      <div className="mt-auto pt-4 border-t border-[var(--sidebar-border)] flex items-center gap-2.5 px-5">
        <Avatar initials="ST" color="#203b53" size="md" />
        <div>
          <div className="text-[13px] text-[#e0e0e8]">Shaun Townsend</div>
          <div className="text-[10px] text-[#6e6e8a]">Operations Manager</div>
        </div>
      </div>
    </nav>
  );
}

function NavIcon({ name }: { name: string }) {
  const c = "currentColor";
  const w = 15;
  const h = 15;
  if (name === 'dashboard')
    return (<svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>);
  if (name === 'folder')
    return (<svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>);
  if (name === 'check')
    return (<svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>);
  if (name === 'calendar')
    return (<svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>);
  if (name === 'users')
    return (<svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>);
  return null;
}
