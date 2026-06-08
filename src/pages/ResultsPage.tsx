import { useLocation } from 'react-router-dom';
import { Shield, Download, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClauseFinding {
  id: string;
  clauseRef: string;
  category: string;
  text: string;
  severity: 'CRITICAL' | 'MEDIUM' | 'LOW';
  regulation: string;
  article: string;
  status: 'VIOLATION' | 'WARNING' | 'COMPLIANT';
  reasoning: string;
  confidence: number;
  humanReview: boolean;
}

const FINDINGS: ClauseFinding[] = [
  {
    id: '1',
    clauseRef: 'CL_002',
    category: 'Data Retention',
    text: 'Vendor shall retain customer data for a period of 24 months post-termination.',
    severity: 'CRITICAL',
    regulation: 'GDPR',
    article: 'Art. 5(1)(e)',
    status: 'VIOLATION',
    reasoning: 'No deletion timeline specified. GDPR requires data retention to be limited to what is necessary for the stated purpose. 24 months post-termination retention without justification violates the storage limitation principle.',
    confidence: 96,
    humanReview: true,
  },
  {
    id: '2',
    clauseRef: 'CL_003',
    category: 'Liability',
    text: 'Total liability capped at 1x annual service fee.',
    severity: 'CRITICAL',
    regulation: 'OJK POJK 12/2018',
    article: 'Art. 23',
    status: 'VIOLATION',
    reasoning: 'Liability cap of 1x annual fee is insufficient for data breach scenarios. OJK regulations require adequate financial provisions for data incident compensation, which typically exceed nominal annual fees.',
    confidence: 94,
    humanReview: true,
  },
  {
    id: '3',
    clauseRef: 'CL_006',
    category: 'Subprocessor',
    text: 'Vendor may engage subprocessors without prior written consent.',
    severity: 'CRITICAL',
    regulation: 'GDPR',
    article: 'Art. 28(2)',
    status: 'VIOLATION',
    reasoning: 'GDPR requires prior written authorization before engaging subprocessors. Current clause grants blanket permission, which is a direct violation of the data processing agreement requirements.',
    confidence: 97,
    humanReview: true,
  },
  {
    id: '4',
    clauseRef: 'CL_005',
    category: 'Termination',
    text: 'Either party may terminate with 30 days written notice.',
    severity: 'MEDIUM',
    regulation: 'OJK POJK 38/2020',
    article: 'Art. 15',
    status: 'WARNING',
    reasoning: '30-day termination notice may be insufficient for orderly data migration and deletion. Consider extending to 60 days with explicit data handling provisions for the transition period.',
    confidence: 82,
    humanReview: false,
  },
  {
    id: '5',
    clauseRef: 'CL_001',
    category: 'Payment',
    text: 'Payment terms: Net 30 days from invoice receipt.',
    severity: 'LOW',
    regulation: 'General',
    article: 'N/A',
    status: 'COMPLIANT',
    reasoning: 'Standard payment terms. No regulatory concerns identified.',
    confidence: 99,
    humanReview: false,
  },
  {
    id: '6',
    clauseRef: 'CL_004',
    category: 'IP',
    text: 'All intellectual property developed during the engagement belongs to the client.',
    severity: 'LOW',
    regulation: 'General',
    article: 'N/A',
    status: 'COMPLIANT',
    reasoning: 'Standard IP assignment clause favorable to client. No regulatory concerns.',
    confidence: 98,
    humanReview: false,
  },
  {
    id: '7',
    clauseRef: 'CL_007',
    category: 'Data Breach',
    text: 'Data breach notification within 72 hours of discovery.',
    severity: 'LOW',
    regulation: 'GDPR',
    article: 'Art. 33',
    status: 'COMPLIANT',
    reasoning: '72-hour notification window aligns with GDPR Article 33 requirements. Properly scoped.',
    confidence: 99,
    humanReview: false,
  },
  {
    id: '8',
    clauseRef: 'CL_008',
    category: 'Audit',
    text: 'Client reserves the right to audit vendor compliance annually.',
    severity: 'LOW',
    regulation: 'ISO 27001',
    article: 'A.18.2.1',
    status: 'COMPLIANT',
    reasoning: 'Annual audit right is consistent with ISO 27001 A.18.2.1 requirements. Properly documented.',
    confidence: 97,
    humanReview: false,
  },
];

const REGULATION_MAP: Record<string, string> = {
  gdpr: 'GDPR',
  ojk: 'OJK POJK',
  pdpa: 'PDPA',
  iso27001: 'ISO 27001',
};

export default function ResultsPage() {
  const location = useLocation();
  const state = location.state as { fileName?: string; regulations?: string[] } | null;
  const fileName = state?.fileName || 'document.pdf';
  const regulations = state?.regulations || ['gdpr', 'ojk'];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'MEDIUM' | 'LOW'>('ALL');

  const critical = FINDINGS.filter(f => f.severity === 'CRITICAL').length;
  const medium = FINDINGS.filter(f => f.severity === 'MEDIUM').length;
  const low = FINDINGS.filter(f => f.severity === 'LOW').length;

  const filtered = filterSeverity === 'ALL'
    ? FINDINGS
    : FINDINGS.filter(f => f.severity === filterSeverity);

  const regLabels = regulations.map((r: string) => REGULATION_MAP[r] || r.toUpperCase()).join(', ');

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-bg-base/90 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-content mx-auto border-x border-border-subtle flex justify-between items-center px-6 h-14">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
            <Shield className="w-4 h-4 text-accent-blue" />
            RegulationGuard
          </div>
          <div className="font-mono text-xs text-accent-emerald">
            REVIEW COMPLETE
          </div>
        </div>
      </nav>

      <main className="pt-14">
        <div className="max-w-content mx-auto border-x border-border-subtle">
          {/* Header */}
          <div className="border-b border-border-subtle px-8 py-6">
            <div className="flex items-center gap-3 text-text-muted font-mono text-xs mb-3">
              <span className="text-text-secondary">01</span>
              <span className="h-px bg-border-subtle w-8" />
              <span className="text-text-secondary">02</span>
              <span className="h-px bg-border-subtle w-8" />
              <span className="text-text-secondary">03</span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-heading">Compliance Report</h1>
                <p className="text-xs text-text-tertiary font-mono mt-2">
                  {fileName} · {regLabels} · Generated {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 bg-btn-primary text-bg-base hover:bg-btn-primary-hover transition-colors rounded-md">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors rounded-md">
                  <FileText className="w-4 h-4" />
                  Markdown
                </button>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="border-b border-border-subtle">
            <div className="border-b border-border-subtle px-4 py-3 bg-bg-surface-2">
              <span className="font-mono text-xs text-text-muted">EXECUTIVE_SUMMARY</span>
            </div>
            <div className="p-8">
              <div className="grid sm:grid-cols-4 grid-cols-2 gap-4 mb-6">
                <div className="border border-border-subtle p-4">
                  <div className="font-mono text-xs text-text-muted mb-2">OVERALL_RISK</div>
                  <div className="text-2xl font-semibold text-accent-red">HIGH</div>
                </div>
                <div className="border border-border-subtle p-4">
                  <div className="font-mono text-xs text-text-muted mb-2">CRITICAL</div>
                  <div className="text-2xl font-semibold text-accent-red">{critical}</div>
                  <div className="font-mono text-[10px] text-text-muted">VIOLATIONS</div>
                </div>
                <div className="border border-border-subtle p-4">
                  <div className="font-mono text-xs text-text-muted mb-2">MEDIUM</div>
                  <div className="text-2xl font-semibold text-accent-amber">{medium}</div>
                  <div className="font-mono text-[10px] text-text-muted">WARNINGS</div>
                </div>
                <div className="border border-border-subtle p-4">
                  <div className="font-mono text-xs text-text-muted mb-2">PASSING</div>
                  <div className="text-2xl font-semibold text-accent-emerald">{low}</div>
                  <div className="font-mono text-[10px] text-text-muted">CLAUSES</div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="border border-accent-red/30 bg-accent-red/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-accent-red" />
                  <span className="text-sm font-medium text-accent-red">RECOMMENDATION</span>
                </div>
                <p className="text-sm text-text-secondary">
                  Do not sign without amendments to CL_002 (Data Retention), CL_003 (Liability Cap), and CL_006 (Subprocessor Consent). These clauses contain confirmed regulatory violations.
                </p>
              </div>

              {/* Human escalation */}
              <div className="border border-accent-amber/30 bg-accent-amber/5 p-4 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-accent-amber" />
                  <span className="text-sm font-medium text-accent-amber">HUMAN_REVIEW_REQUIRED</span>
                </div>
                <p className="text-sm text-text-secondary">
                  3 clauses flagged for human legal counsel review. Confidence levels are high but legal implications require professional sign-off.
                </p>
              </div>
            </div>
          </div>

          {/* Risk Heat Map */}
          <div className="border-b border-border-subtle">
            <div className="border-b border-border-subtle px-4 py-3 bg-bg-surface-2 flex items-center justify-between">
              <span className="font-mono text-xs text-text-muted">
                RISK_MATRIX — {FINDINGS.length} clauses evaluated
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-subtle bg-bg-surface-3">
                    <th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">CLAUSE</th>
                    <th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">CATEGORY</th>
                    <th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">SEVERITY</th>
                    <th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">REGULATION</th>
                    <th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">STATUS</th>
                    <th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">CONF</th>
                    <th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">ESCALATE</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-code">
                  {FINDINGS.map(f => (
                    <tr key={f.id} className="border-b border-border-subtle/50 hover:bg-bg-surface-2/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-accent-blue">{f.clauseRef}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{f.category}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[10px] ${
                          f.severity === 'CRITICAL' ? 'bg-accent-red/10 text-accent-red border-accent-red/20' :
                          f.severity === 'MEDIUM' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' :
                          'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20'
                        }`}>
                          {f.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-tertiary">{f.regulation} {f.article}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[10px] ${
                          f.status === 'VIOLATION' ? 'bg-accent-red/10 text-accent-red border-accent-red/20' :
                          f.status === 'WARNING' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' :
                          'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary">{f.confidence}%</td>
                      <td className="px-4 py-3">
                        {f.humanReview ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-accent-amber" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 text-accent-emerald" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Clause Analysis */}
          <div className="border-b border-border-subtle">
            <div className="border-b border-border-subtle px-4 py-3 bg-bg-surface-2 flex items-center justify-between">
              <span className="font-mono text-xs text-text-muted">
                CLAUSE_ANALYSIS — detailed findings
              </span>
              <div className="flex gap-1">
                {(['ALL', 'CRITICAL', 'MEDIUM', 'LOW'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2.5 py-1 font-mono text-[10px] transition-colors ${
                      filterSeverity === sev
                        ? 'bg-bg-surface-3 text-text-primary border border-border-subtle'
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <AnimatePresence>
                {filtered.map(finding => (
                  <motion.div
                    key={finding.id}
                    initial={false}
                    className="border-b border-border-subtle"
                  >
                    <button
                      onClick={() => setExpandedId(expandedId === finding.id ? null : finding.id)}
                      className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-bg-surface-2/30 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        finding.severity === 'CRITICAL' ? 'bg-accent-red' :
                        finding.severity === 'MEDIUM' ? 'bg-accent-amber' :
                        'bg-accent-emerald'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs text-accent-blue">{finding.clauseRef}</span>
                          <span className="font-mono text-xs text-text-muted">{finding.category}</span>
                          <span className={`badge text-[10px] ml-auto ${
                            finding.severity === 'CRITICAL' ? 'bg-accent-red/10 text-accent-red border-accent-red/20' :
                            finding.severity === 'MEDIUM' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' :
                            'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20'
                          }`}>
                            {finding.severity}
                          </span>
                          {finding.humanReview && (
                            <AlertTriangle className="w-3.5 h-3.5 text-accent-amber flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate">{finding.text}</p>
                      </div>
                      {expandedId === finding.id ? (
                        <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedId === finding.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 pt-1">
                            <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 mb-4">
                              <div>
                                <div className="font-mono text-[10px] text-text-muted mb-1">CLAUSE_TEXT</div>
                                <p className="text-sm text-text-secondary leading-relaxed">{finding.text}</p>
                              </div>
                              <div>
                                <div className="font-mono text-[10px] text-text-muted mb-1">CITATION</div>
                                <p className="text-sm text-text-secondary">
                                  <span className="text-accent-blue">{finding.regulation}</span>
                                  {' '}<span className="text-text-tertiary">{finding.article}</span>
                                </p>
                                <div className="font-mono text-[10px] text-text-muted mt-2">
                                  CONFIDENCE: <span className="text-text-secondary">{finding.confidence}%</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="font-mono text-[10px] text-text-muted mb-1">REASONING</div>
                              <p className="text-sm text-text-secondary leading-relaxed">{finding.reasoning}</p>
                            </div>
                            {finding.humanReview && (
                              <div className="mt-3 flex items-center gap-2 text-accent-amber">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="font-mono text-xs">FLAGGED FOR HUMAN REVIEW</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Regulatory References */}
          <div className="border-b border-border-subtle">
            <div className="border-b border-border-subtle px-4 py-3 bg-bg-surface-2">
              <span className="font-mono text-xs text-text-muted">REGULATORY_REFERENCES</span>
            </div>
            <div className="p-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { reg: 'GDPR', articles: ['Art. 5(1)(e) — Storage Limitation', 'Art. 28(2) — Processor Authorization', 'Art. 33 — Breach Notification'] },
                  { reg: 'OJK POJK', articles: ['POJK 12/2018 Art. 23 — Liability', 'POJK 38/2020 Art. 15 — Termination'] },
                ].map(ref => (
                  <div key={ref.reg} className="border border-border-subtle p-4">
                    <div className="badge bg-accent-blue/10 text-accent-blue border-accent-blue/20 mb-3">
                      {ref.reg}
                    </div>
                    <ul className="space-y-2">
                      {ref.articles.map((art, i) => (
                        <li key={i} className="text-xs text-text-secondary font-mono">{art}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="font-mono text-xs text-text-muted">
              Audit trail TXID: TXID_9885_CERT · 4/4 agents completed · Immutable
            </div>
            <div className="font-mono text-xs text-text-tertiary">
              RegulationGuard v1.0
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
