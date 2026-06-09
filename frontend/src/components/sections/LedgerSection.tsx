import { TimelineEntry } from '../ui';
import CornerGlow from '../../components/ui/CornerGlow';

const timelineData = [
	{
		txId: 'TXID_9882_AUDIT',
		time: 'Oct 12, 14:30',
		title: 'Document fingerprinted',
		description: 'Policy document V.04 uploaded. SHA-256 hash generated and anchored to audit block.',
		status: 'complete' as const,
	},
	{
		txId: 'TXID_9883_ANALYSIS',
		time: 'Oct 12, 14:32',
		title: 'Agent consensus reached',
		description: 'Policy Reader and Risk Analyzer reached 99.8% consensus on Critical Gap #42: insufficient encryption rotation.',
		status: 'complete' as const,
	},
	{
		txId: 'TXID_9884_CROSSCHECK',
		time: 'Oct 12, 14:38',
		title: 'Regulations cross-referenced',
		description: 'Legal Cross-Checker validated findings against 12,400 applicable citations. 3 GDPR violations, 1 OJK gap confirmed.',
		status: 'complete' as const,
	},
	{
		txId: 'TXID_9885_CERT',
		time: 'Oct 12, 14:45',
		title: 'Final certification issued',
		description: 'Immutable report generated with full agent trace history. Exported to Legal Archives.',
		status: 'active' as const,
	},
];

export default function LedgerSection() {
	return (
		<section>
			<div className="max-w-content mx-auto border-x border-border-subtle">
				<CornerGlow color="#22d3ee" position="top-left" opacity={0.3}>
					<CornerGlow color="#22d3ee" position="bottom-right" opacity={0.15}>
						<div className="grid lg:grid-cols-2 grid-cols-1">
							{/* Left: Description */}
							<div className="flex flex-col items-start gap-6 p-8 lg:p-12">
								<span className="font-mono text-xs text-text-secondary tracking-wider uppercase">Audit Trail</span>
								<h2 className="text-heading text-balance">Every agent decision is logged and traceable.</h2>
								<p className="text-body text-text-secondary text-balance">Every audit, agent decision, and remediation step is recorded to a cryptographic trail. No black-box decisions, no lost context.</p>

								<div className="mt-4 w-full">
									<div className="terminal-block">
										<div className="terminal-body space-y-1.5">
											<div>
												<span className="token-comment"># Verify audit integrity</span>
											</div>
											<div>
												<span className="token-prompt">$ </span>
												<span className="token-command">guard</span>
												<span className="token-flag"> verify</span>
												<span className="token-argument"> TXID_9885_CERT</span>
											</div>
											<div className="border-t border-border-subtle pt-2 mt-2">
												<span className="text-accent-emerald">&#10003;</span>
												<span className="text-text-secondary"> Chain integrity: VALID</span>
											</div>
											<div>
												<span className="text-text-secondary"> Blocks: 4</span>
											</div>
											<div>
												<span className="text-text-secondary"> Agents: 4/4 completed</span>
											</div>
											<div>
												<span className="text-text-secondary"> Critical gaps: 3</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Right: Timeline */}
							<div className="p-8 lg:p-12 border-l border-border-subtle">
								<div className="space-y-0">
									{timelineData.map((entry) => (
										<TimelineEntry key={entry.txId} {...entry} />
									))}
								</div>
							</div>
						</div>
					</CornerGlow>
				</CornerGlow>
			</div>
		</section>
	);
}
