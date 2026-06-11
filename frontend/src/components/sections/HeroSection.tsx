import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import GrainSection from '../ui/GrainSection';

export default function HeroSection() {
	return (
		<section className="pt-14">
			<div className="max-w-content mx-auto border-x border-border-subtle">
				<GrainSection>
					<div className="grid lg:grid-cols-2 grid-cols-1 items-center">
						{/* Left: Copy */}
						<div className="flex flex-col items-start gap-6 p-4 sm:p-8 lg:p-12">
							<span className="badge bg-accent-blue/10 text-accent-blue border-accent-blue/20">Multi-Agent Compliance</span>
							<h1 className="text-display text-balance">From contract to compliance report in minutes.</h1>
							<p className="text-body-lg text-text-secondary text-balance max-w-lg">Deploy 4 specialized AI agents to audit your legal standing against GDPR, OJK, PDPA, and ISO 27001. Document ingestion to risk mitigation, automated.</p>
							<div className="flex flex-wrap gap-3 mt-2 w-full">
								<Link to="/upload" className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-btn-primary text-bg-base hover:bg-btn-primary-hover transition-colors rounded-md w-full sm:w-auto justify-center">
									Start Free Review
									<ArrowRight className="w-4 h-4" />
								</Link>
								<a href="#pipeline" className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors rounded-md w-full sm:w-auto justify-center">
									View Pipeline
								</a>
							</div>
						</div>

						{/* Right: Terminal visualization */}
						<div className="p-4 lg:p-8 relative">
							<div className="terminal-block">
								<div className="terminal-header">
									<span className="w-2.5 h-2.5 rounded-full bg-accent-red/60" />
									<span className="w-2.5 h-2.5 rounded-full bg-accent-amber/60" />
									<span className="w-2.5 h-2.5 rounded-full bg-accent-emerald/60" />
									<span className="font-mono text-xs text-text-muted ml-2">regulation-guard</span>
								</div>
								<div className="terminal-body space-y-3">
									<div>
										<span className="token-comment"># Upload your contract</span>
									</div>
									<div>
										<span className="token-prompt">$ </span>
										<span className="token-command">guard</span>
										<span className="token-flag"> review</span>
										<span className="token-argument"> vendor_agreement_v2.pdf</span>
									</div>
									<div className="border-t border-border-subtle pt-3 mt-3 space-y-1.5">
										<div>
											<span className="text-accent-emerald">&#10003;</span>
											<span className="text-text-secondary"> Agent 01: Policy Reader</span>
											<span className="text-text-muted"> — 23 clauses extracted</span>
										</div>
										<div>
											<span className="text-accent-emerald">&#10003;</span>
											<span className="text-text-secondary"> Agent 02: Risk Analyzer</span>
											<span className="text-text-muted"> — 3 critical gaps found</span>
										</div>
										<div>
											<span className="text-accent-cyan">&#8635;</span>
											<span className="text-text-secondary"> Agent 03: Legal Checker</span>
											<span className="text-text-muted"> — cross-referencing 450+ frameworks...</span>
										</div>
										<div className="text-text-muted">
											<span className="opacity-50">&#9679;</span> Agent 04: Reporter — queued
										</div>
									</div>
									<div className="border-t border-border-subtle pt-3 mt-3">
										<span className="token-comment"># Estimated completion: 2m 14s</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</GrainSection>
			</div>
		</section>
	);
}
