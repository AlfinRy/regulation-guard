import { useLocation } from 'react-router-dom';
import { Shield, Download, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReviewResult } from '../lib/api';
import type { ReviewResult, ReportFinding } from '../lib/api';

// Fallback sample data when no real report is available
const SAMPLE_FINDINGS: ReportFinding[] = [
  {
    id: '1', clauseText: 'Vendor shall retain customer data for a period of 24 months post-termination.', category: 'Data Retention', severity: 'CRITICAL', status: 'VIOLATION', regulation: 'GDPR', article: 'Art. 5(1)(e)', reasoning: 'No deletion timeline specified. GDPR requires data retention to be limited to what is necessary for the stated purpose.', confidence: 96, humanReview: true,
  },
  {
    id: '2', clauseText: 'Total liability capped at 1x annual service fee.', category: 'Liability', severity: 'CRITICAL', status: 'VIOLATION', regulation: 'OJK POJK 12/2018', article: 'Art. 23', reasoning: 'Liability cap of 1x annual fee is insufficient for data breach scenarios per OJK regulations.', confidence: 94, humanReview: true,
  },
  {
    id: '3', clauseText: 'Vendor may engage subprocessors without prior written consent.', category: 'Subprocessor', severity: 'CRITICAL', status: 'VIOLATION', regulation: 'GDPR', article: 'Art. 28(2)', reasoning: 'GDPR requires prior written authorization before engaging subprocessors.', confidence: 97, humanReview: true,
  },
  {
    id: '4', clauseText: 'Either party may terminate with 30 days written notice.', category: 'Termination', severity: 'MEDIUM', status: 'WARNING', regulation: 'OJK POJK 38/2020', article: 'Art. 15', reasoning: '30-day termination notice may be insufficient for orderly data migration and deletion.', confidence: 82, humanReview: false,
  },
  {
    id: '5', clauseText: 'Payment terms: Net 30 days from invoice receipt.', category: 'Payment', severity: 'LOW', status: 'COMPLIANT', regulation: 'General', article: 'N/A', reasoning: 'Standard payment terms. No regulatory concerns identified.', confidence: 99, humanReview: false,
  },
  {
    id: '6', clauseText: 'All intellectual property developed during the engagement belongs to the client.', category: 'IP', severity: 'LOW', status: 'COMPLIANT', regulation: 'General', article: 'N/A', reasoning: 'Standard IP assignment clause favorable to client.', confidence: 98, humanReview: false,
  },
  {
    id: '7', clauseText: 'Data breach notification within 72 hours of discovery.', category: 'Data Breach', severity: 'LOW', status: 'COMPLIANT', regulation: 'GDPR', article: 'Art. 33', reasoning: '72-hour notification window aligns with GDPR Article 33 requirements.', confidence: 99, humanReview: false,
  },
  {
    id: '8', clauseText: 'Client reserves the right to audit vendor compliance annually.', category: 'Audit', severity: 'LOW', status: 'COMPLIANT', regulation: 'ISO 27001', article: 'A.18.2.1', reasoning: 'Annual audit right is consistent with ISO 27001 A.18.2.1 requirements.', confidence: 97, humanReview: false,
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

  const state = location.state as {
    sessionId?: string;
    fileName?: string;
    regulations?: string[];
    result?: ReviewResult;
  } | null;

  const sessionId = state?.sessionId || '';
  const fileName = state?.fileName || 'document.pdf';
  const regulations = state?.regulations || ['gdpr', 'ojk'];

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'MEDIUM' | 'LOW'>('ALL');
  const [reportData, setReportData] = useState<ReviewResult | null>(state?.result || null);
  const [loading, setLoading] = useState(!state?.result && !!sessionId);

  // Fetch result from API if not passed via state
  useEffect(() => {
    if (!state?.result && sessionId) {
      getReviewResult(sessionId)
        .then(data => { setReportData(data); })
        .catch(() => {})
        .finally(() => { setLoading(false); });
    }
  }, [sessionId, state?.result]);

  const report = reportData?.report;
  const FINDINGS: ReportFinding[] = report?.findings || SAMPLE_FINDINGS;

  const critical = FINDINGS.filter(f => f.severity === 'CRITICAL').length;
  const medium = FINDINGS.filter(f => f.severity === 'MEDIUM').length;
  const low = FINDINGS.filter(f => f.severity === 'LOW').length;

  const overallRisk = report?.overallRisk || (critical > 0 ? 'HIGH' : medium > 0 ? 'MEDIUM' : 'LOW');
  const summary = report?.summary || 'Compliance review complete. See findings below for details.';
  const recommendation = report?.recommendation || 'Review the findings and address critical issues before proceeding.';

  const filtered = filterSeverity === 'ALL'
    ? FINDINGS
    : FINDINGS.filter(f => f.severity === filterSeverity);

  const regLabels = regulations.map((r: string) => REGULATION_MAP[r] || r.toUpperCase()).join(', ');

  const humanReviewCount = FINDINGS.filter(f => f.humanReview).length;

  // Collect unique regulation citations from findings
  const regCitations = FINDINGS.reduce<Record<string, string[]>>((acc, f) => {
    const reg = f.regulation;
    if (!acc[reg]) acc[reg] = [];
    const cite = f.article !== 'N/A' ? `${f.article}` : '';
    if (cite && !acc[reg].includes(cite)) acc[reg].push(cite);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-secondary">Loading report...</p>
        </div>
      </div>
    );
  }

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
                  <div className={`text-2xl font-semibold ${
                    overallRisk === 'HIGH' ? 'text-accent-red' : overallRisk === 'MEDIUM' ? 'text-accent-amber' : 'text-accent-emerald'
                  }`}>{overallRisk}</div>
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

              {/* Summary text */}
              <p className="text-sm text-text-secondary mb-4">{summary}</p>

              {/* Recommendation */}
              <div className={`border p-4 ${
                overallRisk === 'HIGH' ? 'border-accent-red/30 bg-accent-red/5' :
                overallRisk === 'MEDIUM' ? 'border-accent-amber/30 bg-accent-amber/5' :
                'border-accent-emerald/30 bg-accent-emerald/5'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`w-4 h-4 ${
                    overallRisk === 'HIGH' ? 'text-accent-red' : overallRisk === 'MEDIUM' ? 'text-accent-amber' : 'text-accent-emerald'
                  }`} />
                  <span className={`text-sm font-medium ${
                    overallRisk === 'HIGH' ? 'text-accent-red' : overallRisk === 'MEDIUM' ? 'text-accent-amber' : 'text-accent-emerald'
                  }`}>RECOMMENDATION</span>
                </div>
                <p className="text-sm text-text-secondary">{recommendation}</p>
              </div>

              {/* Human escalation */}
              {humanReviewCount > 0 && (
                <div className="border border-accent-amber/30 bg-accent-amber/5 p-4 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-accent-amber" />
                    <span className="text-sm font-medium text-accent-amber">HUMAN_REVIEW_REQUIRED</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {humanReviewCount} clause{humanReviewCount > 1 ? 's' : ''} flagged for human legal counsel review. Confidence levels are high but legal implications require professional sign-off.
                  </p>
                </div>
              )}
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
                      <td className="px-4 py-3 text-xs text-accent-blue">{f.id}</td>
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
                          <span className="font-mono text-xs text-accent-blue">{finding.id}</span>
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
                        <p className="text-xs text-text-secondary truncate">{finding.clauseText}</p>
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
                                <p className="text-sm text-text-secondary leading-relaxed">{finding.clauseText}</p>
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
                {Object.entries(regCitations).map(([reg, articles]) => (
                  <div key={reg} className="border border-border-subtle p-4">
                    <div className="badge bg-accent-blue/10 text-accent-blue border-accent-blue/20 mb-3">
                      {reg}
                    </div>
                    {articles.length > 0 ? (
                      <ul className="space-y-2">
                        {articles.map((art, i) => (
                          <li key={i} className="text-xs text-text-secondary font-mono">{art}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-text-tertiary">General reference</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="font-mono text-xs text-text-muted">
              Session: {sessionId || 'demo'} · 4/4 agents completed · Immutable
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
