/**
 * RegulationGuard logo component.
 *
 * Uses the custom logo-rg.png asset. Falls back to a Shield icon
 * only if the image fails to load.
 */

import { useState } from 'react';
import { Shield } from 'lucide-react';
import logoSrc from '@assets/logo-rg.png';

interface LogoProps {
  /** Height of the logo in px. Width is auto-scaled. */
  size?: number;
  className?: string;
}

export default function Logo({ size = 24, className = '' }: LogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <Shield className={className} style={{ width: size, height: size }} />;
  }

  return (
    <img
      src={logoSrc}
      alt="RegulationGuard"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
