import { Minus, TrendingDown, TrendingUp } from "lucide-react";
type TrendDir = "up" | "down" | "flat";
export default function TrendIcon({ dir }: { dir: TrendDir }) {
  if (dir === "up")   return <TrendingUp   size={15} className="text-[hsl(145_70%_50%)]" />;
  if (dir === "down") return <TrendingDown  size={15} className="text-[hsl(0_75%_60%)]"  />;
  return                     <Minus         size={15} className="text-[hsl(215_20%_65%)]" />;
}