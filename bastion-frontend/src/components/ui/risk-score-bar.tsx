import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RiskScoreBarProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

const getRiskLevel = (score: number) => {
  if (score >= 80)
    return { level: "high", color: "bg-red-500", textColor: "text-red-500" };
  if (score >= 50)
    return {
      level: "medium",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    };
  return { level: "low", color: "bg-green-500", textColor: "text-green-500" };
};

export function RiskScoreBar({
  score,
  className,
  showLabel = true,
}: RiskScoreBarProps) {
  const risk = getRiskLevel(score);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1">
        <Progress value={score} className="h-2" />
      </div>
      {showLabel && (
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("w-2 h-2 rounded-full", risk.color)} />
          <span className={cn("text-sm font-medium", risk.textColor)}>
            {score}%
          </span>
        </div>
      )}
    </div>
  );
}
