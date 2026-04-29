"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { signupUser } from "@/lib/firebase-auth"

const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be under 72 characters"),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [serverError, setServerError] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(data: SignupFormValues) {
    setServerError("")
    const { user, error } = await signupUser(data.name, data.email, data.password)
    if (error) {
      setServerError(error)
      return
    }
    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="glass-card glow-border rounded-2xl p-8">

          <div className="mb-7">
            <h1
              className="text-2xl font-semibold text-foreground tracking-tight"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Get started — it&apos;s free
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
              <Label htmlFor="name" className="text-sm font-medium text-foreground/80">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Smith"
                {...register("name")}
                className="border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary/60"
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

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

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                {...register("password")}
                className="border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary/60"
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground/60 mt-4">
            By signing up you agree to our{" "}
            <Link href="/terms" className="underline hover:text-muted-foreground transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-muted-foreground transition-colors">
              Privacy Policy
            </Link>
          </p>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}