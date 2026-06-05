import { RiskEntryProps } from '../../types';

export default function RiskEntry({ id, regulation, status, riskScore, confidence }: RiskEntryProps) {
  const statusStyles = {
    COMPLIANT: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
    CRITICAL_GAP: 'bg-accent-red/10 text-accent-red border-accent-red/20',
    WARNING: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
  }[status];

  const scoreColor = {
    COMPLIANT: 'text-text-secondary',
    CRITICAL_GAP: 'text-accent-red',
    WARNING: 'text-accent-amber',
  }[status];

  return (
    <tr className="border-b border-border-subtle/50 hover:bg-bg-surface-2/50 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-accent-blue">{id}</td>
      <td className="px-4 py-3 text-sm text-text-secondary">{regulation}</td>
      <td className="px-4 py-3">
        <span className={`badge ${statusStyles}`}>
          {status}
        </span>
      </td>
      <td className={`px-4 py-3 font-mono text-xs ${scoreColor}`}>{riskScore}</td>
      <td className="px-4 py-3 font-mono text-xs text-text-secondary">{confidence}</td>
    </tr>
  );
}
