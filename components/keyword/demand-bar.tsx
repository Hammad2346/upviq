export default function DemandBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 h-1.5 rounded-full bg-[hsl(224_30%_16%)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: "linear-gradient(90deg, hsl(190 95% 55%), hsl(195 100% 65%))",
          }}
        />
      </div>
      <span className="text-xs font-medium text-foreground/80 w-6 tabular-nums">{value}</span>
    </div>
  );
}