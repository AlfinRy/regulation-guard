import { ArrowRight, Upload, Settings2, Zap, Terminal, Github } from 'lucide-react';
import CornerGlow from '../../components/ui/CornerGlow';

const WEB_APP_URL = 'https://regulation-guard.pages.dev/upload';
const REPO_URL = 'https://github.com/AlfinRy/regulation-guard';

const WEB_STEPS = [
	{
		n: '01',
		icon: Upload,
		text: 'Upload your PDF or DOCX contract',
	},
	{
		n: '02',
		icon: Settings2,
		text: 'Select regulations to check against (OJK, GDPR, PDPA, ISO 27001)',
	},
	{
		n: '03',
		icon: Zap,
		text: 'Watch 4 AI agents review your document in real time',
	},
] as const;

export default function CTASection() {
	return (
		<section id="cta">
			<div className="max-w-content mx-auto border-x border-border-subtle">
				<CornerGlow color="#818cf8" position="top-left" opacity={0.3}>
					<CornerGlow color="#818cf8" position="bottom-right" opacity={0.15}>
						<div className="flex flex-col items-center gap-10 p-4 sm:p-8 lg:p-16">
							{/* Header */}
							<div className="space-y-4 text-center">
								<h2 className="text-heading text-balance">Get started</h2>
								<p className="text-body-lg text-text-secondary max-w-xl mx-auto">
									Two ways to run your first compliance review. Start from the browser in seconds, or self-host the full stack.
								</p>
							</div>

							{/* Two options */}
							<div className="grid lg:grid-cols-2 grid-cols-1 gap-4 w-full max-w-6xl items-stretch">
								{/* OPTION 1 — Web Interface (primary) */}
								<div className="relative flex flex-col gap-6 p-5 sm:p-7 border border-accent-blue/40 bg-accent-blue/[0.04] rounded-md">
									{/* Primary tag */}
									<div className="absolute -top-2.5 left-5">
										<span className="badge bg-accent-blue text-bg-base border-accent-blue">Recommended</span>
									</div>

									<div className="space-y-3">
										<span className="badge bg-accent-blue/10 text-accent-blue border-accent-blue/20">No setup required</span>
										<div className="flex items-center gap-2">
											<h3 className="text-subheading text-text-primary">Web Interface</h3>
										</div>
										<p className="text-body text-text-secondary">
											Upload your document directly from the browser. No installation needed.
										</p>
									</div>

									{/* Step list */}
									<ol className="flex flex-col gap-3">
										{WEB_STEPS.map((step) => {
											const Icon = step.icon;
											return (
												<li key={step.n} className="flex items-start gap-3">
													<span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-9 h-9 border border-accent-blue/30 bg-accent-blue/10 text-accent-blue rounded-md">
														<Icon className="w-4 h-4" />
													</span>
													<div className="flex flex-col">
														<span className="font-mono text-[10px] text-text-muted tracking-wider">STEP_{step.n}</span>
														<span className="text-sm text-text-primary leading-snug">{step.text}</span>
													</div>
												</li>
											);
										})}
									</ol>

									{/* CTA */}
									<div className="mt-auto pt-1">
										<a
											href={WEB_APP_URL}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-btn-primary text-bg-base hover:bg-btn-primary-hover transition-colors rounded-md w-full justify-center"
										>
											Open Web App
											<ArrowRight className="w-4 h-4" />
										</a>
									</div>
								</div>

								{/* OPTION 2 — Self-host (secondary) */}
								<div className="relative flex flex-col gap-6 p-5 sm:p-7 border border-border-subtle bg-bg-surface rounded-md">
									<div className="space-y-3">
										<span className="badge bg-bg-surface-3 text-text-tertiary border-border-default">For developers</span>
										<div className="flex items-center gap-2">
											<Terminal className="w-4 h-4 text-text-tertiary" />
											<h3 className="text-subheading text-text-primary">Self-host</h3>
										</div>
										<p className="text-body text-text-secondary">
											Clone the open-source repo and run the full stack locally with Docker.
										</p>
									</div>

									{/* Terminal with real commands */}
									<div className="terminal-block">
										<div className="terminal-header">
											<span className="font-mono text-xs text-text-muted">bash</span>
										</div>
										<div className="terminal-body space-y-1.5">
											<div>
												<span className="token-comment"># Clone &amp; run the full stack locally</span>
											</div>
											<div>
												<span className="token-prompt">$ </span>
												<span className="token-command">git clone</span>
												<span className="token-argument"> {REPO_URL}</span>
											</div>
											<div>
												<span className="token-prompt">$ </span>
												<span className="token-command">cd</span>
												<span className="token-argument"> regulation-guard</span>
											</div>
											<div>
												<span className="token-prompt">$ </span>
												<span className="token-command">docker compose up</span>
												<span className="token-flag"> --build</span>
											</div>
										</div>
									</div>

									<div className="mt-auto pt-1 flex flex-col gap-2">
										<a
											href={REPO_URL}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors rounded-md w-full justify-center"
										>
											<Github className="w-4 h-4" />
											View on GitHub
										</a>
										<a
											href="#pipeline"
											className="inline-flex items-center gap-1 text-xs font-mono text-text-tertiary hover:text-text-secondary transition-colors w-full justify-center"
										>
											See how it works &rarr;
										</a>
									</div>
								</div>
							</div>
						</div>
					</CornerGlow>
				</CornerGlow>
			</div>
		</section>
	);
}
