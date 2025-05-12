import { Router } from "express";
import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const systemPrompt = `You are a helpful AI assistant. Follow these rules:
- Provide direct code responses without explanations
- Use clear, concise language
- Avoid markdown or special formatting
- Focus on practical, implementable solutions
- Do not generate harmful or inappropriate content
- Keep responses focused on the specific task
- Do not use escape sequences or special characters
- Format output as plain text only`;

const approuter = Router();
approuter.post("/generate", async (req: Request, res: Response) => {
  const { text } = req.body;
  const ai = new GoogleGenAI({ apiKey: "" });
     
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: text ,
    config: {
      systemInstruction: systemPrompt,
    },
  });
  
  res.json({ generatedText: response.text });
});

export default approuter;