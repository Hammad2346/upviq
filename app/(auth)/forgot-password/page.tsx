"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, MailCheck } from "lucide-react"
import { resetPassword } from "@/lib/firebase-auth"

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState("")
  const [sentTo, setSentTo] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  })

  async function onSubmit(data: ForgotFormValues) {
    setServerError("")
    const { error } = await resetPassword(data.email)
    if (error) {
      setServerError(error)
      return
    }
    setSentTo(data.email)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="glass-card glow-border rounded-2xl p-8">

          {sentTo ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center mb-4">
                <div
                  className="p-3 rounded-full"
                  style={{
                    background: "hsl(190 95% 55% / 0.1)",
                    border: "1px solid hsl(190 95% 55% / 0.2)",
                  }}
                >
                  <MailCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h1
                className="text-xl font-semibold text-foreground tracking-tight mb-2"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Check your email
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                We sent a reset link to{" "}
                <span className="text-foreground/80 font-medium">{sentTo}</span>
              </p>
              <Link
                href="/login"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1
                  className="text-2xl font-semibold text-foreground tracking-tight"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  Reset your password
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              {serverError && (
                <Alert variant="destructive" className="mb-5 border-destructive/40 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className="border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary/60"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-semibold text-primary-foreground mt-1 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}