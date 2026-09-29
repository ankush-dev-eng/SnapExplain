import { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import type { MCQuestion } from '../ai/types';

interface MCQPanelProps {
  mcqs: MCQuestion[];
}

interface QuestionState {
  selectedOptionId: string | null;
  showExplanation: boolean;
  submitted: boolean;
}

export function MCQPanel({ mcqs }: MCQPanelProps) {
  const [states, setStates] = useState<QuestionState[]>(
    mcqs.map(() => ({ selectedOptionId: null, showExplanation: false, submitted: false }))
  );
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  const select = (qIdx: number, optId: string) => {
    if (states[qIdx].submitted) return;
    setStates(prev => prev.map((s, i) => i === qIdx ? { ...s, selectedOptionId: optId } : s));
  };

  const submit = (qIdx: number) => {
    const state = states[qIdx];
    if (!state.selectedOptionId || state.submitted) return;
    setStates(prev => prev.map((s, i) => i === qIdx ? { ...s, submitted: true, showExplanation: true } : s));
  };

  const toggleExplanation = (qIdx: number) => {
    setStates(prev => prev.map((s, i) => i === qIdx ? { ...s, showExplanation: !s.showExplanation } : s));
  };

  const submitAll = () => {
    const newStates = states.map(s =>
      s.selectedOptionId ? { ...s, submitted: true, showExplanation: false } : s
    );
    setStates(newStates);
    const answered = newStates.filter(s => s.submitted);
    const correct = answered.filter((s, i) => s.selectedOptionId === mcqs[i].correctOptionId).length;
    setScore({ correct, total: answered.length });
  };

  const reset = () => {
    setStates(mcqs.map(() => ({ selectedOptionId: null, showExplanation: false, submitted: false })));
    setScore(null);
  };

  const allAnswered = states.every(s => s.selectedOptionId !== null);
  const allSubmitted = states.every(s => s.submitted);

  return (
    <div className="space-y-5">
      {/* Score banner */}
      {score !== null && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border animate-fade-in ${
            score.correct === score.total
              ? 'bg-emerald-950/40 border-emerald-700/40'
              : score.correct >= score.total / 2
              ? 'bg-blue-950/40 border-blue-700/40'
              : 'bg-red-950/40 border-red-700/40'
          }`}
          role="alert"
          aria-live="polite"
        >
          <div>
            <p className="text-sm font-semibold text-white">
              Score: {score.correct}/{score.total}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {score.correct === score.total
                ? '🎉 Perfect score!'
                : score.correct >= score.total / 2
                ? '👍 Good effort!'
                : '📖 Keep studying!'}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            aria-label="Retry quiz"
          >
            Retry Quiz
          </button>
        </div>
      )}

      {/* Questions */}
      {mcqs.map((mcq, qIdx) => {
        const state = states[qIdx];
        const isCorrect = state.submitted && state.selectedOptionId === mcq.correctOptionId;
        const isWrong = state.submitted && state.selectedOptionId !== mcq.correctOptionId;

        return (
          <div
            key={mcq.id}
            className="glass-light rounded-xl p-4 space-y-3 animate-fade-in"
            style={{ animationDelay: `${qIdx * 60}ms` }}
          >
            {/* Question header */}
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                  state.submitted
                    ? isCorrect
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-violet-500/20 border-violet-500/30 text-violet-400'
                }`}
                aria-hidden="true"
              >
                {state.submitted
                  ? isCorrect
                    ? <Check className="w-3.5 h-3.5" />
                    : <X className="w-3.5 h-3.5" />
                  : qIdx + 1
                }
              </div>
              <p className="text-sm font-medium text-slate-200 leading-snug flex-1">
                {mcq.question}
              </p>
            </div>

            {/* Options */}
            <fieldset
              className="space-y-2 ml-10"
              aria-label={`Question ${qIdx + 1} options`}
              disabled={state.submitted}
            >
              <legend className="sr-only">Select an answer for question {qIdx + 1}</legend>
              {mcq.options.map((option) => {
                const isSelected = state.selectedOptionId === option.id;
                const isCorrectOpt = option.id === mcq.correctOptionId;

                let optClass = 'mcq-option';
                if (state.submitted) {
                  if (isSelected && isCorrectOpt) optClass += ' selected-correct';
                  else if (isSelected && !isCorrectOpt) optClass += ' selected-wrong';
                  else if (!isSelected && isCorrectOpt) optClass += ' reveal-correct';
                } else if (isSelected) {
                  optClass += ' border-violet-500/50 bg-violet-500/10';
                }

                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer select-none transition-all ${optClass}`}
                    htmlFor={`q${qIdx}-opt-${option.id}`}
                  >
                    <input
                      id={`q${qIdx}-opt-${option.id}`}
                      type="radio"
                      name={`question-${qIdx}`}
                      value={option.id}
                      checked={isSelected}
                      onChange={() => select(qIdx, option.id)}
                      disabled={state.submitted}
                      className="sr-only"
                      aria-label={option.text}
                    />
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-violet-400 bg-violet-400'
                          : 'border-white/20 bg-transparent'
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-slate-300 flex-1">{option.text}</span>
                    {state.submitted && (
                      isCorrectOpt ? (
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                      ) : isSelected ? (
                        <X className="w-4 h-4 text-red-400 flex-shrink-0" aria-hidden="true" />
                      ) : null
                    )}
                  </label>
                );
              })}
            </fieldset>

            {/* Action row */}
            <div className="ml-10 flex items-center gap-3">
              {!state.submitted && (
                <button
                  type="button"
                  onClick={() => submit(qIdx)}
                  disabled={!state.selectedOptionId}
                  className="text-xs px-3 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
                  aria-label={`Submit answer for question ${qIdx + 1}`}
                >
                  Submit Answer
                </button>
              )}

              {state.submitted && (
                <button
                  type="button"
                  onClick={() => toggleExplanation(qIdx)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  aria-expanded={state.showExplanation}
                  aria-controls={`explanation-${qIdx}`}
                >
                  <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Explanation
                  {state.showExplanation
                    ? <ChevronUp className="w-3 h-3" aria-hidden="true" />
                    : <ChevronDown className="w-3 h-3" aria-hidden="true" />
                  }
                </button>
              )}

              {isWrong && (
                <span className="text-xs text-red-400" aria-live="polite">
                  Incorrect
                </span>
              )}
              {isCorrect && (
                <span className="text-xs text-emerald-400" aria-live="polite">
                  Correct!
                </span>
              )}
            </div>

            {/* Explanation */}
            {state.showExplanation && state.submitted && (
              <div
                id={`explanation-${qIdx}`}
                className="ml-10 p-3 rounded-lg bg-blue-950/40 border border-blue-700/30 text-xs text-blue-200 leading-relaxed animate-fade-in"
                role="note"
                aria-label={`Explanation for question ${qIdx + 1}`}
              >
                {mcq.explanation}
              </div>
            )}
          </div>
        );
      })}

      {/* Bulk action */}
      {!allSubmitted && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={submitAll}
            disabled={!allAnswered}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-violet-600/80 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            aria-label="Submit all answers at once"
          >
            Submit All Answers
          </button>
        </div>
      )}

      {allSubmitted && score === null && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              const answered = states.filter(s => s.submitted);
              const correct = answered.filter((s, i) => s.selectedOptionId === mcqs[i].correctOptionId).length;
              setScore({ correct, total: answered.length });
            }}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-emerald-600/80 hover:bg-emerald-600 text-white transition-colors"
          >
            View Score
          </button>
        </div>
      )}
    </div>
  );
}
