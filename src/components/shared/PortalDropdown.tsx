import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalDropdownProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  width: number;
  children: ReactNode;
}

export function PortalDropdown({ open, onClose, anchorRef, width, children }: PortalDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; flipped: boolean }>({ top: 0, left: 0, flipped: false });

  const reposition = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 120;
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipped = spaceBelow < menuHeight + 8;
    setPos({
      top: flipped ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.right - width,
      flipped,
    });
  }, [anchorRef, width]);

  useEffect(() => {
    if (!open) return;
    reposition();
    const frame = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(frame);
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width, zIndex: 9999 }}
      className="bg-white border border-[var(--border-light)] rounded-lg shadow-lg overflow-hidden"
    >
      {children}
    </div>,
    document.body,
  );
}
