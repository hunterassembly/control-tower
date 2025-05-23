"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import { Input } from "@/registry/new-york-v4/ui/input"
import { Label } from "@/registry/new-york-v4/ui/label"
import { supabase } from "@/lib/supabase"

type MessageType = "success" | "error" | "info"

interface Message {
  type: MessageType
  text: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Function to call the consume-invite-token Edge Function
  const consumeInviteToken = async (token: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      // TEMPORARY: Mock response for testing when Edge Function isn't deployed
      if (token === 'test-invite-123') {
        console.log('Using mock response for test token')
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Check if this user is already a member of the test project
        const { data: existingMember } = await supabase
          .from('project_member')
          .select('role')
          .eq('project_id', '49b31685-877b-4d32-9b03-c0796876e33d')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single()

        if (existingMember) {
          return {
            success: true,
            data: {
              message: 'Already a member of this project',
              project_id: '49b31685-877b-4d32-9b03-c0796876e33d',
              project_name: 'Outpost',
              role: existingMember.role
            }
          }
        }

        // Create membership for test
        const user = (await supabase.auth.getUser()).data.user
        if (user) {
          const { data: memberData, error: memberError } = await supabase
            .from('project_member')
            .insert({
              project_id: '49b31685-877b-4d32-9b03-c0796876e33d',
              user_id: user.id,
              role: 'designer'
            })
            .select()
            .single()

          if (memberError) {
            console.error('Mock membership creation failed:', memberError)
            return { success: false, error: `Failed to join project: ${memberError.message}` }
          }

          // Mark token as used
          await supabase
            .from('invite_token')
            .update({ used_at: new Date().toISOString() })
            .eq('token', token)

          return {
            success: true,
            data: {
              message: 'Successfully joined project',
              project_id: '49b31685-877b-4d32-9b03-c0796876e33d',
              project_name: 'Outpost',
              role: 'designer',
              membership: memberData
            }
          }
        }
      }

      // Real Edge Function call (for when it's deployed)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        return { success: false, error: "No valid session found" }
      }

      // Use local development URLs directly
      const supabaseUrl = 'http://127.0.0.1:54321'
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

      const response = await fetch(`${supabaseUrl}/functions/v1/consume-invite-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ invite_token: token })
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to redeem invite token' }
      }

      return { success: true, data: result }
    } catch (error) {
      console.error('Error consuming invite token:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Function to check if user has any project memberships
  const checkProjectMemberships = async (): Promise<{ hasMemberships: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('project_member')
        .select('project_id')
        .limit(1)

      if (error) {
        console.error('Error checking memberships:', error)
        return { hasMemberships: false, error: error.message }
      }

      return { hasMemberships: data && data.length > 0 }
    } catch (error) {
      console.error('Error checking memberships:', error)
      return { hasMemberships: false, error: 'Failed to check project memberships' }
    }
  }

  // Handle authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user.email)
          
          // Check for invite token in URL
          const inviteToken = searchParams.get('invite_token')
          console.log('Invite token after auth:', inviteToken) // Debug log
          
          if (inviteToken) {
            setMessage({
              type: "info",
              text: "🔄 Verifying your invitation..."
            })

            // Call the consume-invite-token Edge Function
            const result = await consumeInviteToken(inviteToken)

            if (result.success && result.data) {
              setMessage({
                type: "success",
                text: `🎉 Success! You've joined "${result.data.project_name || 'the project'}" as a ${result.data.role}!`
              })

              // Show success message longer for better UX
              setTimeout(() => {
                if (result.data.project_id) {
                  router.push(`/projects/${result.data.project_id}`)
                } else {
                  router.push('/projects')
                }
              }, 3000) // Show success message for 3 seconds
            } else {
              setMessage({
                type: "error",
                text: `❌ ${result.error || "Invalid or expired invitation link"}`
              })
              console.error('Invite token redemption failed:', result.error)
              // Stay on login page to show error
            }
          } else {
            // No invite token - check if user is already a member of any project
            const { hasMemberships, error } = await checkProjectMemberships()

            if (error) {
              setMessage({
                type: "error",
                text: "Error checking account status. Please try again."
              })
            } else if (hasMemberships) {
              // User has existing project memberships
              setMessage({
                type: "success",
                text: "✅ Welcome back! Redirecting to your projects..."
              })
              setTimeout(() => router.push('/projects'), 1500)
            } else {
              // New user with no project memberships
              setMessage({
                type: "info",
                text: "✅ Login successful! Please wait for a project invitation to get started."
              })
              // Could redirect to a "waiting for invitation" page
              // For now, just show the message
            }
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your email address"
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // Get invite token from URL if present
      const inviteToken = searchParams.get('invite_token')
      console.log('Invite token from URL:', inviteToken) // Debug log
      
      // Construct redirect URL with invite token preserved
      const redirectUrl = inviteToken 
        ? `${window.location.origin}/login?invite_token=${inviteToken}`
        : `${window.location.origin}/login`
      
      console.log('Email redirect URL:', redirectUrl) // Debug log

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl
        }
      })

      if (error) {
        console.error('Supabase auth error:', error)
        setMessage({
          type: "error",
          text: error.message || "Failed to send magic link"
        })
      } else {
        if (inviteToken) {
          setMessage({
            type: "success",
            text: "Check your email for the magic link to join the project!"
          })
        } else {
          setMessage({
            type: "success",
            text: "Check your email for the magic link!"
          })
        }
        setEmail("") // Clear the email field
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getMessageStyles = (type: MessageType): string => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50 border border-green-200"
      case "error":
        return "text-red-600 bg-red-50 border border-red-200"
      case "info":
        return "text-blue-600 bg-blue-50 border border-blue-200"
      default:
        return ""
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to OffMenu</CardTitle>
          <CardDescription>
            Enter your email to receive a magic link to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Success/Error Message Area */}
          {message && (
            <div className={cn(
              "mb-4 p-3 rounded-md text-sm",
              getMessageStyles(message.type)
            )}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Magic Link"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By continuing, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  )
}
