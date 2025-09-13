import * as React from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
  onComplete?: () => void;
}

export function TypewriterText({ text, className, speed = 50, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = React.useState("");
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    if (text.length === 0) return;

    setDisplayedText("");
    setIsComplete(false);
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span className={cn("inline-block", className)}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
      )}
    </span>
  );
}
