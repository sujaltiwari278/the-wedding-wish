import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// ==========================================
// 1. AI WEDDING GOAL ASSISTANT
// ==========================================

export const GoalSuggestionItemSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(5).max(300),
  category: z.enum(["Travel", "Home", "Kitchen", "Furniture", "Experience", "Other"]),
  suggestedTargetRupees: z.number().min(100),
  reason: z.string().max(200),
  image: z.enum(["plane", "house", "kitchen", "sofa", "ring", "heart", "gift", "camera", "car"]).default("heart"),
});

export const GoalAssistantResponseSchema = z.object({
  disclaimer: z.string(),
  suggestions: z.array(GoalSuggestionItemSchema).min(3).max(8),
});

export type GoalSuggestionItem = z.infer<typeof GoalSuggestionItemSchema>;
export type GoalAssistantResponse = z.infer<typeof GoalAssistantResponseSchema>;

export interface GoalAssistantInput {
  partnerNames?: string;
  interests?: string;
  travelDestinations?: string;
  futurePlans?: string;
  householdNeeds?: string;
  lifestyle?: string;
  totalBudgetRupees: number;
}

// Fallback suggestions generator when Gemini API key is missing or quota is exhausted
function getFallbackGoalSuggestions(input: GoalAssistantInput): GoalAssistantResponse {
  const budget = Math.max(10000, input.totalBudgetRupees || 250000);
  const travelBudget = Math.round(budget * 0.45);
  const homeBudget = Math.round(budget * 0.3);
  const kitchenBudget = Math.round(budget * 0.15);
  const experienceBudget = Math.round(budget * 0.1);

  return {
    disclaimer: "Estimates based strictly on the budget you gave us, not verified market prices.",
    suggestions: [
      {
        title: input.travelDestinations
          ? `${input.travelDestinations.split(",")[0].trim()} Honeymoon Adventure`
          : "Romantic Honeymoon Getaway",
        description: "Exploring scenic vistas, intimate cafe lunches, and creating our first lifelong travel memories.",
        category: "Travel",
        suggestedTargetRupees: travelBudget,
        reason: "Allocated ~45% of your total estimated shagun registry budget towards post-wedding travel.",
        image: "plane",
      },
      {
        title: "First Home Down Payment",
        description: "Helping us lay the foundation for our very own sanctuary and long-term dream home.",
        category: "Home",
        suggestedTargetRupees: homeBudget,
        reason: "Allocated ~30% towards foundational future stability and homeownership.",
        image: "house",
      },
      {
        title: "Chef-Grade Dream Kitchen",
        description: "Copper cookware, high-speed blender, espresso machine, and Sunday morning brunch essentials.",
        category: "Kitchen",
        suggestedTargetRupees: kitchenBudget,
        reason: "Allocated ~15% for household cooking adventures and entertaining guests.",
        image: "kitchen",
      },
      {
        title: "Handcrafted Living Room Furniture",
        description: "A cozy modular sofa and dining set where family and friends will gather for festivals.",
        category: "Furniture",
        suggestedTargetRupees: experienceBudget,
        reason: "Allocated ~10% for warm living room decor and family gatherings.",
        image: "sofa",
      },
    ],
  };
}

export async function generateGoalSuggestions(
  input: GoalAssistantInput
): Promise<GoalAssistantResponse> {
  if (!genAI || !GEMINI_API_KEY) {
    return getFallbackGoalSuggestions(input);
  }

  const systemPrompt = `You are the AI Wedding Goal Assistant for 'The Wedding Wish' - an Indian wedding registry web app.
Your task is to generate 4 to 6 meaningful, culturally conscious wedding financial goals for an Indian couple.

RULES:
1. MANDATORY: Suggested amounts must be derived ONLY from the couple's provided total budget of ₹${input.totalBudgetRupees.toLocaleString("en-IN")}. Total of suggested goals should roughly equal or fit comfortably within this budget.
2. Suggested amounts MUST be framed as "estimates based on the budget you gave us", NEVER as verified market prices.
3. Tone: Warm, respectful, festive, and culturally aware of Indian weddings (e.g. mentions of shagun, lifafa, starting a new chapter, warm family hospitality).
4. Categories MUST be one of: "Travel", "Home", "Kitchen", "Furniture", "Experience", "Other".
5. Images MUST be one of: "plane", "house", "kitchen", "sofa", "ring", "heart", "gift", "camera", "car".
6. Return STRICT JSON with keys:
   - "disclaimer": "Estimates based strictly on the budget you gave us, not verified market prices."
   - "suggestions": array of objects with { title, description, category, suggestedTargetRupees, reason, image }`;

  const userPrompt = `Couple: ${input.partnerNames || "Couple"}
Interests & Hobbies: ${input.interests || "Not specified"}
Dream Travel Destinations: ${input.travelDestinations || "Not specified"}
Future Life Plans: ${input.futurePlans || "Starting a new home together"}
Household Requirements: ${input.householdNeeds || "Kitchen, furniture"}
Lifestyle Preferences: ${input.lifestyle || "Cozy, hospitable"}
Approximate Total Budget: ₹${input.totalBudgetRupees.toLocaleString("en-IN")}`;

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const result = await Promise.race([
      model.generateContent(`${systemPrompt}\n\n${userPrompt}`),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini AI request timeout")), 8000)
      ),
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text);
    const validated = GoalAssistantResponseSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data;
    }
  } catch (err) {
    console.warn("Gemini Goal Assistant error/fallback:", err);
  }

  return getFallbackGoalSuggestions(input);
}

// ==========================================
// 2. AI THANK-YOU MESSAGE GENERATOR
// ==========================================

export const ThankYouResponseSchema = z.object({
  message: z.string().min(10).max(500),
  toneUsed: z.string(),
});

export type ThankYouResponse = z.infer<typeof ThankYouResponseSchema>;

export interface ThankYouInput {
  guestName: string;
  amountRupees: number;
  goalTitle: string;
  guestWish?: string;
  tone: "Heartfelt" | "Funny" | "Formal" | "Hinglish";
  coupleNames: string;
}

function getFallbackThankYou(input: ThankYouInput): ThankYouResponse {
  const { guestName, goalTitle, tone, coupleNames } = input;

  if (tone === "Hinglish") {
    return {
      message: `Dear ${guestName}, aapka shagun mil gaya! Thank you so much for contributing towards our ${goalTitle}. Aapki blessings hamare liye bohot special hain. Milte hain jaldi! - ${coupleNames}`,
      toneUsed: "Hinglish",
    };
  }

  if (tone === "Funny") {
    return {
      message: `Dearest ${guestName}, you officially funded a piece of our ${goalTitle}! Thank you so much for the generous shagun envelope (and for saving us from another toaster set)! With lots of love, ${coupleNames}`,
      toneUsed: "Funny",
    };
  }

  if (tone === "Formal") {
    return {
      message: `Dear ${guestName}, thank you cordially for your generous wedding gift towards our ${goalTitle}. Your gracious blessings and support mean a great deal to us as we embark on this new life. Warm regards, ${coupleNames}`,
      toneUsed: "Formal",
    };
  }

  return {
    message: `Dear ${guestName}, thank you from the bottom of our hearts for contributing towards our ${goalTitle}. Your love, blessings, and generosity mean the world to us as we begin this beautiful new chapter together! Warmly, ${coupleNames}`,
    toneUsed: "Heartfelt",
  };
}

export async function generateThankYouMessage(
  input: ThankYouInput
): Promise<ThankYouResponse> {
  if (!genAI || !GEMINI_API_KEY) {
    return getFallbackThankYou(input);
  }

  const prompt = `You are a personalized wedding thank-you message generator for an Indian couple (${input.coupleNames}).
Guest Name: ${input.guestName}
Amount Given: ₹${input.amountRupees.toLocaleString("en-IN")}
Wedding Goal Funded: ${input.goalTitle}
Guest's Personal Wish: ${input.guestWish ? `"${input.guestWish}"` : "None"}
Requested Tone: ${input.tone} (Options: Heartfelt, Funny, Formal, Hinglish)

RULES:
1. Write a warm, personal WhatsApp-ready message (around 2 to 4 sentences).
2. Reference the specific goal (${input.goalTitle}) and how it directly helps the couple.
3. If guest provided a wish, warmly acknowledge it.
4. If tone is 'Hinglish', use natural conversational Hindi-English phrasing commonly used by urban Indian youth.
5. Return STRICT JSON with keys: { "message": "...", "toneUsed": "${input.tone}" }`;

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini AI request timeout")), 8000)
      ),
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text);
    const validated = ThankYouResponseSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data;
    }
  } catch (err) {
    console.warn("Gemini Thank-You generator error/fallback:", err);
  }

  return getFallbackThankYou(input);
}

// ==========================================
// 3. AI PROFILE DESCRIPTION GENERATOR
// ==========================================

export const ProfileDescriptionsSchema = z.object({
  options: z.array(
    z.object({
      id: z.string(),
      style: z.string(),
      description: z.string().max(200),
    })
  ).length(3),
});

export type ProfileDescriptionsResponse = z.infer<typeof ProfileDescriptionsSchema>;

export async function generateProfileDescriptions(input: {
  coupleNames: string;
  coupleStory?: string;
  interests?: string;
}): Promise<ProfileDescriptionsResponse> {
  const fallbacks: ProfileDescriptionsResponse = {
    options: [
      {
        id: "desc-warm",
        style: "Heartfelt & Traditional",
        description:
          "Your blessings are our biggest gift. Help us turn our little dreams into lifelong memories as we start our forever journey.",
      },
      {
        id: "desc-playful",
        style: "Modern & Playful",
        description:
          "Instead of boxed dinner sets, help us fuel adventures, kitchen feasts, and our dream home. Your love is our ultimate shagun!",
      },
      {
        id: "desc-concise",
        style: "Sweet & Concise",
        description:
          "Welcome to our wedding wish sanctuary! With your blessings and love, we are building our dreams step by step.",
      },
    ],
  };

  if (!genAI || !GEMINI_API_KEY) {
    return fallbacks;
  }

  const prompt = `Write 3 short, catchy profile descriptions for an Indian wedding couple (${input.coupleNames}) for their shagun registry website.
Couple Love Story: ${input.coupleStory || "Two souls embarking on marriage"}
Interests: ${input.interests || "Travel, good food, building a home"}

RULES:
1. Each description MUST be STRICTLY under 200 characters.
2. Tone styles: Option 1: Warm & Heartfelt, Option 2: Modern & Playful, Option 3: Elegant & Concise.
3. Return STRICT JSON format:
{
  "options": [
    { "id": "desc-1", "style": "...", "description": "..." },
    { "id": "desc-2", "style": "...", "description": "..." },
    { "id": "desc-3", "style": "...", "description": "..." }
  ]
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini AI request timeout")), 8000)
      ),
    ]);

    const parsed = JSON.parse(result.response.text());
    const validated = ProfileDescriptionsSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }
  } catch (err) {
    console.warn("Gemini Profile description error/fallback:", err);
  }

  return fallbacks;
}

// ==========================================
// 4. AI WEDDING BUDGET PLANNER
// ==========================================

export const BudgetPlanSchema = z.object({
  disclaimer: z.string(),
  totalEstimatedRupees: z.number(),
  categories: z.array(
    z.object({
      category: z.string(),
      allocatedRupees: z.number(),
      percentage: z.number(),
      priority: z.enum(["High", "Medium", "Low"]),
      tips: z.string(),
    })
  ),
  overallGuidance: z.string(),
});

export type BudgetPlanResponse = z.infer<typeof BudgetPlanSchema>;

export async function generateBudgetPlan(input: {
  coupleNames: string;
  goals: { title: string; category: string; targetAmountPaise: number }[];
  targetSavingsRupees?: number;
}): Promise<BudgetPlanResponse> {
  const totalRupees = input.goals.reduce(
    (sum, g) => sum + g.targetAmountPaise / 100,
    0
  ) || 300000;

  const fallback: BudgetPlanResponse = {
    disclaimer: "Guidance only, not financial advice. All estimates are derived strictly from your input data.",
    totalEstimatedRupees: totalRupees,
    categories: [
      {
        category: "Travel & Honeymoon",
        allocatedRupees: Math.round(totalRupees * 0.45),
        percentage: 45,
        priority: "High",
        tips: "Book flights and hotel stays during off-peak shoulder seasons to maximize value.",
      },
      {
        category: "Home & Foundation",
        allocatedRupees: Math.round(totalRupees * 0.35),
        percentage: 35,
        priority: "High",
        tips: "Direct high-value family shagun towards down payments or principal reduction.",
      },
      {
        category: "Interiors & Kitchen",
        allocatedRupees: Math.round(totalRupees * 0.2),
        percentage: 20,
        priority: "Medium",
        tips: "Prioritize durable core appliances with extended warranties first.",
      },
    ],
    overallGuidance:
      "Your wedding goals strike a solid balance between memorable honeymoon experiences and foundational home assets. We recommend highlighting the Honeymoon as your spotlight dream.",
  };

  if (!genAI || !GEMINI_API_KEY) {
    return fallback;
  }

  const prompt = `Analyze this Indian wedding shagun registry for ${input.coupleNames}:
Total Goals Value: ₹${totalRupees.toLocaleString("en-IN")}
Current Goals List: ${JSON.stringify(input.goals.map((g) => ({ title: g.title, category: g.category, rupees: g.targetAmountPaise / 100 })))}

RULES:
1. Provide a categorized, prioritized budget allocation plan.
2. Return STRICT JSON:
{
  "disclaimer": "Guidance only, not financial advice. All estimates are derived strictly from your input data.",
  "totalEstimatedRupees": ${totalRupees},
  "categories": [
    { "category": "...", "allocatedRupees": 100000, "percentage": 35, "priority": "High", "tips": "..." }
  ],
  "overallGuidance": "..."
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini AI request timeout")), 8000)
      ),
    ]);

    const parsed = JSON.parse(result.response.text());
    const validated = BudgetPlanSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }
  } catch (err) {
    console.warn("Gemini budget planner error/fallback:", err);
  }

  return fallback;
}
