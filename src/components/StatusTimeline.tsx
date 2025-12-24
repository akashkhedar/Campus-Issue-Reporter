import { motion } from "framer-motion";
import { Clock, UserCheck, Loader2, CheckCircle2 } from "lucide-react";
import type { StatusHistoryEntry, IssueStatus } from "@/types/issue";

interface StatusTimelineProps {
  history: StatusHistoryEntry[];
}

const statusIcons: Record<IssueStatus, typeof Clock> = {
  Reported: Clock,
  Assigned: UserCheck,
  "In Progress": Loader2,
  Resolved: CheckCircle2,
};

const statusColors: Record<IssueStatus, string> = {
  Reported: "bg-status-reported",
  Assigned: "bg-status-assigned",
  "In Progress": "bg-status-in-progress",
  Resolved: "bg-status-resolved",
};

export const StatusTimeline = ({ history }: StatusTimelineProps) => {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />

      <div className="space-y-6">
        {history.map((entry, index) => {
          const Icon = statusIcons[entry.to];
          const formattedDate = new Date(entry.changedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-4 pl-2"
            >
              {/* Icon */}
              <div
                className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${statusColors[entry.to]}`}
              >
                <Icon className="h-4 w-4 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="flex-1 rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{entry.to}</span>
                  <span className="text-xs text-muted-foreground">{formattedDate}</span>
                </div>
                {entry.from && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Changed from <span className="font-medium">{entry.from}</span>
                  </p>
                )}
                {entry.changedBy && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    By: {entry.changedBy}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
