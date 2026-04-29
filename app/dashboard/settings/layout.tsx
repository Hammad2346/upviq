import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SETTINGS | Upviq",
  description: "Enter or edit information.",
  openGraph: {
    title: "SETTINGS | Upviq",
    description: "Enter or edit information.",
    siteName: "Upviq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SETTINGS | Upviq",
    description: "Enter or edit information.",
  },
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}