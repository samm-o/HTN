import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Star, Calendar, Building2 } from "lucide-react";

interface TimelineEvent {
  id: string;
  date: string;
  company: string;
  category: string;
  itemLink: string;
  isFirstClaim?: boolean;
  isMultipleAccountsAtStore?: boolean;
  status?: "pending" | "approved" | "denied";
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
  onStatusChange?: (eventId: string, status: string) => void;
}

export function Timeline({ events, className, onStatusChange }: TimelineProps) {
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "denied": return "bg-red-500";
      default: return "bg-yellow-500";
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Vertical timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      
      <div className="space-y-6">
        {sortedEvents.map((event, index) => (
          <div key={event.id} className="relative flex items-start gap-4">
            {/* Timeline node */}
            <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-card border-2 border-border">
              {event.isFirstClaim ? (
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              ) : (
                <Building2 className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 min-w-0 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{event.date}</span>
                {event.isFirstClaim && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    First Claim
                  </Badge>
                )}
              </div>

              <div className="bg-card border rounded-lg p-4 space-y-3 transition-smooth hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{event.company}</h4>
                    <p className="text-sm text-muted-foreground">{event.category}</p>
                  </div>
                  
                  {onStatusChange && (
                    <select
                      value={event.status || "pending"}
                      onChange={(e) => onStatusChange(event.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 bg-background"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="denied">Denied</option>
                    </select>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href={event.itemLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline transition-smooth"
                  >
                    View Item →
                  </a>
                  
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(event.status))} />
                    <span className="text-xs text-muted-foreground capitalize">
                      {event.status || "pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Critical alert for multiple accounts */}
              {event.isMultipleAccountsAtStore && (
                <Alert className="mt-3 border-red-500 bg-red-50 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700 dark:text-red-300 font-medium">
                    🚨 CRITICAL: Multiple accounts detected at {event.company}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
