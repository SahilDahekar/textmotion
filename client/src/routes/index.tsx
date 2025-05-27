import { TextareaForm } from '@/components/TextAreaForm'
import { createFileRoute } from '@tanstack/react-router'
import { Clapperboard } from 'lucide-react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-background/80'>
      <div className='container mx-auto px-4 py-12 max-w-6xl'>
        <div className='space-y-8 mb-12'>
          <div className='text-center space-y-4'>
            <h1 className='flex gap-3 justify-center items-center text-6xl font-armageda tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80'>
              <Clapperboard className='text-gray-800' size={50} /> TextMotion
            </h1>
            <p className='text-xl text-muted-foreground'>
              Create stunning mathematical animations with just a text prompt
            </p>
          </div>          <div className='max-w-3xl mx-auto'>
            <SignedIn>
              <TextareaForm />
            </SignedIn>
            <SignedOut>
              <div className="text-center space-y-4">
                <p className="text-lg text-muted-foreground">
                  Sign In to start creating animations
                </p>
                <SignInButton mode="modal">
                  <Button size="lg" className="px-8">
                    Sign in for free
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </div>
  )
}
