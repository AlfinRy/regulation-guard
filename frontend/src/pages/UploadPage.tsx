import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Upload, FileText, ChevronRight, Check, X, Settings, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { hasSettings, getCurrentProvider, getStoredModelName } from '../lib/byok';
import ProviderIcon from '../components/ui/ProviderIcon';

const REGULATIONS = [
  { id: 'gdpr', code: 'GDPR', name: 'EU General Data Protection Regulation', disabled: false },
  { id: 'ojk', code: 'OJK POJK', name: 'Indonesia OJK Regulations', disabled: false },
  { id: 'pdpa', code: 'PDPA', name: 'Singapore Personal Data Protection', disabled: false },
  { id: 'iso27001', code: 'ISO 27001', name: 'ISO/IEC 27001', disabled: false },
  { id: 'euaiact', code: 'EU AI Act', name: 'EU Artificial Intelligence Act', disabled: true },
  { id: 'soc2', code: 'SOC 2', name: 'SOC 2 Type II', disabled: true },
  { id: 'appi', code: 'APPI', name: 'Japan Act on Protection of Personal Info', disabled: true },
  { id: 'bipbi', code: 'BI PBI', name: 'Bank Indonesia Regulations', disabled: true },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [selectedRegs, setSelectedRegs] = useState<string[]>(['gdpr', 'ojk']);
  const [isDragging, setIsDragging] = useState(false);
  const [docName, setDocName] = useState('');
  const [isConfigured, setIsConfigured] = useState(hasSettings());

  // Re-check settings on focus (user might have saved in settings tab)
  useEffect(() => {
    const check = () => setIsConfigured(hasSettings());
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type === 'application/pdf' || dropped.name.endsWith('.docx'))) {
      setFile(dropped);
      setDocName(dropped.name);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setDocName(selected.name);
    }
  }, []);

  const toggleReg = (id: string) => {
    setSelectedRegs(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (!isConfigured) {
      navigate('/settings');
      return;
    }
    if (file && selectedRegs.length > 0) {
      navigate('/review', { state: { fileName: file.name, regulations: selectedRegs } });
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-bg-base/90 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-content mx-auto border-x border-border-subtle flex justify-between items-center px-6 h-14">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
            <Shield className="w-4 h-4 text-accent-blue" />
            RegulationGuard
          </div>
          <div className="flex items-center gap-3">
            <div className="font-mono text-xs text-text-muted">
              UPLOAD &amp; CONFIGURE
            </div>
            {isConfigured ? (
              <Link to="/settings" className="inline-flex items-center gap-1.5 badge bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20">
                {getCurrentProvider() && <ProviderIcon provider={getCurrentProvider()!} size={12} />}
                {getCurrentProvider()?.name} / {getStoredModelName()}
              </Link>
            ) : (
              <Link to="/settings" className="inline-flex items-center gap-1.5 badge bg-accent-amber/10 text-accent-amber border-accent-amber/20">
                <AlertTriangle className="w-3 h-3" />
                No API key set
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-14">
        <div className="max-w-content mx-auto border-x border-border-subtle">
          {/* Header */}
          <div className="border-b border-border-subtle px-8 py-6">
            <div className="flex items-center gap-3 text-text-muted font-mono text-xs mb-3">
              <span className="text-text-tertiary">01</span>
              <span className="h-px flex-1 bg-border-subtle" />
              <span className="text-text-tertiary">02</span>
              <span className="h-px bg-border-subtle w-8" />
              <span className="text-text-tertiary">03</span>
            </div>
            <h1 className="text-heading">Upload document</h1>
            <p className="text-body text-text-secondary mt-2">
              Drag and drop your contract or policy document. Select target regulations, then start the review.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 grid-cols-1">
            {/* Left: Upload zone */}
            <div className="lg:col-span-3 border-r border-border-subtle p-8">
              <div className="font-mono text-xs text-text-muted mb-4">
                DOCUMENT_INPUT
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-none transition-all duration-200
                  ${file
                    ? 'border-accent-emerald/40 bg-accent-emerald/5'
                    : isDragging
                      ? 'border-accent-blue/60 bg-accent-blue/5'
                      : 'border-border-default hover:border-border-strong bg-bg-surface-2'
                  }
                  min-h-[280px] flex flex-col items-center justify-center cursor-pointer
                `}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileInput}
                />

                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4 text-center px-6"
                    >
                      <div className="w-14 h-14 border border-accent-emerald/30 bg-accent-emerald/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-accent-emerald" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{file.name}</div>
                        <div className="font-mono text-xs text-text-tertiary mt-1">
                          {(file.size / 1024).toFixed(1)} KB · {file.type || 'application/pdf'}
                        </div>
                      </div>
                      <button
                        className="text-xs text-text-tertiary hover:text-accent-red transition-colors font-mono"
                        onClick={(e) => { e.stopPropagation(); setFile(null); setDocName(''); }}
                      >
                        <X className="w-3 h-3 inline mr-1" />
                        REMOVE
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-4 text-center px-6"
                    >
                      <div className="w-14 h-14 border border-border-default bg-bg-surface-3 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-text-tertiary" />
                      </div>
                      <div>
                        <div className="text-sm text-text-secondary">Drop your document here</div>
                        <div className="font-mono text-xs text-text-muted mt-1">
                          PDF or DOCX · Max 50 MB
                        </div>
                      </div>
                      <div className="badge bg-bg-surface-3 text-text-tertiary border-border-default">
                        Browse files
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Document name field */}
              <div className="mt-6">
                <label className="font-mono text-xs text-text-muted block mb-2">
                  DOCUMENT_LABEL
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  placeholder="e.g. Vendor Agreement v2.1"
                  className="w-full bg-bg-surface-2 border border-border-subtle px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-border-strong transition-colors"
                />
              </div>
            </div>

            {/* Right: Regulation selector */}
            <div className="lg:col-span-2 p-8">
              <div className="font-mono text-xs text-text-muted mb-4">
                TARGET_REGULATIONS
              </div>

              <div className="space-y-2">
                {REGULATIONS.map((reg) => {
                  const isSelected = selectedRegs.includes(reg.id);
                  return (
                    <button
                      key={reg.id}
                      disabled={reg.disabled}
                      onClick={() => toggleReg(reg.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 border text-left transition-all duration-150
                        ${reg.disabled
                          ? 'border-border-subtle/50 opacity-35 cursor-not-allowed'
                          : isSelected
                            ? 'border-accent-blue/40 bg-accent-blue/5'
                            : 'border-border-subtle bg-bg-surface-2 hover:border-border-default'
                        }
                      `}
                    >
                      <div className={`
                        w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors
                        ${isSelected
                          ? 'bg-accent-blue border-accent-blue'
                          : 'border-border-default'
                        }
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-bg-base" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-accent-blue">{reg.code}</span>
                          {reg.disabled && (
                            <span className="font-mono text-[10px] text-text-muted">SOON</span>
                          )}
                        </div>
                        <div className="text-xs text-text-tertiary truncate">{reg.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-border-subtle">
                <div className="font-mono text-xs text-text-muted mb-2">
                  SELECTED: {selectedRegs.length} / {REGULATIONS.filter(r => !r.disabled).length}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRegs.map(id => {
                    const reg = REGULATIONS.find(r => r.id === id);
                    return reg ? (
                      <span key={id} className="badge bg-accent-blue/10 text-accent-blue border-accent-blue/20">
                        {reg.code}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer action bar */}
          <div className="border-t border-border-subtle px-8 py-5 flex items-center justify-between">
            <div className="font-mono text-xs text-text-muted">
              {file ? (
                <span className="text-text-secondary">
                  <Check className="w-3 h-3 text-accent-emerald inline mr-1" />
                  {file.name}
                </span>
              ) : (
                <span>No document selected</span>
              )}
              {selectedRegs.length > 0 && (
                <span className="ml-4">
                  {selectedRegs.length} regulation{selectedRegs.length > 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isConfigured && (
                <Link to="/settings" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 border border-accent-amber/30 text-accent-amber hover:bg-accent-amber/5 transition-colors rounded-md">
                  <Settings className="w-4 h-4" />
                  Set API Key First
                </Link>
              )}
              <button
                disabled={!file || selectedRegs.length === 0}
                onClick={handleStart}
                className={`
                  inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-md transition-all duration-200
                  ${file && selectedRegs.length > 0
                    ? 'bg-btn-primary text-bg-base hover:bg-btn-primary-hover'
                    : 'bg-bg-surface-3 text-text-muted cursor-not-allowed'
                  }
                `}
              >
                Start Review
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
