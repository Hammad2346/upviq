type Opportunity = "High" | "Medium" | "Low";
export default function OpportunityBadge({ level }: { level: Opportunity }) {
  const styles: Record<Opportunity, string> = {
    High:   "bg-[hsl(145_70%_50%/0.15)] text-[hsl(145_70%_55%)] border border-[hsl(145_70%_50%/0.3)]",
    Medium: "bg-[hsl(38_95%_60%/0.15)]  text-[hsl(38_95%_65%)]  border border-[hsl(38_95%_60%/0.3)]",
    Low:    "bg-[hsl(0_75%_60%/0.15)]   text-[hsl(0_75%_65%)]   border border-[hsl(0_75%_60%/0.3)]",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${styles[level]}`}>
      {level}
    </span>
  );
}