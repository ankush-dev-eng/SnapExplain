import { useState, useCallback, useRef } from 'react';
import {
  Zap, Type, Image, RotateCcw, AlertCircle, ChevronDown, ChevronUp,
  BookOpen, Loader2, Sparkles, Cpu
} from 'lucide-react';
import { getProvider } from './ai/providerFactory';
import type { StudyResult, StudyMaterial } from './ai/types';
import { ProviderBadge } from './components/ProviderBadge';
import { ImageUpload } from './components/ImageUpload';
import { ResultPanel } from './components/ResultPanel';
import { ResultSkeleton } from './components/LoadingSkeleton';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_TEXT = `TCP/IP is the protocol suite used for communication across interconnected networks. It organizes communication into layers responsible for application services, transport, internet addressing and routing, and network access.

Think of TCP/IP as a set of rules that lets devices communicate. IP handles where data should go, while transport protocols such as TCP manage how data is delivered.

Key concepts:
- TCP provides reliable, ordered, and error-checked delivery of a stream of octets.
- IP handles the logical addressing and routing of packets across network boundaries.
- UDP is connectionless and does not guarantee delivery or ordering, used when speed is prioritized over reliability.
- DNS translates human-readable domain names to IP addresses.`;

const MAX_TEXT_LENGTH = 15000;

// ─── Types ────────────────────────────────────────────────────────────────────

type InputMode = 'text' | 'image';
type AppState = 'idle' | 'loading' | 'success' | 'error';

// ─── App Component ────────────────────────────────────────────────────────────

const provider = getProvider();

export default function App() {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<StudyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDemo = provider.name.toLowerCase().includes('demo');

  const handleProcess = useCallback(async () => {
    const trimmed = textInput.trim();
    if (!trimmed) {
      setError('Please enter or paste some text to analyze.');
      return;
    }
    if (trimmed.length < 20) {
      setError('Please provide more text — at least a few sentences for meaningful analysis.');
      return;
    }

    const studyMaterial: StudyMaterial = { text: trimmed, imageDataUrl };
    setMaterial(studyMaterial);
    setAppState('loading');
    setError(null);
    setResult(null);

    try {
      const res = await provider.analyze(studyMaterial);
      setResult(res);
      setAppState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setAppState('error');
    }
  }, [textInput, imageDataUrl]);

  const handleReset = useCallback(() => {
    setTextInput('');
    setImageDataUrl(undefined);
    setResult(null);
    setError(null);
    setAppState('idle');
    setShowImageUpload(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const loadDemo = useCallback(() => {
    setTextInput(DEMO_TEXT);
    setAppState('idle');
    setResult(null);
    setError(null);
    setInputMode('text');
    setShowImageUpload(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const handleImageTextExtracted = useCallback((text: string, dataUrl: string) => {
    setTextInput(prev => prev ? `${prev}\n\n${text}` : text);
    setImageDataUrl(dataUrl);
    setShowImageUpload(false);
    setInputMode('text');
  }, []);

  const handleImageError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  const charCount = textInput.length;
  const charPercent = Math.min((charCount / MAX_TEXT_LENGTH) * 100, 100);
  const isOverLimit = charCount > MAX_TEXT_LENGTH;

  return (
    <div className="min-h-screen bg-[#0a0b1a] relative overflow-x-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500/6 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="mb-10 sm:mb-14">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center glow-purple"
                  aria-hidden="true"
                >
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                    SnapExplain
                  </h1>
                  <p className="text-xs text-slate-500">AI Study Assistant</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Privacy-first study assistant for{' '}
                <span className="text-slate-300 font-medium">Snapdragon-powered Windows PCs</span>.
                Paste text or upload an image — get instant explanations, summaries, key points, and quizzes.
                Runs locally in your browser.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <ProviderBadge
                providerName={provider.name}
                isLocal={provider.isLocal}
                isDemo={isDemo}
              />
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Cpu className="w-3 h-3" aria-hidden="true" />
                <span>No data leaves your device</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Input Card ──────────────────────────────────────────── */}
        <section aria-label="Study material input" className="mb-6">
          <div className="glass rounded-2xl p-5 sm:p-6 space-y-5">

            {/* Input mode tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                aria-pressed={inputMode === 'text'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  inputMode === 'text' ? 'tab-active' : 'tab-inactive border-white/5'
                }`}
              >
                <Type className="w-4 h-4" aria-hidden="true" />
                Text
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('image');
                  setShowImageUpload(true);
                }}
                aria-pressed={inputMode === 'image'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  inputMode === 'image' ? 'tab-active' : 'tab-inactive border-white/5'
                }`}
              >
                <Image className="w-4 h-4" aria-hidden="true" />
                Image / Screenshot
              </button>
            </div>

            {/* Image upload section */}
            {(inputMode === 'image' || showImageUpload) && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Upload an image with text — OCR will extract the content automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowImageUpload(s => !s)}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showImageUpload ? 'Collapse image upload' : 'Expand image upload'}
                  >
                    {showImageUpload
                      ? <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      : <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    }
                  </button>
                </div>
                {showImageUpload && (
                  <ImageUpload
                    onTextExtracted={handleImageTextExtracted}
                    onError={handleImageError}
                    disabled={appState === 'loading'}
                  />
                )}
              </div>
            )}

            {/* Text area */}
            <div className="space-y-2">
              <label htmlFor="study-text" className="sr-only">
                Study material text
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  id="study-text"
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Paste or type your study material here…&#10;&#10;Textbook passages, notes, articles, lecture content — anything you want to understand better."
                  rows={9}
                  maxLength={MAX_TEXT_LENGTH + 100}
                  disabled={appState === 'loading'}
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all resize-none leading-relaxed font-sans"
                  aria-label="Study material text input"
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'input-error' : 'char-count'}
                />
              </div>

              {/* Character count */}
              <div id="char-count" className="flex items-center justify-between px-1">
                <span className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-slate-600'}`}>
                  {charCount.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()} characters
                </span>
                {charCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverLimit ? 'bg-red-500' : charPercent > 80 ? 'bg-yellow-500' : 'bg-violet-500'
                        }`}
                        style={{ width: `${charPercent}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                id="input-error"
                className="flex items-start gap-3 p-3.5 rounded-xl bg-red-950/40 border border-red-700/40 animate-fade-in"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                id="process-button"
                onClick={handleProcess}
                disabled={appState === 'loading' || !textInput.trim() || isOverLimit}
                className="flex-1 sm:flex-none sm:px-6 py-3 rounded-xl text-sm font-semibold
                  bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500
                  disabled:opacity-40 disabled:cursor-not-allowed
                  text-white transition-all flex items-center justify-center gap-2
                  glow-purple hover:scale-[1.02] active:scale-[0.98]"
                aria-label={appState === 'loading' ? 'Analyzing content…' : 'Analyze study material'}
              >
                {appState === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    Analyze
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={loadDemo}
                disabled={appState === 'loading'}
                className="flex-1 sm:flex-none sm:px-5 py-3 rounded-xl text-sm font-medium
                  bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                  text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all flex items-center justify-center gap-2"
                aria-label="Load photosynthesis demo content"
              >
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                Load Demo
              </button>

              {(textInput || result) && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={appState === 'loading'}
                  className="flex-1 sm:flex-none sm:px-5 py-3 rounded-xl text-sm font-medium
                    bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30
                    text-slate-400 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all flex items-center justify-center gap-2"
                  aria-label="Clear all input and results for new content"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  New Content
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Results ─────────────────────────────────────────────── */}
        <section aria-label="Analysis results" aria-live="polite">
          {appState === 'loading' && (
            <div className="glass rounded-2xl p-5 sm:p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-300">Analyzing your study material…</p>
              </div>
              <ResultSkeleton />
            </div>
          )}

          {appState === 'success' && result && material && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" aria-hidden="true" />
                <p className="text-xs text-slate-500 font-medium">Analysis complete</p>
              </div>
              <ResultPanel result={result} material={material} provider={provider} />
            </div>
          )}

          {appState === 'error' && (
            <div
              className="glass rounded-2xl p-5 sm:p-6 animate-fade-in"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-red-300">Analysis Failed</h2>
                  <p className="text-sm text-slate-400">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAppState('idle');
                      setError(null);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {appState === 'idle' && !textInput && (
            <div className="text-center py-16 space-y-4" aria-label="Getting started guide">
              <div
                className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-white/5 items-center justify-center"
                aria-hidden="true"
              >
                <BookOpen className="w-8 h-8 text-violet-400/60" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-medium text-slate-400">Ready to study smarter</h2>
                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Paste study material above, upload a screenshot, or try the demo to see what SnapExplain can do.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-600">
                {['Explanations', 'Summaries', 'Key Points', 'Quizzes', 'AI Chat'].map(feature => (
                  <span key={feature} className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/8">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="mt-16 pt-8 border-t border-white/5 text-center space-y-2">
          <p className="text-xs text-slate-600">
            SnapExplain runs entirely in your browser. No data is sent to any server.
          </p>
          <p className="text-xs text-slate-700">
            Built for{' '}
            <span className="text-slate-600">Snapdragon-powered Windows PCs</span>.{' '}
            Demo mode uses in-browser text analysis (no neural model).
          </p>
        </footer>
      </div>
    </div>
  );
}
