import type { CSSProperties } from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  radius?: CSSProperties['borderRadius'];
  className?: string;
}

export default function Skeleton({ width = '100%', height = 16, radius, className = '' }: SkeletonProps) {
  return (
    <span
      className={`ui-skeleton${className ? ` ${className}` : ''}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
