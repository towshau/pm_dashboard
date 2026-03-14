import { useState } from 'react';
import { TeamBadge } from '../shared/TeamBadge';
import { StaffPicker } from '../shared/StaffPicker';
import { TaskRow } from './TaskRow';
import type { Task } from '../../lib/types';
import type { Team } from '../../lib/types';
import { supabase } from '../../lib/supabase';

interface ProjectGroupProps {
  projectId: string;
  projectName: string;
  team: Team;
  teamColor: string;
  ownerId: string | null;
  tasks: Task[];
  defaultOpen?: boolean;
  onOwnerChanged?: () => void;
}

export function ProjectGroup({
  projectId,
  projectName,
  team,
  teamColor,
  ownerId,
  tasks,
  defaultOpen = false,
  onOwnerChanged,
}: ProjectGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [currentOwnerId, setCurrentOwnerId] = useState(ownerId);
  const done = tasks.filter((t) => t.status === 'done').length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleOwnerChange = async (staffId: string) => {
    setCurrentOwnerId(staffId);
    await supabase.from('pm_projects').update({ owner_id: staffId }).eq('id', projectId);
    onOwnerChanged?.();
  };

  return (
    <div className="border-b border-[var(--border-lighter)] last:border-b-0">
      <div
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-2.5 px-4 hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <svg
            className="flex-shrink-0 transition-transform"
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth={2}
            style={{ transform: open ? 'rotate(90deg)' : undefined }}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: teamColor }} />
          <span className="font-medium text-sm">{projectName}</span>
          <TeamBadge team={team} />
        </div>
        <div className="flex items-center gap-3">
          <StaffPicker selectedId={currentOwnerId} onSelect={handleOwnerChange} />
          <span className="text-[11px] text-[var(--text-secondary)]">{tasks.length} tasks this dash</span>
          <span className="inline-block w-[60px] h-1 bg-[var(--border-light)] rounded overflow-hidden">
            <span className="block h-full bg-[#1d9e75] rounded" style={{ width: `${pct}%` }} />
          </span>
        </div>
      </div>
      <div
        className="overflow-hidden transition-[max-height] duration-350 ease-out"
        style={{ maxHeight: open ? 800 : 0 }}
      >
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
