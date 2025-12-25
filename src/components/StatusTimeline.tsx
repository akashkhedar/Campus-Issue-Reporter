import { motion } from "framer-motion";
import { Clock, UserCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Timestamp } from "firebase/firestore";
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

const formatTimestamp = (ts?: Timestamp | Date | null) => {
  if (!ts) return "Just now";
  if (ts instanceof Timestamp) {
    return ts.toDate().toLocaleString();
  }
  return ts.toLocaleString();
};

export const StatusTimeline = ({ history }: StatusTimelineProps) => {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 h-full w-0.5 bg-border" />

      <div className="space-y-7">
        {history.map((entry, index) => {
          const Icon = statusIcons[entry.to];
          const formattedDate = formatTimestamp(entry.changedAt);
          return (
            <motion.div
              key={`${entry.to}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-12"
            >
              {/* Icon - positioned left of the vertical line */}
              <div
                className={`absolute left-2 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                  statusColors[entry.to]
                }`}
              >
                <Icon className="h-4 w-4 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-foreground">
                    {entry.to}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-wrap">
                    {formattedDate}
                  </span>
                </div>

                {entry.from && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Changed from{" "}
                    <span className="font-medium">{entry.from}</span>
                  </p>
                )}

                {entry.changedBy && (
                  <p className="mt-2 text-xs text-muted-foreground">
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
