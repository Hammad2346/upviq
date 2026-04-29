"use client";

export default function CompetitionBar({ value }: { value: number }) {
  const getGradient = (val: number): string => {
    if (val >= 75) return "var(--gradient-competition-high)";
    if (val >= 55) return "var(--gradient-competition-medium)";
    return "var(--gradient-competition-low)";
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: getGradient(value),
          }}
        />
      </div>
      <span className="text-xs font-medium text-foreground w-6 tabular-nums">{value}</span>
    </div>
  );
}