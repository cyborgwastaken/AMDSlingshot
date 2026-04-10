// TODO: Set VITE_GEMINI_API_KEY in .env.local
// Get from: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }> };
  }>;
}

async function callGemini(prompt: string, imageBase64?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    // Return mock response when no API key
    return getMockResponse(prompt);
  }

  const parts: object[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({
      inlineData: { mimeType: 'image/jpeg', data: imageBase64 },
    });
  }

  const res = await fetch(`${GEMINI_BASE}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data: GeminiResponse = await res.json();
  return data.candidates[0]?.content.parts[0]?.text ?? '';
}

/** Parse a meal from text description using Gemini */
export async function parseMealWithGemini(description: string): Promise<string> {
  const prompt = `You are NutriQuest's food analysis engine. The user described their meal: "${description}"

  Respond ONLY with a JSON array of food items in this format:
  [{"name": "Food Name", "calories": 200, "protein": 20, "carbs": 30, "fat": 5, "fiber": 3, "isHealthy": true}]

  Be realistic with nutritional values. Include all items mentioned.`;
  return callGemini(prompt);
}

/** Oracle: AI Diet Coach response */
export async function askOracle(params: {
  userMessage: string;
  heroClass: string;
  heroLevel: number;
  stats: Record<string, number>;
  activeQuests: string[];
  recentMeals: string[];
}): Promise<string> {
  const prompt = `You are The Oracle, a mystical AI diet coach in NutriQuest, a health RPG.

  Hero: Level ${params.heroLevel} ${params.heroClass}
  Current Stats: ${JSON.stringify(params.stats)}
  Active Quests: ${params.activeQuests.join(', ') || 'None'}
  Recent Meals: ${params.recentMeals.join(', ') || 'None logged today'}

  User asks: "${params.userMessage}"

  Respond in character as The Oracle — wise, mystical, but practical. Use fantasy RPG language while giving real nutrition advice. Keep response under 150 words. Reference their hero class and current stats.`;

  return callGemini(prompt);
}

/** Generate weekly battle report */
export async function generateBattleReport(params: {
  heroName: string;
  heroClass: string;
  mealsLogged: number;
  avgHealthScore: number;
  statChanges: Record<string, number>;
  questsCompleted: number;
}): Promise<string> {
  const prompt = `You are NutriQuest's battle historian. Write a dramatic weekly battle report for:

  Hero: ${params.heroName}, ${params.heroClass}
  Meals Logged: ${params.mealsLogged}
  Average Health Score: ${params.avgHealthScore}/100
  Stat Changes: ${JSON.stringify(params.statChanges)}
  Quests Completed: ${params.questsCompleted}

  Write 3-4 sentences in epic fantasy RPG narrative style summarizing their week. Be encouraging. Reference specific stats.`;

  return callGemini(prompt);
}

/** Scan food image using Gemini Vision */
export async function scanFoodImage(imageBase64: string): Promise<string> {
  const prompt = `Analyze this food image for NutriQuest health RPG.
  Identify all food items visible and return ONLY a JSON array:
  [{"name": "Food Name", "calories": 200, "protein": 20, "carbs": 30, "fat": 5, "fiber": 3, "isHealthy": true}]`;
  return callGemini(prompt, imageBase64);
}

// ─── Mock responses (used when no API key) ───────────────────────────────────

function getMockResponse(prompt: string): string {
  if (prompt.includes('JSON array')) {
    return JSON.stringify([
      { name: 'Dal Rice', calories: 350, protein: 14, carbs: 62, fat: 4, fiber: 8, isHealthy: true },
    ]);
  }

  const oracleResponses = [
    "Seeker, your STR wanes — the protein spirits hunger for your attention. Consume the sacred chicken or dal to restore your warrior spirit. Three meals of balance and your AGI shall soar like the mountain eagle!",
    "The Oracle sees all. Your Vitality stat cries out — green leaves and colorful vegetables shall mend what ails you. A spinach salad today would grant you the Verdant Shield buff for 6 hours.",
    "Brave hero, your path to the next level is paved with fiber. The humble grain and legume await your consumption. Log three fiber-rich meals this week to unlock the Iron Constitution achievement!",
    "Your stats are in harmony today, warrior. The Oracle recommends: maintain your streak, drink the sacred water (8 glasses), and log dinner before the midnight bell. Fortune favors the consistent!",
  ];

  return oracleResponses[Math.floor(Math.random() * oracleResponses.length)];
}
