import { ProviderConfig } from '../../lib/byok';

import anthropicSvg from '@assets/providers/anthropic.svg';
import deepseekSvg from '@assets/providers/deepseek.svg';
import openaiSvg from '@assets/providers/openai.svg';
import openrouterSvg from '@assets/providers/openrouter.svg';
import ollamaSvg from '@assets/providers/ollama.svg';
import groqSvg from '@assets/providers/groq.svg';
import mistralSvg from '@assets/providers/mistral.svg';
import togetheraiSvg from '@assets/providers/togetherai.svg';
import geminiSvg from '@assets/providers/gemini.svg';
import xaiSvg from '@assets/providers/xai.svg';
import zaiSvg from '@assets/providers/zai.svg';
import fireworksSvg from '@assets/providers/fireworks.svg';

const ICON_MAP: Record<string, string> = {
  'anthropic.svg': anthropicSvg,
  'deepseek.svg': deepseekSvg,
  'openai.svg': openaiSvg,
  'openrouter.svg': openrouterSvg,
  'ollama.svg': ollamaSvg,
  'groq.svg': groqSvg,
  'mistral.svg': mistralSvg,
  'togetherai.svg': togetheraiSvg,
  'fireworks.svg': fireworksSvg,
  'gemini.svg': geminiSvg,
  'xai.svg': xaiSvg,
  'zai.svg': zaiSvg,
};

interface ProviderIconProps {
  provider: ProviderConfig;
  size?: number;
  className?: string;
}

export default function ProviderIcon({ provider, size = 16, className = '' }: ProviderIconProps) {
  const src = ICON_MAP[provider.icon];

  if (!src) {
    // Fallback to emoji
    return (
      <span
        className={`inline-flex items-center justify-center leading-none ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.8 }}
      >
        {provider.logo}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={provider.name}
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
    />
  );
}
