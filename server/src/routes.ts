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
approuter.post("/generate", async (req: Request, res: Response): Promise<void> => {
  const { text } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not defined in environment variables');
    res.status(500).json({ error: 'API key not configured' });
    return;
  }

  // Commented for dev purpose
  // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
     
  // const response = await ai.models.generateContent({
  //   model: "gemini-2.0-flash",
  //   contents: text ,
  //   config: {
  //     systemInstruction: systemPrompt,
  //   },
  // });

  const response = {
    text : "```python\nfrom manim import *\n\nclass SquareToCircle(Scene):\n    def construct(self):\n        square = Square()\n        circle = Circle()\n        self.play(Create(square))\n        self.wait(1)\n        self.play(Transform(square, circle))\n        self.wait(1)\n        self.play(Uncreate(circle))\n        self.wait(1)\n\n```\n"
  }

  // Example response structure
  // {
  //   "generatedText": "```python\nfrom manim import *\n\nclass SquareToCircle(Scene):\n    def construct(self):\n        square = Square()\n        circle = Circle()\n        self.play(Create(square))\n        self.wait(1)\n        self.play(Transform(square, circle))\n        self.wait(1)\n        self.play(Uncreate(circle))\n        self.wait(1)\n\n```\n"
  // }
  
  res.json({ generatedText: response.text });
  return;
});

approuter.get("/execute", async (req: Request, res: Response): Promise<void> => {
  
});

export default approuter;