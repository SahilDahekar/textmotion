import { response, Router } from "express";
import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import * as path from 'path';
import * as fs from 'fs/promises';
import express from "express";

if(process.env.NODE_ENV !== 'production') {
  // Create the videos directory if it doesn't exist
  const publicDir = path.join(__dirname, '..', 'public', 'videos');
  fs.mkdir(publicDir, { recursive: true }).catch(console.error);
}

interface LambdaRequest {
  python_code: string;
  id: string;
  filename: string;
  project_name: string;
}


const systemPrompt = `You are a Manim animation code generator. Generate only Python code for Manim animations with these exact requirements:
\`\`\`python
from manim import *

class YourClassName(Scene):
    def construct(self):
        # Your animation code here
        self.play()
        self.wait()
\`\`\`

Rules:
- Output must be exactly in the format shown above
- Use only valid Manim objects and methods
- Create visually appealing mathematical animations
- Class name should reflect the animation content
- Include proper timing in self.play() and self.wait() calls
- No text or explanations outside the code block
- Ensure animation principles are followed i.e. smooth transitions, clear visibility , non-overlapping objects/texts
- No additional formatting or markdown`;

const approuter = Router();
approuter.post("/generate", async (req: Request, res: Response): Promise<void> => {
  const { text } = req.body;


  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not defined in environment variables');
    res.status(500).json({ error: 'API key not configured' });
    return;
  }

  // Commented for dev purpose
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
     
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: text ,
    config: {
      systemInstruction: systemPrompt,
    },
  });

  // const response = {
  //   text : "```python\nfrom manim import *\n\nclass SquareToCircle(Scene):\n    def construct(self):\n        square = Square()\n        circle = Circle()\n        self.play(Create(square))\n        self.wait(1)\n        self.play(Transform(square, circle))\n        self.wait(1)\n        self.play(Uncreate(circle))\n        self.wait(1)\n\n```\n"
  // }

  res.json({ 
    generatedText: response.text
  });
  return;
});

approuter.post("/execute", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, code, filename, project_name } = req.body;
    if (!code) {
      res.status(400).json({ error: 'No code provided' });
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Using local Docker for execution...');
      try {
        const result = await runDocker(code);
        const className = extractClassName(code);
        
        // Create public videos directory if it doesn't exist
        const publicDir = path.join(__dirname, '..', 'public', 'videos');
        await fs.mkdir(publicDir, { recursive: true });
          // Copy the video to public directory with proper permissions
        const publicVideoPath = path.join(publicDir, `${className}.mp4`);
        await fs.copyFile(result.videoPath, publicVideoPath);
        console.log(`Video copied to: ${publicVideoPath}`);
        
        // Return the local URL (using relative path)
        const video_url = `/videos/${className}.mp4`;
        
        res.status(200).json({
          video_url,
          message: 'Animation created successfully using Docker'
        });
        return;
      } catch (error) {        console.error('Docker execution error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Docker execution failed: ${errorMessage}`);
      }
    } else {
      console.log('Using Lambda for execution...');
      const payload: LambdaRequest = {
        python_code: code,
        id: id,
        filename: filename,
        project_name: project_name
      };
      
      const externalUrl = process.env.LAMDA_FUNCTION_URL;
      if (!externalUrl) {
        throw new Error("LAMDA_FUNCTION_URL is not defined in environment variables.");
      }

      const response = await axios.post(externalUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 * 15,
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Lambda function failed: ' + JSON.stringify(response.data));
      }

      const { video_url, message } = response.data;
      res.status(200).json({ video_url, message });
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Execution failed',
      details: errorMessage
    });
  }
});

// Serve static video files
const videosPath = path.join(__dirname, '..', 'public', 'videos');
console.log('Serving videos from:', videosPath);

approuter.use('/videos', (req, res, next) => {
  console.log('Video request:', req.url);
  next();
}, express.static(videosPath, {
  setHeaders: (res, path) => {
    console.log('Serving video file:', path);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'video/mp4');
  }
}));

function sanitizeCode(text: string): string {
    const pythonCodeMatch = text.match(/```python\n([\s\S]*?)\n```/);
    if (!pythonCodeMatch) {
        throw new Error('Invalid Python code format');
    }
    return pythonCodeMatch[1].trim() + '\n';
}

function extractClassName(code: string): string {
    const classMatch = code.match(/class\s+(\w+)\s*\(\s*Scene\s*\)/);
    if (!classMatch) {
        throw new Error('No Scene class found in the Python code');
    }
    return classMatch[1];
}

async function runDocker(markdownCode: string): Promise<{videoPath: string}> {
    const fs = require('fs').promises;
    const path = require('path');
    const { exec } = require('child_process');
    
    try {
        // const code = sanitizeCode(markdownCode);
        const code = markdownCode.trim();
        const className = extractClassName(code);
        
        const manimDir = path.join(__dirname, '..', 'manim_files');
        await fs.mkdir(manimDir, { recursive: true });
        
        const pythonFile = path.join(manimDir, 'test_scenes.py');
        await fs.writeFile(pythonFile, code);
        
        const dockerCommand = `docker run --rm -v "${manimDir}:/manim" manimcommunity/manim manim -qm test_scenes.py ${className}`;
        
        return new Promise((resolve, reject) => {
            exec(dockerCommand, (error: Error | null, stdout: string, stderr: string) => {
                if (error) {
                    console.error('Docker execution error:', error);
                    reject(error.message);
                    return;
                }
                
                console.log('Docker output:', stdout);
                
                const videoPath = path.join(manimDir, 'media', 'videos', 'test_scenes', '720p30', `${className}.mp4`);
                
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