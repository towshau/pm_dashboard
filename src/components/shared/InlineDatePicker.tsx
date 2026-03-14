import { useState, useRef, useEffect } from 'react';

function formatDue(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

interface InlineDatePickerProps {
  value: string | null;
  onChange?: (date: string) => void;
}

export function InlineDatePicker({ value, onChange }: InlineDatePickerProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (!onChange) {
    return <span className="text-[11px] text-[#9ca3af] min-w-[44px] text-right">{formatDue(value)}</span>;
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="date"
        defaultValue={value ?? ''}
        className="text-[11px] text-[var(--text-secondary)] w-[110px] border border-[var(--border-light)] rounded px-1 py-0.5"
        onClick={(e) => e.stopPropagation()}
        onBlur={(e) => {
          const v = e.target.value;
          if (v && v !== value) onChange(v);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const v = (e.target as HTMLInputElement).value;
            if (v && v !== value) onChange(v);
            setEditing(false);
          }
          if (e.key === 'Escape') setEditing(false);
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      className="text-[11px] text-[#9ca3af] min-w-[44px] text-right cursor-pointer hover:text-[var(--text-primary)] hover:underline"
    >
      {formatDue(value)}
    </button>
  );
}
