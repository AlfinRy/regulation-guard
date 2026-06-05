import { TimelineEntryProps } from '../../types';

export default function TimelineEntry({ txId, time, title, description, status }: TimelineEntryProps) {
  return (
    <div className="flex gap-4 relative">
      <div className="flex flex-col items-center">
        <span className="status-dot status-active" aria-label={`Status: ${status}`} />
        <div className="w-px flex-1 bg-border-subtle" />
      </div>
      <div className="pb-8 flex-1">
        <div className="flex items-center gap-3 mb-1">
          <code className="font-mono text-xs text-accent-cyan">{txId}</code>
          <span className="font-mono text-xs text-text-muted">{time}</span>
        </div>
        <h4 className="text-sm font-medium text-text-primary mb-1">{title}</h4>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
