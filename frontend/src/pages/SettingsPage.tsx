import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, ExternalLink, ArrowLeft, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PROVIDERS,
  getStoredProviderId,
  getStoredModelForProvider,
  getStoredKeyForProvider,
  saveSettings,
  clearSettings,
  getProviderConfig,
} from '../lib/byok';
import ProviderIcon from '../components/ui/ProviderIcon';
import Logo from '../components/ui/Logo';
import { validateKey } from '../lib/api';

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export default function SettingsPage() {
  const navigate = useNavigate();

  // Load stored values on mount (per-provider, with global fallback)
  const [providerId, setProviderId] = useState<string>(getStoredProviderId() || 'deepseek');
  const [apiKey, setApiKey] = useState<string>(getStoredKeyForProvider(providerId) || '');
  const [modelName, setModelName] = useState<string>(getStoredModelForProvider(providerId) || '');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testError, setTestError] = useState('');

  const provider = getProviderConfig(providerId);

  // When the provider changes, restore the model id + api key previously
  // saved for that provider (falling back to the provider's default model).
  useEffect(() => {
    const config = getProviderConfig(providerId);
    if (!config) return;
    const savedModel = getStoredModelForProvider(providerId);
    const savedKey = getStoredKeyForProvider(providerId);
    setModelName(savedModel ?? config.defaultModel);
    setApiKey(savedKey ?? '');
    setTestStatus('idle');
    setTestError('');
  }, [providerId]);

  const handleTest = async () => {
    if (!apiKey || !provider) return;

    // Save temporarily so the API client can read the headers
    saveSettings(providerId, apiKey, modelName);

    setTestStatus('testing');
    setTestError('');

    try {
      const result = await validateKey();

      if (result.valid) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setTestError(result.error || 'Invalid API key. Please check and try again.');
      }
    } catch {
      setTestStatus('error');
      setTestError('Connection failed. Please check your network.');
    }
  };

  const handleSave = () => {
    if (!apiKey || !providerId || !modelName) return;
    saveSettings(providerId, apiKey, modelName);
    navigate('/upload');
  };

  const handleClear = () => {
    clearSettings();
    setApiKey('');
    setModelName(provider?.defaultModel || '');
    setTestStatus('idle');
    setTestError('');
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-bg-base/90 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-content mx-auto border-x border-border-subtle flex justify-between items-center px-4 sm:px-6 h-14">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-text-primary font-semibold text-sm sm:text-md">
              <Logo size={60} />
              <span className="hidden sm:inline">RegulationGuard</span>
              <span className="sm:hidden">RG</span>
            </Link>
          </div>
          <div className="font-mono text-xs text-text-muted">
            SETTINGS
          </div>
        </div>
      </nav>

      <main className="pt-14">
        <div className="max-w-content mx-auto border-x border-border-subtle">
          {/* Header */}
          <div className="border-b border-border-subtle px-4 sm:px-8 py-6">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => navigate(-1)}
                className="text-text-tertiary hover:text-text-secondary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-subheading sm:text-heading">AI Provider Settings</h1>
            </div>
            <p className="text-body text-text-secondary">
              Select an AI provider and enter your API key. Your key is stored in your browser and is never sent to our servers for storage.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 grid-cols-1">
            {/* Main form */}
            <div className="lg:col-span-2 lg:border-r border-b lg:border-b-0 border-border-subtle p-4 sm:p-8">
              <div className="max-w-lg">

                  {/* Provider grid selector */}
                  <div className="mb-6">
                    <label className="font-mono text-xs text-text-muted block mb-2">
                      AI_PROVIDER
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROVIDERS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setProviderId(p.id); setTestStatus('idle'); }}
                          className={`
                            flex items-center gap-2.5 px-3 py-2.5 border text-left transition-all duration-150
                            ${providerId === p.id
                              ? 'border-accent-blue/50 bg-accent-blue/5'
                              : 'border-border-subtle bg-bg-surface-2 hover:border-border-default'
                            }
                          `}
                        >
                          <ProviderIcon provider={p} size={p.id === 'together' ? 100 : 22} />
                          <span className="text-sm text-text-primary">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                {/* API Key */}
                <div className="mb-6">
                  <label className="font-mono text-xs text-text-muted block mb-2">
                    API_KEY
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={e => { setApiKey(e.target.value); setTestStatus('idle'); }}
                      placeholder="sk-..."
                      className="w-full bg-bg-surface-2 border border-border-subtle px-4 py-3 pr-12 text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Model Name */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-xs text-text-muted">
                      MODEL_NAME
                    </label>
                    {provider && (
                      <a
                        href={provider.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-accent-blue hover:text-accent-cyan transition-colors"
                      >
                        Model docs
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={modelName}
                    onChange={e => { setModelName(e.target.value); setTestStatus('idle'); }}
                    placeholder={provider?.defaultModel || 'model-name'}
                    className="w-full bg-bg-surface-2 border border-border-subtle px-4 py-3 text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors"
                  />
                  {provider && (
                    <p className="font-mono text-[10px] text-text-muted mt-1.5">
                      Examples: {provider.modelHint}
                    </p>
                  )}
                </div>

                {/* Test + Save */}
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={handleTest}
                    disabled={!apiKey || testStatus === 'testing'}
                    className={`
                      inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-md transition-all
                      ${!apiKey
                        ? 'bg-bg-surface-3 text-text-muted cursor-not-allowed'
                        : 'bg-bg-surface-2 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong'
                      }
                    `}
                  >
                    {testStatus === 'testing' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Test Connection
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={!apiKey || !modelName}
                    className={`
                      inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-all
                      ${apiKey && modelName
                        ? 'bg-btn-primary text-bg-base hover:bg-btn-primary-hover'
                        : 'bg-bg-surface-3 text-text-muted cursor-not-allowed'
                      }
                    `}
                  >
                    Save Settings
                  </button>
                </div>

                {/* Test result */}
                <AnimatePresence>
                  {testStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-accent-emerald text-sm mb-4"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Connection successful. Key is valid for {provider?.name}.
                    </motion.div>
                  )}
                  {testStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-accent-red text-sm mb-4"
                    >
                      <XCircle className="w-4 h-4" />
                      {testError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right sidebar: Info */}
            <div className="p-4 sm:p-8">
              {/* Current config preview */}
              <div className="border border-border-subtle p-4 mb-6">
                <div className="font-mono text-xs text-text-muted mb-3">
                  CURRENT_CONFIG
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="font-mono text-[10px] text-text-muted">PROVIDER</div>
                    <div className="flex items-center gap-2 text-sm text-text-primary">
                      {provider && <ProviderIcon provider={provider} size={16} />}
                      {provider?.name}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-text-muted">BASE_URL</div>
                    <div className="text-xs text-text-tertiary font-mono truncate">
                      {provider?.baseUrl}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-text-muted">MODEL</div>
                    <div className="text-sm text-text-secondary font-mono">
                      {modelName || '(not set)'}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-text-muted">KEY</div>
                    <div className="text-sm text-text-secondary font-mono">
                      {apiKey ? `${apiKey.slice(0, 6)}${'•'.repeat(12)}` : '(not set)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy notice */}
              <div className="border border-border-subtle p-4 mb-6">
                <div className="font-mono text-xs text-text-muted mb-2">
                  PRIVACY_NOTICE
                </div>
                <div className="space-y-2 text-xs text-text-tertiary leading-relaxed">
                  <p>
                    Your API key is stored in this browser's <span className="text-text-secondary font-mono">localStorage</span> only.
                  </p>
                  <p>
                    The key is sent via HTTP header per request to the backend and is never written to any database or log.
                  </p>
                </div>
              </div>

              {/* Clear */}
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-2 text-xs text-text-tertiary hover:text-accent-red transition-colors font-mono"
              >
                <Trash2 className="w-3 h-3" />
                Clear all settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
