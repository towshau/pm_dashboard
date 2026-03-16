import { useState, useRef, useCallback } from 'react';
import { PortalDropdown } from './PortalDropdown';
import type { TaskStatus } from '../../lib/types';

const STATUS_ORDER: TaskStatus[] = ['to_do', 'in_progress', 'review', 'blocked', 'done'];

const statusStyles: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  to_do: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'To do' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-800', label: 'In progress' },
  review: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Review' },
  blocked: { bg: 'bg-red-50', text: 'text-red-700', label: 'Blocked' },
  done: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Done' },
};

interface StatusBadgeProps {
  status: TaskStatus;
  onChange?: (status: TaskStatus) => void;
}

export function StatusBadge({ status, onChange }: StatusBadgeProps) {
  const s = statusStyles[status] ?? statusStyles.to_do;
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  if (!onChange) {
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap cursor-pointer hover:ring-1 hover:ring-gray-300 ${s.bg} ${s.text}`}
      >
        {s.label}
      </button>
      <PortalDropdown open={open} onClose={close} anchorRef={btnRef} width={112}>
        {STATUS_ORDER.map((st) => {
          const style = statusStyles[st];
          return (
            <button
              key={st}
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(st); setOpen(false); }}
              className={`flex items-center gap-1.5 w-full px-2.5 py-1.5 text-left text-[11px] hover:bg-gray-50 ${st === status ? 'bg-gray-50 font-medium' : ''}`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st === 'blocked' ? '#ef4444' : st === 'done' ? '#10b981' : st === 'in_progress' ? '#f59e0b' : '#3b82f6' }} />
              {style.label}
            </button>
          );
        })}
      </PortalDropdown>
    </div>
  );
}
