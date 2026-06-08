import { BookOpen, CheckCircle, FileText, Lock } from 'lucide-react';
import { AgentStatus } from '../ui';

const agents = [
  {
    icon: BookOpen,
    name: 'Policy Reader',
    label: 'AGENT_01',
    status: 'complete' as const,
    output: 'HANDOFF: STRUCTURED_CLAUSE_JSON',
  },
  {
    icon: FileText,
    name: 'Risk Analyzer',
    label: 'AGENT_02',
    status: 'active' as const,
    output: 'HANDOFF: GAP_PROBABILITY_MATRIX',
  },
  {
    icon: Lock,
    name: 'Legal Cross-Checker',
    label: 'AGENT_03',
    status: 'processing' as const,
    output: 'HANDOFF: CITATION_CERT',
  },
  {
    icon: CheckCircle,
    name: 'Compliance Reporter',
    label: 'AGENT_04',
    status: 'queued' as const,
    output: 'FINAL: IMMUTABLE_AUDIT_LOG',
  },
];

export default function PipelineSection() {
  return (
    <section id="pipeline">
      <div className="max-w-content mx-auto border-x border-border-subtle">
        <div className="grid lg:grid-cols-2 grid-cols-1">
          {/* Left: Description */}
          <div className="flex flex-col items-start gap-6 p-8 lg:p-12">
            <span className="font-mono text-xs text-text-muted tracking-wider uppercase">
              4-Agent Pipeline
            </span>
            <h2 className="text-heading text-balance">
              One document flows through four specialists.
            </h2>
            <p className="text-body-lg text-text-secondary text-balance">
              Each agent reads the previous agent's output, applies its own analysis, and hands off structured data to the next. Every decision is logged, every handoff is traceable.
            </p>
            <div className="mt-2 w-full">
              <div className="terminal-block">
                <div className="terminal-body">
                  <div className="space-y-1.5">
                    <div>
                      <span className="token-comment"># Agent handoff chain</span>
                    </div>
                    <div>
                      <span className="token-key">agent_01</span>
                      <span className="token-value"> → </span>
                      <span className="token-string">clause_extraction_result</span>
                    </div>
                    <div>
                      <span className="token-key">agent_02</span>
                      <span className="token-value"> → </span>
                      <span className="token-string">risk_analysis_result</span>
                    </div>
                    <div>
                      <span className="token-key">agent_03</span>
                      <span className="token-value"> → </span>
                      <span className="token-string">legal_crosscheck_result</span>
                    </div>
                    <div>
                      <span className="token-key">agent_04</span>
                      <span className="token-value"> → </span>
                      <span className="token-accent">final_report</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Agent cards grid */}
          <div className="p-4 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent) => (
                <AgentStatus key={agent.label} {...agent} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
