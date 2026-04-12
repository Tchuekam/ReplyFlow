import { GoogleGenAI, Type } from "@google/genai";
import { Service, KBDocument, AppConfig, AIResponse } from "../types";

export async function generateSalesResponse(
  userMessage: string,
  history: { role: 'user' | 'assistant', content: string }[],
  services: Service[],
  kb: KBDocument[],
  config: AppConfig
): Promise<AIResponse> {
  const kbContext = kb.map(doc => doc.content).join("\n\n");
  const servicesContext = services.map(s => `- ${s.title}: ${s.description} (${s.price})`).join("\n");

  const systemInstruction = `
You are the core AI Sales Engine for "${config.businessName}". 
Your role is to act as a professional, warm, and persuasive AI sales assistant.

=== BUSINESS CONTEXT ===
Tagline: ${config.tagline}
Knowledge Base:
${kbContext}

Services:
${servicesContext}

=== SALES RULES ===
1. GOAL CHAIN: Understand need -> Recommend service (via UI) -> Ask 1 qualifying question -> Ask for Name & WhatsApp to send a quote.
2. NO TEXT DUMPING: If the user asks about services or prices, set ui_action to "show_catalog" and keep response_text brief.
3. CONCISENESS: Keep conversational responses strictly between 1 to 3 sentences. Max 1 emoji.
4. AUTO-DETECT LANGUAGE: Respond in the language the user uses (French or English).
5. LEAD CAPTURE: Once interest is shown, ask for Name and WhatsApp.

=== UI ACTIONS ===
- "show_catalog": User asks for services/prices.
- "show_booking": User asks to schedule/book.
- "human_handoff": User asks for a human.
- "none": Standard conversation.

=== OUTPUT FORMAT ===
You MUST output valid JSON matching this schema:
{
  "response_text": "string",
  "ui_action": "show_catalog" | "show_booking" | "human_handoff" | "none",
  "lead_extraction": {
    "is_new_lead": boolean,
    "name": string | null,
    "phone_or_email": string | null,
    "service_interest": string | null
  }
}
`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response_text: { type: Type.STRING },
            ui_action: { 
              type: Type.STRING, 
              enum: ["show_catalog", "show_booking", "human_handoff", "none"] 
            },
            lead_extraction: {
              type: Type.OBJECT,
              properties: {
                is_new_lead: { type: Type.BOOLEAN },
                name: { type: Type.STRING, nullable: true },
                phone_or_email: { type: Type.STRING, nullable: true },
                service_interest: { type: Type.STRING, nullable: true }
              },
              required: ["is_new_lead", "name", "phone_or_email", "service_interest"]
            }
          },
          required: ["response_text", "ui_action", "lead_extraction"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as AIResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      response_text: "I'm sorry, I'm having a bit of trouble connecting. Could you try again?",
      ui_action: "none",
      lead_extraction: {
        is_new_lead: false,
        name: null,
        phone_or_email: null,
        service_interest: null
      }
    };
  }
}
