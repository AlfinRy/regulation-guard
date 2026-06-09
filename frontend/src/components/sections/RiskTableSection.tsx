import { RiskEntry } from '../ui';
import CornerGlow from '../../components/ui/CornerGlow';

const riskData = [
	{
		id: 'ART_32_GDPR',
		regulation: 'GDPR - Data Security',
		status: 'COMPLIANT' as const,
		riskScore: '0.04',
		confidence: '98.2%',
	},
	{
		id: 'ISO_27001_A12',
		regulation: 'ISO 27001 - Access Control',
		status: 'CRITICAL_GAP' as const,
		riskScore: '0.89',
		confidence: '94.1%',
	},
	{
		id: 'OJK_POJK_38',
		regulation: 'Indonesia OJK - Data Governance',
		status: 'WARNING' as const,
		riskScore: '0.45',
		confidence: '89.9%',
	},
	{
		id: 'PDPA_SEC_24',
		regulation: 'Singapore PDPA - Data Transfer',
		status: 'COMPLIANT' as const,
		riskScore: '0.12',
		confidence: '96.5%',
	},
];

export default function RiskTableSection() {
	return (
		<section id="risk-table">
			<div className="max-w-content mx-auto border-x border-border-subtle">
				<CornerGlow color="#fbbf24" position="top-left" opacity={0.3}>
					<CornerGlow color="#fbbf24" position="bottom-right" opacity={0.15}>
						<div className="grid lg:grid-cols-5 grid-cols-1">
							{/* Left: Summary */}
							<div className="lg:col-span-2 flex flex-col items-start gap-6 p-8 lg:p-12">
								<span className="font-mono text-xs text-text-secondary tracking-wider uppercase">Risk Intelligence</span>
								<h2 className="text-heading text-balance">Live compliance posture, clause by clause.</h2>
								<p className="text-body text-text-secondary text-balance">Every requirement mapped against its regulation, scored for risk, and measured for confidence. No fluff.</p>

								{/* Exposure meter */}
								<div className="w-full mt-2">
									<div className="flex justify-between items-center mb-2">
										<span className="font-mono text-xs text-text-muted">TOTAL_EXPOSURE</span>
										<span className="font-mono text-xs text-accent-amber">12%</span>
									</div>
									<div className="h-1.5 bg-bg-surface-4 w-full rounded-full">
										<div className="h-full bg-accent-amber rounded-full" style={{ width: '12%' }} />
									</div>
								</div>

								<div className="flex gap-4 mt-2 text-center">
									<div>
										<div className="text-2xl font-semibold text-text-primary">1</div>
										<div className="font-mono text-xs text-text-muted">CRITICAL</div>
									</div>
									<div>
										<div className="text-2xl font-semibold text-text-primary">1</div>
										<div className="font-mono text-xs text-text-muted">WARNING</div>
									</div>
									<div>
										<div className="text-2xl font-semibold text-text-primary">2</div>
										<div className="font-mono text-xs text-text-muted">PASSING</div>
									</div>
								</div>
							</div>

							{/* Right: Risk table */}
							<div className="lg:col-span-3 border-l border-border-subtle">
								<div className="border-b border-border-subtle px-4 py-3 bg-bg-surface-2">
									<span className="font-mono text-xs text-text-muted">risk_matrix — 4 requirements evaluated</span>
								</div>
								<div className="overflow-x-auto">
									<table className="w-full text-left">
										<thead>
											<tr className="border-b border-border-subtle bg-bg-surface-3">
												<th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">REQUIREMENT_ID</th>
												<th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">REGULATION</th>
												<th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">STATUS</th>
												<th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">RISK</th>
												<th className="px-4 py-2.5 font-mono text-xs text-text-muted font-normal">CONF</th>
											</tr>
										</thead>
										<tbody className="font-mono text-code">
											{riskData.map((row) => (
												<RiskEntry key={row.id} {...row} />
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</CornerGlow>
				</CornerGlow>
			</div>
		</section>
	);
}
