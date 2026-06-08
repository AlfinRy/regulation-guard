import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, BookOpen, FileText, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentStep {
  id: string;
  icon: typeof BookOpen;
  name: string;
  label: string;
  status: 'queued' | 'running' | 'complete';
  progress: number;
  messages: BandMessage[];
}

interface BandMessage {
  id: string;
  agent: string;
  type: string;
  content: string;
  timestamp: string;
}

const SAMPLE_CLAUSES = [
  { id: 'CL_001', category: 'Payment', text: 'Payment terms: Net 30 days from invoice receipt.', severity: 'LOW' },
  { id: 'CL_002', category: 'Data', text: 'Vendor shall retain customer data for a period of 24 months post-termination.', severity: 'HIGH' },
  { id: 'CL_003', category: 'Liability', text: 'Total liability capped at 1x annual service fee.', severity: 'HIGH' },
  { id: 'CL_004', category: 'IP', text: 'All intellectual property developed during the engagement belongs to the client.', severity: 'LOW' },
  { id: 'CL_005', category: 'Termination', text: 'Either party may terminate with 30 days written notice.', severity: 'MEDIUM' },
  { id: 'CL_006', category: 'Subprocessor', text: 'Vendor may engage subprocessors without prior written consent.', severity: 'HIGH' },
  { id: 'CL_007', category: 'Data', text: 'Data breach notification within 72 hours of discovery.', severity: 'LOW' },
  { id: 'CL_008', category: 'Audit', text: 'Client reserves the right to audit vendor compliance annually.', severity: 'LOW' },
];

const BAND_MESSAGES: BandMessage[] = [
  { id: '1', agent: 'AGENT_01', type: 'clause_extraction_result', content: 'Initializing document parser. Detected 8 major clauses across 6 categories.', timestamp: '00:01' },
  { id: '2', agent: 'AGENT_01', type: 'clause_extraction_result', content: 'Extraction complete. Structured JSON with 8 clauses, metadata fingerprinted.', timestamp: '00:14' },
  { id: '3', agent: 'AGENT_01', type: 'handoff', content: 'HANDOFF → AGENT_02: Forwarding clause_extraction_result (8 items, 0 parse errors).', timestamp: '00:15' },
  { id: '4', agent: 'AGENT_02', type: 'risk_analysis_result', content: 'Risk analysis started. Running taxonomy match against 450+ risk patterns.', timestamp: '00:16' },
  { id: '5', agent: 'AGENT_02', type: 'risk_analysis_result', content: 'CL_002 flagged: Data retention exceeds regulatory maximum. Severity: HIGH.', timestamp: '00:28' },
  { id: '6', agent: 'AGENT_02', type: 'risk_analysis_result', content: 'CL_003 flagged: Liability cap insufficient for data breach scenarios per OJK.', timestamp: '00:31' },
  { id: '7', agent: 'AGENT_02', type: 'risk_analysis_result', content: 'CL_006 flagged: Subprocessor consent clause absent. GDPR Art. 28(2) risk.', timestamp: '00:35' },
  { id: '8', agent: 'AGENT_02', type: 'handoff', content: 'HANDOFF → AGENT_03: Forwarding risk_analysis_result (3 HIGH, 1 MEDIUM, 4 LOW).', timestamp: '00:36' },
  { id: '9', agent: 'AGENT_03', type: 'legal_crosscheck_result', content: 'Cross-referencing CL_002, CL_003, CL_006 against GDPR, OJK POJK 12/2018.', timestamp: '00:37' },
  { id: '10', agent: 'AGENT_03', type: 'legal_crosscheck_result', content: 'CL_002: GDPR Art. 5(1)(e) violation confirmed. No deletion timeline specified.', timestamp: '00:52' },
  { id: '11', agent: 'AGENT_03', type: 'legal_crosscheck_result', content: 'CL_003: OJK POJK 38/2020 — liability floor for data incidents exceeds cap.', timestamp: '00:58' },
  { id: '12', agent: 'AGENT_03', type: 'legal_crosscheck_result', content: 'CL_006: GDPR Art. 28(2) — prior written consent for subprocessors required.', timestamp: '01:04' },
  { id: '13', agent: 'AGENT_03', type: 'handoff', content: 'HANDOFF → AGENT_04: Forwarding legal_crosscheck_result (3 confirmed violations).', timestamp: '01:05' },
  { id: '14', agent: 'AGENT_04', type: 'final_report', content: 'Compliance report generation started. Assembling executive summary.', timestamp: '01:06' },
  { id: '15', agent: 'AGENT_04', type: 'final_report', content: 'Risk matrix constructed. Clause-by-clause analysis attached.', timestamp: '01:18' },
  { id: '16', agent: 'AGENT_04', type: 'final_report', content: 'Final report ready. 3 critical, 1 medium, 4 low findings. Recommendation: DO NOT SIGN without amendments.', timestamp: '01:24' },
];

export default function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const feedRef = useRef<HTMLDivElement>(null);

  const state = location.state as { fileName?: string; regulations?: string[] } | null;
  const fileName = state?.fileName || 'document.pdf';
  const regulations = state?.regulations || ['gdpr', 'ojk'];

  const [agents, setAgents] = useState<AgentStep[]>([
    { id: 'agent_01', icon: BookOpen, name: 'Policy Reader', label: 'AGENT_01', status: 'queued', progress: 0, messages: [] },
    { id: 'agent_02', icon: FileText, name: 'Risk Analyzer', label: 'AGENT_02', status: 'queued', progress: 0, messages: [] },
    { id: 'agent_03', icon: Lock, name: 'Legal Cross-Checker', label: 'AGENT_03', status: 'queued', progress: 0, messages: [] },
    { id: 'agent_04', icon: CheckCircle, name: 'Compliance Reporter', label: 'AGENT_04', status: 'queued', progress: 0, messages: [] },
  ]);

  const [visibleMessages, setVisibleMessages] = useState<BandMessage[]>([]);
  const [visibleClauses, setVisibleClauses] = useState<typeof SAMPLE_CLAUSES>([]);
  const [currentAgentIdx, setCurrentAgentIdx] = useState(0);
  const [allDone, setAllDone] = useState(false);

  // Simulate the agent pipeline
  useEffect(() => {
    let msgIdx = 0;
    const agentBoundaries = [3, 8, 13, 16]; // index in BAND_MESSAGES where each agent completes

    const interval = setInterval(() => {
      if (msgIdx >= BAND_MESSAGES.length) {
        clearInterval(interval);
        setAllDone(true);
        return;
      }

      const msg = BAND_MESSAGES[msgIdx];

      // Determine which agent is active
      let agentIdx = 0;
      if (msgIdx <= 3) agentIdx = 0;
      else if (msgIdx <= 8) agentIdx = 1;
      else if (msgIdx <= 13) agentIdx = 2;
      else agentIdx = 3;

      setCurrentAgentIdx(agentIdx);

      setVisibleMessages(prev => [...prev, msg]);

      // Update agent statuses
      setAgents(prev => prev.map((a, i) => {
        if (i < agentIdx) return { ...a, status: 'complete', progress: 100 };
        if (i === agentIdx) {
          const boundary = agentBoundaries[i] || BAND_MESSAGES.length;
          const start = i === 0 ? 0 : agentBoundaries[i - 1];
          const progress = Math.min(100, Math.round(((msgIdx - start) / (boundary - start)) * 100));
          return { ...a, status: 'running', progress, messages: [...a.messages, msg] };
        }
        return a;
      }));

      // Reveal clauses after agent 1 starts
      if (msgIdx === 1) {
        // Reveal clauses one by one
        SAMPLE_CLAUSES.forEach((clause, ci) => {
          setTimeout(() => {
            setVisibleClauses(prev => [...prev, clause]);
          }, ci * 200);
        });
      }

      msgIdx++;
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  const overallProgress = Math.round(
    agents.reduce((sum, a) => sum + a.progress, 0) / agents.length
  );

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-bg-base/90 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-content mx-auto border-x border-border-subtle flex justify-between items-center px-6 h-14">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
            <Shield className="w-4 h-4 text-accent-blue" />
            RegulationGuard
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs text-text-muted">
              REVIEW IN PROGRESS
            </div>
            <div className="font-mono text-xs text-accent-cyan">
              {overallProgress}%
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-14">
        <div className="max-w-content mx-auto border-x border-border-subtle">
          {/* Header */}
          <div className="border-b border-border-subtle px-8 py-4">
            <div className="flex items-center gap-3 text-text-muted font-mono text-xs mb-2">
              <span className="text-text-secondary">01</span>
              <span className="h-px bg-border-subtle w-8" />
              <span className="text-text-secondary">02</span>
              <span className="h-px flex-1 bg-border-subtle" />
              <span className="text-text-tertiary">03</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-subheading">Live Review</h1>
                <p className="text-xs text-text-tertiary font-mono mt-1">{fileName} · {regulations.length} regulation{regulations.length > 1 ? 's' : ''}</p>
              </div>
              {allDone && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate('/results', { state: { fileName, regulations } })}
                  className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-btn-primary text-bg-base hover:bg-btn-primary-hover transition-colors rounded-md"
                >
                  View Results
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Agent progress bar */}
          <div className="border-b border-border-subtle px-8 py-4">
            <div className="flex items-center gap-3">
              {agents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <div key={agent.id} className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-3.5 h-3.5 ${
                        agent.status === 'complete' ? 'text-accent-emerald' :
                        agent.status === 'running' ? 'text-accent-cyan' :
                        'text-text-muted'
                      }`} />
                      <span className={`font-mono text-xs ${
                        agent.status === 'complete' ? 'text-text-secondary' :
                        agent.status === 'running' ? 'text-text-primary' :
                        'text-text-muted'
                      }`}>
                        {agent.label}
                      </span>
                      {agent.status === 'running' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                      )}
                      {agent.status === 'complete' && (
                        <CheckCircle className="w-3 h-3 text-accent-emerald" />
                      )}
                    </div>
                    <div className="h-1 bg-bg-surface-4 w-full">
                      <motion.div
                        className={`h-full ${
                          agent.status === 'complete' ? 'bg-accent-emerald' :
                          agent.status === 'running' ? 'bg-accent-cyan' :
                          'bg-transparent'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${agent.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main content: Band Feed + Clause List */}
          <div className="grid lg:grid-cols-5 grid-cols-1">
            {/* Band Agent Feed */}
            <div className="lg:col-span-3 border-r border-border-subtle">
              <div className="border-b border-border-subtle px-4 py-3 bg-bg-surface-2 flex items-center justify-between">
                <span className="font-mono text-xs text-text-muted">
                  BAND_ROOM — live agent feed
                </span>
                <span className="font-mono text-xs text-accent-cyan">
                  {visibleMessages.length} messages
                </span>
              </div>
              <div
                ref={feedRef}
                className="h-[500px] overflow-y-auto p-4 space-y-2 font-mono text-code"
              >
                <AnimatePresence>
                  {visibleMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3 border border-border-subtle bg-bg-surface-2 ${
                        msg.type === 'handoff' ? 'border-l-2 border-l-accent-amber' :
                        msg.type === 'final_report' ? 'border-l-2 border-l-accent-emerald' :
                        ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs ${
                          msg.agent === 'AGENT_01' ? 'text-accent-blue' :
                          msg.agent === 'AGENT_02' ? 'text-accent-cyan' :
                          msg.agent === 'AGENT_03' ? 'text-accent-orange' :
                          'text-accent-emerald'
                        }`}>
                          {msg.agent}
                        </span>
                        <span className="text-xs text-text-muted">{msg.timestamp}</span>
                        <span className="text-[10px] text-text-muted ml-auto">
                          {msg.type}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {msg.content}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!allDone && (
                  <div className="flex items-center gap-2 p-3 text-text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                    <span className="text-xs">
                      {agents[currentAgentIdx]?.label} processing...
                    </span>
                  </div>
                )}

                {allDone && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 border border-accent-emerald/30 bg-accent-emerald/5"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent-emerald" />
                      <span className="text-xs text-accent-emerald font-medium">
                        Pipeline complete. All 4 agents finished. Report ready.
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right: Clause List */}
            <div className="lg:col-span-2">
              <div className="border-b border-border-subtle px-4 py-3 bg-bg-surface-2">
                <span className="font-mono text-xs text-text-muted">
                  EXTRACTED_CLAUSES — {visibleClauses.length} of {SAMPLE_CLAUSES.length}
                </span>
              </div>
              <div className="h-[500px] overflow-y-auto">
                <AnimatePresence>
                  {visibleClauses.map((clause) => (
                    <motion.div
                      key={clause.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-border-subtle p-4 hover:bg-bg-surface-2/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-accent-blue">{clause.id}</span>
                        <span className={`badge text-[10px] ${
                          clause.severity === 'HIGH'
                            ? 'bg-accent-red/10 text-accent-red border-accent-red/20'
                            : clause.severity === 'MEDIUM'
                              ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20'
                              : 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20'
                        }`}>
                          {clause.severity}
                        </span>
                      </div>
                      <div className="text-xs text-text-tertiary font-mono mb-1">{clause.category}</div>
                      <p className="text-xs text-text-secondary leading-relaxed">{clause.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
