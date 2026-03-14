import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const reposition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const dropH = 280;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const top = spaceBelow >= dropH ? rect.bottom + 4 : rect.top - dropH - 4;
    const left = Math.max(8, rect.right - 224);
    setPos({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    reposition();
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        btnRef.current?.contains(t) ||
        panelRef.current?.contains(t)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, reposition]);

  const selected = staff.filter((s) => selectedIds.includes(s.id));

  return (
    <>
      <button
        ref={btnRef}
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
      {open && pos && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] w-56 bg-white border border-[var(--border-light)] rounded-lg shadow-lg max-h-[280px] overflow-y-auto"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="px-3 py-1.5 text-[10px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider border-b border-[var(--border-lighter)] sticky top-0 bg-white">
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
        </div>,
        document.body
      )}
    </>
  );
}
