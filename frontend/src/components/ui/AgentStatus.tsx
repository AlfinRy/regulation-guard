import { AgentStatusProps } from '../../types';

export default function AgentStatus({ icon: Icon, name, label, status, output }: AgentStatusProps) {
  const statusLabel = {
    active: 'RUNNING',
    processing: 'PROCESSING',
    queued: 'QUEUED',
    complete: 'DONE',
  }[status];

  const statusBadgeColor = {
    active: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
    processing: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
    queued: 'bg-text-muted/10 text-text-tertiary border-text-muted/20',
    complete: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
  }[status];

  return (
    <div className={`p-4 border border-border-subtle bg-bg-surface-2 ${status === 'queued' ? 'opacity-40' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="status-dot" aria-label={`Status: ${statusLabel}`} />
          <Icon className="w-4 h-4 text-text-secondary" />
        </div>
        <span className={`badge ${statusBadgeColor}`}>
          {statusLabel}
        </span>
      </div>
      <div className="font-mono text-xs text-text-muted mb-1">{label}</div>
      <div className="text-sm font-medium text-text-primary">{name}</div>
      {output && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <code className="font-mono text-xs text-accent-cyan">{output}</code>
        </div>
      )}
    </div>
  );
}
