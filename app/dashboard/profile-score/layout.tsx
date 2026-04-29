import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PROFILE SCORE | Upviq",
  description: "Score of the profile.",
  openGraph: {
    title: "PROFILE SCORE | Upviq",
    description: "Score of the profile.",
    siteName: "Upviq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PROFILE SCORE | Upviq",
    description: "Score of the profile.",
  },
}

export default function ProfileScoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}