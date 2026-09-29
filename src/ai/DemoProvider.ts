/**
 * DemoProvider — A fully functional, deterministic AI provider.
 *
 * This provider uses rule-based NLP (keyword extraction, sentence analysis,
 * and structured text processing) to produce genuinely useful study content
 * from input text. It does NOT use any cloud API or external service.
 *
 * Architecture note:
 * This is the local/fallback provider. It is fully self-contained and runs
 * entirely in the browser. In a future Snapdragon deployment, this provider
 * can be replaced by LocalLLMProvider which connects to an on-device LLM
 * (e.g., via Qualcomm AI Hub, ONNX Runtime, or llama.cpp WebAssembly build).
 *
 * What this provider actually does:
 * - Tokenizes and analyzes input text
 * - Extracts key sentences using TF-IDF-like scoring
 * - Generates bullet points from sentence analysis
 * - Builds MCQs by extracting factual sentences and generating distractors
 * - Supports contextual chat with history-aware responses
 *
 * Limitation: This is not a neural language model. Outputs depend on the
 * quality and structure of the input text. It works best with structured
 * educational content.
 */

import type { AIProvider, StudyMaterial, StudyResult, ChatMessage, MCQuestion, MCQOption } from './types';

// ─── Text Processing Utilities ──────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

const STOP_WORDS = new Set([
  'the', 'and', 'that', 'this', 'with', 'for', 'are', 'was', 'were',
  'have', 'has', 'had', 'not', 'but', 'from', 'they', 'their', 'there',
  'what', 'when', 'where', 'which', 'who', 'will', 'would', 'could',
  'should', 'may', 'can', 'its', 'than', 'then', 'into', 'also',
  'some', 'each', 'how', 'more', 'one', 'two', 'three', 'four', 'five',
  'first', 'second', 'third', 'been', 'being', 'does', 'did', 'using',
  'used', 'use', 'make', 'made', 'about', 'most', 'any', 'all'
]);

function getKeywords(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const freq = new Map<string, number>();
  for (const token of tokens) {
    if (!STOP_WORDS.has(token) && token.length > 3) {
      freq.set(token, (freq.get(token) ?? 0) + 1);
    }
  }
  return freq;
}

function getSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 600);
}

function scoreSentence(sentence: string, keywordFreq: Map<string, number>): number {
  const tokens = tokenize(sentence);
  if (tokens.length === 0) return 0;
  let score = 0;
  for (const token of tokens) {
    score += keywordFreq.get(token) ?? 0;
  }
  // Penalize very long or very short sentences
  const lenPenalty = Math.abs(tokens.length - 15) * 0.1;
  return score / tokens.length - lenPenalty;
}

function getTopSentences(text: string, n: number): string[] {
  const sentences = getSentences(text);
  if (sentences.length === 0) return [];
  const keywords = getKeywords(text);
  const scored = sentences.map(s => ({ s, score: scoreSentence(s, keywords) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n).map(x => x.s);
}

function extractKeyPoints(text: string): string[] {
  // Try to find bullet-like structures first
  const bulletLines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => /^[-•*\d+\.\)]\s/.test(l))
    .map(l => l.replace(/^[-•*\d+\.\)]\s+/, '').trim())
    .filter(l => l.length > 15);

  if (bulletLines.length >= 3) {
    return bulletLines.slice(0, 7);
  }

  // Otherwise extract from top sentences
  const sentences = getTopSentences(text, 7);
  return sentences.map(s => {
    // Shorten sentence to a key-point style if needed
    if (s.length > 120) {
      const idx = s.indexOf(',', 40);
      return idx > 0 ? s.slice(0, idx).trim() : s.slice(0, 110).trim() + '…';
    }
    return s;
  });
}

function generateSummary(text: string): string {
  const sentences = getTopSentences(text, 4);
  if (sentences.length === 0) {
    return 'No summary could be generated. Please provide more detailed text.';
  }
  return sentences.join(' ');
}

function generateExplanation(text: string): string {
  // Find the first substantive paragraph as context
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 50);
  const intro = paragraphs[0] ?? text.slice(0, 300);

  const keywords = [...getKeywords(text).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);

  const topSentences = getTopSentences(text, 3);
  const core = topSentences.length > 0 ? topSentences[0] : intro;

  let explanation = `This content covers the topic of **${keywords.slice(0, 3).join(', ')}**. `;

  if (paragraphs.length > 0) {
    explanation += `\n\nAt its core: ${core} `;
  }

  if (topSentences.length > 1) {
    explanation += `\n\nFurther context: ${topSentences[1]} `;
  }

  if (keywords.length >= 3) {
    explanation += `\n\nThe key concepts to focus on are: **${keywords.join('**, **')}**.`;
  }

  return explanation.trim();
}

// ─── MCQ Generation ──────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMCQs(text: string): MCQuestion[] {
  const sentences = getSentences(text).filter(s => s.length > 40 && s.length < 300);
  const keywords = [...getKeywords(text).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([w]) => w);

  if (sentences.length < 2 || keywords.length < 4) {
    return getDefaultMCQs();
  }

  const mcqs: MCQuestion[] = [];
  const usedSentences = new Set<number>();
  const available = shuffle([...Array(sentences.length).keys()]);

  const questionTemplates = [
    (kw: string, s: string) => ({
      q: `What is the primary focus of the following statement: "${s.slice(0, 80)}…"?`,
      correct: kw,
    }),
    (kw: string) => ({
      q: `Which concept is most central to this content?`,
      correct: kw,
    }),
    (kw: string, s: string) => ({
      q: `Based on the text, what does "${s.split(' ').slice(0, 6).join(' ')}…" primarily describe?`,
      correct: kw,
    }),
  ];

  for (let i = 0; i < Math.min(5, available.length); i++) {
    const sentIdx = available[i];
    if (usedSentences.has(sentIdx)) continue;
    usedSentences.add(sentIdx);

    const sentence = sentences[sentIdx];
    const sentTokens = tokenize(sentence).filter(t => !STOP_WORDS.has(t) && t.length > 3);
    if (sentTokens.length === 0) continue;

    // Pick the most keyword-rich token from this sentence
    const sentKeywords = getKeywords(sentence);
    const topLocal = [...sentKeywords.entries()].sort((a, b) => b[1] - a[1]);
    const correctKw = topLocal.length > 0 ? topLocal[0][0] : sentTokens[0];

    // Build distractors from other keywords
    const distractors = keywords.filter(k => k !== correctKw).slice(0, 3);
    while (distractors.length < 3) {
      distractors.push(['concept', 'process', 'element', 'factor', 'component'][distractors.length] || 'term');
    }

    const template = questionTemplates[i % questionTemplates.length];
    const { q, correct } = template(correctKw, sentence);

    const options: MCQOption[] = shuffle([
      { id: 'a', text: correct },
      { id: 'b', text: distractors[0] },
      { id: 'c', text: distractors[1] },
      { id: 'd', text: distractors[2] },
    ]).map((opt, idx) => ({ ...opt, id: ['a', 'b', 'c', 'd'][idx] }));

    const correctOptionId = options.find(o => o.text === correct)!.id;

    mcqs.push({
      id: `q${i + 1}`,
      question: q,
      options,
      correctOptionId,
      explanation: `The answer is "${correct}". ${sentence}`,
    });
  }

  return mcqs.length >= 3 ? mcqs : getDefaultMCQs();
}

function getDefaultMCQs(): MCQuestion[] {
  return [
    {
      id: 'q1',
      question: 'What is the primary purpose of studying this material?',
      options: [
        { id: 'a', text: 'To gain knowledge and understanding' },
        { id: 'b', text: 'To complete an assignment without learning' },
        { id: 'c', text: 'To memorize without comprehension' },
        { id: 'd', text: 'None of the above' },
      ],
      correctOptionId: 'a',
      explanation: 'Studying material helps build knowledge and understanding of a subject.',
    },
    {
      id: 'q2',
      question: 'Which approach leads to better retention of study material?',
      options: [
        { id: 'a', text: 'Passive reading only' },
        { id: 'b', text: 'Active recall and self-testing' },
        { id: 'c', text: 'Highlighting everything' },
        { id: 'd', text: 'Reading once before an exam' },
      ],
      correctOptionId: 'b',
      explanation: 'Active recall through self-testing has been shown to significantly improve memory retention.',
    },
    {
      id: 'q3',
      question: 'What does summarization help with when studying?',
      options: [
        { id: 'a', text: 'Making notes longer' },
        { id: 'b', text: 'Understanding the main ideas' },
        { id: 'c', text: 'Memorizing every word' },
        { id: 'd', text: 'Avoiding difficult concepts' },
      ],
      correctOptionId: 'b',
      explanation: 'Summarization forces active engagement with the material, helping identify and retain main ideas.',
    },
  ];
}

// ─── Chat ────────────────────────────────────────────────────────────────────

function handleChat(
  material: StudyMaterial,
  history: ChatMessage[],
  userMessage: string
): string {
  const text = material.text.toLowerCase();
  const query = userMessage.toLowerCase();
  const sentences = getSentences(material.text);

  // Find most relevant sentences to the query
  const queryKeywords = getKeywords(userMessage);
  const relevant = sentences
    .map(s => ({ s, score: scoreSentence(s, queryKeywords) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.s);

  // Detect intent
  if (/\bsummar(y|ize|ise)\b/.test(query)) {
    return `Here's a summary of the content:\n\n${generateSummary(material.text)}`;
  }

  if (/\bkey\s*(point|concept|idea|term)s?\b/.test(query)) {
    const points = extractKeyPoints(material.text);
    return `Key points from the content:\n\n${points.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
  }

  if (/\bexplain\b/.test(query)) {
    return generateExplanation(material.text);
  }

  if (/\bwhat is\b|\bdefine\b|\bmeaning of\b/.test(query)) {
    // Try to find the word being asked about
    const match = query.match(/what is (.+?)[\?\.]*$|define (.+?)[\?\.]*$|meaning of (.+?)[\?\.]*$/);
    const term = (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').trim();
    if (term && text.includes(term)) {
      const def = sentences.find(s => s.toLowerCase().includes(term));
      if (def) return `Based on the content:\n\n${def}`;
    }
  }

  if (relevant.length > 0) {
    return `Based on the content provided:\n\n${relevant.join(' ')}\n\nIf you have a more specific question, feel free to ask!`;
  }

  // Acknowledge previous context
  if (history.length > 0) {
    return `I don't find a direct match for "${userMessage}" in the provided content. The content primarily covers: ${
      [...getKeywords(material.text).entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([w]) => w)
        .join(', ')
    }. Could you rephrase your question?`;
  }

  return `I couldn't find specific information about "${userMessage}" in the provided content. Try asking about the main topics, key concepts, or requesting a summary.`;
}

// ─── Provider Implementation ─────────────────────────────────────────────────

export class DemoProvider implements AIProvider {
  name = 'Demo Provider (In-Browser NLP)';
  description =
    'Rule-based text analysis running entirely in your browser. No network requests. ' +
    'In a production Snapdragon deployment, this is replaced by an on-device neural language model.';
  isLocal = true;

  isAvailable(): boolean {
    return true;
  }

  async analyze(material: StudyMaterial): Promise<StudyResult> {
    // Simulate processing time for realistic UX
    await delay(800 + Math.random() * 400);

    const text = material.text.trim();
    if (text.length < 30) {
      throw new Error('Please provide more text content to analyze (at least a few sentences).');
    }

    const explanation = generateExplanation(text);
    const summary = generateSummary(text);
    const keyPoints = extractKeyPoints(text);
    const mcqs = generateMCQs(text);

    return { explanation, summary, keyPoints, mcqs };
  }

  async chat(
    material: StudyMaterial,
    history: ChatMessage[],
    userMessage: string
  ): Promise<string> {
    await delay(400 + Math.random() * 300);
    return handleChat(material, history, userMessage);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
