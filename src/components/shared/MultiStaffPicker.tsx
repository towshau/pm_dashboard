import { useState, useRef, useEffect } from 'react';
import { useStaff } from '../../hooks/useStaff';
import { Avatar } from './Avatar';
import { deriveInitials } from '../../lib/types';

interface MultiStaffPickerProps {
  selectedIds: string[];
  onToggle: (staffId: string) => void;
  mainOwnerId?: string | null;
}

export function MultiStaffPicker({ selectedIds, onToggle, mainOwnerId }: MultiStaffPickerProps) {
  const { staff } = useStaff();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = staff.filter((s) => selectedIds.includes(s.id));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-0.5 hover:opacity-80 transition-opacity"
        title="Click to manage assignees"
      >
        {selected.length > 0 ? (
          <div className="flex -space-x-1.5">
            {selected.slice(0, 3).map((s) => (
              <Avatar
                key={s.id}
                initials={deriveInitials(s.first_name, s.last_name)}
                color={s.rgb_colour ?? '#2d4a6f'}
                size="xs"
              />
            ))}
            {selected.length > 3 && (
              <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[8px] text-white">
                +{selected.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="rounded-full bg-gray-200 flex items-center justify-center text-gray-400 w-5 h-5 text-[8px]">+</span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 top-full right-0 mt-1 w-56 bg-white border border-[var(--border-light)] rounded-lg shadow-lg max-h-52 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider border-b border-[var(--border-lighter)]">
            Toggle assignees
          </div>
          {staff.map((person) => {
            const initials = deriveInitials(person.first_name, person.last_name);
            const isSelected = selectedIds.includes(person.id);
            const isOwner = person.id === mainOwnerId;
            return (
              <button
                key={person.id}
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggle(person.id); }}
                className={`flex items-center gap-2 w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <Avatar initials={initials} color={person.rgb_colour ?? '#2d4a6f'} size="xs" />
                <span className="truncate">{person.first_name} {person.last_name ?? ''}</span>
                {isOwner && <span className="text-[9px] text-blue-600 ml-auto">owner</span>}
                {isSelected && !isOwner && (
                  <svg className="ml-auto text-blue-600 flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 12l5 5L20 7" /></svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
