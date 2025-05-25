import { response, Router } from "express";
import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";


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
    const { id , code , filename , project_name  } = req.body;
    if (!code) {
      res.status(400).json({ error: 'No code provided' });
      return;
    }
    console.log("generated code: " + code);
    
    const payload: LambdaRequest = {
      python_code:code, 
      //"from manim import *\n\nclass SlopeEquationScene(Scene):\n    def construct(self):\n        # Title\n        title = Text(\"Slope Equation\").scale(1.2).to_edge(UP)\n        self.play(Write(title))\n\n        # Axes\n        axes = Axes(\n            x_range=[-1, 6],\n            y_range=[-1, 6],\n            x_length=6,\n            y_length=6,\n            axis_config={\"color\": BLUE},\n        ).shift(DOWN * 0.5 + LEFT * 1)\n        self.play(Create(axes))\n\n        # Points\n        p1 = Dot(axes.coords_to_point(1, 2), color=YELLOW)\n        p2 = Dot(axes.coords_to_point(4, 5), color=RED)\n\n        label1 = MathTex(\"(x_1, y_1)\").next_to(p1, DOWN)\n        label2 = MathTex(\"(x_2, y_2)\").next_to(p2, UP)\n\n        self.play(FadeIn(p1), Write(label1))\n        self.play(FadeIn(p2), Write(label2))\n\n        # Connecting Line\n        line = Line(p1.get_center(), p2.get_center(), color=GREEN)\n        self.play(Create(line))\n\n        # Delta y and Delta x\n        delta_y = Arrow(start=axes.coords_to_point(4, 2), end=axes.coords_to_point(4, 5), buff=0, color=ORANGE)\n        delta_x = Arrow(start=axes.coords_to_point(1, 2), end=axes.coords_to_point(4, 2), buff=0, color=PURPLE)\n\n        dy_label = MathTex(\"y_2 - y_1\").next_to(delta_y, RIGHT)\n        dx_label = MathTex(\"x_2 - x_1\").next_to(delta_x, DOWN)\n\n        self.play(Create(delta_y), Write(dy_label))\n        self.play(Create(delta_x), Write(dx_label))\n\n        # Slope equation\n        slope_eq = MathTex(\"m = \\\\frac{y_2 - y_1}{x_2 - x_1}\").to_edge(DOWN)\n        self.play(Write(slope_eq))\n        self.wait(1)\n\n        # Numerical example\n        slope_value = MathTex(\"m = \\\\frac{5 - 2}{4 - 1} = \\\\frac{3}{3} = 1\").next_to(slope_eq, UP)\n        self.play(Write(slope_value))\n        self.wait(2)",
      id: id,
      filename: filename,
      project_name: project_name
    };
    
    const externalUrl: string | undefined = process.env.LAMDA_FUNCTION_URL;
    if (!externalUrl) {
      throw new Error("LAMDA_FUNCTION_URL is not defined in environment variables.");
    }

    const response = await axios.post(externalUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000*15, 
    });
    if (response.status !== 200 || !response.data) {
      res.status(500).json({ error: 'Lambda function failed', details: response.data });
      return;
    }
    console.log("Lambda response:", response);
    const { video_url, message } = response.data;

    res.status(200).json({
      video_url: video_url,
      message
    });
    // const result = await runDocker(code);
    
    
    // const fs = require('fs');
    // const videoPath = result.videoPath;
    // const stat = fs.statSync(videoPath);
    
    // res.writeHead(200, {
    //   'Content-Type': 'video/mp4',
    //   'Content-Length': stat.size,
    //   'Content-Disposition': 'attachment; filename=animation.mp4'
    // });

    
    // const videoStream = fs.createReadStream(videoPath);
    // videoStream.pipe(res);
  } catch (error) {
    // console.error('Error executing code:', error);
    // const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // res.status(500).json({ 
    //   error: 'Failed to execute animation',
    //   details: errorMessage
    // });
    console.error('Error calling Lambda:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Lambda invocation failed',
      details: errorMessage
    });
  }
});

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
        const code = sanitizeCode(markdownCode);
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