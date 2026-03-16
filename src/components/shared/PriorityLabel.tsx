import { useState, useRef, useCallback } from 'react';
import { PortalDropdown } from './PortalDropdown';
import type { Priority } from '../../lib/types';

const PRIORITY_ORDER: Priority[] = ['high', 'medium', 'low'];

const priorityStyles: Record<Priority, string> = {
  high: 'text-[#e24b4a]',
  medium: 'text-amber-600',
  low: 'text-gray-400',
};

const priorityDots: Record<Priority, string> = {
  high: '#e24b4a',
  medium: '#d97706',
  low: '#9ca3af',
};

const priorityLabels: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

interface PriorityLabelProps {
  priority: Priority;
  onChange?: (priority: Priority) => void;
}

export function PriorityLabel({ priority, onChange }: PriorityLabelProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  if (!onChange) {
    return (
      <span className={`text-[10px] font-medium min-w-[38px] ${priorityStyles[priority]}`}>
        {priorityLabels[priority]}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`text-[10px] font-medium min-w-[38px] cursor-pointer hover:underline ${priorityStyles[priority]}`}
      >
        {priorityLabels[priority]}
      </button>
      <PortalDropdown open={open} onClose={close} anchorRef={btnRef} width={96}>
        {PRIORITY_ORDER.map((p) => (
          <button
            key={p}
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(p); setOpen(false); }}
            className={`flex items-center gap-1.5 w-full px-2.5 py-1.5 text-left text-[11px] hover:bg-gray-50 ${p === priority ? 'bg-gray-50 font-medium' : ''}`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityDots[p] }} />
            {priorityLabels[p]}
          </button>
        ))}
      </PortalDropdown>
    </div>
  );
}
