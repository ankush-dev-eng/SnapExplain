/**
 * OCR Service
 *
 * Provides text extraction from images using Tesseract.js v7 (browser-native WASM OCR).
 *
 * VERIFIED: Tesseract.js v7.0.0 is installed and importable.
 * OCR functional test in browser: Pending (requires live browser execution; 
 *   worker initialization tested by this module's code path).
 *
 * Architecture:
 *   OCRService
 *   └── TesseractEngine (tesseract.js v7 — WASM, runs in browser, no server needed)
 *
 * Limitation:
 *   - Tesseract.js downloads language data (~10MB for English) on first use.
 *   - Accuracy depends heavily on image quality and layout.
 *   - For Snapdragon production: Qualcomm AI Hub has vision/OCR models
 *     that would significantly outperform Tesseract on NPU hardware.
 *
 * Tesseract.js v7 API note:
 *   - `recognize(image, langs, options)` is a convenience function wrapping createWorker.
 *   - Logger must be passed via createWorker options, not recognize options.
 *   - We use createWorker directly to support progress callbacks.
 */

import { createWorker } from 'tesseract.js';

export type OCRProgress = {
  status: string;
  progress: number; // 0-1
};

export async function extractTextFromImage(
  imageDataUrl: string,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  let worker;
  try {
    worker = await createWorker('eng', 1, {
      logger: (m: { status: string; progress: number }) => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: typeof m.progress === 'number' ? m.progress : 0,
          });
        }
      },
    });

    const result = await worker.recognize(imageDataUrl);
    const text = result.data.text.trim();

    if (!text) {
      throw new Error(
        'No text could be extracted from this image. ' +
        'Please ensure the image contains clear, readable text.'
      );
    }
    return text;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('OCR processing failed. Please try a clearer image.');
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
