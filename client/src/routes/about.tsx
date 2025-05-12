import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <Button onClick={ () =>{console.log("about")}}>Hello World About</Button>
  </div>
}
