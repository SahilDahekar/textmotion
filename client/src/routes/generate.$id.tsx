import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader, SendHorizontal } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

interface Message {
  type: 'user' | 'assistant'
  content: string
}

export const Route = createFileRoute('/generate/$id')({
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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  async function handleGenerateAnimation(text: string) {
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
      })

      const execResponse = await axios.post("http://localhost:5000/api/execute", 
        { code: genResponse.data.generatedText },
        { responseType: 'blob' }
      );

      const videoBlob = new Blob([execResponse.data], { type: 'video/mp4' });
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: 'Your animation is ready!' 
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
    if (search.text) {
      setMessages([{ type: 'user', content: search.text }])
      handleGenerateAnimation(search.text)
    }
  }, [search.text])

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
        {/* Generated Code */}
        {generatedCode && (
          <div className="h-1/2 border-b p-4 overflow-auto">
            <h3 className="font-medium mb-2">Generated Python Code</h3>
            <pre className="p-4 bg-muted/10 rounded-lg overflow-x-auto">
              {generatedCode}
            </pre>
          </div>
        )}

        {/* Generated Animation */}
        {videoUrl && (
          <div className="h-1/2 p-4 flex flex-col">
            <h3 className="font-medium mb-2">Generated Animation</h3>
            <div className="flex-1 bg-black rounded-lg overflow-hidden">
              <video
                controls
                className="w-full h-full object-contain"
                src={videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <Button 
              className="mt-4 self-end"
              onClick={() => {
                const a = document.createElement('a');
                a.href = videoUrl;
                a.download = 'animation.mp4';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              Download Video
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
