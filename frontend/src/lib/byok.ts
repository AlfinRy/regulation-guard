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
    defaultModel: 'claude-3-5-sonnet-20241022',
    modelHint: 'claude-3-5-sonnet-20241022, claude-3-haiku-20240307',
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
    modelHint: 'gpt-4o, gpt-4o-mini, gpt-4-turbo',
    docsUrl: 'https://platform.openai.com/docs/models',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    logo: '🟣',
    icon: 'openrouter.svg',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o',
    modelHint: 'openai/gpt-4o, anthropic/claude-3.5-sonnet, google/gemini-2.0-flash',
    docsUrl: 'https://openrouter.ai/models',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    logo: '🦙',
    icon: 'ollama.svg',
    baseUrl: 'https://ollama.com/api',
    defaultModel: 'llama3',
    modelHint: 'llama3, mistral, codellama',
    docsUrl: 'https://ollama.com/library',
  },
  {
    id: 'groq',
    name: 'Groq',
    logo: '⚡',
    icon: 'groq.svg',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    modelHint: 'llama-3.3-70b-versatile, mixtral-8x7b-32768',
    docsUrl: 'https://console.groq.com/docs/models',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    logo: '🌀',
    icon: 'mistral.svg',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    modelHint: 'mistral-large-latest, codestral-latest',
    docsUrl: 'https://docs.mistral.ai/getting-started/models/',
  },
  {
    id: 'together',
    name: 'Together AI',
    logo: '🤝',
    icon: 'togetherai.svg',
    baseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3-70b-chat-hf',
    modelHint: 'meta-llama/Llama-3-70b-chat-hf, mistralai/Mixtral-8x7B-Instruct-v0.1',
    docsUrl: 'https://docs.together.ai/docs/inference-models',
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    logo: '🎆',
    icon: 'fireworks.svg',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
    modelHint: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
    docsUrl: 'https://docs.fireworks.ai/',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    logo: '💎',
    icon: 'gemini.svg',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-1.5-flash',
    modelHint: 'gemini-1.5-flash, gemini-1.5-pro',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
  },
  {
    id: 'xai',
    name: 'xAI Grok',
    logo: '✖️',
    icon: 'xai.svg',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-2',
    modelHint: 'grok-2, grok-2-mini',
    docsUrl: 'https://docs.x.ai/docs/',
  },
  {
    id: 'zai',
    name: 'Z.AI (Zhipu)',
    logo: '🔮',
    icon: 'zai.svg',
    baseUrl: 'https://api.z.ai/api/paas/v4',
    defaultModel: 'glm-4',
    modelHint: 'glm-4, glm-4-flash',
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
const LS_KEY_API_KEY = 'rg_api_key';
const LS_KEY_PROVIDER = 'rg_provider_id';
const LS_KEY_MODEL = 'rg_model_name';

export function getStoredProviderId(): string | null {
  return localStorage.getItem(LS_KEY_PROVIDER);
}

export function getStoredApiKey(): string | null {
  return localStorage.getItem(LS_KEY_API_KEY);
}

export function getStoredModelName(): string | null {
  return localStorage.getItem(LS_KEY_MODEL);
}

export function getProviderConfig(id: string): ProviderConfig | undefined {
  return PROVIDERS.find(p => p.id === id);
}

export function getCurrentProvider(): ProviderConfig | undefined {
  const id = getStoredProviderId();
  return id ? getProviderConfig(id) : undefined;
}

export function saveSettings(providerId: string, apiKey: string, modelName: string): void {
  localStorage.setItem(LS_KEY_PROVIDER, providerId);
  localStorage.setItem(LS_KEY_API_KEY, apiKey);
  localStorage.setItem(LS_KEY_MODEL, modelName);
}

export function clearSettings(): void {
  localStorage.removeItem(LS_KEY_PROVIDER);
  localStorage.removeItem(LS_KEY_API_KEY);
  localStorage.removeItem(LS_KEY_MODEL);
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
