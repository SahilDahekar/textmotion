import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Loader, SendHorizontal } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { GeneratedContent } from '@/components/GeneratedContent'

interface Message {
  type: 'user' | 'assistant'
  content: string
}

interface ExecutionRequest {
  code: string;
  id: string;
  filename: string;
  project_name: string;
}


export const Route = createFileRoute('/generate/$id')({  beforeLoad: ({ context }: { context: { auth?: { userId: string; isLoaded: boolean; isSignedIn: boolean; } } }) => {
    if (!context.auth?.isLoaded) {
      // Wait for auth to load
      return;
    }
    console.log(context);
    if (!context.auth?.isSignedIn || !context.auth?.userId) {
      throw redirect({
        to: '/',
        search: {
          redirect: '/generate/$id'
        }
      })
    }
  },
  component: GeneratePage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      text: (search.text as string) || ''
    }
  }
})

function GeneratePage() {
  const { id } = Route.useParams()
  const search = Route.useSearch()
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  async function handleGenerateAnimation(text: string) {
    if(isLoading) return

    setIsLoading(true)
    try {
      const genResponse = await axios.post("http://localhost:5000/api/generate", { text });
      const sanitizedCode = genResponse.data.generatedText.match(/```python\n([\s\S]*?)\n```/);
      if (!sanitizedCode) {
        throw new Error('Failed to parse generated code');
      }
      setGeneratedCode(sanitizedCode[1].trim() + '\n');
      
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: 'Generated the animation code. Creating the animation now...' 
      }])
      toast.info('Generating animation from code', {
        description: 'This may take a few seconds.',
      })      // Extract the class name from the Python code to use as filename
      const classNameMatch = sanitizedCode[1].match(/class\s+(\w+)\(/);
      const filename = classNameMatch ? classNameMatch[1] : 'Animation';
      
      const payload: ExecutionRequest = {
        code: sanitizedCode[1],
        id: user?.id || '',  // Use the authenticated user's ID
        filename: filename,  // Use the extracted class name as filename
        project_name: id,
      };
        const execResponse = await axios.post("http://localhost:5000/api/execute", payload, {
        timeout: 10000 * 15,
      });
      console.log('Server response:', execResponse.data);
      
      // Handle the video URL based on environment
      const videoUrl = execResponse.data.video_url;
      setVideoUrl(videoUrl);
      
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: execResponse.data.message || 'Your animation is ready!' 
      }])
      toast.success('Animation created successfully!', {
        description: 'You can now view and download your animation.',
      })
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: 'Sorry, there was an error creating your animation.' 
      }])
      toast.error('Error creating animation', {
        description: 'Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }
  // Handle initial text from search params
  useEffect(() => {
    if (search.text && messages.length === 0) {
      setMessages([{ type: 'user', content: search.text }]);
      setHasGenerated(false);
    }
    // eslint-disable-next-line
  }, [search.text]);

  // When the initial user message is set, trigger the animation only once
  useEffect(() => {
    if (
      messages.length === 1 &&
      messages[0].type === 'user' &&
      search.text &&
      !hasGenerated
    ) {
      setHasGenerated(true);
      handleGenerateAnimation(search.text);
    }
    // eslint-disable-next-line
  }, [messages, search.text]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setMessages(prev => [...prev, { type: 'user', content: userMessage }])
    setInput('')
    await handleGenerateAnimation(userMessage)
  }

  return (
    <div className="h-screen flex">
      {/* Chat Interface */}
      <div className="w-1/2 border-r flex flex-col h-full">
        <div className="flex-1 p-4 overflow-auto space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted mr-4'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your animation..."
              className="resize-none min-h-[120px] pb-16 w-full break-words whitespace-pre-wrap pr-20"
            />
            <div className="absolute bottom-4 right-4">
              <Button 
                disabled={isLoading} 
                type="submit"
                size="lg"
                className="px-8 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create <SendHorizontal className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Panel */}
      <div className="w-1/2 h-full flex flex-col">
        <GeneratedContent generatedCode={generatedCode} videoUrl={videoUrl} />
      </div>
    </div>
  )
}
