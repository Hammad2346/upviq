import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KEYWORDS | Upviq",
  description: "Enter and keep track of your keywords.",
  openGraph: {
    title: "KEYWORDS | Upviq",
    description: "Enter and keep track of your keywords.",
    siteName: "Upviq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KEYWORDS | Upviq",
    description: "Enter and keep track of your keywords.",
  },
}

export default function keywordsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}