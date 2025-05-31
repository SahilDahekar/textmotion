import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from "@/components/ui/sonner"
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Navbar from '@/components/Navbar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export const Route = createRootRoute({
  component: () => {
    return (
      <div className="min-h-screen flex flex-col">

        <SidebarProvider>
          <Navbar />
          <main className="flex-1 relative">
            <SidebarTrigger variant='outline' className='absolute top-2 left-2 z-50 w-10 h-10'/>
            <Outlet />
          </main>
        </SidebarProvider>

        <Toaster richColors closeButton />
        {/* <TanStackRouterDevtools /> */}
      </div>
    )
  },
})
