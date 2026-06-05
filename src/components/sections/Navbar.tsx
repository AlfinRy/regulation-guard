import { Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-bg-base/90 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-content mx-auto border-x border-border-subtle flex justify-between items-center px-6 h-14">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2 text-text-primary font-semibold text-sm">
            <Shield className="w-4 h-4 text-accent-blue" />
            RegulationGuard
          </a>
          <div className="hidden md:flex items-center gap-1">
            <a className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors" href="#pipeline">
              Pipeline
            </a>
            <a className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors" href="#risk-table">
              Risk Data
            </a>
            <a className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors" href="#coverage">
              Coverage
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#cta"
            className="text-sm font-medium px-4 py-2 bg-btn-primary text-bg-base hover:bg-btn-primary-hover transition-colors rounded-md"
          >
            Start Review
          </a>
        </div>
      </div>
    </nav>
  );
}
