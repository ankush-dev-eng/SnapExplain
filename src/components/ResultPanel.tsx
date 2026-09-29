import { useState } from 'react';
import {
  FileText, Lightbulb, List, HelpCircle, MessageSquare,
  ChevronRight
} from 'lucide-react';
import { CopyButton } from './CopyButton';
import { MCQPanel } from './MCQPanel';
import { ChatPanel } from './ChatPanel';
import type { StudyResult, StudyMaterial } from '../ai/types';
import type { AIProvider } from '../ai/types';

interface ResultPanelProps {
  result: StudyResult;
  material: StudyMaterial;
  provider: AIProvider;
}

type TabId = 'explanation' | 'summary' | 'keypoints' | 'mcqs' | 'chat';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  shortLabel: string;
}

const TABS: Tab[] = [
  { id: 'explanation', label: 'Explanation', shortLabel: 'Explain', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'summary', label: 'Summary', shortLabel: 'Summary', icon: <FileText className="w-4 h-4" /> },
  { id: 'keypoints', label: 'Key Points', shortLabel: 'Keys', icon: <List className="w-4 h-4" /> },
  { id: 'mcqs', label: 'Quiz (MCQs)', shortLabel: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
  { id: 'chat', label: 'Ask AI', shortLabel: 'Ask', icon: <MessageSquare className="w-4 h-4" /> },
];

// Convert **bold** markdown to JSX
function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="text-slate-200 font-semibold">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

export function ResultPanel({ result, material, provider }: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('explanation');

  const renderContent = () => {
    switch (activeTab) {
      case 'explanation':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                Simple Explanation
              </h3>
              <CopyButton
                text={result.explanation.replace(/\*\*/g, '')}
                label="Copy"
                aria-label="Copy explanation"
              />
            </div>
            <div className="prose-snap text-sm leading-7 space-y-3">
              {result.explanation.split('\n\n').map((para, i) => (
                <p key={i}>{renderMarkdown(para)}</p>
              ))}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" aria-hidden="true" />
                Summary
              </h3>
              <CopyButton text={result.summary} label="Copy" />
            </div>
            <div className="bg-white/3 border border-white/8 rounded-xl p-5">
              <p className="text-sm text-slate-300 leading-relaxed prose-snap">
                {result.summary}
              </p>
            </div>
          </div>
        );

      case 'keypoints':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <List className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                Key Points
              </h3>
              <CopyButton
                text={result.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}
                label="Copy All"
              />
            </div>
            <ul className="space-y-2" aria-label="Key points list">
              {result.keyPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-white/3 border border-white/8 hover:border-emerald-500/20 transition-all group animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span
                    className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 mt-0.5"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300 leading-relaxed flex-1">{point}</span>
                  <ChevronRight
                    className="w-4 h-4 text-slate-600 group-hover:text-emerald-500/50 shrink-0 mt-0.5 transition-colors"
                    aria-hidden="true"
                  />
                </li>
              ))}
            </ul>
          </div>
        );

      case 'mcqs':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-violet-400" aria-hidden="true" />
                Practice Quiz
                <span className="text-xs font-normal text-slate-500">
                  {result.mcqs.length} questions
                </span>
              </h3>
            </div>
            <MCQPanel mcqs={result.mcqs} />
          </div>
        );

      case 'chat':
        return (
          <div className="animate-fade-in">
            <ChatPanel material={material} provider={provider} />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <nav aria-label="Result sections" role="tablist">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap shrink-0 ${
                activeTab === tab.id ? 'tab-active' : 'tab-inactive border-white/5'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Panel content */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="glass rounded-2xl p-5"
      >
        {renderContent()}
      </div>
    </div>
  );
}
