import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { BookOpen, FileText, Lock, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { streamReviewEvents, getReviewResult } from '../lib/api';
import Logo from '../components/ui/Logo';
import type { SSEEvent, ReviewResult } from '../lib/api';

interface AgentStep {
  id: string;
  icon: typeof BookOpen;
  name: string;
  label: string;
  status: 'queued' | 'running' | 'complete' | 'error';
  progress: number;
}

interface ClauseItem {
  id: string;
  category: string;
  text: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

const AGENT_MAP: Record<string, { label: string; color: string }> = {
  AGENT_01: { label: 'Policy Reader', color: 'text-accent-blue' },
  AGENT_02: { label: 'Risk Analyzer', color: 'text-accent-cyan' },
  AGENT_03: { label: 'Legal Cross-Checker', color: 'text-accent-orange' },
  AGENT_04: { label: 'Compliance Reporter', color: 'text-accent-emerald' },
  SYSTEM: { label: 'System', color: 'text-text-tertiary' },
};

const AGENT_STEPS: AgentStep[] = [
  { id: 'AGENT_01', icon: BookOpen, name: 'Policy Reader', label: 'AGENT_01', status: 'queued', progress: 0 },
  { id: 'AGENT_02', icon: FileText, name: 'Risk Analyzer', label: 'AGENT_02', status: 'queued', progress: 0 },
  { id: 'AGENT_03', icon: Lock, name: 'Legal Cross-Checker', label: 'AGENT_03', status: 'queued', progress: 0 },
  { id: 'AGENT_04', icon: CheckCircle, name: 'Compliance Reporter', label: 'AGENT_04', status: 'queued', progress: 0 },
];

function getAgentProgress(events: SSEEvent[]): AgentStep[] {
  const steps = AGENT_STEPS.map(s => ({ ...s }));

  for (const event of events) {
    const agentIdx = steps.findIndex(s => s.id === event.agent);
    if (agentIdx === -1) continue;

    const step = steps[agentIdx];

    if (event.type === 'handoff') {
      // Current agent complete
      step.status = 'complete';
      step.progress = 100;
      // Next agent starts
      if (agentIdx + 1 < steps.length) {
        steps[agentIdx + 1].status = 'running';
        steps[agentIdx + 1].progress = 10;
      }
    } else if (event.type === 'complete' || event.type === 'error') {
      step.status = event.type === 'complete' ? 'complete' : 'error';
      step.progress = event.type === 'complete' ? 100 : step.progress;
    } else {
      // Regular message — mark agent as running
      if (step.status === 'queued') {
        step.status = 'running';
        step.progress = 10;
      }
      // Incremental progress
      if (step.status === 'running' && step.progress < 90) {
        step.progress = Math.min(90, step.progress + 15);
      }
    }
  }

  return steps;
}

function extractClausesFromEvents(events: SSEEvent[]): ClauseItem[] {
  const clauses: ClauseItem[] = [];

  for (const event of events) {
    if (event.agent === 'AGENT_01' && event.type === 'clause_extraction_result') {
      // Try to extract clause count from message
      const match = event.content.match(/(\d+)\s+clause/i);
      if (match) {
        const count = parseInt(match[1], 10);
        const categories = ['Data', 'Liability', 'Payment', 'IP', 'Termination', 'Subprocessor', 'Audit', 'Confidentiality'];
        const severities: ClauseItem['severity'][] = ['HIGH', 'MEDIUM', 'LOW'];

        // Generate placeholder clauses — real data comes from the final report
        for (let i = 0; i < count; i++) {
          clauses.push({
            id: `CL_${String(i + 1).padStart(3, '0')}`,
            category: categories[i % categories.length],
            text: `Clause ${i + 1} extracted. Details available in the final report.`,
            severity: severities[i % 3],
          });
        }
      }
    }
  }

  return clauses;
}

export default function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const feedRef = useRef<HTMLDivElement>(null);

  const state = location.state as { sessionId?: string; fileName?: string; regulations?: string[] } | null;
  const sessionId = state?.sessionId || '';
  const fileName = state?.fileName || 'document.pdf';
  const regulations = state?.regulations || [];

  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [agents, setAgents] = useState<AgentStep[]>(AGENT_STEPS);
  const [clauses, setClauses] = useState<ClauseItem[]>([]);
  const [allDone, setAllDone] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReviewResult | null>(null);

  // Subscribe to SSE stream
  useEffect(() => {
    if (!sessionId) {
      setError('No session ID. Start a review from the Upload page.');
      return;
    }

    let cancelled = false;

    async function subscribe() {
      try {
        for await (const event of streamReviewEvents(sessionId)) {
          if (cancelled) break;

          setEvents(prev => [...prev, event]);

          // Update agent progress
          setEvents(current => {
            setAgents(getAgentProgress(current));
            return current;
          });

          // Extract clauses
          setEvents(current => {
            setClauses(extractClausesFromEvents(current));
            return current;
          });

          if (event.type === 'complete') {
            setAllDone(true);

            // Fetch the final result
            try {
              const res = await getReviewResult(sessionId);
              setResult(res);
            } catch {
              // Result might not be ready yet
            }
          }

          if (event.type === 'error') {
            setError(event.content);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Stream connection failed.');
        }
      }
    }

    subscribe();

    return () => { cancelled = true; };
  }, [sessionId]);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events]);

  const overallProgress = Math.round(agents.reduce((sum, a) => sum + a.progress, 0) / agents.length);

  // If no session, show error state
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="max-w-md text-center p-8">
          <AlertTriangle className="w-10 h-10 text-accent-amber mx-auto mb-4" />
          <h2 className="text-subheading mb-2">No Active Review</h2>
          <p className="text-sm text-text-secondary mb-4">
            {error || 'Start a review from the Upload page to see live agent activity.'}
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-btn-primary text-bg-base hover:bg-btn-primary-hover rounded-md"
          >
            Go to Upload
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-bg-base/90 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-content mx-auto border-x border-border-subtle flex justify-between items-center px-6 h-14">
          <Link to="/" className="flex items-center text-text-primary font-semibold text-md">
            <Logo size={60} />
            RegulationGuard
          </Link>
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
              <span className={allDone ? 'text-accent-emerald' : 'text-text-tertiary'}>03</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-subheading">Live Review</h1>
                <p className="text-xs text-text-tertiary font-mono mt-1">
                  {fileName} · {regulations.length} regulation{regulations.length > 1 ? 's' : ''} · {sessionId.slice(0, 12)}
                </p>
              </div>
              {allDone && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate('/results', { state: { sessionId, fileName, regulations, result } })}
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
                        agent.status === 'error' ? 'text-accent-red' :
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
                      {agent.status === 'error' && (
                        <AlertTriangle className="w-3 h-3 text-accent-red" />
                      )}
                    </div>
                    <div className="h-1 bg-bg-surface-4 w-full">
                      <motion.div
                        className={`h-full ${
                          agent.status === 'complete' ? 'bg-accent-emerald' :
                          agent.status === 'error' ? 'bg-accent-red' :
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

          {/* Error banner */}
          {error && (
            <div className="border-b border-accent-red/30 bg-accent-red/5 px-8 py-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent-red flex-shrink-0" />
              <span className="text-sm text-accent-red">{error}</span>
            </div>
          )}

          {/* Main content: Band Feed + Clause List */}
          <div className="grid lg:grid-cols-5 grid-cols-1">
            {/* Band Agent Feed */}
            <div className="lg:col-span-3 border-r border-border-subtle">
              <div className="border-b border-border-subtle px-4 py-3 bg-bg-surface-2 flex items-center justify-between">
                <span className="font-mono text-xs text-text-muted">
                  BAND_ROOM — live agent feed
                </span>
                <span className="font-mono text-xs text-accent-cyan">
                  {events.length} messages
                </span>
              </div>
              <div
                ref={feedRef}
                className="h-[500px] overflow-y-auto p-4 space-y-2 font-mono text-code"
              >
                <AnimatePresence>
                  {events.map((event) => (
                    <motion.div
                      key={event.id || event.timestamp}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3 border border-border-subtle bg-bg-surface-2 ${
                        event.type === 'handoff' ? 'border-l-2 border-l-accent-amber' :
                        event.type === 'final_report' ? 'border-l-2 border-l-accent-emerald' :
                        event.type === 'error' ? 'border-l-2 border-l-accent-red' :
                        ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs ${
                          (AGENT_MAP[event.agent]?.color || 'text-text-tertiary')
                        }`}>
                          {event.agent}
                        </span>
                        <span className="text-xs text-text-muted">{event.timestamp}</span>
                        <span className="text-[10px] text-text-muted ml-auto">
                          {event.type}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {event.content}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!allDone && !error && events.length > 0 && (
                  <div className="flex items-center gap-2 p-3 text-text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                    <span className="text-xs">
                      {agents.find(a => a.status === 'running')?.label || 'Processing'}...
                    </span>
                  </div>
                )}

                {events.length === 0 && !error && (
                  <div className="flex items-center justify-center h-full text-text-muted">
                    <div className="text-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse inline-block mb-3" />
                      <p className="text-xs">Connecting to pipeline...</p>
                    </div>
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
                  EXTRACTED_CLAUSES — {clauses.length} found
                </span>
              </div>
              <div className="h-[500px] overflow-y-auto">
                <AnimatePresence>
                  {clauses.map((clause, i) => (
                    <motion.div
                      key={clause.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
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

                {clauses.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-text-muted text-xs font-mono">
                    Waiting for Agent 1 to extract clauses...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
