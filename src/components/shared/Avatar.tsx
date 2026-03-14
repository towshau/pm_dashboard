interface AvatarProps {
  initials: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
  title?: string;
}

const sizeClasses = {
  xs: 'w-5 h-5 text-[8px]',
  sm: 'w-[22px] h-[22px] text-[9px]',
  md: 'w-8 h-8 text-[11px]',
};

export function Avatar({ initials, color = '#2d4a6f', size = 'sm', title }: AvatarProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium text-white flex-shrink-0 ${sizeClasses[size]}`}
      style={{ backgroundColor: color }}
      title={title}
    >
      {initials}
    </div>
  );
}
