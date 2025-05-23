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

  // Handle authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user.email)
          
          // Check for invite token in URL
          const inviteToken = searchParams.get('invite_token')
          
          if (inviteToken) {
            setMessage({
              type: "info",
              text: "Verifying your invitation..."
            })
            // TODO: Call consume-invite-token Edge Function
            // For now, redirect to projects
            router.push('/projects')
          } else {
            // No invite token - check if user is already a member
            // TODO: Check project membership
            // For now, redirect to projects
            router.push('/projects')
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
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/login${
            searchParams.get('invite_token') 
              ? `?invite_token=${searchParams.get('invite_token')}` 
              : ''
          }`
        }
      })

      if (error) {
        console.error('Supabase auth error:', error)
        setMessage({
          type: "error",
          text: error.message || "Failed to send magic link"
        })
      } else {
        setMessage({
          type: "success",
          text: "Check your email for the magic link!"
        })
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
