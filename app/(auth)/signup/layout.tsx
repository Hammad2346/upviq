import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up | Upviq",
  description: "Create a free account to get started.",
  openGraph: {
    title: "Sign Up | Upviq",
    description: "Create a free account to get started.",
    siteName: "Upviq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up | Upviq",
    description: "Create a free account to get started.",
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}