import { GrainGradient } from '@paper-design/shaders-react';
import type { ReactNode } from 'react';

interface GrainSectionProps {
  children: ReactNode;
}

export default function GrainSection({ children }: GrainSectionProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GrainGradient
          colorBack="#0a0a0a"
          colors={['#1a2a4a', '#0d1b2e', '#1a1a2e', '#0a1628']}
          shape="corners"
          softness={0.6}
          intensity={0.4}
          noise={0.2}
          speed={0.5}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
