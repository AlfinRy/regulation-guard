import { LucideIcon } from 'lucide-react';

export interface AgentStatusProps {
  icon: LucideIcon;
  name: string;
  label: string;
  status: 'active' | 'processing' | 'queued' | 'complete';
  progress?: number;
  output?: string;
}

export interface RiskEntryProps {
  id: string;
  regulation: string;
  status: 'COMPLIANT' | 'CRITICAL_GAP' | 'WARNING';
  riskScore: string;
  confidence: string;
}

export interface TimelineEntryProps {
  txId: string;
  time: string;
  title: string;
  description: string;
  status: 'complete' | 'active';
}
