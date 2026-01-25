import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Message, Feedback } from '../types';

let genAI: GoogleGenerativeAI | null = null;

// Sanitize API key - remove any non-ASCII characters or whitespace
function sanitizeApiKey(apiKey: string): string {
    return apiKey
        .trim()
        .replace(/[^\x20-\x7E]/g, '') // Remove non-printable ASCII
        .replace(/\s/g, ''); // Remove any whitespace
}

export function initializeGemini(apiKey: string) {
    const cleanKey = sanitizeApiKey(apiKey);
    genAI = new GoogleGenerativeAI(cleanKey);
}

export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
        const testAI = new GoogleGenerativeAI(apiKey);
        const model = testAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        await model.generateContent('Hi');
        return { valid: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('API key not valid')) {
            return {
                valid: false,
                error: 'API Keyが無効です。Google AI Studioで正しいキーをコピーしてください。'
            };
        }
        if (errorMessage.includes('quota')) {
            return {
                valid: false,
                error: 'API使用量の上限に達しました。しばらく待ってから再試行してください。'
            };
        }
        if (errorMessage.includes('permission')) {
            return {
                valid: false,
                error: 'APIへのアクセス権限がありません。Gemini APIが有効になっているか確認してください。'
            };
        }
        return {
            valid: false,
            error: `接続エラー: ${errorMessage}`
        };
    }
}

const CONVERSATION_TOPICS = [
    'travel and memorable trips',
    'favorite hobbies and pastimes',
    'recent movies or TV shows',
    'food and cooking experiences',
    'technology and gadgets',
    'books and reading habits',
    'sports and fitness',
    'music and concerts',
    'dreams and future goals',
    'cultural differences and experiences',
];

export function getRandomTopic(): string {
    return CONVERSATION_TOPICS[Math.floor(Math.random() * CONVERSATION_TOPICS.length)];
}

// Demo mode responses (no API needed)
const DEMO_RESPONSES = [
    "Hi there! I'd love to chat about travel with you. Have you been on any interesting trips recently, or is there somewhere you've always dreamed of visiting?",
    "That sounds really interesting! What made that experience so memorable for you?",
    "I can totally relate to that. It's amazing how travel can change our perspective. What do you think you learned from that experience?",
    "That's a great point! Have you thought about where you'd like to go next?",
    "Wow, that would be an amazing adventure! What's the first thing you'd want to do when you get there?",
];

let demoResponseIndex = 0;

export function getDemoResponse(): string {
    const response = DEMO_RESPONSES[demoResponseIndex % DEMO_RESPONSES.length];
    demoResponseIndex++;
    return response;
}

export function getDemoFeedback(): import('../types').Feedback {
    return {
        pronunciation: {
            summary: "全体的に良い発音でした！いくつかの難しい音に注意すると更に良くなります。",
            issues: [
                {
                    word: "travel",
                    ipa: "/ˈtrævəl/",
                    explanation: "日本語話者は「トラベル」と発音しがちですが、最初の音は「トゥ」ではなく「チュ」に近いです。",
                    tip: "舌を上の歯茎につけて「tr」を発音してみましょう。"
                },
                {
                    word: "interesting",
                    ipa: "/ˈɪntrəstɪŋ/",
                    explanation: "4音節ではなく3音節で発音します。「イントゥレスティング」ではなく「インタレスティング」。",
                    tip: "「ter」の部分を軽く発音しましょう。"
                }
            ]
        },
        grammar: {
            summary: "基本的な文法は正しく使えています。時制の一貫性に少し注意しましょう。",
            corrections: [
                {
                    original: "I go there last year",
                    corrected: "I went there last year",
                    explanation: "過去の出来事を話すときは過去形を使います。",
                    grammarPoint: "過去形 (Past Simple)"
                }
            ]
        },
        vocabulary: {
            summary: "会話に適切な語彙を使っていますが、より洗練された表現も試してみましょう。",
            suggestions: [
                {
                    used: "good",
                    suggested: ["excellent", "wonderful", "fantastic"],
                    context: "旅行の感想を述べるとき",
                    explanation: "「good」の代わりにより表現力のある形容詞を使うと、会話が生き生きとします。"
                },
                {
                    used: "very big",
                    suggested: ["huge", "enormous", "massive"],
                    context: "サイズを表現するとき",
                    explanation: "「very + 形容詞」よりも一語で強い意味を持つ形容詞を使うとネイティブらしい表現になります。"
                }
            ]
        },
        overallComment: "素晴らしい会話練習でした！積極的に英語を話そうとする姿勢が良いですね。発音と語彙を少し改善するだけで、さらに自然な英語に近づきます。この調子で練習を続けてください！"
    };
}

const CONVERSATION_SYSTEM_PROMPT = `You are a friendly native English speaker having a casual conversation with someone learning English.

Guidelines:
- Be warm, encouraging, and patient
- Ask follow-up questions to keep the conversation flowing
- Use natural, everyday English (not too formal)
- If the user makes minor mistakes, don't correct them during conversation - just respond naturally
- Keep your responses concise (2-3 sentences) to give the user more speaking practice
- Show genuine interest in what they say

Your role is to be a conversation partner, NOT a teacher during this phase.`;

export const MODELS = [
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Exp (最新・推奨)' },
    { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (安定・高速)' },
    { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (安定・高精度)' },
    { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro (軽量・旧安定版)' },
];

export async function getConversationResponse(
    messages: Message[],
    topic: string,
    modelName: string = 'gemini-2.0-flash',
    retries = 3
): Promise<string> {
    if (!genAI) throw new Error('Gemini API not initialized');

    const model = genAI.getGenerativeModel({ model: modelName });

    let conversationHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
    }));

    // Ensure history starts with user role (API requirement)
    if (conversationHistory.length > 0 && conversationHistory[0].role === 'model') {
        conversationHistory = [
            {
                role: 'user',
                parts: [{ text: `Let's start our conversation about ${topic}.` }],
            },
            ...conversationHistory
        ];
    }

    const chat = model.startChat({
        history: conversationHistory,
        generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.8,
        },
    });

    let prompt: string;
    if (messages.length === 0) {
        prompt = `${CONVERSATION_SYSTEM_PROMPT}

Start the conversation by greeting the user warmly and introducing the topic: "${topic}". 
Ask them an engaging opening question about this topic.`;
    } else {
        prompt = `${CONVERSATION_SYSTEM_PROMPT}

Continue the conversation naturally. The topic is: "${topic}".
Respond to the user's message and ask a follow-up question.`;
    }

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const result = await chat.sendMessage(prompt);
            return result.response.text();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`API Error (attempt ${attempt + 1}/${retries}):`, errorMessage);

            // Check for various rate limit indicators
            const lowerError = errorMessage.toLowerCase();
            const isRateLimited = lowerError.includes('429') ||
                lowerError.includes('quota') ||
                lowerError.includes('resource_exhausted') ||
                lowerError.includes('rate') ||
                lowerError.includes('limit') ||
                lowerError.includes('too many');

            if (isRateLimited && attempt < retries - 1) {
                // Wait with longer backoff: 5s, 15s, 30s
                const waitTimes = [5000, 15000, 30000];
                const waitTime = waitTimes[attempt];
                console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            throw error;
        }
    }
    throw new Error('Max retries exceeded');
}

const FEEDBACK_SYSTEM_PROMPT = `You are an expert English language coach analyzing a conversation between a learner and a native speaker.

Your task is to provide comprehensive feedback IN JAPANESE (日本語で解説してください).

Analyze the conversation and provide feedback in the following JSON format:
{
  "pronunciation": {
    "summary": "発音に関する総合評価（日本語）",
    "issues": [
      {
        "word": "問題のあった単語",
        "ipa": "/発音記号/",
        "explanation": "なぜ発音が難しいのか（日本語）",
        "tip": "練習のコツ（日本語）"
      }
    ]
  },
  "grammar": {
    "summary": "文法に関する総合評価（日本語）",
    "corrections": [
      {
        "original": "ユーザーが言った文",
        "corrected": "正しい文",
        "explanation": "なぜ間違っているのか（日本語）",
        "grammarPoint": "関連する文法ポイント"
      }
    ]
  },
  "vocabulary": {
    "summary": "語彙に関する総合評価（日本語）",
    "suggestions": [
      {
        "used": "使用された単語",
        "suggested": ["より良い表現1", "より良い表現2"],
        "context": "使用された文脈",
        "explanation": "なぜこの表現が良いか（日本語）"
      }
    ]
  },
  "overallComment": "全体的なコメントと励ましの言葉（日本語）"
}

Important notes:
- Be neutral and objective - not too harsh, not too lenient
- Focus on patterns rather than isolated mistakes
- Provide actionable advice
- For pronunciation, identify words that Japanese speakers commonly struggle with
- For grammar, explain using Japanese grammatical terms when helpful
- For vocabulary, suggest more natural or sophisticated alternatives
- If something was said well, mention it too!

IMPORTANT: Return ONLY valid JSON, no markdown code blocks or additional text.`;

export async function generateFeedback(messages: Message[]): Promise<Feedback> {
    if (!genAI) throw new Error('Gemini API not initialized');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const userMessages = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('\n');

    const fullConversation = messages
        .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
        .join('\n');

    const prompt = `${FEEDBACK_SYSTEM_PROMPT}

Here is the full conversation:
${fullConversation}

User's utterances to analyze:
${userMessages}

Analyze the user's English and provide detailed feedback in the JSON format specified above.`;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.3,
        },
    });

    const responseText = result.response.text();

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
    } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    try {
        const feedback: Feedback = JSON.parse(cleanedResponse);
        return feedback;
    } catch {
        // Return a default feedback if parsing fails
        return {
            pronunciation: {
                summary: 'フィードバックの生成中にエラーが発生しました。',
                issues: [],
            },
            grammar: {
                summary: 'フィードバックの生成中にエラーが発生しました。',
                corrections: [],
            },
            vocabulary: {
                summary: 'フィードバックの生成中にエラーが発生しました。',
                suggestions: [],
            },
            overallComment: '申し訳ございません。フィードバックを生成できませんでした。もう一度お試しください。',
        };
    }
}

// Track if audio has been unlocked (needed for iOS)
let audioUnlocked = false;

// Unlock audio for iOS - call this on first user interaction
export function unlockAudio(): void {
    if (audioUnlocked) return;

    if (window.speechSynthesis) {
        // Create a silent utterance to unlock audio on iOS
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
        audioUnlocked = true;
        console.log('Audio unlocked for iOS');
    }
}

export function speakText(text: string, lang: string = 'en-US'): Promise<void> {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            console.error('Speech synthesis not supported');
            resolve(); // Don't block if not supported
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // iOS workaround: wait for voices to load
        const speak = () => {
            // Try to get an English voice
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(v => v.lang.startsWith('en'));
            if (englishVoice) {
                utterance.voice = englishVoice;
            }

            utterance.onend = () => {
                console.log('Speech ended');
                resolve();
            };

            utterance.onerror = (e) => {
                console.error('Speech error:', e);
                resolve(); // Don't block on error
            };

            window.speechSynthesis.speak(utterance);

            // iOS fix: Speech synthesis can get stuck, so we add a timeout
            setTimeout(() => {
                if (window.speechSynthesis.speaking) {
                    console.log('Speech still in progress...');
                }
            }, 10000);
        };

        // Check if voices are loaded
        if (window.speechSynthesis.getVoices().length > 0) {
            speak();
        } else {
            // Wait for voices to load (needed on some mobile browsers)
            window.speechSynthesis.onvoiceschanged = () => {
                speak();
            };
            // Fallback: try speaking anyway after a short delay
            setTimeout(speak, 100);
        }
    });
}

