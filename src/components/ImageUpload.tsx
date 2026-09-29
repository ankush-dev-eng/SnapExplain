import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, ImageIcon, FileText, Loader2 } from 'lucide-react';
import { fileToDataUrl, isImageFile, extractTextFromImage } from '../services/ocr';
import type { OCRProgress } from '../services/ocr';

interface ImageUploadProps {
  onTextExtracted: (text: string, dataUrl: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ onTextExtracted, onError, disabled }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!isImageFile(file)) {
      onError('Please upload an image file (PNG, JPG, JPEG, WebP, GIF, BMP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('Image file is too large. Please use an image smaller than 10MB.');
      return;
    }

    setIsProcessing(true);
    setOcrProgress(null);
    setFileName(file.name);

    try {
      const dataUrl = await fileToDataUrl(file);
      setPreviewUrl(dataUrl);

      const text = await extractTextFromImage(dataUrl, (progress) => {
        setOcrProgress(progress);
      });

      onTextExtracted(text, dataUrl);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to process image.');
      setPreviewUrl(null);
      setFileName(null);
    } finally {
      setIsProcessing(false);
      setOcrProgress(null);
    }
  }, [onTextExtracted, onError]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isProcessing) return;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [disabled, isProcessing, processFile]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isProcessing) setIsDragOver(true);
  }, [disabled, isProcessing]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [processFile]);

  const handleClear = useCallback(() => {
    setPreviewUrl(null);
    setFileName(null);
    setOcrProgress(null);
  }, []);

  const getProgressLabel = (progress: OCRProgress) => {
    const pct = Math.round(progress.progress * 100);
    const status = progress.status.replace(/_/g, ' ');
    return `${status} ${pct}%`;
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled || isProcessing ? -1 : 0}
        aria-label="Drop zone for image upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${isDragOver ? 'drop-zone-active' : 'border-white/10 hover:border-violet-500/40 hover:bg-white/[0.02]'}
          ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isProcessing}
          aria-label="Upload image file"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-violet-300">Extracting text from image…</p>
              {ocrProgress && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">{getProgressLabel(ocrProgress)}</p>
                  <div className="w-40 mx-auto h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress.progress * 100}%` }}
                      role="progressbar"
                      aria-valuenow={Math.round(ocrProgress.progress * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Uploaded study material"
                className="max-h-32 max-w-full rounded-lg border border-white/10 object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span className="text-sm text-emerald-400 font-medium">{fileName}</span>
              <span className="text-xs text-slate-500">· Text extracted</span>
            </div>
            <p className="text-xs text-slate-400">Click to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-violet-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Drop an image here</p>
              <p className="text-xs text-slate-500 mt-0.5">or click to browse</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>PNG, JPG, WebP, GIF, BMP · max 10MB</span>
            </div>
          </div>
        )}
      </div>

      {previewUrl && (
        <button
          type="button"
          onClick={handleClear}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors py-1"
          aria-label="Remove uploaded image"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          Remove image
        </button>
      )}
    </div>
  );
}
