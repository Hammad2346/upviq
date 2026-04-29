import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PROFILE | Upviq",
  description: "Enter the profile to get started.",
  openGraph: {
    title: "PROFILE | Upviq",
    description: "Enter the profile to get started.",
    siteName: "Upviq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PROFILE | Upviq",
    description: "Enter the profile to get started.",
  },
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}