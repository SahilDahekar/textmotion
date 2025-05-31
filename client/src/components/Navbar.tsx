import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"
import { Link } from "@tanstack/react-router"
import { Clapperboard, LogIn } from "lucide-react"
import { Button } from "./ui/button"
import { Sidebar, SidebarFooter, SidebarContent, SidebarHeader } from "./ui/sidebar"


function Navbar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="flex items-center justify-between p-4 border-b">
                <Link to="/" className="text-xl font-semibold">
                    <h1 className='flex gap-0.5 justify-center items-center text-2xl text-foreground font-armageda tracking-tight'>
                        <Clapperboard className='text-gray-800' /> TextMotion
                    </h1>
                </Link>
            </SidebarHeader>
            <SidebarContent className="p-4">
                {/* add content for new chat button , search button and older chat tabs */}
            </SidebarContent>
            <SidebarFooter className="border-t">
                <SignedIn>
                    <UserButton showName appearance={{
                        elements: {
                            avatarBox: {
                                width: '2rem',
                                height: '2rem',
                            },
                            userButtonOuterIdentifier : {
                                order: '2',
                            },
                            rootBox: "px-3 py-3",
                        }
                    }}/>
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <Button variant="outline" className='flex items-center justify-start py-6 text-md'><LogIn className="mr-1 ml-2" />Login</Button>
                    </SignInButton>
                </SignedOut>
            </SidebarFooter>
        </Sidebar>
    )
}

export default Navbar