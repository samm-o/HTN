import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  rows?: number;
}

export function SkeletonLoader({ className, rows = 4 }: SkeletonLoaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted rounded-lg skeleton-shimmer relative overflow-hidden" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded skeleton-shimmer relative overflow-hidden" style={{ width: `${Math.random() * 40 + 60}%` }} />
              <div className="h-3 bg-muted rounded skeleton-shimmer relative overflow-hidden" style={{ width: `${Math.random() * 30 + 40}%` }} />
            </div>
            <div className="w-20 h-8 bg-muted rounded skeleton-shimmer relative overflow-hidden" />
          </div>
        </div>
      ))}
    </div>
  );
}
