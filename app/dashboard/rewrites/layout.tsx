import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "REWRITES | Upviq",
  description: "AI Generated reWrites to make your profile better.",
  openGraph: {
    title: "REWRITES | Upviq",
    description: "AI Generated reWrites to make your profile better",
    siteName: "Upviq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REWRITES | Upviq",
    description: "AI Generated reWrites to make your profile better",
  },
}

export default function RewritesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}