import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, User, Bot, MessageSquare, Trash2 } from 'lucide-react';
import type { StudyMaterial, ChatMessage } from '../ai/types';
import type { AIProvider } from '../ai/types';

interface ChatPanelProps {
  material: StudyMaterial;
  provider: AIProvider;
}

export function ChatPanel({ material, provider }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await provider.chat(material, [...messages, userMsg], trimmed);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
      // Focus back to input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, isLoading, material, messages, provider]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const SUGGESTED_QUESTIONS = [
    'Summarize this content',
    'What are the key concepts?',
    'Explain this in simple terms',
    'What should I focus on?',
  ];

  return (
    <div className="flex flex-col h-[560px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-400" aria-hidden="true" />
          <span className="text-sm font-medium text-slate-300">Ask about this content</span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
            aria-label="Clear chat history"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-violet-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Ask anything about the content</p>
              <p className="text-xs text-slate-600 mt-1">Powered by in-browser text analysis</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/40 text-slate-400 hover:text-violet-300 transition-all"
                  aria-label={`Suggested question: ${q}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'user'
                    ? 'bg-violet-600/30 text-violet-400'
                    : 'bg-blue-600/20 text-blue-400'
                }`}
                aria-hidden="true"
              >
                {msg.role === 'user'
                  ? <User className="w-4 h-4" />
                  : <Bot className="w-4 h-4" />
                }
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-violet-600/20 border border-violet-500/20 text-slate-200 rounded-tr-sm'
                    : 'bg-white/5 border border-white/8 text-slate-300 rounded-tl-sm'
                }`}
                role={msg.role === 'assistant' ? 'article' : undefined}
                aria-label={msg.role === 'assistant' ? 'Assistant response' : 'Your message'}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 animate-fade-in" aria-live="polite" aria-label="Loading response">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-400" aria-hidden="true" />
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" aria-hidden="true" />
              <span className="text-sm text-slate-400">Analyzing…</span>
            </div>
          </div>
        )}

        {error && (
          <div
            className="p-3 rounded-xl bg-red-950/40 border border-red-700/40 text-sm text-red-300"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <label htmlFor="chat-input" className="sr-only">
            Ask a question about the study content
          </label>
          <textarea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question… (Enter to send, Shift+Enter for newline)"
            rows={1}
            style={{ resize: 'none' }}
            className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors min-h-[48px] max-h-[120px] overflow-y-auto"
            aria-label="Chat input"
            aria-multiline="true"
            disabled={isLoading}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
        </div>
        <button
          type="button"
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Send message"
        >
          {isLoading
            ? <Loader2 className="w-5 h-5 text-white animate-spin" aria-hidden="true" />
            : <Send className="w-5 h-5 text-white" aria-hidden="true" />
          }
        </button>
      </div>
    </div>
  );
}
