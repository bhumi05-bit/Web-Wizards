import React from 'react';

const COLORS = [
  'bg-emerald-600 text-white',
  'bg-indigo-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white',
  'bg-teal-600 text-white',
  'bg-sky-600 text-white'
];

function getInitialColor(identifier = '') {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

export default function UserAvatar({ name = '', username = '', size = 'md', className = '' }) {
  const displayName = name || username || 'U';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';
  const colorClass = getInitialColor(username || name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs font-semibold',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-14 h-14 text-lg font-bold',
    xl: 'w-20 h-20 text-2xl font-bold',
    '2xl': 'w-24 h-24 text-3xl font-bold'
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`rounded-full flex items-center justify-center select-none shadow-2xs font-serif ${selectedSize} ${colorClass} ${className}`}
      aria-label={displayName}
      title={displayName}
    >
      <span>{initial}</span>
    </div>
  );
}

export { UserAvatar };
