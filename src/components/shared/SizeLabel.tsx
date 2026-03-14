import { useState, useRef, useEffect } from 'react';
import type { Size } from '../../lib/types';

const SIZE_ORDER: Size[] = ['XS', 'S', 'M', 'L', 'XL'];

const sizeColors: Record<Size, string> = {
  XS: 'text-gray-400',
  S: 'text-sky-500',
  M: 'text-violet-500',
  L: 'text-orange-500',
  XL: 'text-red-500',
};

interface SizeLabelProps {
  size: Size;
  onChange?: (size: Size) => void;
}

export function SizeLabel({ size, onChange }: SizeLabelProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!onChange) {
    return (
      <span className={`text-[10px] font-medium min-w-[18px] text-center ${sizeColors[size]}`}>{size}</span>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`text-[10px] font-medium min-w-[18px] text-center cursor-pointer hover:underline ${sizeColors[size]}`}
      >
        {size}
      </button>
      {open && (
        <div className="absolute z-50 top-full right-0 mt-1 w-20 bg-white border border-[var(--border-light)] rounded-lg shadow-lg overflow-hidden">
          {SIZE_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false); }}
              className={`flex items-center gap-1.5 w-full px-2.5 py-1.5 text-left text-[11px] hover:bg-gray-50 ${s === size ? 'bg-gray-50 font-medium' : ''} ${sizeColors[s]}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
