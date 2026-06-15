export interface ProviderConfig {
  id: string;
  name: string;
  logo: string; // emoji fallback
  icon: string; // SVG path relative to src/assets/providers/
  baseUrl: string;
  defaultModel: string;
  modelHint: string;
  docsUrl: string;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: '🟠',
    icon: 'anthropic.svg',
    baseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-3-sonnet-20240229',
    modelHint: 'claude-3-sonnet-20240229, claude-opus-4-7',
    docsUrl: 'https://docs.anthropic.com/en/docs/about-claude/models',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: '🔵',
    icon: 'deepseek.svg',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    modelHint: 'deepseek-chat, deepseek-reasoner',
    docsUrl: 'https://api-docs.deepseek.com/',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '🟢',
    icon: 'openai.svg',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    modelHint: 'gpt-4o, gpt-5.1, gpt-5.5',
    docsUrl: 'https://platform.openai.com/docs/models',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    logo: '🟣',
    icon: 'openrouter.svg',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o',
    modelHint: 'openai/gpt-4o, anthropic/claude-opus-4.7',
    docsUrl: 'https://openrouter.ai/models',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    logo: '🦙',
    icon: 'ollama.svg',
    baseUrl: 'https://ollama.com/api',
    defaultModel: 'llama-3.3-70b-instruct',
    modelHint: 'llama-3.3-70b-instruct, llama-3.3-8b-instruct',
    docsUrl: 'https://ollama.com/library',
  },
  {
    id: 'groq',
    name: 'Groq',
    logo: '⚡',
    icon: 'groq.svg',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
    modelHint: 'meta-llama/llama-4-scout-17b-16e-instruct, qwen/qwen3-32b',
    docsUrl: 'https://console.groq.com/docs/models',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    logo: '🌀',
    icon: 'mistral.svg',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    modelHint: 'mistral-large-latest, mistral-medium-latest',
    docsUrl: 'https://docs.mistral.ai/getting-started/models/',
  },
  {
    id: 'together',
    name: 'Together AI',
    logo: '🤝',
    icon: 'togetherai.svg',
    baseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V4-Pro',
    modelHint: 'deepseek-ai/DeepSeek-V4-Pro, zai-org/GLM-5.1',
    docsUrl: 'https://docs.together.ai/docs/inference-models',
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    logo: '🎆',
    icon: 'fireworks.svg',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/deepseek-v4-flash',
    modelHint: 'accounts/fireworks/models/deepseek-v4-flash, accounts/fireworks/models/minimax-m3',
    docsUrl: 'https://docs.fireworks.ai/',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    logo: '💎',
    icon: 'gemini.svg',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-2.5-flash',
    modelHint: 'gemini-2.5-flash, gemini-3.5-flash',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
  },
  {
    id: 'xai',
    name: 'xAI Grok',
    logo: '✖️',
    icon: 'xai.svg',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-4.3',
    modelHint: 'grok-4.3',
    docsUrl: 'https://docs.x.ai/docs/',
  },
  {
    id: 'zai',
    name: 'Z.AI (Zhipu)',
    logo: '🔮',
    icon: 'zai.svg',
    baseUrl: 'https://api.z.ai/api/paas/v4',
    defaultModel: 'glm-4-plus',
    modelHint: 'glm-4-plus, glm-4v-plus',
    docsUrl: 'https://open.bigmodel.cn/dev/howuse/model',
  },
  {
    id: 'zai-coding',
    name: 'Z.AI Coding Plan',
    logo: '🔮',
    icon: 'zai.svg',
    baseUrl: 'https://api.z.ai/api/coding/paas/v4',
    defaultModel: 'glm-4.7',
    modelHint: 'glm-4.7',
    docsUrl: 'https://docs.z.ai/guides/overview/quick-start',
  },
];

// --- localStorage keys ---
// Global slots hold the *active* provider's values (used by api.ts / UploadPage).
// Per-provider maps keep a history so switching back to a provider restores
// the model id + api key previously saved for it.
const LS_KEY_API_KEY = 'rg_api_key';
const LS_KEY_PROVIDER = 'rg_provider_id';
const LS_KEY_MODEL = 'rg_model_name';
const LS_KEY_MODELS = 'rg_models'; // JSON map: providerId -> modelName
const LS_KEY_KEYS = 'rg_api_keys'; // JSON map: providerId -> apiKey

function readJsonMap(key: string): Record<string, string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getStoredProviderId(): string | null {
  return localStorage.getItem(LS_KEY_PROVIDER);
}

export function getStoredApiKey(): string | null {
  return localStorage.getItem(LS_KEY_API_KEY);
}

export function getStoredModelName(): string | null {
  return localStorage.getItem(LS_KEY_MODEL);
}

/**
 * Returns the model id last saved for a given provider.
 * Falls back to the global slot for backward-compat with the active provider.
 */
export function getStoredModelForProvider(providerId: string): string | null {
  const map = readJsonMap(LS_KEY_MODELS);
  if (map[providerId]) return map[providerId];
  if (providerId === getStoredProviderId()) return getStoredModelName();
  return null;
}

/**
 * Returns the api key last saved for a given provider.
 * Falls back to the global slot for backward-compat with the active provider.
 */
export function getStoredKeyForProvider(providerId: string): string | null {
  const map = readJsonMap(LS_KEY_KEYS);
  if (map[providerId]) return map[providerId];
  if (providerId === getStoredProviderId()) return getStoredApiKey();
  return null;
}

export function getProviderConfig(id: string): ProviderConfig | undefined {
  return PROVIDERS.find(p => p.id === id);
}

export function getCurrentProvider(): ProviderConfig | undefined {
  const id = getStoredProviderId();
  return id ? getProviderConfig(id) : undefined;
}

export function saveSettings(providerId: string, apiKey: string, modelName: string): void {
  // Active (global) slots — consumed by api.ts / UploadPage.tsx
  localStorage.setItem(LS_KEY_PROVIDER, providerId);
  localStorage.setItem(LS_KEY_API_KEY, apiKey);
  localStorage.setItem(LS_KEY_MODEL, modelName);

  // Per-provider history
  const models = readJsonMap(LS_KEY_MODELS);
  models[providerId] = modelName;
  localStorage.setItem(LS_KEY_MODELS, JSON.stringify(models));

  const keys = readJsonMap(LS_KEY_KEYS);
  keys[providerId] = apiKey;
  localStorage.setItem(LS_KEY_KEYS, JSON.stringify(keys));
}

export function clearSettings(): void {
  localStorage.removeItem(LS_KEY_PROVIDER);
  localStorage.removeItem(LS_KEY_API_KEY);
  localStorage.removeItem(LS_KEY_MODEL);
  localStorage.removeItem(LS_KEY_MODELS);
  localStorage.removeItem(LS_KEY_KEYS);
}

export function hasSettings(): boolean {
  return !!(getStoredProviderId() && getStoredApiKey() && getStoredModelName());
}

/**
 * Returns the headers needed for backend API calls.
 * These are sent per-request; the backend never stores them.
 */
export function getAuthHeaders(): Record<string, string> {
  const provider = getCurrentProvider();
  return {
    'X-API-Key': getStoredApiKey() || '',
    'X-Provider-URL': provider?.baseUrl || '',
    'X-Model-Name': getStoredModelName() || '',
  };
}
