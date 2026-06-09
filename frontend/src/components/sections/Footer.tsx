import Logo from '../ui/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle">
      <div className="max-w-content mx-auto border-x border-border-subtle px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <a href="/" className="flex items-center text-text-primary font-semibold text-md">
            <Logo size={60} />
            RegulationGuard
          </a>
          <p className="text-sm text-text-tertiary">
            Multi-agent compliance review for regulated industries.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-text-tertiary">
          <a href="#pipeline" className="hover:text-text-secondary transition-colors">Pipeline</a>
          <a href="#risk-table" className="hover:text-text-secondary transition-colors">Risk Data</a>
          <a href="#coverage" className="hover:text-text-secondary transition-colors">Coverage</a>
          <a
            href="https://github.com/AlfinRy/regulation-guard"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors"
            aria-label="View source on GitHub (opens in new tab)"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
