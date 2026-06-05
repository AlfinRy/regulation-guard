import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const [activeTab, setActiveTab] = useState<'guard' | 'demo'>('guard');

  return (
    <section id="cta">
      <div className="max-w-content mx-auto border-x border-border-subtle">
        <div className="flex flex-col items-center gap-8 p-8 lg:p-16 text-center">
          <div className="space-y-4">
            <h2 className="text-heading text-balance">Get started</h2>
            <p className="text-body-lg text-text-secondary max-w-xl">
              Run your first compliance review in under 3 minutes.
            </p>
          </div>

          {/* Terminal with tabs */}
          <div className="w-full max-w-lg">
            <div className="terminal-block relative">
              <div className="terminal-header">
                <div className="flex items-center gap-1">
                  <button
                    className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                      activeTab === 'guard'
                        ? 'bg-bg-surface-2 text-text-primary'
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                    onClick={() => setActiveTab('guard')}
                  >
                    guard
                  </button>
                  <button
                    className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                      activeTab === 'demo'
                        ? 'bg-bg-surface-2 text-text-primary'
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                    onClick={() => setActiveTab('demo')}
                  >
                    demo
                  </button>
                </div>
              </div>
              <div className="terminal-body">
                {activeTab === 'guard' ? (
                  <div>
                    <span className="token-prompt">$ </span>
                    <span className="token-command">guard</span>
                    <span className="token-flag"> review</span>
                    <span className="token-argument"> contract.pdf</span>
                    <span className="token-flag"> --regulations</span>
                    <span className="token-string"> gdpr,ojk</span>
                  </div>
                ) : (
                  <div>
                    <span className="token-prompt">$ </span>
                    <span className="token-command">npx</span>
                    <span className="token-argument"> regulation-guard-demo</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-btn-primary text-bg-base hover:bg-btn-primary-hover transition-colors rounded-md"
            >
              View on GitHub
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#pipeline"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors rounded-md"
            >
              See How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
