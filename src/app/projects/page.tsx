import { GalleryVerticalEnd } from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          OffMenu
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
          <p className="text-muted-foreground">
            You've successfully signed in. This is a placeholder for the Projects Dashboard.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Coming soon: Project list, task management, and more!
          </p>
        </div>
      </div>
    </div>
  )
} 