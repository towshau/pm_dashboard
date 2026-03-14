import { useState, useRef, useEffect } from 'react';
import { useStaff } from '../../hooks/useStaff';
import { Avatar } from './Avatar';
import { deriveInitials } from '../../lib/types';

interface StaffPickerProps {
  selectedId: string | null;
  onSelect: (staffId: string) => void;
  size?: 'xs' | 'sm';
}

export function StaffPicker({ selectedId, onSelect, size = 'sm' }: StaffPickerProps) {
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

  const selected = staff.find((s) => s.id === selectedId);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
        title={selected ? `${selected.first_name} ${selected.last_name ?? ''} — click to reassign` : 'Assign someone'}
      >
        {selected ? (
          <Avatar
            initials={deriveInitials(selected.first_name, selected.last_name)}
            color={selected.rgb_colour ?? '#2d4a6f'}
            size={size}
          />
        ) : (
          <span className={`rounded-full bg-gray-200 flex items-center justify-center text-gray-400 ${size === 'xs' ? 'w-5 h-5 text-[8px]' : 'w-[22px] h-[22px] text-[9px]'}`}>?</span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border border-[var(--border-light)] rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {staff.map((person) => {
            const initials = deriveInitials(person.first_name, person.last_name);
            const isSelected = person.id === selectedId;
            return (
              <button
                key={person.id}
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelect(person.id); setOpen(false); }}
                className={`flex items-center gap-2 w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <Avatar initials={initials} color={person.rgb_colour ?? '#2d4a6f'} size="xs" />
                <span className="flex-1 min-w-0">{person.first_name} {person.last_name ?? ''}</span>
                {person.role && <span className="text-[10px] text-[var(--text-tertiary)] flex-shrink-0 ml-1">{person.role}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
