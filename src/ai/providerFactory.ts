/**
 * AI Provider Factory
 *
 * Selects the best available AI provider at runtime.
 * Priority order:
 *   1. LocalLLMProvider (if available — not available in current env)
 *   2. DemoProvider (always available fallback)
 *
 * To add a new provider:
 *   1. Implement AIProvider interface
 *   2. Add to PROVIDERS array below
 *   3. Higher index = lower priority
 */

import type { AIProvider } from './types';
import { DemoProvider } from './DemoProvider';
import { LocalLLMProvider } from './LocalLLMProvider';

const PROVIDERS: AIProvider[] = [
  new LocalLLMProvider(),
  new DemoProvider(),
];

export function getProvider(): AIProvider {
  for (const provider of PROVIDERS) {
    if (provider.isAvailable()) {
      return provider;
    }
  }
  // DemoProvider always returns true, so this should never be reached
  return new DemoProvider();
}

export { DemoProvider, LocalLLMProvider };
export type { AIProvider };
