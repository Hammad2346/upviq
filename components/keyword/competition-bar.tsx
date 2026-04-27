export default function CompetitionBar({ value }: { value: number }) {
  const color =
    value >= 75
      ? "linear-gradient(90deg, hsl(0 75% 60%), hsl(20 90% 55%))"
      : value >= 55
      ? "linear-gradient(90deg, hsl(38 95% 60%), hsl(30 90% 55%))"
      : "linear-gradient(90deg, hsl(145 70% 50%), hsl(160 70% 45%))";

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 h-1.5 rounded-full bg-[hsl(224_30%_16%)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-medium text-foreground/80 w-6 tabular-nums">{value}</span>
    </div>
  );
}