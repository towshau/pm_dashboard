import type { Team } from '../../lib/types';
import { TEAM_COLORS } from '../../lib/types';

export function TeamBadge({ team }: { team: Team }) {
  const color = TEAM_COLORS[team] ?? '#6b7280';
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {team}
    </span>
  );
}
