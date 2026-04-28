"use client";

type Opportunity = "High" | "Medium" | "Low";

export default function OpportunityBadge({ level }: { level: Opportunity }) {
  const styles: Record<Opportunity, string> = {
    High:   "bg-green-100 text-green-700 border border-green-300",
    Medium: "bg-amber-100 text-amber-700 border border-amber-300",
    Low:    "bg-red-100 text-red-700 border border-red-300",
  };

  return (
    <span className={`px-3 py-1 rounded-full flex justify-center text-xs font-semibold tracking-wide ${styles[level]}`}>
      {level}
    </span>
  );
}