import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiKey } from '../lib/config';

const SYSTEM_PROMPT = `You are a legal assistant for the Delhi RoadWatch app. Help users understand Delhi traffic rules, Motor Vehicles Act fines (updated 2024), and violation reporting procedures. Keep answers concise, formal, and helpful. Use bullet points for steps where appropriate.`;

export async function chatWithLegalBotGemini(history) {
    const key = getGeminiKey();
    if (!key) throw new Error('Gemini API key not configured. Please go to Settings and add your key.');

    const genAI = new GoogleGenerativeAI(key);
    const flashModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const chatHistory = formattedHistory.slice(0, -1);
        const lastInput = history[history.length - 1]?.content || "";

        const chat = flashModel.startChat({
            history: chatHistory,
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
        });

        const result = await chat.sendMessage(lastInput);
        const response = await result.response;
        return { reply: response.text() };
    } catch (error) {
        console.error("[AI ENGINE] Gemini Chat Error:", error);
        throw error;
    }
}
