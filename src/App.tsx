import { Activity, BarChart3, BookOpen, CheckCircle2, FileText, Lock, MapPin, Shield, TrendingUp } from 'lucide-react';

export default function App() {
  return (
    <div className="bg-surface-dim dark:bg-surface-dim text-on-surface dark:text-on-surface overflow-x-hidden">
      <div className="noise-overlay" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface-dim dark:bg-surface-dim border-b border-outline-variant dark:border-outline-variant">
        <div className="flex justify-between items-center px-10 lg:px-40 w-full h-16 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-headline-md text-headline-md font-semibold text-on-surface dark:text-on-surface">RegulationGuard</span>
            <div className="hidden md:flex gap-6">
              <a className="font-body-md text-body-md text-primary dark:text-primary border-b-2 border-primary pb-1" href="#dashboard">Dashboard</a>
              <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors" href="#audits">Audits</a>
              <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors" href="#regulations">Regulations</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-primary-container text-on-primary-container px-4 py-2 font-label-md text-label-md hover:brightness-110 transition-all">
              New Review
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="min-h-[800px] flex items-center relative overflow-hidden px-10 lg:px-40 max-w-[1440px] mx-auto py-24">
          <div className="grid grid-cols-12 gap-4 w-full">
            {/* Left Content */}
            <div className="col-span-12 lg:col-span-5 flex flex-col justify-center space-y-8">
              <div className="space-y-2">
                <span className="text-primary font-label-md text-label-md tracking-widest uppercase">Autonomous Regulatory Intelligence</span>
                <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">
                  Automate Compliance with <span className="text-primary italic">Absolute</span> Precision.
                </h1>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                Deploy an orchestrated multi-agent pipeline to audit your legal standing. From document ingestion to risk mitigation in minutes, not months.
              </p>
              <div className="flex gap-4">
                <button className="bg-primary-container text-on-primary-container px-8 py-4 font-label-md text-label-md uppercase tracking-wider hover:brightness-110 transition-all">
                  Request Access
                </button>
                <button className="border border-outline-variant px-8 py-4 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-variant transition-all">
                  View Demo
                </button>
              </div>
            </div>

            {/* Right Visualization */}
            <div className="col-span-12 lg:col-span-7 relative">
              <div className="bg-surface-container-low glass-border p-8 relative overflow-hidden">
                <div className="scanner-line"></div>
                <div className="flex flex-col space-y-12 relative z-10">
                  {/* Input */}
                  <div className="flex items-center justify-between">
                    <div className="bg-surface-container-high p-4 glass-border border-l-4 border-l-primary flex items-center gap-4 w-48">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-label-md text-[10px] text-outline">INPUT_STREAM</div>
                        <div className="font-data-mono text-data-mono text-on-surface">POLICY_V.04.pdf</div>
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-outline-variant mx-4 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    </div>
                  </div>

                  {/* 4 Agents */}
                  <div className="grid grid-cols-4 gap-4">
                    <AgentCard icon={BookOpen} label="AGENT_01" name="Policy Reader" progress={85} />
                    <AgentCard icon={Shield} label="AGENT_02" name="Risk Analyzer" progress={40} pulse />
                    <AgentCard icon={Lock} label="AGENT_03" name="Legal Checker" progress={0} disabled />
                    <AgentCard icon={CheckCircle2} label="AGENT_04" name="Reporter" progress={0} disabled />
                  </div>

                  {/* Output */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-px bg-outline-variant mx-4"></div>
                    <div className="bg-surface-container-high p-4 glass-border border-r-4 border-r-primary flex items-center gap-4 w-56">
                      <div className="text-right">
                        <div className="font-label-md text-[10px] text-outline">AUDIT_RESULT</div>
                        <div className="font-data-mono text-data-mono text-primary">CRITICAL_PASS</div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligence Engine */}
        <section className="bg-surface-container-low py-24 border-y border-outline-variant">
          <div className="px-10 lg:px-40 max-w-[1440px] mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-headline-lg text-headline-lg">The Intelligence Engine</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
                Our 4-agent cognitive architecture mimics a high-performance legal team, working in a unified data boardroom to ensure zero-gap compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <EngineCard
                icon={BookOpen}
                title="Policy Reader"
                desc="Extracts semantic intent from unstructured legal PDFs using proprietary OCR/LLM hybrid pipelines."
                handoff="HANDOFF: STRUC_METADATA_JSON"
              />
              <EngineCard
                icon={TrendingUp}
                title="Risk Analyzer"
                desc="Cross-references policy intents against known risk frameworks to identify critical exposure gaps."
                handoff="HANDOFF: GAP_PROBABILITY_MATRIX"
              />
              <EngineCard
                icon={Lock}
                title="Legal Cross-Checker"
                desc="Validates findings against 50,000+ global regulatory citations in the RegulationGuard DB."
                handoff="HANDOFF: CITATION_VALID_CERT"
              />
              <EngineCard
                icon={FileText}
                title="Compliance Reporter"
                desc="Synthesizes all agent outputs into a board-ready audit trail with actionable remediation steps."
                handoff="FINAL: IMMUTABLE_AUDIT_LOG"
              />
            </div>
          </div>
        </section>

        {/* Live Risk Intelligence */}
        <section className="py-24 px-10 lg:px-40 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <h2 className="font-headline-lg text-headline-lg">Live Risk Intelligence</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Our high-density interface provides immediate visibility into your compliance posture. No fluff, just technical data mapped to regulatory requirements.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-label-md text-label-md text-outline">
                  <span>TOTAL_EXPOSURE</span>
                  <span className="text-on-surface">12%</span>
                </div>
                <div className="h-2 bg-surface-container-high w-full">
                  <div className="h-full bg-primary w-[12%]"></div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="bg-surface-container-lowest glass-border overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container border-b border-outline-variant">
                      <th className="p-4 font-label-md text-label-md text-outline">REQUIREMENT_ID</th>
                      <th className="p-4 font-label-md text-label-md text-outline">REGULATION</th>
                      <th className="p-4 font-label-md text-label-md text-outline">STATUS</th>
                      <th className="p-4 font-label-md text-label-md text-outline">RISK_SCORE</th>
                      <th className="p-4 font-label-md text-label-md text-outline">CONFIDENCE</th>
                    </tr>
                  </thead>
                  <tbody className="font-data-mono text-data-mono">
                    <RiskRow id="ART_32_GDPR" reg="GDPR - Data Security" status="COMPLIANT" score="0.04" conf="98.2%" />
                    <RiskRow id="ISO_27001_A12" reg="ISO 27001" status="CRITICAL_GAP" score="0.89" conf="94.1%" critical />
                    <RiskRow id="OJK_POJK_38" reg="Indonesia OJK" status="WARNING" score="0.45" conf="89.9%" warning />
                    <RiskRow id="PDPA_SEC_24" reg="Singapore PDPA" status="COMPLIANT" score="0.12" conf="96.5%" />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Global Jurisdictional Coverage */}
        <section className="bg-surface-dim py-24 relative overflow-hidden">
          <div className="px-10 lg:px-40 max-w-[1440px] mx-auto">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-6 flex flex-col justify-center space-y-8">
                <h2 className="font-headline-lg text-headline-lg">Global Jurisdictional Coverage</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  We maintain a live-synced knowledge base of over 450 regional and international frameworks. RegulationGuard updates its logic hourly to reflect changing legal landscapes.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container glass-border flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div className="font-label-md text-label-md">GDPR / EU AI Act</div>
                  </div>
                  <div className="p-4 bg-surface-container glass-border flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <div className="font-label-md text-label-md">OJK / BI / POJK</div>
                  </div>
                  <div className="p-4 bg-surface-container glass-border flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <div className="font-label-md text-label-md">ISO 27001 / SOC2</div>
                  </div>
                  <div className="p-4 bg-surface-container glass-border flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="font-label-md text-label-md">PDPA / APPI</div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-6">
                <div className="relative bg-surface-container-low glass-border p-4 aspect-video overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4y8N9fZs2xq8lLkc4bqLCR24F65R8yJ4TmTkH9BKDHawN_OSxfXjAYZk8Q1kNznIakTqVPdQD4nk-9bU17Fd7fMhGSIFA8OvoTSzgVUhYgI2fGTeHCxXpMUwCAreNspTAkC_g7MVsCwlgvalZbxhsu44nFnOP5BJuJ2Y7F1MpNJkkrESwk1JDiCm1aWgrLEFd9_Yiv-7HMEERDF6yvrMFiurIMRQ2NnFdSPvSN2weJxXX2loqnQWv2ztApUSVDNkg4jiWtXmNzx6H"
                    alt="Global regulatory coverage map"
                    className="w-full h-full object-cover grayscale opacity-40 mix-blend-screen"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-surface-dim/80 backdrop-blur-md p-6 glass-border max-w-xs text-center space-y-2">
                      <div className="font-headline-md text-headline-md text-primary">450+</div>
                      <div className="font-label-md text-label-md uppercase tracking-widest text-outline">Frameworks Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Immutable Ledger */}
        <section className="py-24 px-10 lg:px-40 max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg">The Immutable Ledger</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Every audit, every agent decision, and every remediation is logged to a cryptographic trail.</p>
          </div>

          <div className="relative space-y-8 before:absolute before:left-[19px] lg:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-outline-variant">
            <TimelineItem
              icon={Activity}
              id="TXID_9882_AUDIT"
              time="Oct 12, 14:30"
              title="Initial Document Hashing"
              desc="Policy document V.04 uploaded. SHA-256 fingerprint generated and anchored to the audit block."
            />
            <TimelineItem
              icon={Shield}
              id="TXID_9883_ANALYSIS"
              time="Oct 12, 14:32"
              title="Agent Concensus Reached"
              desc="Policy Reader and Risk Analyzer reached 99.8% consensus on Critical Gap #42: 'Insufficient encryption rotation'."
              reverse
            />
            <TimelineItem
              icon={CheckCircle2}
              id="TXID_9885_CERT"
              time="Oct 12, 14:45"
              title="Final Certification Issued"
              desc="Immutable report generated. Exported to Legal Archives with full agent trace history."
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-10 lg:px-40 max-w-[1440px] mx-auto text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px]"></div>
          <div className="relative z-10 space-y-10">
            <div className="space-y-4">
              <h2 className="font-display-lg text-display-lg">Ready to Secure Your Compliance Architecture?</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Join forward-thinking legal teams deploying autonomous audit pipelines. Get your first comprehensive review in minutes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-on-primary px-10 py-5 font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all">
                Start Free Review
              </button>
              <button className="bg-surface-container border border-outline-variant px-10 py-5 font-label-md text-label-md uppercase tracking-widest hover:bg-surface-variant transition-all">
                Speak to an Architect
              </button>
            </div>
            <div className="pt-12 flex justify-center gap-12 opacity-40 contrast-125">
              <span className="font-headline-md text-headline-md italic">FINTECH_INC</span>
              <span className="font-headline-md text-headline-md italic">GLOBAL_BANK</span>
              <span className="font-headline-md text-headline-md italic">LEGAL_TRUST</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant">
        <div className="grid grid-cols-4 gap-4 px-10 lg:px-40 py-12 max-w-[1440px] mx-auto">
          <div className="col-span-4 lg:col-span-1 space-y-4">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">RegulationGuard</span>
            <p className="font-body-md text-body-md text-on-surface-variant">The definitive standard for autonomous regulatory auditing and intelligence.</p>
          </div>
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <h5 className="font-label-md text-label-md text-primary uppercase">Product</h5>
            <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant">
              <li><a className="hover:text-on-surface underline transition-colors" href="#">Platform Overview</a></li>
              <li><a className="hover:text-on-surface underline transition-colors" href="#">Agent Orchestration</a></li>
              <li><a className="hover:text-on-surface underline transition-colors" href="#">Risk Engine</a></li>
              <li><a className="hover:text-on-surface underline transition-colors" href="#">Pricing</a></li>
            </ul>
          </div>
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <h5 className="font-label-md text-label-md text-primary uppercase">Compliance</h5>
            <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant">
              <li><a className="hover:text-on-surface underline transition-colors" href="#">GDPR Center</a></li>
              <li><a className="hover:text-on-surface underline transition-colors" href="#">ISO Standards</a></li>
              <li><a className="hover:text-on-surface underline transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-on-surface underline transition-colors" href="#">Security Audit</a></li>
            </ul>
          </div>
          <div className="col-span-4 lg:col-span-1 space-y-4">
            <h5 className="font-label-md text-label-md text-primary uppercase">Connect</h5>
            <p className="font-body-md text-body-md text-on-surface-variant pt-4">© 2024 RegulationGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AgentCard({ icon: Icon, label, name, progress, pulse, disabled }) {
  return (
    <div className={`bg-surface-container-highest p-4 glass-border text-center space-y-2 ${disabled ? 'opacity-50' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="font-data-mono text-[10px] text-primary">{label}</div>
      <div className="font-label-md text-label-md">{name}</div>
      <div className="w-full bg-surface-dim h-1 mt-2">
        <div className={`bg-primary h-full transition-all ${pulse ? 'animate-pulse' : ''}`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function EngineCard({ icon: Icon, title, desc, handoff }) {
  return (
    <div className="bg-surface-container p-6 glass-border group hover:border-primary/50 transition-all">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-3">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h4 className="font-headline-md text-headline-md">{title}</h4>
          <p className="font-body-md text-body-md text-on-surface-variant">{desc}</p>
          <div className="font-data-mono text-[11px] text-primary pt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            {handoff}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskRow({ id, reg, status, score, conf, critical, warning }) {
  const statusColor = critical ? 'bg-error-container/20 text-error border border-error/20' : warning ? 'bg-secondary-container/20 text-secondary border border-secondary/20' : 'bg-primary/10 text-primary border border-primary/20';
  return (
    <tr className="border-b border-outline-variant/30 hover:bg-surface-container/50 transition-colors">
      <td className="p-4">{id}</td>
      <td className="p-4">{reg}</td>
      <td className="p-4"><span className={`px-2 py-1 ${statusColor}`}>{status}</span></td>
      <td className={`p-4 ${critical ? 'text-error' : ''}`}>{score}</td>
      <td className="p-4">{conf}</td>
    </tr>
  );
}

function TimelineItem({ icon: Icon, id, time, title, desc, reverse }) {
  return (
    <div className={`relative flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center lg:justify-between group`}>
      <div className="absolute left-0 lg:left-1/2 -translate-x-1/2 w-10 h-10 bg-surface-dim border border-primary flex items-center justify-center z-10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className={`${reverse ? 'lg:w-[45%]' : 'lg:w-[45%]'} ml-12 lg:ml-0 bg-surface-container p-6 glass-border group-hover:border-primary transition-all`}>
        <div className="flex justify-between items-start mb-2">
          <div className="font-data-mono text-[10px] text-primary">{id}</div>
          <div className="font-label-md text-label-md text-outline">{time}</div>
        </div>
        <h4 className="font-headline-md text-headline-md mb-2">{title}</h4>
        <p className="font-body-md text-body-md text-on-surface-variant">{desc}</p>
      </div>
      <div className={`hidden lg:block ${reverse ? 'lg:w-[45%]' : 'lg:w-[45%]'}`}></div>
    </div>
  );
}
