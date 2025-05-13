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
  
  res.json({ 
    generatedText: response.text
  });
  return;
});

approuter.post("/execute", async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: 'No code provided' });
      return;
    }

    const result = await runDocker(code);
    
    
    const fs = require('fs');
    const videoPath = result.videoPath;
    const stat = fs.statSync(videoPath);
    
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename=animation.mp4'
    });

    
    const videoStream = fs.createReadStream(videoPath);
    videoStream.pipe(res);
  } catch (error) {
    console.error('Error executing code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to execute animation',
      details: errorMessage
    });
  }
});

async function runDocker(markdownCode: string): Promise<{videoPath: string}> {
    const fs = require('fs').promises;
    const path = require('path');
    const { exec } = require('child_process');
    
    function sanitizeCode(text: string): string {
        
        const pythonCodeMatch = text.match(/```python\n([\s\S]*?)\n```/);
        if (!pythonCodeMatch) {
            throw new Error('Invalid Python code format');
        }
        
        // Get the code content and ensure proper line endings
        const cleanCode = pythonCodeMatch[1].trim();
        return cleanCode + '\n';
    }
    
    try {
        
        const code = sanitizeCode(markdownCode);
        
        
        const manimDir = path.join(__dirname, '..', 'manim_files');
        await fs.mkdir(manimDir, { recursive: true });
        
        
        const pythonFile = path.join(manimDir, 'test_scenes.py');
        await fs.writeFile(pythonFile, code);
        
        
        const dockerCommand = `docker run --rm -v "${manimDir}:/manim" manimcommunity/manim manim -qm test_scenes.py SquareToCircle`;
        
        return new Promise((resolve, reject) => {
            exec(dockerCommand, (error: Error | null, stdout: string, stderr: string) => {
                if (error) {
                    console.error('Docker execution error:', error);
                    reject(error.message);
                    return;
                }
                
                console.log('Docker output:', stdout);
                
                
                const videoPath = path.join(manimDir, 'media', 'videos', 'test_scenes', '720p30', 'SquareToCircle.mp4');
                
                
                fs.access(videoPath)
                    .then(() => {
                        resolve({ videoPath });
                    })
                    .catch(() => {
                        reject(new Error('Video file not generated'));
                    });
            });
        });
    } catch (error) {
        console.error('Error in runDocker:', error);
        throw error;
    }
}


export default approuter;