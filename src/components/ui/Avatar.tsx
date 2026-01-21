/**
 * Avatar component - Displays circular avatars with fallback to initials
 * Supports preset SVG avatars and base64 photo uploads
 */

import { useState } from 'react';

interface AvatarProps {
  src: string; // 'avatar-robot-1.svg' or 'data:image/jpeg;base64,...'
  alt: string; // Player name
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
};

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', className = '' }) => {
  const [error, setError] = useState(false);

  // If src is undefined or empty, show initials fallback
  if (!src || error) {
    const initials = alt
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ${className}`}
      >
        {initials}
      </div>
    );
  }

  // Resolve path based on whether it's a base64 data URL or preset filename
  const resolvedSrc = src.startsWith('data:') ? src : `/avatars/${src}`;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      onError={() => setError(true)}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
    />
  );
};
