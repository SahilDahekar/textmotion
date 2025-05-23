import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from "@/components/ui/sonner"
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors closeButton />
      <TanStackRouterDevtools />
    </>
  ),
})
