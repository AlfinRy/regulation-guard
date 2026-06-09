import type { ReactNode } from 'react';

interface CornerGlowProps {
  children: ReactNode;
  /** CSS color for the glow */
  color: string;
  /** Which corner gets the primary glow */
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Glow intensity 0-1, default 0.12 */
  opacity?: number;
  className?: string;
}

const positionClasses: Record<string, string> = {
  'top-left': 'top-0 left-0',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'bottom-right': 'bottom-0 right-0',
};

export default function CornerGlow({
  children,
  color,
  position,
  opacity = 0.12,
  className = '',
}: CornerGlowProps) {
  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div
        className={`absolute ${positionClasses[position]} w-[600px] h-[600px] pointer-events-none`}
        style={{
          background: `radial-gradient(circle at ${position.includes('left') ? '0%' : '100%'} ${position.includes('top') ? '0%' : '100%'}, ${color}, transparent 70%)`,
          opacity,
        }}
      />
      {children}
    </section>
  );
}
