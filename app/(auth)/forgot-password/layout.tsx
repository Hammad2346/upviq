import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password | Upviq",
  description: "Enter a email to recover your account.",
  openGraph: {
    title: "Forgot Password | Upviq",
    description: "Enter a email to recover your account.",
    siteName: "Upviq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forgot Password | Upviq",
    description: "Enter a email to recover your account.",
  },
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}