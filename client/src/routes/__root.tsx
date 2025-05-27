import { Outlet, createRootRoute, Link } from '@tanstack/react-router'
import { Toaster } from "@/components/ui/sonner"
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Clapperboard } from 'lucide-react'

export const Route = createRootRoute({
  component: () => {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold">
              <h1 className='flex gap-0.5 justify-center items-center text-2xl text-foreground font-armageda tracking-tight'>
                <Clapperboard className='text-gray-800' /> TextMotion
              </h1>
            </Link>
            <nav className="flex items-center gap-4">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" className=''>Sign In</Button>
                </SignInButton>
              </SignedOut>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <Toaster richColors closeButton />
        <TanStackRouterDevtools />
      </div>
    )
  },
})
