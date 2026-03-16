import { useState, useRef, useCallback } from 'react';
import { PortalDropdown } from './PortalDropdown';
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
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  if (!onChange) {
    return (
      <span className={`text-[10px] font-medium min-w-[18px] text-center ${sizeColors[size]}`}>{size}</span>
    );
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`text-[10px] font-medium min-w-[18px] text-center cursor-pointer hover:underline ${sizeColors[size]}`}
      >
        {size}
      </button>
      <PortalDropdown open={open} onClose={close} anchorRef={btnRef} width={80}>
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
      </PortalDropdown>
    </div>
  );
}
