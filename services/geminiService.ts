import { GoogleGenAI } from "@google/genai";

const AI_KEY = process.env.API_KEY || '';

export const generateGameOverComment = async (score: number, highScore: number): Promise<string> => {
  if (!AI_KEY) {
    return "Great game! (Add API Key for AI roasting)";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: AI_KEY });
    
    const prompt = `
      You are a sarcastic, retro arcade machine personality from the 1980s. 
      The player just lost a game of Snake.
      Their Score: ${score}.
      Their High Score: ${highScore}.
      
      Generate a short, witty, slightly roasting or encouraging one-sentence comment (max 20 words) based on their performance.
      If the score is low (< 5), roast them hard.
      If the score is high (> 20), praise them but keep it cool.
      Don't use quotes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "Game Over. Try again!";
  } catch (error) {
    console.error("Error generating AI comment:", error);
    return "Connection lost... but your skills remain questionable.";
  }
};