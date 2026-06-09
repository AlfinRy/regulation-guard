import CornerGlow from '../../components/ui/CornerGlow';

const regulations = [
	{ code: 'GDPR', name: 'EU General Data Protection Regulation', scope: 'Data privacy, consent, breach notification' },
	{ code: 'EU AI Act', name: 'EU Artificial Intelligence Act', scope: 'AI risk classification, transparency' },
	{ code: 'OJK POJK', name: 'Indonesia OJK Regulations', scope: 'Financial services, data governance' },
	{ code: 'BI PBI', name: 'Bank Indonesia Regulations', scope: 'Banking compliance, reporting' },
	{ code: 'PDPA', name: 'Singapore Personal Data Protection', scope: 'Data collection, transfer, consent' },
	{ code: 'ISO 27001', name: 'ISO/IEC 27001', scope: 'Information security management' },
	{ code: 'SOC2', name: 'SOC 2 Type II', scope: 'Service organization controls' },
	{ code: 'APPI', name: 'Japan Act on Protection of Personal Info', scope: 'Cross-border data transfer' },
];

export default function CoverageSection() {
	return (
		<section id="coverage">
			<div className="max-w-content mx-auto border-x border-border-subtle">
				<CornerGlow color="#34d399" position="top-left" opacity={0.3}>
					<CornerGlow color="#34d399" position="bottom-right" opacity={0.15}>
						<div className="p-8 lg:p-12 text-center">
							<span className="font-mono text-xs text-text-muted tracking-wider uppercase">Jurisdictional Coverage</span>
							<h2 className="text-heading text-balance mt-3 mx-auto">450+ regulatory frameworks, live-synced hourly.</h2>
							<p className="text-body-lg text-text-secondary text-balance max-w-2xl mx-auto mt-4">RegulationGuard maintains a knowledge base of regional and international compliance frameworks. The logic updates as legal landscapes change.</p>
						</div>

						<div className="px-4 lg:px-8 pb-8 lg:pb-12">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
								{regulations.map((reg) => (
									<div key={reg.code} className="p-4 border border-border-subtle bg-bg-surface-2 hover:border-border-default transition-colors">
										<div className="flex items-center gap-2 mb-2">
											<span className="badge bg-accent-blue/10 text-accent-blue border-accent-blue/20">{reg.code}</span>
										</div>
										<div className="text-sm text-text-primary font-medium mb-1">{reg.name}</div>
										<div className="text-xs text-text-tertiary">{reg.scope}</div>
									</div>
								))}
							</div>
						</div>
					</CornerGlow>
				</CornerGlow>
			</div>
		</section>
	);
}
