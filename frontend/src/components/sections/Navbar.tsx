import { Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';

export default function Navbar() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <nav className="fixed top-0 w-full z-50 bg-bg-base/90 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-content mx-auto border-x border-border-subtle flex justify-between items-center px-4 sm:px-6 h-14">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center text-text-primary font-semibold text-md">
            <Logo size={60} />
            RegulationGuard
          </Link>
          {isLanding && (
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
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/settings"
            className={`text-sm font-medium px-2 sm:px-3 py-2 border transition-colors rounded-md ${
              location.pathname === '/settings'
                ? 'border-border-strong text-text-primary'
                : 'border-transparent text-text-tertiary hover:text-text-secondary'
            }`}
            title="AI Provider Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <Link
            to="/upload"
            className="text-sm font-medium px-3 sm:px-4 py-2 bg-btn-primary text-bg-base hover:bg-btn-primary-hover transition-colors rounded-md"
          >
            <span className="hidden sm:inline">Start Review</span>
            <span className="sm:hidden">Review</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
