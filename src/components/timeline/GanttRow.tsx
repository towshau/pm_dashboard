import { useState } from 'react';
import { Avatar } from '../shared/Avatar';
import type { Project } from '../../lib/types';
import type { SubProject } from '../../lib/types';
import { GanttSubRow } from './GanttSubRow';
import { TEAM_COLORS } from '../../lib/types';
import type { Team } from '../../lib/types';

interface GanttRowProps {
  project: Project;
  subProjects: SubProject[];
  rangeStart: Date;
  rangeEnd: Date;
  dashStart: Date | null;
  dashEnd: Date | null;
}

function toDate(s: string | null): Date | null {
  if (!s) return null;
  return new Date(s + 'T12:00:00');
}

function pctInRange(d: Date, start: Date, end: Date): number {
  const total = end.getTime() - start.getTime();
  const pos = d.getTime() - start.getTime();
  return Math.max(0, Math.min(100, (pos / total) * 100));
}

export function GanttRow({
  project,
  subProjects,
  rangeStart,
  rangeEnd,
  dashStart,
  dashEnd,
}: GanttRowProps) {
  const [expanded, setExpanded] = useState(false);
  const start = toDate(project.start_date) ?? rangeStart;
  const end = toDate(project.target_end_date) ?? rangeEnd;
  const rangeMs = rangeEnd.getTime() - rangeStart.getTime();
  const leftPct = pctInRange(start, rangeStart, rangeEnd);
  const barWidth = (end.getTime() - start.getTime()) / rangeMs * 100;

  let dashZoneLeft = 0;
  let dashZoneWidth = 0;
  if (dashStart && dashEnd && rangeMs > 0) {
    dashZoneLeft = pctInRange(dashStart, rangeStart, rangeEnd);
    dashZoneWidth = ((dashEnd.getTime() - dashStart.getTime()) / rangeMs) * 100;
  }

  const team = project.team as Team;
  const teamColor = TEAM_COLORS[team] ?? project.team_color;

  return (
    <div className="border-b border-[var(--border-lighter)] last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex min-h-11 cursor-pointer hover:bg-gray-50/80 text-left"
      >
        <div className="w-[200px] min-w-[200px] py-1.5 px-3 border-r border-[var(--border-light)] flex items-center gap-2">
          <svg
            className="flex-shrink-0 transition-transform"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            style={{ transform: expanded ? 'rotate(90deg)' : undefined }}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <div>
            <div className="text-[13px] font-medium">{project.name}</div>
            <div className="text-[10px] text-[#9ca3af] flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: teamColor }} />
              {team}
              {project.owner_initials && (
                <>
                  <span className="text-[#9ca3af]">·</span>
                  <Avatar
                    initials={project.owner_initials}
                    color={project.owner_avatar_color ?? undefined}
                    size="xs"
                  />
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 relative min-h-[44px]">
          <div
            className="absolute top-0 bottom-0 bg-[rgba(127,119,221,0.06)] border-x border-dashed border-[rgba(127,119,221,0.3)] z-[1] pointer-events-none"
            style={{ left: `${dashZoneLeft}%`, width: `${dashZoneWidth}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-md z-[3] opacity-90 flex items-center"
            style={{
              left: `${leftPct}%`,
              width: `${Math.max(2, barWidth)}%`,
              backgroundColor: project.team_color,
            }}
          >
            <span className="absolute left-2 text-[9px] font-medium text-white truncate max-w-full">
              {project.name}
            </span>
          </div>
        </div>
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: expanded ? 400 : 0 }}
      >
        {subProjects.map((sp) => {
          const spStart = toDate(sp.start_date) ?? start;
          const spEnd = toDate(sp.target_end_date) ?? end;
          const spLeft = pctInRange(spStart, rangeStart, rangeEnd);
          const spWidth = ((spEnd.getTime() - spStart.getTime()) / rangeMs) * 100;
          return (
            <GanttSubRow
              key={sp.id}
              subProject={sp}
              leftPct={spLeft}
              widthPct={spWidth}
              color={`${project.team_color}80`}
            />
          );
        })}
      </div>
    </div>
  );
}
