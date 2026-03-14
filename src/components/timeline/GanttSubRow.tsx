import type { SubProject } from '../../lib/types';

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return '';
  const fmt = (s: string) => {
    const d = new Date(s + 'T12:00:00');
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return `Until ${fmt(end!)}`;
}

interface GanttSubRowProps {
  subProject: SubProject;
  leftPct: number;
  widthPct: number;
  color: string;
}

export function GanttSubRow({ subProject, leftPct, widthPct, color }: GanttSubRowProps) {
  const dates = formatDateRange(subProject.start_date, subProject.target_end_date);
  return (
    <div className="flex min-h-8 cursor-default">
      <div className="w-[200px] min-w-[200px] py-1.5 pl-9 pr-3 border-r border-[var(--border-light)] flex items-center gap-1">
        <div className="min-w-0">
          <span className="text-xs font-normal text-[var(--text-secondary)] block truncate">{subProject.name}</span>
          {dates && <span className="text-[9px] text-[var(--text-tertiary)] block">{dates}</span>}
        </div>
      </div>
      <div className="flex-1 relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-sm z-[2] opacity-90"
          style={{
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
