/**
 * LocalLLMProvider — Placeholder for genuine on-device LLM integration.
 *
 * STATUS: NOT IMPLEMENTED / NOT AVAILABLE IN CURRENT ENVIRONMENT
 *
 * This provider is the intended production implementation for Snapdragon-powered
 * Windows PCs. It will connect to a locally-running language model via one of:
 *
 * Option 1: WebLLM (WASM/WebGPU)
 *   - https://webllm.mlc.ai/
 *   - Runs Llama 3 / Phi-3 / Gemma models in-browser via WebGPU
 *   - Works today on Chrome with WebGPU support
 *
 * Option 2: Qualcomm AI Hub
 *   - https://aihub.qualcomm.com/
 *   - Deploy optimized models to Snapdragon NPU
 *   - Requires Qualcomm SDK and native bridge
 *
 * Option 3: ONNX Runtime Web
 *   - https://onnxruntime.ai/docs/get-started/with-javascript/web.html
 *   - Run quantized ONNX models in browser
 *   - Phi-3-mini-4k-instruct-onnx supports WebGPU
 *
 * Option 4: llama.cpp server
 *   - Run locally at http://localhost:8080
 *   - Use Snapdragon-optimized quantized models
 *
 * To enable: implement the analyze() and chat() methods below,
 * pointing to whichever runtime is available, then set this as the
 * active provider in providerFactory.ts.
 *
 * VERIFIED: Not tested. Not available in current environment.
 */

import type { AIProvider, StudyMaterial, StudyResult, ChatMessage } from './types';

export class LocalLLMProvider implements AIProvider {
  name = 'Local LLM (On-Device — Not Available)';
  description =
    'On-device neural language model for Snapdragon-powered Windows PCs. ' +
    'Not available in the current environment. See LocalLLMProvider.ts for integration instructions.';
  isLocal = true;

  isAvailable(): boolean {
    // TODO: Check for WebGPU support or local server availability
    // Example for WebGPU: return 'gpu' in navigator;
    // Example for llama.cpp: ping http://localhost:8080/health
    return false;
  }

  async analyze(_material: StudyMaterial): Promise<StudyResult> {
    throw new Error(
      'LocalLLMProvider is not implemented. ' +
      'See src/ai/LocalLLMProvider.ts for integration instructions. ' +
      'Using DemoProvider as fallback.'
    );
  }

  async chat(
    _material: StudyMaterial,
    _history: ChatMessage[],
    _userMessage: string
  ): Promise<string> {
    throw new Error('LocalLLMProvider is not implemented.');
  }
}
