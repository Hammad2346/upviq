import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "LOG IN | Upviq",
  description: "Login with your account to get started.",
  openGraph: {
    title: "LOG IN | Upviq",
    description: "Login with your account to get started.",
    siteName: "Upviq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LOG IN | Upviq",
    description: "Login with your account to get started.",
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}